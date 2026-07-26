import {ApiError} from "@/lib/api/api-error";
import {apiRequest} from "@/lib/api/api-client";

import {
    publicCommentsQuerySchema,
    publicCommentsResultSchema,
    type PublicCommentsQuery,
    type PublicCommentsQueryInput,
    type PublicCommentsResult,
} from "../schemas/public-comments.schema";

type GetPublicCommentsOptions = Readonly<{
    cache?: RequestCache;
    query?: PublicCommentsQueryInput;
    signal?: AbortSignal;
}>;

function buildPublicCommentsPath(postId: string, query: PublicCommentsQuery): string {
    const searchParams = new URLSearchParams({
        page: String(query.page),
        limit: String(query.limit),
        sort: query.sort,
    });

    return `posts/${encodeURIComponent(postId)}/comments?${searchParams.toString()}`;
}

export async function getPublicComments(
    postId: string,
    options: GetPublicCommentsOptions = {}
): Promise<PublicCommentsResult> {
    const query = publicCommentsQuerySchema.parse(options.query ?? {});

    const result = await apiRequest<unknown, unknown>(buildPublicCommentsPath(postId, query), {
        method: "GET",
        cache: options.cache ?? "no-store",
        signal: options.signal,
    });

    const parsedResult = publicCommentsResultSchema.safeParse(result);

    if (!parsedResult.success) {
        throw new ApiError({
            kind: "invalid-response",
            message: "The public comments response does not match the verified API contract",
        });
    }

    const containsMismatchedPost = parsedResult.data.data.some((comment) => comment.post !== postId);

    if (containsMismatchedPost) {
        throw new ApiError({
            kind: "invalid-response",
            message: "The comments response contains an unexpected post reference",
        });
    }

    return parsedResult.data;
}
