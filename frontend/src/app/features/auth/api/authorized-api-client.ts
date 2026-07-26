import "client-only";

import {ApiError} from "@/lib/api/api-error";
import {apiRequest} from "@/lib/api/api-client";
import type {ApiResult} from "@/lib/api/api-types";

import {authSessionStore} from "../session/auth-session-store";
import {coordinateAuthRefresh} from "../session/refresh-auth-session";

type ReplayableRequestBody = Exclude<BodyInit, ReadableStream>;

export type AuthorizedRequestInit = Omit<RequestInit, "body" | "credentials"> &
    Readonly<{
        body?: ReplayableRequestBody | null;
    }>;

function createAuthenticationRequiredError(): ApiError {
    return new ApiError({
        kind: "http",
        message: "Authentication is required",
        status: 401,
        code: "UNAUTHORIZED",
    });
}

function isUnauthorizedError(error: unknown): error is ApiError {
    return error instanceof ApiError && error.kind === "http" && error.status === 401;
}

function getAbortReason(signal: AbortSignal): unknown {
    return signal.reason ?? new DOMException("The operation was aborted", "AbortError");
}

async function waitForSharedRefresh(signal?: AbortSignal | null): Promise<void> {
    signal?.throwIfAborted();

    const sharedRefreshPromise = coordinateAuthRefresh();

    if (!signal) {
        await sharedRefreshPromise;
        return;
    }

    await new Promise<void>((resolve, reject) => {
        const removeAbortListener = () => {
            signal.removeEventListener("abort", handleAbort);
        };

        const handleAbort = () => {
            removeAbortListener();
            reject(getAbortReason(signal));
        };

        signal.addEventListener("abort", handleAbort, {once: true});

        if (signal.aborted) {
            handleAbort();
            return;
        }

        sharedRefreshPromise.then(
            () => {
                removeAbortListener();
                resolve();
            },
            (error: unknown) => {
                removeAbortListener();
                reject(error);
            }
        );
    });
}

async function resolveAccessToken(signal?: AbortSignal | null): Promise<string> {
    const currentAccessToken = authSessionStore.getAccessToken();

    if (currentAccessToken) {
        return currentAccessToken;
    }

    if (authSessionStore.getSnapshot().status === "anonymous") {
        throw createAuthenticationRequiredError();
    }

    await waitForSharedRefresh(signal);

    const refreshedAccessToken = authSessionStore.getAccessToken();

    if (!refreshedAccessToken) {
        authSessionStore.clearSession();
        throw createAuthenticationRequiredError();
    }

    return refreshedAccessToken;
}

function createAuthorizedRequestInit(init: AuthorizedRequestInit, accessToken: string): RequestInit {
    const headers = new Headers(init.headers);

    headers.delete("X-CSRF-Token");
    headers.set("Authorization", `Bearer ${accessToken}`);

    return {
        ...init,
        headers,
        cache: "no-store",
        credentials: "omit",
    };
}

async function sendAuthorizedRequest<TData, TMeta>(
    path: string,
    init: AuthorizedRequestInit,
    accessToken: string
): Promise<ApiResult<TData, TMeta>> {
    init.signal?.throwIfAborted();

    return apiRequest<TData, TMeta>(path, createAuthorizedRequestInit(init, accessToken));
}

async function retryAuthorizedRequestOnce<TData, TMeta>(
    path: string,
    init: AuthorizedRequestInit,
    accessToken: string
): Promise<ApiResult<TData, TMeta>> {
    try {
        return await sendAuthorizedRequest<TData, TMeta>(path, init, accessToken);
    } catch (error) {
        if (isUnauthorizedError(error)) {
            authSessionStore.clearSession();
        }

        throw error;
    }
}

export async function authorizedApiRequest<TData, TMeta = never>(
    path: string,
    init: AuthorizedRequestInit = {}
): Promise<ApiResult<TData, TMeta>> {
    const requestAccessToken = await resolveAccessToken(init.signal);

    try {
        return await sendAuthorizedRequest<TData, TMeta>(path, init, requestAccessToken);
    } catch (error) {
        if (!isUnauthorizedError(error)) {
            throw error;
        }

        /*
         * ربما سجّل المستخدم خروجه أثناء وجود الطلب في الشبكة.
         * لا نحاول إحياء الجلسة بعد أن أصبحت الحالة Anonymous.
         */
        if (authSessionStore.getSnapshot().status === "anonymous") {
            throw error;
        }

        /*
         * قد يكون Request آخر قد جدّد الجلسة بالفعل، بينما وصل رد هذا
         * الطلب القديم متأخرًا. في هذه الحالة نستخدم التوكن الأحدث
         * بدل تنفيذ Refresh ثانية غير ضرورية.
         */
        const latestAccessToken = authSessionStore.getAccessToken();

        if (latestAccessToken && latestAccessToken !== requestAccessToken) {
            return retryAuthorizedRequestOnce<TData, TMeta>(path, init, latestAccessToken);
        }

        await waitForSharedRefresh(init.signal);

        const refreshedAccessToken = authSessionStore.getAccessToken();

        if (!refreshedAccessToken) {
            authSessionStore.clearSession();
            throw createAuthenticationRequiredError();
        }

        return retryAuthorizedRequestOnce<TData, TMeta>(path, init, refreshedAccessToken);
    }
}
