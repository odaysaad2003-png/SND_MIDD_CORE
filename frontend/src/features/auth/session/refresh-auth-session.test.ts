import {beforeEach, describe, expect, it, vi} from "vitest";

import {ApiError} from "@/lib/api/api-error";

import type {AuthSessionData} from "../schemas/auth.schema";
import {authSessionStore} from "./auth-session-store";

const authApiMocks = vi.hoisted(() => ({
    getRefreshCsrfToken: vi.fn(),
    refreshAuthSession: vi.fn(),
}));

vi.mock("../api/auth-api", () => authApiMocks);

import {coordinateAuthRefresh} from "./refresh-auth-session";

const session: AuthSessionData = {
    user: {
        id: "user-1",
        name: "مستخدم سند",
        email: "user@example.com",
        role: "user",
        avatar: null,
        isActive: true,
        createdAt: "2026-07-18T10:00:00.000Z",
        updatedAt: "2026-07-18T10:00:00.000Z",
    },
    accessToken: "access-token",
    csrfToken: "rotated-csrf-token",
};

function createHttpError(status: number): ApiError {
    return new ApiError({
        kind: "http",
        message: "Authentication failed",
        status,
        code: status === 401 ? "UNAUTHORIZED" : "FORBIDDEN",
    });
}

function createDeferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (reason?: unknown) => void;

    const promise = new Promise<T>((promiseResolve, promiseReject) => {
        resolve = promiseResolve;
        reject = promiseReject;
    });

    return {promise, resolve, reject};
}

beforeEach(() => {
    authSessionStore.markChecking();
    authApiMocks.getRefreshCsrfToken.mockReset();
    authApiMocks.refreshAuthSession.mockReset();
});

describe("authSessionStore", () => {
    it("keeps tokens outside the public session snapshot", () => {
        authSessionStore.setSession(session);

        expect(authSessionStore.getSnapshot()).toEqual({
            status: "authenticated",
            user: session.user,
        });
        expect(authSessionStore.getSnapshot()).not.toHaveProperty("accessToken");
        expect(authSessionStore.getSnapshot()).not.toHaveProperty("csrfToken");
        expect(authSessionStore.getAccessToken()).toBe(session.accessToken);
        expect(authSessionStore.getCsrfToken()).toBe(session.csrfToken);
    });
});

describe("coordinateAuthRefresh", () => {
    it("shares one in-flight refresh across concurrent callers", async () => {
        const deferredRefresh = createDeferred<AuthSessionData>();

        authSessionStore.setCsrfToken("current-csrf-token");
        authApiMocks.refreshAuthSession.mockReturnValue(deferredRefresh.promise);

        const firstRequest = coordinateAuthRefresh();
        const secondRequest = coordinateAuthRefresh();

        expect(firstRequest).toBe(secondRequest);

        await Promise.resolve();
        expect(authApiMocks.refreshAuthSession).toHaveBeenCalledTimes(1);

        deferredRefresh.resolve(session);

        await expect(firstRequest).resolves.toEqual(session);
        expect(authSessionStore.getSnapshot().status).toBe("authenticated");
    });

    it("bootstraps CSRF when the tab has no in-memory token", async () => {
        authApiMocks.getRefreshCsrfToken.mockResolvedValue("bootstrap-csrf-token");
        authApiMocks.refreshAuthSession.mockResolvedValue(session);

        await coordinateAuthRefresh();

        expect(authApiMocks.getRefreshCsrfToken).toHaveBeenCalledTimes(1);
        expect(authApiMocks.refreshAuthSession).toHaveBeenCalledWith({
            csrfToken: "bootstrap-csrf-token",
        });
    });

    it("gets a fresh CSRF token and retries refresh once after a 403", async () => {
        authSessionStore.setCsrfToken("stale-csrf-token");
        authApiMocks.refreshAuthSession.mockRejectedValueOnce(createHttpError(403)).mockResolvedValueOnce(session);
        authApiMocks.getRefreshCsrfToken.mockResolvedValue("fresh-csrf-token");

        await coordinateAuthRefresh();

        expect(authApiMocks.getRefreshCsrfToken).toHaveBeenCalledTimes(1);
        expect(authApiMocks.refreshAuthSession).toHaveBeenNthCalledWith(1, {
            csrfToken: "stale-csrf-token",
        });
        expect(authApiMocks.refreshAuthSession).toHaveBeenNthCalledWith(2, {
            csrfToken: "fresh-csrf-token",
        });
    });

    it("clears the local session after a final authentication failure", async () => {
        authSessionStore.setSession(session);
        authApiMocks.refreshAuthSession.mockRejectedValue(createHttpError(401));

        await expect(coordinateAuthRefresh()).rejects.toMatchObject({status: 401});

        expect(authSessionStore.getSnapshot()).toEqual({
            status: "anonymous",
            user: null,
        });
        expect(authSessionStore.getAccessToken()).toBeNull();
        expect(authSessionStore.getCsrfToken()).toBeNull();
    });

    it("does not log the user out for a recoverable network failure", async () => {
        const networkError = new ApiError({
            kind: "network",
            message: "The API request could not reach the server",
        });

        authSessionStore.setSession(session);
        authApiMocks.refreshAuthSession.mockRejectedValue(networkError);

        await expect(coordinateAuthRefresh()).rejects.toBe(networkError);
        expect(authSessionStore.getSnapshot().status).toBe("authenticated");
        expect(authSessionStore.getAccessToken()).toBe(session.accessToken);
    });
});
