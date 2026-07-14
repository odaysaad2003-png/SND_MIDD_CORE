export function PublicCommentsSkeleton() {
    return (
        <div role="status" aria-label="جار تحميل التعليقات" className="grid gap-4">
            <span className="sr-only">جار تحميل التعليقات.</span>

            {Array.from({length: 3}, (_, index) => (
                <div
                    key={`public-comment-skeleton-${index}`}
                    aria-hidden="true"
                    className="skeleton-surface grid gap-4 overflow-hidden rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5"
                >
                    <div className="flex items-center gap-3">
                        <div className="skeleton-block size-10 rounded-full" />
                        <div className="grid flex-1 gap-2">
                            <div className="skeleton-block h-4 w-32 max-w-full rounded-full" />
                            <div className="skeleton-block h-3 w-40 max-w-full rounded-full" />
                        </div>
                    </div>
                    <div className="grid gap-3">
                        <div className="skeleton-block h-3 w-full rounded-full" />
                        <div className="skeleton-block h-3 w-5/6 rounded-full" />
                    </div>
                </div>
            ))}
        </div>
    );
}
