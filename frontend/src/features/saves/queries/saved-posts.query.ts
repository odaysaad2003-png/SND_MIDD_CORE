import {keepPreviousData, queryOptions} from "@tanstack/react-query";

import {getMySavedPosts} from "../api/get-my-saved-posts";
import {
    savedPostsQuerySchema,
    type SavedPostsQuery,
    type SavedPostsQueryInput,
} from "../schemas/saved-posts.schema";

export const savedPostKeys = {
    all: ["saves", "private", "current-user"] as const,
    lists: () => [...savedPostKeys.all, "list"] as const,
    list: (query: SavedPostsQuery) => [...savedPostKeys.lists(), query] as const,
};

export function savedPostsQueryOptions(input: SavedPostsQueryInput = {}) {
    const query = savedPostsQuerySchema.parse(input);

    return queryOptions({
        queryKey: savedPostKeys.list(query),
        queryFn: ({signal}) => getMySavedPosts({query, signal}),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
        retry: false,
        meta: {
            authScope: "private",
        },
    });
}
