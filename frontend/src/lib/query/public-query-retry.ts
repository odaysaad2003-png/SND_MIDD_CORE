import {ApiError} from "@/lib/api/api-error";

export function shouldRetryPublicQuery(failureCount: number, error: unknown): boolean {
    if (failureCount >= 1) {
        return false;
    }

    if (error instanceof Error && error.name === "AbortError") {
        return false;
    }

    if (!(error instanceof ApiError)) {
        return false;
    }

    if (error.kind === "network") {
        return true;
    }

    return error.kind === "http" && error.status !== null && error.status >= 500;
}
