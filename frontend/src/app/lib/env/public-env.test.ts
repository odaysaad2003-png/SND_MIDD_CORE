import {afterEach, describe, expect, it, vi} from "vitest";

import {getPublicEnv} from "./public-env";

afterEach(() => {
    vi.unstubAllEnvs();
});

describe("getPublicEnv", () => {
    it("normalizes a valid HTTPS API base URL", () => {
        vi.stubEnv("NODE_ENV", "production");
        vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.example.com/api/v1/");

        expect(getPublicEnv()).toEqual({
            NEXT_PUBLIC_API_BASE_URL: "https://api.example.com/api/v1",
        });
    });

    it("allows HTTP outside production", () => {
        vi.stubEnv("NODE_ENV", "development");
        vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:5000/api/v1");

        expect(getPublicEnv().NEXT_PUBLIC_API_BASE_URL).toBe("http://localhost:5000/api/v1");
    });

    it("rejects HTTP in production", () => {
        vi.stubEnv("NODE_ENV", "production");
        vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://api.example.com/api/v1");

        expect(() => getPublicEnv()).toThrow("Invalid public environment");
    });

    it.each([
        "https://api.example.com/api/v2",
        "https://api.example.com/api/v1?token=secret",
        "https://api.example.com/api/v1#section",
        "https://user:password@api.example.com/api/v1",
    ])("rejects an invalid API boundary: %s", (value) => {
        vi.stubEnv("NODE_ENV", "production");
        vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", value);

        expect(() => getPublicEnv()).toThrow("Invalid public environment");
    });
});
