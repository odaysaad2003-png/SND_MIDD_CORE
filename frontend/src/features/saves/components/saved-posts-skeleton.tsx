export function SavedPostsSkeleton({count = 3}: Readonly<{count?: number}>) {
    return (
        <div role="status" aria-label="جار تحميل المنشورات المحفوظة" className="grid gap-5">
            <div className="flex items-center justify-between gap-4">
                <div className="skeleton-block h-5 w-40 rounded-full" />
                <div className="skeleton-block h-5 w-24 rounded-full" />
            </div>

            <ul className="grid gap-5 md:grid-cols-2">
                {Array.from({length: count}, (_, index) => (
                    <li
                        key={`saved-post-skeleton-${index}`}
                        aria-hidden="true"
                        className="grid gap-5 rounded-[1.75rem] border border-border bg-surface p-5"
                    >
                        <div className="flex items-center gap-3">
                            <div className="skeleton-block size-10 rounded-full" />
                            <div className="grid flex-1 gap-2">
                                <div className="skeleton-block h-4 w-28 rounded-full" />
                                <div className="skeleton-block h-3 w-20 rounded-full" />
                            </div>
                        </div>
                        <div className="skeleton-block h-7 w-3/4 rounded-full" />
                        <div className="grid gap-2">
                            <div className="skeleton-block h-4 w-full rounded-full" />
                            <div className="skeleton-block h-4 w-5/6 rounded-full" />
                        </div>
                        <div className="skeleton-block h-12 w-full rounded-2xl" />
                    </li>
                ))}
            </ul>
        </div>
    );
}
