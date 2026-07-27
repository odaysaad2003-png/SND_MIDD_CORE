import {describe, expect, it} from "vitest";

import {savedPostsResultSchema} from "./saved-posts.schema";

const savedPost = {
    id: "post-1",
    title: "منشور محفوظ",
    content: "محتوى المنشور",
    author: {
        id: "user-1",
        name: "مستخدم سند",
        avatar: null,
    },
    images: [],
    status: "active",
    likesCount: 2,
    savedAt: "2026-07-27T10:00:00.000Z",
    createdAt: "2026-07-26T10:00:00.000Z",
    updatedAt: "2026-07-26T10:00:00.000Z",
};

describe("savedPostsResultSchema", () => {
    it("accepts the verified saved-post list contract", () => {
        expect(
            savedPostsResultSchema.parse({
                data: [savedPost],
                meta: {
                    page: 1,
                    limit: 6,
                    total: 1,
                    totalPages: 1,
                },
            }),
        ).toEqual({
            data: [savedPost],
            meta: {
                page: 1,
                limit: 6,
                total: 1,
                totalPages: 1,
            },
        });
    });

    it("rejects missing savedAt and unknown fields", () => {
        expect(
            savedPostsResultSchema.safeParse({
                data: [{...savedPost, savedAt: undefined}],
                meta: {
                    page: 1,
                    limit: 6,
                    total: 1,
                    totalPages: 1,
                },
            }).success,
        ).toBe(false);

        expect(
            savedPostsResultSchema.safeParse({
                data: [{...savedPost, privateEmail: "hidden@example.com"}],
                meta: {
                    page: 1,
                    limit: 6,
                    total: 1,
                    totalPages: 1,
                },
            }).success,
        ).toBe(false);
    });
});
