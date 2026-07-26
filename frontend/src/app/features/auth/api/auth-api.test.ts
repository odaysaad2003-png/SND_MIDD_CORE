import {beforeEach, describe, expect, it, vi} from "vitest";

const apiRequestMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api/api-client", () => ({
    apiRequest: apiRequestMock,
}));

import {
    getRefreshCsrfToken,
    login,
    logoutAuthSession,
    refreshAuthSession,
    register,
} from "./auth-api";

const session = {
    user: {
        id: "user-1",
        name: "مستخدم سند",
        email: "user@example.com",
        role: "user",
        avatar: null,
        isActive: true,
        createdAt: "2026-07-26T10:00:00.000Z",
        updatedAt: "2026-07-26T10:00:00.000Z",
    },
    accessToken: "access-token",
    csrfToken: "csrf-token",
};

function readRequestInit(): RequestInit {
    return apiRequestMock.mock.calls[0]?.[1] as RequestInit;
}

beforeEach(() => {
    apiRequestMock.mockReset();
});

describe("auth API contract", () => {
    it("normalizes registration input and accepts the refresh cookie through credentials", async () => {
        apiRequestMock.mockResolvedValue({
            data: session,
        });

        await register({
            name: "  مستخدم سند  ",
            email: "  USER@EXAMPLE.COM ",
            password: "password-123",
        });

        const init = readRequestInit();
        const body = JSON.parse(String(init.body)) as Record<string, unknown>;

        expect(apiRequestMock).toHaveBeenCalledWith(
            "auth/register",
            expect.objectContaining({
                method: "POST",
                credentials: "include",
                cache: "no-store",
            })
        );
        expect(new Headers(init.headers).get("Content-Type")).toBe("application/json");
        expect(body).toEqual({
            name: "مستخدم سند",
            email: "user@example.com",
            password: "password-123",
        });
        expect(body).not.toHaveProperty("refreshToken");
    });

    it("uses credentialed cookie requests only for the auth session endpoints", async () => {
        apiRequestMock
            .mockResolvedValueOnce({
                data: {
                    csrfToken: "csrf-token",
                },
            })
            .mockResolvedValueOnce({
                data: session,
            })
            .mockResolvedValueOnce({
                data: {
                    message: "Logged out successfully",
                },
            });

        await expect(getRefreshCsrfToken()).resolves.toBe("csrf-token");
        await expect(refreshAuthSession({csrfToken: "csrf-token"})).resolves.toEqual(session);
        await expect(logoutAuthSession({csrfToken: "csrf-token"})).resolves.toBe("Logged out successfully");

        expect(apiRequestMock).toHaveBeenNthCalledWith(
            1,
            "auth/csrf",
            expect.objectContaining({
                method: "GET",
                credentials: "include",
            })
        );
        expect(apiRequestMock).toHaveBeenNthCalledWith(
            2,
            "auth/refresh",
            expect.objectContaining({
                method: "POST",
                credentials: "include",
                headers: {
                    "X-CSRF-Token": "csrf-token",
                },
            })
        );
        expect(apiRequestMock).toHaveBeenNthCalledWith(
            3,
            "auth/logout",
            expect.objectContaining({
                method: "POST",
                credentials: "include",
                headers: {
                    "X-CSRF-Token": "csrf-token",
                },
            })
        );
    });

    it("rejects an auth response that leaks a refresh token into JSON", async () => {
        apiRequestMock.mockResolvedValue({
            data: {
                ...session,
                refreshToken: "must-not-be-public",
            },
        });

        await expect(
            login({
                email: "user@example.com",
                password: "password-123",
            })
        ).rejects.toMatchObject({
            kind: "invalid-response",
        });
    });
});
