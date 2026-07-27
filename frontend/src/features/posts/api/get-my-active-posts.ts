import {authorizedApiRequest} from "@/features/auth/api/authorized-api-client";
import {ApiError} from "@/lib/api/api-error";

import {
    myActivePostsQuerySchema,
    myActivePostsResultSchema,
    type MyActivePostsQuery,
    type MyActivePostsQueryInput,
    type MyActivePostsResult,
} from "../schemas/my-posts.schema";

export type GetMyActivePostsOptions = Readonly<{
    query?: MyActivePostsQueryInput;
    signal?: AbortSignal;
}>;

function buildMyActivePostsPath(query: MyActivePostsQuery): string {
    const searchParams = new URLSearchParams({
        page: String(query.page),
        limit: String(query.limit),

        /*
         * F4 يعرض المنشورات النشطة فقط.
         * لا نسمح للـComponent باختيار status مختلفة.
         */
        status: "active",

        sort: query.sort,
    });

    if (query.q) {
        searchParams.set("q", query.q);
    }

    return `posts/me?${searchParams.toString()}`;
}

function invalidMyPostsResponse(): ApiError {
    return new ApiError({
        kind: "invalid-response",
        message: "The current-user posts response does not match the verified API contract",
    });
}

export async function getMyActivePosts(options: GetMyActivePostsOptions = {}): Promise<MyActivePostsResult> {
    const query = myActivePostsQuerySchema.parse(options.query ?? {});

    const result = await authorizedApiRequest<unknown, unknown>(buildMyActivePostsPath(query), {
        method: "GET",
        signal: options.signal,
    });

    const parsedResult = myActivePostsResultSchema.safeParse(result);

    if (!parsedResult.success) {
        throw invalidMyPostsResponse();
    }

    return parsedResult.data;
}
