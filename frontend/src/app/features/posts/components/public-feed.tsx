import {dehydrate, HydrationBoundary} from "@tanstack/react-query";

import {makeQueryClient} from "@/lib/query/make-query-client";

import {PUBLIC_FEED_PAGE_SIZE, type PublicFeedUrlState} from "../lib/public-feed-url-state";
import {publicPostsQueryOptions} from "../queries/public-posts.query";
import {PublicFeedClient} from "./public-feed-client";

type PublicFeedProps = Readonly<{
    state: PublicFeedUrlState;
}>;

export async function PublicFeed({state}: PublicFeedProps) {
    const query = {
        page: state.page,
        limit: PUBLIC_FEED_PAGE_SIZE,
        sort: state.sort,
        search: state.search,
    };
    const queryClient = makeQueryClient();

    await queryClient.prefetchQuery(publicPostsQueryOptions(query));

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <PublicFeedClient query={query} state={state} variant="feed" />
        </HydrationBoundary>
    );
}
