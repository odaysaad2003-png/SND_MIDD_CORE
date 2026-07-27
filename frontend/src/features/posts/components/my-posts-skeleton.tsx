export function MyPostsSkeleton({count = 3}: Readonly<{count?: number}>) {
    return (
        <div role="status" aria-label="جار تحميل منشوراتك" className="grid gap-5">
            <div className="flex items-center justify-between gap-4">
                <div className="skeleton-block h-5 w-40 rounded-full" />
                <div className="skeleton-block h-5 w-24 rounded-full" />
            </div>

            <ul className="grid gap-5">
                {Array.from({length: count}, (_, index) => (
                    <li
                        key={`my-post-skeleton-${index}`}
                        aria-hidden="true"
                        className="overflow-hidden rounded-[1.75rem] border border-border bg-surface"
                    >
                        <div className="grid gap-4 p-5 sm:p-6">
                            <div className="flex items-center justify-between gap-4">
                                <div className="grid flex-1 gap-3">
                                    <div className="skeleton-block h-4 w-28 rounded-full" />
                                    <div className="skeleton-block h-7 w-2/3 rounded-full" />
                                </div>
                                <div className="skeleton-block h-8 w-20 rounded-full" />
                            </div>

                            <div className="grid gap-2">
                                <div className="skeleton-block h-4 w-full rounded-full" />
                                <div className="skeleton-block h-4 w-5/6 rounded-full" />
                                <div className="skeleton-block h-4 w-3/5 rounded-full" />
                            </div>

                            {index % 2 === 0 ? <div className="skeleton-block aspect-[16/7] rounded-2xl" /> : null}
                        </div>

                        <div className="flex flex-wrap gap-3 border-t border-border bg-surface-muted/45 p-4 sm:px-6">
                            <div className="skeleton-block h-10 w-28 rounded-xl" />
                            <div className="skeleton-block h-10 w-32 rounded-xl" />
                            <div className="skeleton-block h-10 w-24 rounded-xl" />
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
