import {ApiError} from "@/lib/api/api-error";
import {apiRequest} from "@/lib/api/api-client";

import {
    publicPostResultSchema,
    type PublicPost,
} from "../schemas/public-posts.schema";

type GetPublicPostOptions = Readonly<{
    cache?: RequestCache;
    signal?: AbortSignal;
}>;

export function isPublicPostUnavailableError(error: unknown): boolean {
    return error instanceof ApiError && (error.status === 400 || error.status === 404);
}

export async function getPublicPost(
    postId: string,
    options: GetPublicPostOptions = {}
): Promise<PublicPost> {
    const result = await apiRequest<unknown>(`posts/${encodeURIComponent(postId)}`, {
        method: "GET",
        cache: options.cache ?? "no-store",
        signal: options.signal,
    });

    const parsedResult = publicPostResultSchema.safeParse(result);

    if (!parsedResult.success) {
        throw new ApiError({
            kind: "invalid-response",
            message: "The public post response does not match the verified API contract",
        });
    }

    return parsedResult.data.data;
}
