import {BookmarkCheck, Cloud, ShieldCheck} from "lucide-react";

import {Button} from "@/components/ui/button";

import {SavedPostsClient} from "../components/saved-posts-client";
import {
    parseSavedPostsUrlState,
    type SavedPostsRawSearchParams,
} from "../lib/saved-posts-url-state";

export async function SavedPostsPage({
    searchParams,
}: Readonly<{searchParams: Promise<SavedPostsRawSearchParams>}>) {
    const state = parseSavedPostsUrlState(await searchParams);

    return (
        <div className="px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
            <div className="mx-auto grid max-w-6xl gap-8">
                <header className="relative overflow-hidden rounded-[2rem] border border-border bg-surface-raised p-6 sm:p-9">
                    <div aria-hidden="true" className="absolute -end-16 -top-24 size-72 rounded-full bg-brand/12 blur-3xl" />
                    <div className="relative grid gap-6">
                        <p className="section-kicker">
                            <BookmarkCheck aria-hidden="true" className="me-1.5 inline size-3.5" />
                            مكتبتك الشخصية
                        </p>
                        <div className="grid max-w-3xl gap-3">
                            <h1 className="text-balance text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl">
                                منشورات تريد العودة إليها.
                            </h1>
                            <p className="leading-8 text-muted-foreground">
                                مساحة خاصة تجمع ما حفظته. أزل الحفظ من البطاقة وستتزامن القائمة مع الخادم تلقائيًا.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-2">
                                <ShieldCheck aria-hidden="true" className="size-3.5 text-success" />
                                ظاهرة لك فقط
                            </span>
                            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-2">
                                <Cloud aria-hidden="true" className="size-3.5 text-brand" />
                                محفوظة على حسابك
                            </span>
                        </div>
                    </div>
                </header>

                <form
                    action="/saved"
                    method="get"
                    className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-end sm:justify-between"
                >
                    <div className="grid gap-2">
                        <label htmlFor="saved-sort" className="text-sm font-semibold">
                            ترتيب المحفوظات
                        </label>
                        <select
                            id="saved-sort"
                            name="sort"
                            defaultValue={state.sort}
                            className="h-11 rounded-xl border border-border bg-surface px-3 text-foreground"
                        >
                            <option value="latest">الأحدث حفظًا</option>
                            <option value="oldest">الأقدم حفظًا</option>
                        </select>
                    </div>
                    <Button type="submit">تطبيق الترتيب</Button>
                </form>

                <SavedPostsClient state={state} />
            </div>
        </div>
    );
}
