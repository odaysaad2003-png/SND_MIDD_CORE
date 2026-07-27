import type {QueryClient} from "@tanstack/react-query";

import type {PublicPost, PublicPostsResult} from "@/features/posts/schemas/public-posts.schema";

function isPublicPost(value: unknown): value is PublicPost {
    return typeof value === "object" && value !== null && "id" in value;
}

function updatePost(post: PublicPost, postId: string, likesCount: number): PublicPost {
    return post.id === postId && post.likesCount !== likesCount
        ? {...post, likesCount}
        : post;
}

function updatePostCacheValue(value: unknown, postId: string, likesCount: number): unknown {
    if (isPublicPost(value)) {
        return updatePost(value, postId, likesCount);
    }

    if (
        typeof value === "object" &&
        value !== null &&
        "data" in value &&
        Array.isArray((value as PublicPostsResult).data)
    ) {
        const result = value as PublicPostsResult;
        let changed = false;
        const data = result.data.map((post) => {
            const nextPost = updatePost(post, postId, likesCount);
            changed ||= nextPost !== post;
            return nextPost;
        });

        return changed ? {...result, data} : value;
    }

    return value;
}

export function synchronizePostLikesCount(
    queryClient: QueryClient,
    postId: string,
    likesCount: number,
): void {
    queryClient.setQueriesData(
        {
            predicate: (query) => query.queryKey[0] === "posts",
        },
        (current) => updatePostCacheValue(current, postId, likesCount),
    );
}
