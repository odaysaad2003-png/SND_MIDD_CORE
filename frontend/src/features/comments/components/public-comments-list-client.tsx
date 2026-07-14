"use client";

import {useQuery} from "@tanstack/react-query";
import {RefreshCw} from "lucide-react";
import Link from "next/link";

import {Button, buttonVariants} from "@/components/ui/button";
import {Feedback} from "@/components/ui/feedback";
import {ApiError} from "@/lib/api/api-error";
import {cn} from "@/lib/utils/cn";

import {
    buildPublicCommentsHref,
    type PublicCommentsUrlState,
} from "../lib/public-comments-url-state";
import {publicCommentsQueryOptions} from "../queries/public-comments.query";
import type {PublicCommentsQueryInput} from "../schemas/public-comments.schema";
import {PublicCommentCard} from "./public-comment-card";
import {PublicCommentsPagination} from "./public-comments-pagination";
import {PublicCommentsSkeleton} from "./public-comments-skeleton";

const commentCountFormatter = new Intl.NumberFormat("ar-PS");

type PublicCommentsListClientProps = Readonly<{
    postId: string;
    query: PublicCommentsQueryInput;
    state: PublicCommentsUrlState;
}>;

export function PublicCommentsListClient({postId, query, state}: PublicCommentsListClientProps) {
    const result = useQuery(publicCommentsQueryOptions(postId, query));

    if (result.isPending) {
        return <PublicCommentsSkeleton />;
    }

    if (result.isError) {
        const requestId = result.error instanceof ApiError ? result.error.requestId : null;
        const isNetworkError = result.error instanceof ApiError && result.error.kind === "network";

        return (
            <Feedback
                variant="danger"
                title={isNetworkError ? "تعذر الاتصال لتحميل التعليقات" : "تعذر تحميل التعليقات"}
                description={
                    <div className="grid gap-3">
                        <p>المنشور ما زال ظاهرًا، ويمكنك إعادة محاولة هذا القسم وحده.</p>
                        {requestId ? (
                            <p className="text-xs text-muted-foreground">
                                معرّف الطلب: <code dir="ltr">{requestId}</code>
                            </p>
                        ) : null}
                        <div>
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                aria-busy={result.isFetching}
                                onClick={() => void result.refetch()}
                            >
                                <RefreshCw aria-hidden="true" className={result.isFetching ? "animate-spin" : undefined} />
                                {result.isFetching ? "نعيد التحميل…" : "إعادة المحاولة"}
                            </Button>
                        </div>
                    </div>
                }
            />
        );
    }

    if (result.data.meta.total === 0) {
        return <Feedback title="لا توجد تعليقات بعد" description="لم تبدأ المحادثة حول هذا المنشور حتى الآن." />;
    }

    if (result.data.data.length === 0) {
        return (
            <Feedback
                title="لا توجد تعليقات في هذه الصفحة"
                description={
                    <div className="grid gap-3">
                        <p>قد تكون وصلت إلى صفحة تتجاوز عدد الصفحات المتاحة.</p>
                        <div>
                            <Link
                                href={buildPublicCommentsHref(postId, {...state, page: 1})}
                                className={cn(buttonVariants({size: "sm", variant: "secondary"}))}
                            >
                                العودة إلى أول صفحة
                            </Link>
                        </div>
                    </div>
                }
            />
        );
    }

    return (
        <div className="grid gap-5">
            <div className="flex min-h-7 flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                <p>
                    عدد التعليقات: <span className="font-semibold text-foreground">{commentCountFormatter.format(result.data.meta.total)}</span>
                </p>
                <span aria-live="polite" className={result.isFetching ? "opacity-100" : "opacity-0"}>
                    نحدّث المحادثة…
                </span>
            </div>

            <ol className="grid gap-4">
                {result.data.data.map((comment) => (
                    <li key={comment.id}>
                        <PublicCommentCard comment={comment} />
                    </li>
                ))}
            </ol>

            <PublicCommentsPagination meta={result.data.meta} postId={postId} state={state} />
        </div>
    );
}
