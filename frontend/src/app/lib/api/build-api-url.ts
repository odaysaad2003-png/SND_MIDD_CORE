import {getPublicEnv} from "@/lib/env/public-env";

const publicEnv = getPublicEnv();

const apiBaseUrl = new URL(`${publicEnv.NEXT_PUBLIC_API_BASE_URL}/`);
const absoluteUrlPattern = /^[a-zA-Z][a-zA-Z\d+.-]*:/;

export function buildApiUrl(path: string): string {
    const requestedPath = path.trim();

    if (!requestedPath) {
        throw new Error("API path must not be empty");
    }

    if (requestedPath.startsWith("//") || absoluteUrlPattern.test(requestedPath)) {
        throw new Error("API path must be relative");
    }

    const relativePath = requestedPath.replace(/^\/+/, "");

    if (!relativePath) {
        throw new Error("API path must contain an endpoint");
    }

    const url = new URL(relativePath, apiBaseUrl);
    const hasEndpoint = url.pathname !== apiBaseUrl.pathname;
    const isInsideConfiguredApi = url.origin === apiBaseUrl.origin && url.pathname.startsWith(apiBaseUrl.pathname);

    if (!hasEndpoint || !isInsideConfiguredApi || url.hash !== "") {
        throw new Error("API path must stay inside the configured API base URL and contain an endpoint");
    }

    return url.toString();
}
