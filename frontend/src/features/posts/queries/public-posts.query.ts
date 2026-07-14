import {queryOptions} from "@tanstack/react-query";

import {shouldRetryPublicQuery} from "@/lib/query/public-query-retry";

import {getPublicPosts} from "../api/get-public-posts";
import {
    publicPostsQuerySchema,
    type PublicPostsQueryInput,
} from "../schemas/public-posts.schema";

export const publicPostKeys = {
    all: ["posts", "public"] as const,
    lists: () => [...publicPostKeys.all, "list"] as const,
    list: (query: ReturnType<typeof publicPostsQuerySchema.parse>) =>
        [...publicPostKeys.lists(), query] as const,
};

export function publicPostsQueryOptions(input: PublicPostsQueryInput = {}) {
    const query = publicPostsQuerySchema.parse(input);

    return queryOptions({
        queryKey: publicPostKeys.list(query),
        queryFn: ({signal}) => getPublicPosts({query, signal}),
        staleTime: 45_000,
        retry: shouldRetryPublicQuery,
    });
}
