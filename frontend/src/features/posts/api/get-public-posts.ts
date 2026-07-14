import {ApiError} from "@/lib/api/api-error";
import {apiRequest} from "@/lib/api/api-client";

import {
    publicPostsQuerySchema,
    publicPostsResultSchema,
    type PublicPostsQuery,
    type PublicPostsQueryInput,
    type PublicPostsResult,
} from "../public-posts.schema";

type GetPublicPostsOptions = Readonly<{
    cache?: RequestCache;
    query?: PublicPostsQueryInput;
    signal?: AbortSignal;
}>;

function buildPublicPostsPath(query: PublicPostsQuery): string {
    const searchParams = new URLSearchParams({
        page: String(query.page),
        limit: String(query.limit),
        sort: query.sort,
    });

    if (query.search) {
        searchParams.set("search", query.search);
    }

    return `posts?${searchParams.toString()}`;
}

export async function getPublicPosts(options: GetPublicPostsOptions = {}): Promise<PublicPostsResult> {
    const query = publicPostsQuerySchema.parse(options.query ?? {});

    const result = await apiRequest<unknown, unknown>(buildPublicPostsPath(query), {
        method: "GET",
        cache: options.cache ?? "no-store",
        signal: options.signal,
    });

    const parsedResult = publicPostsResultSchema.safeParse(result);

    if (!parsedResult.success) {
        throw new ApiError({
            kind: "invalid-response",
            message: "The public posts response does not match the verified API contract",
        });
    }

    return parsedResult.data;
}
