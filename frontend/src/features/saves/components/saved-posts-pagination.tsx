import Link from "next/link";

import {Button} from "@/components/ui/button";
import type {PaginationMeta} from "@/features/posts/schemas/public-posts.schema";

import {
    buildSavedPostsHref,
    type SavedPostsUrlState,
} from "../lib/saved-posts-url-state";

export function SavedPostsPagination({
    meta,
    state,
}: Readonly<{meta: PaginationMeta; state: SavedPostsUrlState}>) {
    if (meta.totalPages <= 1) {
        return null;
    }

    return (
        <nav
            aria-label="التنقل بين صفحات المحفوظات"
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4"
        >
            {meta.page > 1 ? (
                <Button asChild variant="secondary">
                    <Link href={buildSavedPostsHref({...state, page: meta.page - 1})}>
                        الصفحة السابقة
                    </Link>
                </Button>
            ) : (
                <Button type="button" variant="secondary" disabled>
                    الصفحة السابقة
                </Button>
            )}

            <p className="text-sm text-muted-foreground">
                الصفحة <strong className="text-foreground">{meta.page}</strong> من{" "}
                <strong className="text-foreground">{meta.totalPages}</strong>
            </p>

            {meta.page < meta.totalPages ? (
                <Button asChild variant="secondary">
                    <Link href={buildSavedPostsHref({...state, page: meta.page + 1})}>
                        الصفحة التالية
                    </Link>
                </Button>
            ) : (
                <Button type="button" variant="secondary" disabled>
                    الصفحة التالية
                </Button>
            )}
        </nav>
    );
}
