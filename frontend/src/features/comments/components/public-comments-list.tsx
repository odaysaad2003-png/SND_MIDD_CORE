import {dehydrate, HydrationBoundary} from "@tanstack/react-query";

import {makeQueryClient} from "@/lib/query/make-query-client";

import {
    PUBLIC_COMMENTS_PAGE_SIZE,
    type PublicCommentsUrlState,
} from "../lib/public-comments-url-state";
import {publicCommentsQueryOptions} from "../queries/public-comments.query";
import {PublicCommentsListClient} from "./public-comments-list-client";

type PublicCommentsListProps = Readonly<{
    postId: string;
    state: PublicCommentsUrlState;
}>;

export async function PublicCommentsList({postId, state}: PublicCommentsListProps) {
    const query = {
        page: state.page,
        limit: PUBLIC_COMMENTS_PAGE_SIZE,
        sort: state.sort,
    };
    const queryClient = makeQueryClient();

    await queryClient.prefetchQuery(publicCommentsQueryOptions(postId, query));

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <PublicCommentsListClient postId={postId} query={query} state={state} />
        </HydrationBoundary>
    );
}
