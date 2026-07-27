"use client";

import {useQuery, useQueryClient} from "@tanstack/react-query";
import {BookmarkX, RefreshCw, Sparkles} from "lucide-react";
import Link from "next/link";
import {useEffect} from "react";

import {Button} from "@/components/ui/button";
import {Feedback} from "@/components/ui/feedback";
import {saveStatusQueryOptions} from "@/features/post-interactions/queries/post-interaction.queries";
import {PublicPostCard} from "@/features/posts/components/public-post-card";
import type {SavedPost} from "@/features/saves/schemas/saved-posts.schema";
import {ApiError} from "@/lib/api/api-error";

import {
    buildSavedPostsHref,
    toSavedPostsQuery,
    type SavedPostsUrlState,
} from "../lib/saved-posts-url-state";
import {savedPostKeys, savedPostsQueryOptions} from "../queries/saved-posts.query";
import {SavedPostsPagination} from "./saved-posts-pagination";
import {SavedPostsSkeleton} from "./saved-posts-skeleton";

function SavedPostCard({post}: Readonly<{post: SavedPost}>) {
    const queryClient = useQueryClient();
    const saveStatus = useQuery(saveStatusQueryOptions(post.id, true));

    useEffect(() => {
        if (saveStatus.data?.savedByMe === false) {
            void queryClient.invalidateQueries({queryKey: savedPostKeys.all});
        }
    }, [queryClient, saveStatus.data?.savedByMe]);

    return <PublicPostCard post={post} />;
}

function errorCopy(error: unknown): Readonly<{title: string; description: string}> {
    if (error instanceof ApiError && error.kind === "network") {
        return {
            title: "تعذر الاتصال بالمحفوظات",
            description: "تحقق من الإنترنت ثم أعد المحاولة. لم تتغير محفوظاتك.",
        };
    }

    if (error instanceof ApiError && error.kind === "invalid-response") {
        return {
            title: "تعذر التحقق من بيانات المحفوظات",
            description: "وصل رد لا يطابق العقد المعتمد، لذلك لم نعرض بيانات غير موثوقة.",
        };
    }

    if (error instanceof ApiError && error.status === 403) {
        return {
            title: "المحفوظات غير متاحة لهذا الحساب",
            description: "رفض الخادم الطلب. قد يكون الحساب غير نشط.",
        };
    }

    return {
        title: "تعذر تحميل المحفوظات",
        description: "حدث خطأ غير متوقع. أعد المحاولة بعد قليل.",
    };
}

export function SavedPostsClient({state}: Readonly<{state: SavedPostsUrlState}>) {
    const result = useQuery(savedPostsQueryOptions(toSavedPostsQuery(state)));

    if (result.isPending) {
        return <SavedPostsSkeleton />;
    }

    if (result.isError) {
        const copy = errorCopy(result.error);
        const requestId = result.error instanceof ApiError ? result.error.requestId : null;

        return (
            <Feedback
                variant="danger"
                title={copy.title}
                description={
                    <div className="grid gap-4">
                        <p>{copy.description}</p>
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
                                disabled={result.isFetching}
                                aria-busy={result.isFetching}
                                onClick={() => void result.refetch()}
                            >
                                <RefreshCw
                                    aria-hidden="true"
                                    className={result.isFetching ? "motion-safe:animate-spin" : undefined}
                                />
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
        if (meta.totalPages > 0 && state.page > meta.totalPages) {
            return (
                <Feedback
                    variant="warning"
                    title="هذه الصفحة لم تعد تحتوي محفوظات"
                    description={
                        <div className="grid gap-4">
                            <p>ربما أزلت آخر منشور محفوظ في الصفحة.</p>
                            <div>
                                <Button asChild variant="secondary" size="sm">
                                    <Link href={buildSavedPostsHref({...state, page: meta.totalPages})}>
                                        الانتقال إلى آخر صفحة متاحة
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    }
                />
            );
        }

        return (
            <div className="relative overflow-hidden rounded-[2rem] border border-border bg-surface-raised p-7 text-center sm:p-12">
                <div aria-hidden="true" className="absolute -end-20 -top-24 size-64 rounded-full bg-brand/10 blur-3xl" />
                <div className="relative mx-auto grid max-w-xl justify-items-center gap-4">
                    <span className="grid size-16 place-items-center rounded-3xl bg-brand/10 text-brand">
                        <BookmarkX aria-hidden="true" className="size-8" />
                    </span>
                    <div className="grid gap-2">
                        <h2 className="text-2xl font-bold text-foreground">محفوظاتك ما زالت فارغة</h2>
                        <p className="leading-7 text-muted-foreground">
                            احفظ المنشورات المهمة لتعود إليها بسرعة من أي جهاز تسجّل الدخول منه.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/posts">استكشاف منشورات المجتمع</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="grid gap-5" aria-busy={result.isFetching}>
            <div className="flex min-h-8 flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                <p>
                    لديك <strong className="text-foreground">{meta.total}</strong> منشورًا محفوظًا
                </p>
                <p
                    aria-live="polite"
                    className={`inline-flex items-center gap-2 transition-opacity ${
                        result.isFetching ? "opacity-100" : "opacity-0"
                    }`}
                >
                    <Sparkles aria-hidden="true" className="size-4 text-brand" />
                    نحدّث المحفوظات
                </p>
            </div>

            <ul
                className={`grid gap-5 md:grid-cols-2 ${
                    result.isPlaceholderData ? "opacity-65" : "opacity-100"
                }`}
            >
                {data.map((post) => (
                    <li key={post.id}>
                        <SavedPostCard post={post} />
                    </li>
                ))}
            </ul>

            <SavedPostsPagination meta={meta} state={state} />
        </div>
    );
}
