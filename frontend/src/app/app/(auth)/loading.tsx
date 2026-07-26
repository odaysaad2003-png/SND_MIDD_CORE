export default function AuthLoading() {
    return (
        <div
            role="status"
            aria-live="polite"
            aria-busy="true"
            className="relative overflow-hidden rounded-[1.75rem] border border-border/80 bg-surface/92 p-5 shadow-[0_24px_70px_rgba(11,40,68,0.1)] backdrop-blur-xl sm:p-8"
        >
            <span className="sr-only">جار تجهيز صفحة الحساب</span>

            <div
                aria-hidden="true"
                className="pointer-events-none absolute -end-20 -top-24 size-48 rounded-full bg-brand/10 blur-3xl"
            />

            <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-24 -start-20 size-44 rounded-full bg-accent/10 blur-3xl"
            />

            <div className="relative grid gap-8">
                <div className="grid gap-3">
                    <div className="skeleton-block h-6 w-28 rounded-full" />
                    <div className="skeleton-block h-9 w-3/4 rounded-xl" />
                    <div className="skeleton-block h-4 w-full rounded-full" />
                    <div className="skeleton-block h-4 w-4/5 rounded-full" />
                </div>

                <div className="grid gap-5">
                    <div className="grid gap-2">
                        <div className="skeleton-block h-4 w-24 rounded-full" />
                        <div className="skeleton-block h-12 w-full rounded-xl" />
                    </div>

                    <div className="grid gap-2">
                        <div className="skeleton-block h-4 w-28 rounded-full" />
                        <div className="skeleton-block h-12 w-full rounded-xl" />
                    </div>

                    <div className="skeleton-block h-12 w-full rounded-xl" />
                </div>

                <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
                    <span>نجهّز المساحة</span>

                    <span aria-hidden="true" className="flex items-center gap-1">
                        <span className="size-1.5 animate-bounce rounded-full bg-brand [animation-delay:-0.3s]" />
                        <span className="size-1.5 animate-bounce rounded-full bg-brand [animation-delay:-0.15s]" />
                        <span className="size-1.5 animate-bounce rounded-full bg-brand" />
                    </span>
                </div>
            </div>
        </div>
    );
}
