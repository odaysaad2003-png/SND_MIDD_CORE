import {Compass, Radio, Search} from "lucide-react";
import {Suspense} from "react";

import {PublicFeed} from "@/features/posts/components/public-feed";
import {PublicFeedControls} from "@/features/posts/components/public-feed-controls";
import {PublicFeedSkeleton} from "@/features/posts/components/public-feed-skeleton";
import {
    parsePublicFeedUrlState,
    type PublicFeedRawSearchParams,
} from "@/features/posts/lib/public-feed-url-state";

type PublicPostsPageProps = Readonly<{
    searchParams: Promise<PublicFeedRawSearchParams>;
}>;

export async function PublicPostsPage({searchParams}: PublicPostsPageProps) {
    const state = parsePublicFeedUrlState(await searchParams);
    const suspenseKey = `${state.page}:${state.sort}:${state.search ?? ""}`;

    return (
        <div className="px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
            <div className="mx-auto grid max-w-5xl gap-8">
                <header className="relative overflow-hidden rounded-[2rem] border border-border bg-surface-raised p-6 sm:p-9">
                    <div aria-hidden="true" className="absolute -end-16 -top-24 size-72 rounded-full bg-brand/12 blur-3xl" />
                    <div className="relative grid gap-6 sm:grid-cols-[1fr_auto] sm:items-end">
                        <div className="grid max-w-3xl gap-3">
                            <p className="section-kicker"><Compass aria-hidden="true" className="me-1.5 inline size-3.5" />الاستكشاف العام</p>
                            <h1 className="text-balance text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">كل ما يشاركه المجتمع، في مكان واحد.</h1>
                            <p className="max-w-2xl leading-8 text-muted-foreground">ابحث في العناوين والمحتوى، وغيّر ترتيب النتائج، وافتح أي منشور دون تسجيل الدخول.</p>
                        </div>
                        <div className="flex gap-2 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-2"><Radio aria-hidden="true" className="size-3.5 text-brand" /> بيانات مباشرة</span>
                            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-2"><Search aria-hidden="true" className="size-3.5 text-brand" /> بحث قابل للمشاركة</span>
                        </div>
                    </div>
                </header>

                <PublicFeedControls state={state} />

                <Suspense key={suspenseKey} fallback={<PublicFeedSkeleton count={4} />}>
                    <PublicFeed state={state} />
                </Suspense>
            </div>
        </div>
    );
}
