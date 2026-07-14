import Link from "next/link";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";

import type {PublicFeedUrlState} from "../lib/public-feed-url-state";

type PublicFeedControlsProps = Readonly<{
    state: PublicFeedUrlState;
}>;

export function PublicFeedControls({state}: PublicFeedControlsProps) {
    const hasActiveFilters = Boolean(state.search) || state.sort !== "latest";

    return (
        <form
            action="/posts"
            method="get"
            role="search"
            className="grid gap-4 rounded-2xl border border-border bg-surface p-4 shadow-sm sm:grid-cols-[minmax(0,1fr)_12rem_auto] sm:items-end sm:p-5"
        >
            <div className="grid gap-2">
                <label htmlFor="public-post-search" className="text-sm font-semibold text-foreground">
                    البحث في المنشورات
                </label>
                <Input
                    id="public-post-search"
                    name="search"
                    defaultValue={state.search ?? ""}
                    maxLength={100}
                    enterKeyHint="search"
                    placeholder="ابحث في العنوان أو المحتوى"
                    dir="auto"
                />
            </div>

            <div className="grid gap-2">
                <label htmlFor="public-post-sort" className="text-sm font-semibold text-foreground">
                    الترتيب
                </label>
                <select
                    id="public-post-sort"
                    name="sort"
                    defaultValue={state.sort}
                    className="h-11 rounded-xl border border-border bg-surface px-3 text-base text-foreground shadow-sm hover:border-border-strong"
                >
                    <option value="latest">الأحدث أولًا</option>
                    <option value="oldest">الأقدم أولًا</option>
                </select>
            </div>

            <div className="flex flex-wrap gap-2">
                <Button type="submit">تطبيق</Button>

                {hasActiveFilters ? (
                    <Button asChild variant="ghost">
                        <Link href="/posts">مسح الفلاتر</Link>
                    </Button>
                ) : null}
            </div>
        </form>
    );
}
