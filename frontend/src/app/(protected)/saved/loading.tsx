import {SavedPostsSkeleton} from "@/features/saves/components/saved-posts-skeleton";

export default function SavedPostsLoading() {
    return (
        <div className="px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
            <div className="mx-auto grid max-w-6xl gap-8">
                <div aria-hidden="true" className="grid gap-5 rounded-[2rem] border border-border bg-surface-raised p-6 sm:p-9">
                    <div className="skeleton-block h-7 w-36 rounded-full" />
                    <div className="skeleton-block h-12 w-2/3 rounded-full" />
                    <div className="skeleton-block h-5 w-full max-w-2xl rounded-full" />
                </div>
                <div aria-hidden="true" className="skeleton-block h-24 rounded-2xl" />
                <SavedPostsSkeleton />
            </div>
        </div>
    );
}
