import {describe, expect, it} from "vitest";

import {
    buildAdminPostsHref,
    buildAdminReportsHref,
    buildAdminUsersHref,
    parseAdminPostsUrlState,
    parseAdminReportsUrlState,
    parseAdminUsersUrlState,
} from "./admin-url-state";

describe("admin URL state", () => {
    it("normalizes user filters and rejects unsupported values", () => {
        expect(
            parseAdminUsersUrlState({
                page: "2",
                q: "  user@example.com  ",
                status: "active",
                role: "owner",
                sort: "oldest",
            })
        ).toEqual({
            page: 2,
            q: "user@example.com",
            status: "active",
            sort: "oldest",
        });
    });

    it("builds stable user pagination links without default noise", () => {
        expect(
            buildAdminUsersHref({
                page: 1,
                status: "suspended",
                sort: "latest",
            })
        ).toBe("/admin/users?status=suspended");
    });

    it("normalizes post lifecycle and moderation filters", () => {
        expect(
            parseAdminPostsUrlState({
                page: "-1",
                lifecycleStatus: "deleted",
                moderationStatus: "hidden",
            })
        ).toEqual({
            page: 1,
            lifecycleStatus: "deleted",
            moderationStatus: "hidden",
            sort: "latest",
        });

        expect(
            buildAdminPostsHref({
                page: 3,
                lifecycleStatus: "deleted",
                moderationStatus: "hidden",
                sort: "latest",
            })
        ).toBe("/admin/posts?page=3&lifecycleStatus=deleted&moderationStatus=hidden");
    });

    it("keeps only exact report enums", () => {
        expect(
            parseAdminReportsUrlState({
                status: "pending",
                targetType: "post",
                reason: "spam",
                sort: "oldest",
            })
        ).toEqual({
            page: 1,
            status: "pending",
            targetType: "post",
            reason: "spam",
            sort: "oldest",
        });

        expect(
            buildAdminReportsHref({
                page: 1,
                status: "pending",
                targetType: "post",
                reason: "spam",
                sort: "oldest",
            })
        ).toBe("/admin/reports?status=pending&targetType=post&reason=spam&sort=oldest");
    });
});
