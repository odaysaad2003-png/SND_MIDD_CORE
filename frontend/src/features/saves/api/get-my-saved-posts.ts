import {authorizedApiRequest} from "@/features/auth/api/authorized-api-client";
import {ApiError} from "@/lib/api/api-error";

import {
    savedPostsQuerySchema,
    savedPostsResultSchema,
    type SavedPostsQuery,
    type SavedPostsQueryInput,
    type SavedPostsResult,
} from "../schemas/saved-posts.schema";

type GetMySavedPostsOptions = Readonly<{
    query?: SavedPostsQueryInput;
    signal?: AbortSignal;
}>;

function buildSavedPostsPath(query: SavedPostsQuery): string {
    const searchParams = new URLSearchParams({
        page: String(query.page),
        limit: String(query.limit),
        sort: query.sort,
    });

    return `saves/me?${searchParams.toString()}`;
}

export async function getMySavedPosts(
    options: GetMySavedPostsOptions = {},
): Promise<SavedPostsResult> {
    const query = savedPostsQuerySchema.parse(options.query ?? {});
    const result = await authorizedApiRequest<unknown>(
        buildSavedPostsPath(query),
        {
            method: "GET",
            signal: options.signal,
        },
    );
    const parsedResult = savedPostsResultSchema.safeParse(result);

    if (!parsedResult.success) {
        throw new ApiError({
            kind: "invalid-response",
            message: "The saved-posts response does not match the verified API contract",
        });
    }

    return parsedResult.data;
}
