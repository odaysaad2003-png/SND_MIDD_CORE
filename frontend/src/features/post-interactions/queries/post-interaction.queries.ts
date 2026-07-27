import {queryOptions} from "@tanstack/react-query";

import {getMyLikeStatus, getMySaveStatus} from "../api/post-interaction-api";

export const postInteractionKeys = {
    all: ["post-interactions"] as const,
    likeStatuses: () => [...postInteractionKeys.all, "like-status"] as const,
    likeStatus: (postId: string) => [...postInteractionKeys.likeStatuses(), postId] as const,
    saveStatuses: () => [...postInteractionKeys.all, "save-status"] as const,
    saveStatus: (postId: string) => [...postInteractionKeys.saveStatuses(), postId] as const,
};

export function likeStatusQueryOptions(postId: string, enabled: boolean) {
    return queryOptions({
        queryKey: postInteractionKeys.likeStatus(postId),
        queryFn: ({signal}) => getMyLikeStatus(postId, {signal}),
        enabled,
        staleTime: 30_000,
        retry: false,
        meta: {authScope: "private"},
    });
}

export function saveStatusQueryOptions(postId: string, enabled: boolean) {
    return queryOptions({
        queryKey: postInteractionKeys.saveStatus(postId),
        queryFn: ({signal}) => getMySaveStatus(postId, {signal}),
        enabled,
        staleTime: 30_000,
        retry: false,
        meta: {authScope: "private"},
    });
}
