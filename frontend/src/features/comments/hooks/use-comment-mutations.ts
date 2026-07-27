"use client";

import {useMutation, useQueryClient} from "@tanstack/react-query";

import {createComment, deleteComment, updateComment} from "../api/comment-mutations-api";
import {removeCommentFromCaches, replaceCommentInCaches} from "../lib/synchronize-comment-caches";
import {publicCommentKeys} from "../queries/public-comments.query";
import type {CommentMutationInput, PublicComment} from "../schemas/public-comments.schema";

export function useCreateCommentMutation(postId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: CommentMutationInput) => createComment(postId, input),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: publicCommentKeys.byPost(postId)});
        },
    });
}

export function useUpdateCommentMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({comment, input}: {comment: PublicComment; input: CommentMutationInput}) =>
            updateComment(comment, input),
        onSuccess: (comment) => replaceCommentInCaches(queryClient, comment),
        onError: async (_error, variables) => {
            await queryClient.invalidateQueries({queryKey: publicCommentKeys.byPost(variables.comment.post)});
        },
    });
}

export function useDeleteCommentMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (comment: PublicComment) => {
            await deleteComment(comment.id);
            return comment;
        },
        onSuccess: (comment) => {
            removeCommentFromCaches(queryClient, comment.post, comment.id);
            void queryClient.invalidateQueries({queryKey: publicCommentKeys.byPost(comment.post)});
        },
    });
}
