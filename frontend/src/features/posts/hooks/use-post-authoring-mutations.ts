"use client";

import {useMutation, useQueryClient} from "@tanstack/react-query";

import {createPost, uploadPostImages} from "../api/post-authoring-api";
import {myPostKeys} from "../queries/my-posts.query";
import {publicPostKeys} from "../queries/public-posts.query";
import type {PostAuthoringFormValues} from "../schemas/post-authoring.schema";
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
