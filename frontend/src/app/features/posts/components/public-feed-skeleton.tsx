import {LoaderCircle} from "lucide-react";

type PublicFeedSkeletonProps = Readonly<{
    count?: number;
}>;

export function PublicFeedSkeleton({count = 3}: PublicFeedSkeletonProps) {
    return (
        <div role="status" aria-label="جار تحميل المنشورات العامة" className="grid gap-4">
            <div className="flex items-center gap-3 rounded-2xl border border-brand/15 bg-brand/5 px-4 py-3 text-sm text-muted-foreground">
                <span className="relative grid size-9 place-items-center rounded-full bg-surface shadow-sm">
                    <span aria-hidden="true" className="absolute inset-1 rounded-full border border-brand/20" />
                    <LoaderCircle aria-hidden="true" className="size-4 animate-spin text-brand" />
                </span>
                <span>نجهّز أحدث ما شاركه المجتمع…</span>
            </div>

            {Array.from({length: count}, (_, index) => (
                <div
                    key={`public-feed-skeleton-${index}`}
                    aria-hidden="true"
                    className="skeleton-surface grid gap-5 overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-sm"
                >
                    <div className="flex items-center gap-3">
                        <div className="skeleton-block size-11 rounded-full" />
                        <div className="grid flex-1 gap-2">
                            <div className="skeleton-block h-4 w-32 max-w-full rounded-full" />
                            <div className="skeleton-block h-3 w-24 max-w-full rounded-full" />
                        </div>
                    </div>

                    <div className="grid gap-3">
                        <div className="skeleton-block h-5 w-2/3 rounded-full" />
                        <div className="skeleton-block h-3 w-full rounded-full" />
                        <div className="skeleton-block h-3 w-5/6 rounded-full" />
                        <div className="skeleton-block h-3 w-3/4 rounded-full" />
                    </div>
                </div>
            ))}
        </div>
    );
}
