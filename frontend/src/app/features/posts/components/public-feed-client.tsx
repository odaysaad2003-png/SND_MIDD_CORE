"use client";

import {useQuery} from "@tanstack/react-query";
import {RefreshCw, Sparkles} from "lucide-react";
import Link from "next/link";

import {Button} from "@/components/ui/button";
import {Feedback} from "@/components/ui/feedback";
import {ApiError} from "@/lib/api/api-error";

import type {PublicFeedUrlState} from "../lib/public-feed-url-state";
import {publicPostsQueryOptions} from "../queries/public-posts.query";
import type {PublicPostsQueryInput} from "../schemas/public-posts.schema";
import {PublicFeedPagination} from "./public-feed-pagination";
import {PublicFeedSkeleton} from "./public-feed-skeleton";
import {PublicPostCard} from "./public-post-card";

type PublicFeedClientProps = Readonly<{
    query: PublicPostsQueryInput;
    state?: PublicFeedUrlState;
    variant: "feed" | "preview";
}>;

export function PublicFeedClient({query, state, variant}: PublicFeedClientProps) {
    const result = useQuery(publicPostsQueryOptions(query));

    if (result.isPending) {
        return <PublicFeedSkeleton count={variant === "preview" ? 3 : 4} />;
    }

    if (result.isError) {
        const requestId = result.error instanceof ApiError ? result.error.requestId : null;
        const isNetworkError = result.error instanceof ApiError && result.error.kind === "network";

        return (
            <Feedback
                variant="danger"
                title={isNetworkError ? "الاتصال بالمجتمع غير متاح الآن" : "تعذر تحميل المنشورات"}
                description={
                    <div className="grid gap-4">
                        <p>
                            {variant === "preview"
                                ? "باقي الصفحة متاح. يمكنك إعادة محاولة تحميل أحدث المنشورات فقط."
                                : "احتفظنا بعنوان الصفحة والفلاتر. أعد المحاولة دون فقدان مسار التصفح."}
                        </p>

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
                                {result.isFetching ? "نعيد الاتصال…" : "إعادة المحاولة"}
                            </Button>
                        </div>
                    </div>
                }
            />
        );
    }

    const {data, meta} = result.data;

    if (data.length === 0) {
        const hasActiveFilters = variant === "feed" && state
            ? Boolean(state.search) || state.sort !== "latest"
            : false;

        return (
            <Feedback
                title={hasActiveFilters ? "لا توجد منشورات تطابق بحثك" : "لا توجد منشورات عامة حتى الآن"}
                description={
                    <div className="grid gap-3">
                        <p>
                            {hasActiveFilters
                                ? "جرّب عبارة أقصر أو ارجع إلى العرض الأحدث."
                                : "عندما يبدأ المجتمع بالمشاركة ستظهر المنشورات هنا."}
                        </p>
                        {variant === "feed" ? (
                            <div>
                                <Button asChild variant="secondary" size="sm">
                                    <Link href="/posts">مسح الفلاتر والعودة للبداية</Link>
                                </Button>
                            </div>
                        ) : null}
                    </div>
                }
            />
        );
    }

    return (
        <div className="grid gap-5">
            {variant === "feed" ? (
                <div className="flex min-h-8 flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                    <p>
                        <span className="font-semibold text-foreground">{meta.total}</span> منشورًا متاحًا للقراءة
                    </p>
                    <p
                        aria-live="polite"
                        className={`inline-flex items-center gap-2 transition-opacity ${result.isFetching ? "opacity-100" : "opacity-0"}`}
                    >
                        <Sparkles aria-hidden="true" className="size-4 text-brand" />
                        نحدّث المحتوى
                    </p>
                </div>
            ) : null}

            <ul className={variant === "preview" ? "grid gap-4 lg:grid-cols-3" : "grid gap-4"}>
                {data.map((post, index) => (
                    <li key={post.id} className="h-full">
                        <PublicPostCard post={post} featured={variant === "preview" && index === 0} />
                    </li>
                ))}
            </ul>

            {variant === "feed" && state ? <PublicFeedPagination meta={meta} state={state} /> : null}
        </div>
    );
}
