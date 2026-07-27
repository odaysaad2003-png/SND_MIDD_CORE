"use client";

import {useMutation, useQueryClient} from "@tanstack/react-query";

import {
    createPost,
    deletePost,
    removePostImage,
    updatePost,
    uploadPostImages,
} from "../api/post-authoring-api";
import {myPostKeys} from "../queries/my-posts.query";
import {publicPostKeys} from "../queries/public-posts.query";
import type {PostAuthoringFormValues, PostUpdatePayload} from "../schemas/post-authoring.schema";
import type {PublicPost, PublicPostsResult} from "../schemas/public-posts.schema";

function replacePostInList(current: PublicPostsResult | undefined, post: PublicPost): PublicPostsResult | undefined {
    if (!current) {
        return current;
    }

    const hasPost = current.data.some((item) => item.id === post.id);

    if (!hasPost) {
        return current;
    }

    return {
        ...current,
        data: current.data.map((item) => (item.id === post.id ? post : item)),
    };
}

function removePostFromList(current: PublicPostsResult | undefined, postId: string): PublicPostsResult | undefined {
    if (!current || !current.data.some((item) => item.id === postId)) {
        return current;
    }

    const total = Math.max(0, current.meta.total - 1);

    return {
        data: current.data.filter((item) => item.id !== postId),
        meta: {
            ...current.meta,
            total,
            totalPages: total === 0 ? 0 : Math.ceil(total / current.meta.limit),
        },
    };
}

export function usePostCacheActions() {
    const queryClient = useQueryClient();

    return {
        async invalidatePostLists(): Promise<void> {
            await Promise.all([
                queryClient.invalidateQueries({queryKey: publicPostKeys.lists()}),
                queryClient.invalidateQueries({queryKey: myPostKeys.lists()}),
            ]);
        },

        synchronizePost(post: PublicPost): void {
            queryClient.setQueriesData<PublicPostsResult>(
                {queryKey: publicPostKeys.lists()},
                (current) => replacePostInList(current, post)
            );

            queryClient.setQueriesData<PublicPostsResult>(
                {queryKey: myPostKeys.lists()},
                (current) => replacePostInList(current, post)
            );
        },

        removePost(postId: string): void {
            queryClient.setQueriesData<PublicPostsResult>(
                {queryKey: publicPostKeys.lists()},
                (current) => removePostFromList(current, postId)
            );

            queryClient.setQueriesData<PublicPostsResult>(
                {queryKey: myPostKeys.lists()},
                (current) => removePostFromList(current, postId)
            );
        },
    };
}

export function useCreatePost() {
    const cache = usePostCacheActions();

    return useMutation({
        mutationKey: ["posts", "create"] as const,
        mutationFn: (values: PostAuthoringFormValues) => createPost(values),
        retry: false,
        gcTime: 0,
        onSuccess: () => {
            void cache.invalidatePostLists();
        },
    });
}

type UpdatePostVariables = Readonly<{
    postId: string;
    values: PostUpdatePayload;
}>;

export function useUpdatePost() {
    const cache = usePostCacheActions();

    return useMutation({
        mutationKey: ["posts", "update"] as const,
        mutationFn: ({postId, values}: UpdatePostVariables) => updatePost(postId, values),
        retry: false,
        gcTime: 0,
        onSuccess: (post) => {
            cache.synchronizePost(post);
            void cache.invalidatePostLists();
        },
    });
}

export function useDeletePost() {
    const cache = usePostCacheActions();

    return useMutation({
        mutationKey: ["posts", "delete"] as const,
        mutationFn: (postId: string) => deletePost(postId),
        retry: false,
        gcTime: 0,
        onSuccess: (_data, postId) => {
            cache.removePost(postId);
            void cache.invalidatePostLists();
        },
        onError: () => {
            // DELETE غير idempotent من منظور النتيجة المرئية عند انقطاع الشبكة؛
            // نعيد قراءة القوائم بدل إعادة إرسال الطلب تلقائيًا.
            void cache.invalidatePostLists();
        },
    });
}

type UploadPostImagesVariables = Readonly<{
    postId: string;
    files: readonly File[];
}>;

export function useUploadPostImages() {
    const cache = usePostCacheActions();

    return useMutation({
        mutationKey: ["posts", "upload-images"] as const,
        mutationFn: ({postId, files}: UploadPostImagesVariables) => uploadPostImages(postId, files),
        retry: false,
        gcTime: 0,
        onSuccess: (post) => {
            cache.synchronizePost(post);
            void cache.invalidatePostLists();
        },
    });
}

type RemovePostImageVariables = Readonly<{
    postId: string;
    imageUrl: string;
}>;

export function useRemovePostImage() {
    const cache = usePostCacheActions();

    return useMutation({
        mutationKey: ["posts", "remove-image"] as const,
        mutationFn: ({postId, imageUrl}: RemovePostImageVariables) => removePostImage(postId, imageUrl),
        retry: false,
        gcTime: 0,
        onSuccess: (post) => {
            cache.synchronizePost(post);
            void cache.invalidatePostLists();
        },
    });
}
