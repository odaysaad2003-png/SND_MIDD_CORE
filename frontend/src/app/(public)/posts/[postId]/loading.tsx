import {PublicCommentsSkeleton} from "@/features/comments/components/public-comments-skeleton";
import {PublicPostDetailSkeleton} from "@/features/posts/components/public-post-detail-skeleton";

export default function PublicPostLoading() {
    return (
        <div className="px-4 py-8 sm:px-6 sm:py-12">
            <div className="mx-auto grid max-w-3xl gap-8">
                <div aria-hidden="true" className="skeleton-block h-4 w-40 rounded-full" />
                <PublicPostDetailSkeleton />

                <section aria-label="جار تحميل التعليقات" className="grid gap-5">
                    <div aria-hidden="true" className="grid gap-3">
                        <div className="skeleton-block h-4 w-28 rounded-full" />
                        <div className="skeleton-block h-8 w-40 rounded-xl" />
                        <div className="skeleton-block h-4 w-3/4 rounded-full" />
                    </div>
                    <PublicCommentsSkeleton />
                </section>
            </div>
        </div>
    );
}
