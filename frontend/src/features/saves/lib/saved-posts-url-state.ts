import {z} from "zod";

import {SAVED_POSTS_PAGE_SIZE} from "../schemas/saved-posts.schema";

export type SavedPostsRawSearchParams = Record<
    string,
    string | string[] | undefined
>;

export type SavedPostsUrlState = Readonly<{
    page: number;
    sort: "latest" | "oldest";
}>;

function firstValue(
    value: string | string[] | undefined,
): string | undefined {
    return Array.isArray(value) ? value[0] : value;
}

export function parseSavedPostsUrlState(
    searchParams: SavedPostsRawSearchParams,
): SavedPostsUrlState {
    const page = z.coerce
        .number()
        .int()
        .positive()
        .safeParse(firstValue(searchParams.page));
    const sort = z
        .enum(["latest", "oldest"])
        .safeParse(firstValue(searchParams.sort));

    return {
        page: page.success ? page.data : 1,
        sort: sort.success ? sort.data : "latest",
    };
}

export function buildSavedPostsHref(state: SavedPostsUrlState): string {
    const searchParams = new URLSearchParams();

    if (state.page > 1) {
        searchParams.set("page", String(state.page));
    }

    if (state.sort !== "latest") {
        searchParams.set("sort", state.sort);
    }

    const query = searchParams.toString();

    return query ? `/saved?${query}` : "/saved";
}

export function toSavedPostsQuery(state: SavedPostsUrlState) {
    return {
        ...state,
        limit: SAVED_POSTS_PAGE_SIZE,
    };
}
