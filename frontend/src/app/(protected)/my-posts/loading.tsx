import {MyPostsSkeleton} from "@/features/posts/components/my-posts-skeleton";

export default function MyPostsLoading() {
    return (
        <div className="px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
            <div className="mx-auto grid max-w-5xl gap-8">
                <div aria-hidden="true" className="grid gap-5 rounded-[2rem] border border-border bg-surface-raised p-6 sm:p-9">
                    <div className="skeleton-block h-7 w-40 rounded-full" />
                    <div className="skeleton-block h-12 w-2/3 rounded-full" />
                    <div className="skeleton-block h-5 w-full max-w-2xl rounded-full" />
                    <div className="skeleton-block h-12 w-44 rounded-xl" />
                </div>

                <div aria-hidden="true" className="skeleton-block h-32 rounded-[1.75rem]" />
                <MyPostsSkeleton />
            </div>
        </div>
    );
}
