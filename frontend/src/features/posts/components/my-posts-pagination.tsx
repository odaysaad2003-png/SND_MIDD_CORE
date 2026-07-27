import Link from "next/link";

import {Button} from "@/components/ui/button";

import {buildMyPostsHref, type MyPostsUrlState} from "../lib/my-posts-url-state";
import type {PaginationMeta} from "../schemas/public-posts.schema";

type MyPostsPaginationProps = Readonly<{
    meta: PaginationMeta;
    state: MyPostsUrlState;
}>;

export function MyPostsPagination({meta, state}: MyPostsPaginationProps) {
    if (meta.totalPages <= 1) {
        return null;
    }

    const hasPreviousPage = meta.page > 1;
    const hasNextPage = meta.page < meta.totalPages;

    return (
        <nav
            aria-label="التنقل بين صفحات منشوراتي"
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm"
        >
            {hasPreviousPage ? (
                <Button asChild variant="secondary">
                    <Link href={buildMyPostsHref({...state, page: meta.page - 1})}>الصفحة السابقة</Link>
                </Button>
            ) : (
                <Button type="button" variant="secondary" disabled>
                    الصفحة السابقة
                </Button>
            )}

            <p className="text-sm text-muted-foreground">
                الصفحة <span className="font-semibold text-foreground">{meta.page}</span> من{" "}
                <span className="font-semibold text-foreground">{meta.totalPages}</span>
            </p>

            {hasNextPage ? (
                <Button asChild variant="secondary">
                    <Link href={buildMyPostsHref({...state, page: meta.page + 1})}>الصفحة التالية</Link>
                </Button>
            ) : (
                <Button type="button" variant="secondary" disabled>
                    الصفحة التالية
                </Button>
            )}
        </nav>
    );
}
