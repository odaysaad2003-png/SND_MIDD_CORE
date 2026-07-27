import {authorizedApiRequest} from "@/features/auth/api/authorized-api-client";
import {ApiError} from "@/lib/api/api-error";

import {
    postAuthoringFormSchema,
    postMutationResultSchema,
    type PostAuthoringFormValues,
} from "../schemas/post-authoring.schema";
import type {PublicPost} from "../schemas/public-posts.schema";

type MutationOptions = Readonly<{
    signal?: AbortSignal;
}>;

function invalidPostMutationResponse(message: string): ApiError {
    return new ApiError({
        kind: "invalid-response",
        message,
    });
}

function parsePostMutationResult(result: unknown, message: string): PublicPost {
    const parsedResult = postMutationResultSchema.safeParse(result);

    if (!parsedResult.success) {
        throw invalidPostMutationResponse(message);
    }

    return parsedResult.data.data;
}

export async function createPost(
    values: PostAuthoringFormValues,
    options: MutationOptions = {}
): Promise<PublicPost> {
    const payload = postAuthoringFormSchema.parse(values);

    const result = await authorizedApiRequest<unknown>("posts", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: options.signal,
    });

    return parsePostMutationResult(result, "The created post response does not match the verified API contract");
}

export async function uploadPostImages(
    postId: string,
    files: readonly File[],
    options: MutationOptions = {}
): Promise<PublicPost> {
    if (files.length === 0) {
        throw new Error("uploadPostImages requires at least one image");
    }

    const formData = new FormData();

    files.forEach((file) => {
        formData.append("images", file, file.name);
    });

    const result = await authorizedApiRequest<unknown>(`posts/${encodeURIComponent(postId)}/images`, {
        method: "POST",
        body: formData,
        signal: options.signal,
    });

    return parsePostMutationResult(result, "The post image response does not match the verified API contract");
}
