import {beforeEach, describe, expect, it, vi} from "vitest";

import {ApiError} from "@/lib/api/api-error";

import type {AuthSessionData} from "../schemas/auth.schema";
import {authSessionStore} from "../session/auth-session-store";

const dependencyMocks = vi.hoisted(() => ({
    apiRequest: vi.fn(),
    coordinateAuthRefresh: vi.fn(),
}));

vi.mock("@/lib/api/api-client", () => ({
    apiRequest: dependencyMocks.apiRequest,
}));

vi.mock("../session/refresh-auth-session", () => ({
    coordinateAuthRefresh: dependencyMocks.coordinateAuthRefresh,
}));

import {authorizedApiRequest} from "./authorized-api-client";

const originalSession: AuthSessionData = {
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
    accessToken: "old-access-token",
    csrfToken: "old-csrf-token",
};

const refreshedSession: AuthSessionData = {
    ...originalSession,
    accessToken: "new-access-token",
    csrfToken: "new-csrf-token",
};

function createHttpError(status: number): ApiError {
    return new ApiError({
        kind: "http",
        message: status === 401 ? "Unauthorized" : "Forbidden",
        status,
        code: status === 401 ? "UNAUTHORIZED" : "FORBIDDEN",
    });
}

function readRequestHeaders(callIndex: number): Headers {
    const requestInit = dependencyMocks.apiRequest.mock.calls[callIndex]?.[1] as RequestInit | undefined;

    return new Headers(requestInit?.headers);
}

beforeEach(() => {
    authSessionStore.markChecking();

    dependencyMocks.apiRequest.mockReset();
    dependencyMocks.coordinateAuthRefresh.mockReset();
});

describe("authorizedApiRequest", () => {
    it("attaches the access token without sending cookie credentials or CSRF", async () => {
        authSessionStore.setSession(originalSession);
        dependencyMocks.apiRequest.mockResolvedValue({
            data: {id: "user-1"},
        });

        await authorizedApiRequest("users/me", {
            headers: {
                "X-Feature-Name": "profile",
                "X-CSRF-Token": "must-not-leak",
            },
        });

        const requestInit = dependencyMocks.apiRequest.mock.calls[0]?.[1] as RequestInit | undefined;
        const headers = readRequestHeaders(0);

        expect(headers.get("Authorization")).toBe("Bearer old-access-token");
        expect(headers.get("X-Feature-Name")).toBe("profile");
        expect(headers.get("X-CSRF-Token")).toBeNull();
        expect(requestInit?.credentials).toBe("omit");
        expect(requestInit?.cache).toBe("no-store");
    });

    it("fails locally for an anonymous user without attempting refresh", async () => {
        authSessionStore.clearSession();

        await expect(authorizedApiRequest("users/me")).rejects.toMatchObject({
            kind: "http",
            status: 401,
            code: "UNAUTHORIZED",
        });

        expect(dependencyMocks.coordinateAuthRefresh).not.toHaveBeenCalled();
        expect(dependencyMocks.apiRequest).not.toHaveBeenCalled();
    });

    it("bootstraps the session when the auth state is still checking", async () => {
        authSessionStore.markChecking();

        dependencyMocks.coordinateAuthRefresh.mockImplementation(async () => {
            authSessionStore.setSession(refreshedSession);
            return refreshedSession;
        });

        dependencyMocks.apiRequest.mockResolvedValue({
            data: {id: "user-1"},
        });

        await authorizedApiRequest("users/me");

        expect(dependencyMocks.coordinateAuthRefresh).toHaveBeenCalledTimes(1);

        expect(readRequestHeaders(0).get("Authorization")).toBe("Bearer new-access-token");
    });

    it("refreshes after one 401 and retries once with the rotated token", async () => {
        authSessionStore.setSession(originalSession);

        dependencyMocks.apiRequest.mockRejectedValueOnce(createHttpError(401)).mockResolvedValueOnce({
            data: {id: "user-1"},
        });

        dependencyMocks.coordinateAuthRefresh.mockImplementation(async () => {
            authSessionStore.setSession(refreshedSession);
            return refreshedSession;
        });

        await authorizedApiRequest("users/me");

        expect(dependencyMocks.apiRequest).toHaveBeenCalledTimes(2);
        expect(dependencyMocks.coordinateAuthRefresh).toHaveBeenCalledTimes(1);

        expect(readRequestHeaders(0).get("Authorization")).toBe("Bearer old-access-token");

        expect(readRequestHeaders(1).get("Authorization")).toBe("Bearer new-access-token");
    });

    it("uses an already-rotated token when a stale 401 response arrives late", async () => {
        authSessionStore.setSession(originalSession);

        dependencyMocks.apiRequest
        .mockImplementationOnce(async () => {
            authSessionStore.setSession(refreshedSession);
            throw createHttpError(401);
        })
        .mockResolvedValueOnce({
            data: {id: "user-1"},
        });

        await authorizedApiRequest("users/me");

        expect(dependencyMocks.apiRequest).toHaveBeenCalledTimes(2);
        expect(dependencyMocks.coordinateAuthRefresh).not.toHaveBeenCalled();

        expect(readRequestHeaders(1).get("Authorization")).toBe("Bearer new-access-token");
    });

    it("clears the session when the retried request also returns 401", async () => {
        authSessionStore.setSession(originalSession);

        dependencyMocks.apiRequest
        .mockRejectedValueOnce(createHttpError(401))
        .mockRejectedValueOnce(createHttpError(401));

        dependencyMocks.coordinateAuthRefresh.mockImplementation(async () => {
            authSessionStore.setSession(refreshedSession);
            return refreshedSession;
        });

        await expect(authorizedApiRequest("users/me")).rejects.toMatchObject({
            status: 401,
        });

        expect(dependencyMocks.apiRequest).toHaveBeenCalledTimes(2);
        expect(authSessionStore.getSnapshot()).toEqual({
            status: "anonymous",
            user: null,
        });
        expect(authSessionStore.getAccessToken()).toBeNull();
        expect(authSessionStore.getCsrfToken()).toBeNull();
    });

    it("does not refresh after a forbidden response", async () => {
        authSessionStore.setSession(originalSession);
        dependencyMocks.apiRequest.mockRejectedValue(createHttpError(403));

        await expect(authorizedApiRequest("users/me")).rejects.toMatchObject({
            status: 403,
        });

        expect(dependencyMocks.coordinateAuthRefresh).not.toHaveBeenCalled();
        expect(authSessionStore.getSnapshot().status).toBe("authenticated");
    });
});
