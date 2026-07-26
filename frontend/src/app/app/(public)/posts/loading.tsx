import {PublicFeedSkeleton} from "@/features/posts/components/public-feed-skeleton";

export default function PublicPostsLoading() {
    return (
        <div className="px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
            <div className="mx-auto grid max-w-5xl gap-8">
                <div aria-hidden="true" className="skeleton-surface grid min-h-72 gap-4 overflow-hidden rounded-[2rem] border border-border bg-surface-raised p-6 sm:p-9">
                    <div className="skeleton-block h-7 w-36 rounded-full" />
                    <div className="skeleton-block h-12 w-4/5 max-w-2xl rounded-2xl" />
                    <div className="skeleton-block h-4 w-3/5 max-w-xl rounded-full" />
                </div>
                <PublicFeedSkeleton count={4} />
            </div>
        </div>
    );
}
