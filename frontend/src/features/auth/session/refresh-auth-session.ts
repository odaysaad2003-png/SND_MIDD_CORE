import "client-only";

import {ApiError} from "@/lib/api/api-error";

import {getRefreshCsrfToken, refreshAuthSession} from "../api/auth-api";
import type {AuthSessionData} from "../schemas/auth.schema";
import {authSessionStore} from "./auth-session-store";

let refreshPromise: Promise<AuthSessionData> | null = null;
let refreshAbortController: AbortController | null = null;
let refreshGeneration = 0;

function isFinalSessionError(error: unknown): boolean {
    return error instanceof ApiError && error.kind === "http" && (error.status === 401 || error.status === 403);
}

function shouldRetryWithFreshCsrf(error: unknown): boolean {
    return error instanceof ApiError && error.kind === "http" && error.status === 403;
}

function isCurrentRefresh(generation: number): boolean {
    return generation === refreshGeneration;
}

async function requestFreshCsrfToken(generation: number, signal: AbortSignal): Promise<string> {
    const csrfToken = await getRefreshCsrfToken({signal});

    if (isCurrentRefresh(generation)) {
        authSessionStore.setCsrfToken(csrfToken);
    }

    return csrfToken;
}

async function resolveCsrfToken(generation: number, signal: AbortSignal): Promise<string> {
    const currentCsrfToken = authSessionStore.getCsrfToken();

    if (currentCsrfToken) {
        return currentCsrfToken;
    }

    return requestFreshCsrfToken(generation, signal);
}

function commitRefreshedSession(session: AuthSessionData, generation: number): void {
    /*
     * قد تكون عملية Login أو Logout بدأت أثناء وجود Refresh في الشبكة.
     * عندها تصبح نتيجة الـRefresh قديمة، فلا نسمح لها بتغيير الذاكرة.
     */
    if (!isCurrentRefresh(generation)) {
        return;
    }

    authSessionStore.setSession(session);
}

async function performRefresh(generation: number, signal: AbortSignal): Promise<AuthSessionData> {
    const csrfToken = await resolveCsrfToken(generation, signal);

    try {
        const session = await refreshAuthSession({
            csrfToken,
            signal,
        });

        commitRefreshedSession(session, generation);

        return session;
    } catch (error) {
        if (!shouldRetryWithFreshCsrf(error)) {
            throw error;
        }

        const freshCsrfToken = await requestFreshCsrfToken(generation, signal);

        const session = await refreshAuthSession({
            csrfToken: freshCsrfToken,
            signal,
        });

        commitRefreshedSession(session, generation);

        return session;
    }
}

/**
 * تلغي أي Refresh قديمة عندما يبدأ انتقال Auth جديد، مثل:
 * Login أو Register أو Logout أو إعادة Bootstrap يدوية.
 */
export function invalidateAuthRefresh(): void {
    refreshGeneration += 1;

    refreshAbortController?.abort(new DOMException("The authentication refresh was superseded", "AbortError"));

    refreshAbortController = null;
    refreshPromise = null;
}

export function coordinateAuthRefresh(): Promise<AuthSessionData> {
    if (refreshPromise) {
        return refreshPromise;
    }

    const generation = refreshGeneration;
    const abortController = new AbortController();

    refreshAbortController = abortController;

    const currentPromise = performRefresh(generation, abortController.signal)
    .catch((error: unknown) => {
        /*
         * لا نمسح جلسة أحدث بسبب فشل Refresh أصبحت قديمة
         * بعد Login أو Logout آخر.
         */
        if (isCurrentRefresh(generation) && isFinalSessionError(error)) {
            authSessionStore.clearSession();
        }

        throw error;
    })
    .finally(() => {
        /*
         * قد تكون Refresh جديدة بدأت بعد إلغاء القديمة.
         * القديمة لا يجوز أن تمسح مرجع العملية الجديدة.
         */
        if (refreshPromise === currentPromise) {
            refreshPromise = null;
        }

        if (refreshAbortController === abortController) {
            refreshAbortController = null;
        }
    });

    refreshPromise = currentPromise;

    return currentPromise;
}
