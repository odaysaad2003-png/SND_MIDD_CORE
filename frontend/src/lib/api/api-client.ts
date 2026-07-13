import {ApiError} from "@/lib/api/api-error";
import {type ApiErrorEnvelope, type ApiResult, type ApiSuccessEnvelope} from "@/lib/api/api-types";
import {buildApiUrl} from "@/lib/api/build-api-url";

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isApiErrorEnvelope(value: unknown): value is ApiErrorEnvelope {
    if (!isRecord(value) || value.success !== false) {
        return false;
    }

    const error = value.error;

    return isRecord(error) && typeof error.code === "string" && typeof error.message === "string";
}

function isApiSuccessEnvelope(value: unknown): value is ApiSuccessEnvelope<unknown, unknown> {
    return isRecord(value) && value.success === true && Object.hasOwn(value, "data");
}

function isAbortError(error: unknown): boolean {
    return error instanceof Error && error.name === "AbortError";
}

async function parseJsonResponse(response: Response, requestId: string | null): Promise<unknown> {
    try {
        return await response.json();
    } catch {
        throw new ApiError({
            kind: "invalid-response",
            message: "The API returned an invalid JSON response",
            status: response.status,
            requestId,
        });
    }
}

export async function apiRequest<TData, TMeta = never>(
    path: string,
    init: RequestInit = {}
): Promise<ApiResult<TData, TMeta>> {
    const url = buildApiUrl(path);
    const headers = new Headers(init.headers);

    if (!headers.has("Accept")) {
        headers.set("Accept", "application/json");
    }

    let response: Response;

    try {
        response = await fetch(url, {
            ...init,
            headers,
        });
    } catch (error) {
        if (isAbortError(error)) {
            throw error;
        }

        throw new ApiError({
            kind: "network",
            message: "The API request could not reach the server",
        });
    }

    const requestId = response.headers.get("x-request-id");

    if (response.status === 204) {
        return {
            data: undefined as TData,
        };
    }

    const payload = await parseJsonResponse(response, requestId);

    if (!response.ok) {
        if (isApiErrorEnvelope(payload)) {
            throw new ApiError({
                kind: "http",
                message: payload.error.message,
                status: response.status,
                code: payload.error.code,
                details: payload.error.details,
                requestId,
            });
        }

        throw new ApiError({
            kind: "invalid-response",
            message: "The API returned an invalid error response",
            status: response.status,
            requestId,
        });
    }

    if (!isApiSuccessEnvelope(payload)) {
        throw new ApiError({
            kind: "invalid-response",
            message: "The API returned an invalid success response",
            status: response.status,
            requestId,
        });
    }

    const result: ApiResult<TData, TMeta> = {
        data: payload.data as TData,
    };

    if (Object.hasOwn(payload, "meta")) {
        result.meta = payload.meta as TMeta;
    }

    return result;
}
