import type {QueryClient} from "@tanstack/react-query";

import type {PublicComment, PublicCommentsResult} from "../schemas/public-comments.schema";
import {publicCommentKeys} from "../queries/public-comments.query";

export function replaceCommentInCaches(queryClient: QueryClient, comment: PublicComment): void {
    queryClient.setQueriesData<PublicCommentsResult>(
        {queryKey: publicCommentKeys.byPost(comment.post)},
        (current) => current
            ? {...current, data: current.data.map((item) => item.id === comment.id ? comment : item)}
            : current,
    );
}

export function removeCommentFromCaches(queryClient: QueryClient, postId: string, commentId: string): void {
    queryClient.setQueriesData<PublicCommentsResult>(
        {queryKey: publicCommentKeys.byPost(postId)},
        (current) => {
            if (!current || !current.data.some((item) => item.id === commentId)) {
                return current;
            }

            return {
                ...current,
                data: current.data.filter((item) => item.id !== commentId),
                meta: {...current.meta, total: Math.max(0, current.meta.total - 1)},
            };
        },
    );
}
