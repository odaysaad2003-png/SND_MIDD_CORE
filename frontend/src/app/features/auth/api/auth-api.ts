import {ApiError} from "@/lib/api/api-error";
import {apiRequest} from "@/lib/api/api-client";

import {
    authSessionResultSchema,
    csrfResultSchema,
    loginInputSchema,
    logoutResultSchema,
    registerInputSchema,
    type AuthSessionData,
    type LoginFormValues,
    type RegisterFormValues,
} from "../schemas/auth.schema";

type AuthRequestOptions = Readonly<{
    signal?: AbortSignal;
}>;

type CsrfProtectedRequestOptions = AuthRequestOptions &
    Readonly<{
        csrfToken: string;
    }>;

function invalidAuthResponse(message: string): ApiError {
    return new ApiError({
        kind: "invalid-response",
        message,
    });
}

function parseAuthSessionResult(result: unknown): AuthSessionData {
    const parsedResult = authSessionResultSchema.safeParse(result);

    if (!parsedResult.success) {
        throw invalidAuthResponse("The authentication response does not match the verified API contract");
    }

    return parsedResult.data.data;
}

export async function register(values: RegisterFormValues, options: AuthRequestOptions = {}): Promise<AuthSessionData> {
    const payload = registerInputSchema.parse(values);

    const result = await apiRequest<unknown>("auth/register", {
        method: "POST",
        cache: "no-store",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: options.signal,
    });

    return parseAuthSessionResult(result);
}

export async function login(values: LoginFormValues, options: AuthRequestOptions = {}): Promise<AuthSessionData> {
    const payload = loginInputSchema.parse(values);

    const result = await apiRequest<unknown>("auth/login", {
        method: "POST",
        cache: "no-store",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: options.signal,
    });

    return parseAuthSessionResult(result);
}

export async function getRefreshCsrfToken(options: AuthRequestOptions = {}): Promise<string> {
    const result = await apiRequest<unknown>("auth/csrf", {
        method: "GET",
        cache: "no-store",
        credentials: "include",
        signal: options.signal,
    });

    const parsedResult = csrfResultSchema.safeParse(result);

    if (!parsedResult.success) {
        throw invalidAuthResponse("The CSRF response does not match the verified API contract");
    }

    return parsedResult.data.data.csrfToken;
}

export async function refreshAuthSession({csrfToken, signal}: CsrfProtectedRequestOptions): Promise<AuthSessionData> {
    const result = await apiRequest<unknown>("auth/refresh", {
        method: "POST",
        cache: "no-store",
        credentials: "include",
        headers: {
            "X-CSRF-Token": csrfToken,
        },
        signal,
    });

    return parseAuthSessionResult(result);
}

export async function logoutAuthSession({csrfToken, signal}: CsrfProtectedRequestOptions): Promise<string> {
    const result = await apiRequest<unknown>("auth/logout", {
        method: "POST",
        cache: "no-store",
        credentials: "include",
        headers: {
            "X-CSRF-Token": csrfToken,
        },
        signal,
    });

    const parsedResult = logoutResultSchema.safeParse(result);

    if (!parsedResult.success) {
        throw invalidAuthResponse("The logout response does not match the verified API contract");
    }

    return parsedResult.data.data.message;
}
