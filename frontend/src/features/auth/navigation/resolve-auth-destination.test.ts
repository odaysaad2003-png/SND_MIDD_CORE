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

    it("keeps the approved saved-posts route with URL state", () => {
        expect(resolveAuthDestination("/saved?page=2&sort=oldest")).toBe(
            "/saved?page=2&sort=oldest"
        );
    });

    it("keeps the approved current-user posts route with filters", () => {
        expect(resolveAuthDestination("/my-posts?q=مساعدة&sort=-updatedAt")).toBe(
            "/my-posts?q=%D9%85%D8%B3%D8%A7%D8%B9%D8%AF%D8%A9&sort=-updatedAt"
        );
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
