import {describe, expect, it} from "vitest";

import {resolveAuthDestination} from "./resolve-auth-destination";

describe("resolveAuthDestination", () => {
    it("keeps an allowlisted internal path with its query and fragment", () => {
        expect(resolveAuthDestination("/posts/507f1f77bcf86cd799439011?commentsPage=2#comments")).toBe(
            "/posts/507f1f77bcf86cd799439011?commentsPage=2#comments"
        );
    });

    it("keeps the approved private profile route", () => {
        expect(resolveAuthDestination("/profile")).toBe("/profile");
    });

    it.each([
        "https://evil.example/path",
        "//evil.example/path",
        "/\\evil.example/path",
        "/posts//evil",
        "/admin",
        "/profile/settings",
        "\u0000/posts",
    ])("falls back for an unsafe or unsupported return target: %s", (returnTo) => {
        expect(resolveAuthDestination(returnTo)).toBe("/posts");
    });

    it("uses the feed when no return target exists", () => {
        expect(resolveAuthDestination(null)).toBe("/posts");
    });
});
