const fallbackDestination = "/posts";
const validationOrigin = "https://snd-internal.invalid";

const allowedExactPaths = new Set(["/", "/posts", "/profile", "/my-posts", "/privacy", "/community-guidelines"]);

const allowedPathPrefixes = ["/posts/"] as const;

function isAllowedPathname(pathname: string): boolean {
    return allowedExactPaths.has(pathname) || allowedPathPrefixes.some((prefix) => pathname.startsWith(prefix));
}

function containsUnsafeCharacters(value: string): boolean {
    return /[\u0000-\u001F\u007F\\]/.test(value);
}

export function resolveAuthDestination(returnTo: string | null | undefined): string {
    if (!returnTo || !returnTo.startsWith("/") || returnTo.startsWith("//") || containsUnsafeCharacters(returnTo)) {
        return fallbackDestination;
    }

    try {
        const parsedUrl = new URL(returnTo, validationOrigin);

        if (
            parsedUrl.origin !== validationOrigin ||
            parsedUrl.username ||
            parsedUrl.password ||
            parsedUrl.pathname.includes("//") ||
            !isAllowedPathname(parsedUrl.pathname)
        ) {
            return fallbackDestination;
        }

        return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
    } catch {
        return fallbackDestination;
    }
}
