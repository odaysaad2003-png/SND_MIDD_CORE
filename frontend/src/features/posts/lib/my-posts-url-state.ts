import {z} from "zod";

import {MY_ACTIVE_POSTS_PAGE_SIZE} from "../schemas/my-posts.schema";

export type MyPostsRawSearchParams = Record<string, string | string[] | undefined>;

export type MyPostsUrlState = Readonly<{
    page: number;
    q?: string;
    sort: "createdAt" | "-createdAt" | "updatedAt" | "-updatedAt";
}>;

function getFirstValue(value: string | string[] | undefined): string | undefined {
    return Array.isArray(value) ? value[0] : value;
}

export function parseMyPostsUrlState(searchParams: MyPostsRawSearchParams): MyPostsUrlState {
    const pageResult = z.coerce.number().int().positive().safeParse(getFirstValue(searchParams.page));
    const sortResult = z
        .enum(["createdAt", "-createdAt", "updatedAt", "-updatedAt"])
        .safeParse(getFirstValue(searchParams.sort));
    const rawQuery = getFirstValue(searchParams.q)?.trim();
    const queryResult = z.string().max(100).safeParse(rawQuery);

    return {
        page: pageResult.success ? pageResult.data : 1,
        sort: sortResult.success ? sortResult.data : "-createdAt",
        ...(queryResult.success && queryResult.data ? {q: queryResult.data} : {}),
    };
}

export function buildMyPostsHref(state: MyPostsUrlState): string {
    const searchParams = new URLSearchParams();

    if (state.page > 1) {
        searchParams.set("page", String(state.page));
    }

    if (state.sort !== "-createdAt") {
        searchParams.set("sort", state.sort);
    }

    if (state.q) {
        searchParams.set("q", state.q);
    }

    const query = searchParams.toString();

    return query ? `/my-posts?${query}` : "/my-posts";
}

export function toMyActivePostsQuery(state: MyPostsUrlState) {
    return {
        page: state.page,
        limit: MY_ACTIVE_POSTS_PAGE_SIZE,
        q: state.q,
        sort: state.sort,
    };
}
