import {afterAll, beforeAll, describe, expect, it, vi} from "vitest";

let buildApiUrl: typeof import("./build-api-url").buildApiUrl;

beforeAll(async () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.example.com/api/v1");
    ({buildApiUrl} = await import("./build-api-url"));
});

afterAll(() => {
    vi.unstubAllEnvs();
});

describe("buildApiUrl", () => {
    it("resolves an endpoint inside the configured API boundary", () => {
        expect(buildApiUrl("posts?page=2")).toBe("https://api.example.com/api/v1/posts?page=2");
    });

    it("normalizes whitespace and leading slashes", () => {
        expect(buildApiUrl("  /posts/123  ")).toBe("https://api.example.com/api/v1/posts/123");
    });

    it.each([
        "https://evil.example/posts",
        "https://api.example.com/api/v1/posts",
        "//evil.example/posts",
        "../auth/refresh",
        "%2e%2e/auth/refresh",
        "posts#private",
    ])("rejects a path that can escape or alter the API boundary: %s", (path) => {
        expect(() => buildApiUrl(path)).toThrow();
    });

    it.each(["", "   ", ".", "./", "?page=1"])("rejects a path without an endpoint: %s", (path) => {
        expect(() => buildApiUrl(path)).toThrow();
    });
});
