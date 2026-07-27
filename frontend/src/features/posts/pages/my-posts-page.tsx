import {Images, LayoutDashboard, ShieldCheck} from "lucide-react";

import {MyPostsClient} from "../components/my-posts-client";
import {MyPostsControls} from "../components/my-posts-controls";
import {PostComposerTrigger} from "../components/post-composer-trigger";
import {parseMyPostsUrlState, type MyPostsRawSearchParams} from "../lib/my-posts-url-state";

type MyPostsPageProps = Readonly<{
    searchParams: Promise<MyPostsRawSearchParams>;
}>;

export async function MyPostsPage({searchParams}: MyPostsPageProps) {
    const state = parseMyPostsUrlState(await searchParams);

    return (
        <div className="px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
            <div className="mx-auto grid max-w-5xl gap-8">
                <header className="relative overflow-hidden rounded-[2rem] border border-border bg-surface-raised p-6 sm:p-9">
                    <div aria-hidden="true" className="absolute -end-16 -top-24 size-72 rounded-full bg-brand/12 blur-3xl" />
                    <div aria-hidden="true" className="absolute -bottom-28 -start-20 size-64 rounded-full bg-accent/8 blur-3xl" />

                    <div className="relative grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
                        <div className="grid max-w-3xl gap-4">
                            <p className="section-kicker">
                                <LayoutDashboard aria-hidden="true" className="me-1.5 inline size-3.5" />
                                مساحة إدارة المحتوى
                            </p>

                            <div className="grid gap-3">
                                <h1 className="text-balance text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                                    منشوراتك، تحت سيطرتك.
                                </h1>
                                <p className="max-w-2xl leading-8 text-muted-foreground">
                                    ابحث في منشوراتك النشطة، عدّل النص، أضف الصور أو احذفها، واتخذ قرار الحذف من مكان واحد واضح.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-2">
                                    <ShieldCheck aria-hidden="true" className="size-3.5 text-success" />
                                    عمليات المالك فقط
                                </span>
                                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-2">
                                    <Images aria-hidden="true" className="size-3.5 text-brand" />
                                    حتى 5 صور لكل منشور
                                </span>
                            </div>
                        </div>

                        <PostComposerTrigger size="lg" className="w-full shadow-lg lg:w-auto" />
                    </div>
                </header>

                <MyPostsControls state={state} />
                <MyPostsClient state={state} />
            </div>
        </div>
    );
}
