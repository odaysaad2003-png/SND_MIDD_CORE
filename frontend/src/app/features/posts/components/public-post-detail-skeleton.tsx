export function PublicPostDetailSkeleton() {
    return (
        <div role="status" aria-label="جار تحميل المنشور" className="grid gap-6">
            <span className="sr-only">جار تحميل المنشور.</span>

            <div
                aria-hidden="true"
                className="skeleton-surface grid gap-6 overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-sm"
            >
                <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-1 items-center gap-3">
                        <div className="skeleton-block size-12 rounded-full" />
                        <div className="grid flex-1 gap-2">
                            <div className="skeleton-block h-4 w-32 max-w-full rounded-full" />
                            <div className="skeleton-block h-3 w-24 max-w-full rounded-full" />
                        </div>
                    </div>
                    <div className="skeleton-block h-9 w-32 rounded-xl" />
                </div>

                <div className="grid gap-3">
                    <div className="skeleton-block h-8 w-4/5 rounded-xl" />
                    <div className="skeleton-block h-3 w-44 rounded-full" />
                </div>

                <div className="grid gap-3">
                    <div className="skeleton-block h-4 w-full rounded-full" />
                    <div className="skeleton-block h-4 w-full rounded-full" />
                    <div className="skeleton-block h-4 w-5/6 rounded-full" />
                    <div className="skeleton-block h-4 w-3/4 rounded-full" />
                </div>

                <div className="skeleton-block aspect-[4/3] w-full rounded-xl" />
            </div>
        </div>
    );
}
