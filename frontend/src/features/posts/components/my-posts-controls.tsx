import {FilterX, Search} from "lucide-react";
import Link from "next/link";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";

import type {MyPostsUrlState} from "../lib/my-posts-url-state";

export function MyPostsControls({state}: Readonly<{state: MyPostsUrlState}>) {
    const hasActiveFilters = Boolean(state.q) || state.sort !== "-createdAt";

    return (
        <form
            action="/my-posts"
            method="get"
            role="search"
            className="grid gap-4 rounded-[1.75rem] border border-border bg-surface p-4 shadow-[0_12px_36px_rgba(11,40,68,0.06)] sm:grid-cols-[minmax(0,1fr)_14rem_auto] sm:items-end sm:p-5"
        >
            <div className="grid gap-2">
                <label htmlFor="my-posts-search" className="text-sm font-semibold text-foreground">
                    ابحث في منشوراتك
                </label>
                <div className="relative">
                    <Search
                        aria-hidden="true"
                        className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                        id="my-posts-search"
                        name="q"
                        defaultValue={state.q ?? ""}
                        maxLength={100}
                        enterKeyHint="search"
                        placeholder="العنوان أو جزء من المحتوى"
                        dir="auto"
                        className="ps-10"
                    />
                </div>
            </div>

            <div className="grid gap-2">
                <label htmlFor="my-posts-sort" className="text-sm font-semibold text-foreground">
                    ترتيب النتائج
                </label>
                <select
                    id="my-posts-sort"
                    name="sort"
                    defaultValue={state.sort}
                    className="h-11 rounded-xl border border-border bg-surface px-3 text-base text-foreground shadow-sm transition-colors hover:border-border-strong"
                >
                    <option value="-createdAt">الأحدث نشرًا</option>
                    <option value="createdAt">الأقدم نشرًا</option>
                    <option value="-updatedAt">آخر ما تم تعديله</option>
                    <option value="updatedAt">الأقدم تعديلًا</option>
                </select>
            </div>

            <div className="flex flex-wrap gap-2">
                <Button type="submit" className="flex-1 sm:flex-none">
                    تطبيق
                </Button>

                {hasActiveFilters ? (
                    <Button asChild variant="ghost" className="flex-1 sm:flex-none">
                        <Link href="/my-posts">
                            <FilterX aria-hidden="true" />
                            مسح
                        </Link>
                    </Button>
                ) : null}
            </div>
        </form>
    );
}
