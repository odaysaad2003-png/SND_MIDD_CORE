import Link from "next/link";

import {Button} from "@/components/ui/button";

import {buildPublicFeedHref, type PublicFeedUrlState} from "../lib/public-feed-url-state";
import type {PaginationMeta} from "../schemas/public-posts.schema";

type PublicFeedPaginationProps = Readonly<{
    meta: PaginationMeta;
    state: PublicFeedUrlState;
}>;

export function PublicFeedPagination({meta, state}: PublicFeedPaginationProps) {
    if (meta.totalPages <= 1) {
        return null;
    }

    const hasPreviousPage = meta.page > 1;
    const hasNextPage = meta.page < meta.totalPages;

    return (
        <nav
            aria-label="التنقل بين صفحات المنشورات"
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm"
        >
            {hasPreviousPage ? (
                <Button asChild variant="secondary">
                    <Link
                        href={buildPublicFeedHref({...state, page: meta.page - 1})}
                        scroll
                    >
                        الصفحة السابقة
                    </Link>
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
                    <Link
                        href={buildPublicFeedHref({...state, page: meta.page + 1})}
                        scroll
                    >
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
