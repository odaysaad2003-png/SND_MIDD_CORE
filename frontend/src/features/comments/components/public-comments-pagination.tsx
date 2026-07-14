import Link from "next/link";

import {Button} from "@/components/ui/button";
import type {PaginationMeta} from "@/features/posts";

import {
    buildPublicCommentsHref,
    type PublicCommentsUrlState,
} from "../lib/public-comments-url-state";

type PublicCommentsPaginationProps = Readonly<{
    meta: PaginationMeta;
    postId: string;
    state: PublicCommentsUrlState;
}>;

export function PublicCommentsPagination({meta, postId, state}: PublicCommentsPaginationProps) {
    if (meta.totalPages <= 1) {
        return null;
    }

    const hasPreviousPage = meta.page > 1;
    const hasNextPage = meta.page < meta.totalPages;

    return (
        <nav
            aria-label="التنقل بين صفحات التعليقات"
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface p-4"
        >
            {hasPreviousPage ? (
                <Button asChild variant="secondary">
                    <Link href={buildPublicCommentsHref(postId, {...state, page: meta.page - 1})}>
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
                    <Link href={buildPublicCommentsHref(postId, {...state, page: meta.page + 1})}>
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
