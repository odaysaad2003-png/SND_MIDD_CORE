import {z} from "zod";

export const PUBLIC_FEED_PAGE_SIZE = 10;

export type PublicFeedRawSearchParams = Record<string, string | string[] | undefined>;

export type PublicFeedUrlState = Readonly<{
    page: number;
    search?: string;
    sort: "latest" | "oldest";
}>;

function getFirstValue(value: string | string[] | undefined): string | undefined {
    return Array.isArray(value) ? value[0] : value;
}

export function parsePublicFeedUrlState(searchParams: PublicFeedRawSearchParams): PublicFeedUrlState {
    const pageResult = z.coerce.number().int().positive().safeParse(getFirstValue(searchParams.page));
    const sortResult = z.enum(["latest", "oldest"]).safeParse(getFirstValue(searchParams.sort));
    const rawSearch = getFirstValue(searchParams.search)?.trim();
    const searchResult = z.string().max(100).safeParse(rawSearch);

    return {
        page: pageResult.success ? pageResult.data : 1,
        sort: sortResult.success ? sortResult.data : "latest",
        ...(searchResult.success && searchResult.data ? {search: searchResult.data} : {}),
    };
}

export function buildPublicFeedHref(state: PublicFeedUrlState): string {
    const searchParams = new URLSearchParams();

    if (state.page > 1) {
        searchParams.set("page", String(state.page));
    }

    if (state.sort !== "latest") {
        searchParams.set("sort", state.sort);
    }

    if (state.search) {
        searchParams.set("search", state.search);
    }

    const query = searchParams.toString();

    return query ? `/posts?${query}` : "/posts";
}
