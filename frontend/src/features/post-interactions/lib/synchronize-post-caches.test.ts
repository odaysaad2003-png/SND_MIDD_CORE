import {QueryClient} from "@tanstack/react-query";
import {describe, expect, it} from "vitest";

import type {PublicPost, PublicPostsResult} from "@/features/posts/schemas/public-posts.schema";

import {synchronizePostLikesCount} from "./synchronize-post-caches";

const post: PublicPost = {
    id: "post-1",
    title: "منشور تجريبي",
    content: "محتوى",
    author: {id: "user-1", name: "مستخدم سند", avatar: null},
    images: [],
    status: "active",
    likesCount: 2,
    createdAt: "2026-07-27T12:00:00.000Z",
    updatedAt: "2026-07-27T12:00:00.000Z",
};

describe("synchronizePostLikesCount", () => {
    it("updates every post list cache containing the target post", () => {
        const queryClient = new QueryClient();
        const result: PublicPostsResult = {
            data: [post],
            meta: {page: 1, limit: 10, total: 1, totalPages: 1},
        };

        queryClient.setQueryData(["posts", "public", "list", {page: 1}], result);
        queryClient.setQueryData(["posts", "private", "current-user", "list"], result);

        synchronizePostLikesCount(queryClient, post.id, 9);

        expect(
            queryClient.getQueryData<PublicPostsResult>([
                "posts",
                "public",
                "list",
                {page: 1},
            ])?.data[0]?.likesCount,
        ).toBe(9);
        expect(
            queryClient.getQueryData<PublicPostsResult>([
                "posts",
                "private",
                "current-user",
                "list",
            ])?.data[0]?.likesCount,
        ).toBe(9);
    });

    it("does not alter unrelated cached resources", () => {
        const queryClient = new QueryClient();
        const unrelated = {value: "unchanged"};
        queryClient.setQueryData(["profile", "me"], unrelated);

        synchronizePostLikesCount(queryClient, post.id, 5);

        expect(queryClient.getQueryData(["profile", "me"])).toBe(unrelated);
    });
});
