import {dehydrate, HydrationBoundary} from "@tanstack/react-query";

import {makeQueryClient} from "@/lib/query/make-query-client";

import {publicPostsQueryOptions} from "../queries/public-posts.query";
import {PublicFeedClient} from "./public-feed-client";
import {PublicFeedSkeleton} from "./public-feed-skeleton";

const previewQuery = {
    page: 1,
    limit: 3,
    sort: "latest",
} as const;

export async function PublicFeedPreview() {
    const queryClient = makeQueryClient();

    await queryClient.prefetchQuery(publicPostsQueryOptions(previewQuery));

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <PublicFeedClient query={previewQuery} variant="preview" />
        </HydrationBoundary>
    );
}

export function PublicFeedPreviewSkeleton() {
    return <PublicFeedSkeleton count={3} />;
}
