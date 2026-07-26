import {queryOptions} from "@tanstack/react-query";

import {shouldRetryPublicQuery} from "@/lib/query/public-query-retry";

import {getPublicComments} from "../api/get-public-comments";
import {
    publicCommentsQuerySchema,
    type PublicCommentsQueryInput,
} from "../schemas/public-comments.schema";

export const publicCommentKeys = {
    all: ["comments", "public"] as const,
    byPost: (postId: string) => [...publicCommentKeys.all, "post", postId] as const,
    list: (
        postId: string,
        query: ReturnType<typeof publicCommentsQuerySchema.parse>,
    ) => [...publicCommentKeys.byPost(postId), "list", query] as const,
};

export function publicCommentsQueryOptions(
    postId: string,
    input: PublicCommentsQueryInput = {},
) {
    const query = publicCommentsQuerySchema.parse(input);

    return queryOptions({
        queryKey: publicCommentKeys.list(postId, query),
        queryFn: ({signal}) => getPublicComments(postId, {query, signal}),
        staleTime: 30_000,
        retry: shouldRetryPublicQuery,
    });
}
