import {z} from "zod";

export const PUBLIC_COMMENTS_PAGE_SIZE = 10;

export type PublicCommentsRawSearchParams = Record<string, string | string[] | undefined>;

export type PublicCommentsUrlState = Readonly<{
    page: number;
    sort: "latest" | "oldest";
}>;

function getFirstValue(value: string | string[] | undefined): string | undefined {
    return Array.isArray(value) ? value[0] : value;
}

export function parsePublicCommentsUrlState(
    searchParams: PublicCommentsRawSearchParams
): PublicCommentsUrlState {
    const pageResult = z.coerce
        .number()
        .int()
        .positive()
        .safeParse(getFirstValue(searchParams.commentsPage));

    const sortResult = z
        .enum(["latest", "oldest"])
        .safeParse(getFirstValue(searchParams.commentsSort));

    return {
        page: pageResult.success ? pageResult.data : 1,
        sort: sortResult.success ? sortResult.data : "latest",
    };
}

export function buildPublicCommentsHref(postId: string, state: PublicCommentsUrlState): string {
    const searchParams = new URLSearchParams();

    if (state.page > 1) {
        searchParams.set("commentsPage", String(state.page));
    }

    if (state.sort !== "latest") {
        searchParams.set("commentsSort", state.sort);
    }

    const query = searchParams.toString();
    const pathname = `/posts/${encodeURIComponent(postId)}`;

    return `${query ? `${pathname}?${query}` : pathname}#comments`;
}
