import {Button} from "@/components/ui/button";

import type {PublicCommentsUrlState} from "../lib/public-comments-url-state";

type PublicCommentsControlsProps = Readonly<{
    postId: string;
    state: PublicCommentsUrlState;
}>;

export function PublicCommentsControls({postId, state}: PublicCommentsControlsProps) {
    return (
        <form
            action={`/posts/${encodeURIComponent(postId)}#comments`}
            method="get"
            className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 sm:flex-row sm:items-end"
        >
            <div className="grid flex-1 gap-2">
                <label htmlFor="comments-sort" className="text-sm font-semibold text-foreground">
                    ترتيب التعليقات
                </label>

                <select
                    id="comments-sort"
                    name="commentsSort"
                    defaultValue={state.sort}
                    className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-base text-foreground shadow-sm transition-colors hover:border-border-strong sm:max-w-xs"
                >
                    <option value="latest">الأحدث أولًا</option>
                    <option value="oldest">الأقدم أولًا</option>
                </select>
            </div>

            <Button type="submit" variant="secondary">
                تطبيق الترتيب
            </Button>
        </form>
    );
}
