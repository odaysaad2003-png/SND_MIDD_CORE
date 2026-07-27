import {authorizedApiRequest} from "@/features/auth/client";
import {ApiError} from "@/lib/api/api-error";

import {
    likeStatusResultSchema,
    saveStatusResultSchema,
    type LikeStatus,
    type SaveStatus,
} from "../schemas/post-interaction.schema";

type InteractionRequestOptions = Readonly<{signal?: AbortSignal}>;

function invalidInteractionResponse(kind: "like" | "save"): ApiError {
    return new ApiError({
        kind: "invalid-response",
        message: `The ${kind} response does not match the verified API contract`,
    });
}

async function requestLikeStatus(
    postId: string,
    method: "GET" | "POST" | "DELETE",
    options: InteractionRequestOptions = {},
): Promise<LikeStatus> {
    const suffix = method === "GET" ? "/me" : "";
    const result = await authorizedApiRequest<unknown>(
        `posts/${encodeURIComponent(postId)}/likes${suffix}`,
        {method, signal: options.signal},
    );
    const parsed = likeStatusResultSchema.safeParse(result);

    if (!parsed.success) {
        throw invalidInteractionResponse("like");
    }

    return parsed.data.data;
}

async function requestSaveStatus(
    postId: string,
    method: "GET" | "POST" | "DELETE",
    options: InteractionRequestOptions = {},
): Promise<SaveStatus> {
    const suffix = method === "GET" ? "/me" : "";
    const result = await authorizedApiRequest<unknown>(
        `posts/${encodeURIComponent(postId)}/saves${suffix}`,
        {method, signal: options.signal},
    );
    const parsed = saveStatusResultSchema.safeParse(result);

    if (!parsed.success) {
        throw invalidInteractionResponse("save");
    }

    return parsed.data.data;
}

export const getMyLikeStatus = (postId: string, options?: InteractionRequestOptions) =>
    requestLikeStatus(postId, "GET", options);

export const likePost = (postId: string, options?: InteractionRequestOptions) =>
    requestLikeStatus(postId, "POST", options);

export const unlikePost = (postId: string, options?: InteractionRequestOptions) =>
    requestLikeStatus(postId, "DELETE", options);

export const getMySaveStatus = (postId: string, options?: InteractionRequestOptions) =>
    requestSaveStatus(postId, "GET", options);

export const savePost = (postId: string, options?: InteractionRequestOptions) =>
    requestSaveStatus(postId, "POST", options);

export const unsavePost = (postId: string, options?: InteractionRequestOptions) =>
    requestSaveStatus(postId, "DELETE", options);
