"use client";

import {useQuery} from "@tanstack/react-query";
import {FilePenLine, RefreshCw, Sparkles} from "lucide-react";
import Link from "next/link";
import {useRouter} from "next/navigation";

import {Button} from "@/components/ui/button";
import {Feedback} from "@/components/ui/feedback";
import {ApiError} from "@/lib/api/api-error";

import {buildMyPostsHref, toMyActivePostsQuery, type MyPostsUrlState} from "../lib/my-posts-url-state";
import {myActivePostsQueryOptions} from "../queries/my-posts.query";
import {MyPostsPagination} from "./my-posts-pagination";
import {MyPostsSkeleton} from "./my-posts-skeleton";
import {OwnedPostCard} from "./owned-post-card";
import {PostComposerTrigger} from "./post-composer-trigger";

type MyPostsClientProps = Readonly<{
    state: MyPostsUrlState;
}>;

type MyPostsErrorContent = Readonly<{
    title: string;
    description: string;
}>;

function getMyPostsErrorContent(error: unknown): MyPostsErrorContent {
    if (!(error instanceof ApiError)) {
        return {
            title: "تعذر تحميل منشوراتك",
            description: "حدث خطأ غير متوقع أثناء تجهيز مساحة الإدارة. أعد المحاولة.",
        };
    }

    if (error.kind === "network") {
        return {
            title: "الاتصال بمنشوراتك غير متاح الآن",
            description: "تحقق من الإنترنت ثم أعد المحاولة. لم نسجّل خروجك ولم نغيّر أي منشور.",
        };
    }

    if (error.kind === "invalid-response") {
        return {
            title: "تعذر التحقق من بيانات المنشورات",
            description: "وصل رد لا يطابق العقد المعتمد، لذلك لم نعرض محتوى قد يكون غير صحيح.",
        };
    }

    if (error.status === 403) {
        return {
            title: "إدارة المنشورات غير متاحة لهذا الحساب",
            description: "رفض الخادم تنفيذ الطلب. قد يكون الحساب غير نشط أو لا يملك الصلاحية المطلوبة.",
        };
    }

    return {
        title: "تعذر تحميل منشوراتك",
        description: "لم نتمكن من جلب القائمة الآن. أعد المحاولة واستخدم معرّف الطلب عند طلب الدعم.",
    };
}

export function MyPostsClient({state}: MyPostsClientProps) {
    const router = useRouter();
    const result = useQuery(myActivePostsQueryOptions(toMyActivePostsQuery(state)));

    if (result.isPending) {
        return <MyPostsSkeleton />;
    }

    if (result.isError) {
        const content = getMyPostsErrorContent(result.error);
        const requestId = result.error instanceof ApiError ? result.error.requestId : null;

        return (
            <Feedback
                variant="danger"
                title={content.title}
                description={
                    <div className="grid gap-4">
                        <p>{content.description}</p>

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
    const hasActiveFilters = Boolean(state.q) || state.sort !== "-createdAt";

    if (data.length === 0) {
        if (meta.totalPages > 0 && state.page > meta.totalPages) {
            return (
                <Feedback
                    variant="warning"
                    title="هذه الصفحة لم تعد تحتوي منشورات"
                    description={
                        <div className="grid gap-4">
                            <p>قد تكون القائمة تغيّرت بعد حذف منشور أو تعديل الفلاتر.</p>
                            <div>
                                <Button asChild variant="secondary" size="sm">
                                    <Link href={buildMyPostsHref({...state, page: meta.totalPages})}>
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
            <div className="relative overflow-hidden rounded-[2rem] border border-border bg-surface-raised p-6 text-center sm:p-10">
                <div aria-hidden="true" className="absolute -end-16 -top-20 size-56 rounded-full bg-brand/10 blur-3xl" />

                <div className="relative mx-auto grid max-w-xl justify-items-center gap-4">
                    <span className="grid size-16 place-items-center rounded-3xl bg-brand/10 text-brand">
                        <FilePenLine aria-hidden="true" className="size-8" />
                    </span>

                    <div className="grid gap-2">
                        <h2 className="text-2xl font-bold text-foreground">
                            {hasActiveFilters ? "لا توجد منشورات تطابق بحثك" : "ابدأ أول منشور لك في سند"}
                        </h2>
                        <p className="leading-7 text-muted-foreground">
                            {hasActiveFilters
                                ? "جرّب عبارة أقصر أو ارجع إلى ترتيب المنشورات الأحدث."
                                : "اكتب رسالتك في نافذة سريعة، وأضف الصور اختياريًا دون مغادرة هذه الصفحة."}
                        </p>
                    </div>

                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                        {hasActiveFilters ? (
                            <Button asChild variant="secondary">
                                <Link href="/my-posts">مسح البحث والترتيب</Link>
                            </Button>
                        ) : (
                            <PostComposerTrigger className="w-full sm:w-auto" />
                        )}

                        <Button asChild variant="ghost">
                            <Link href="/posts">استكشاف منشورات المجتمع</Link>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="grid gap-5" aria-busy={result.isFetching}>
            <div className="flex min-h-8 flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                <p>
                    لديك <span className="font-semibold text-foreground">{meta.total}</span> منشورًا نشطًا
                    {state.q ? <> يطابق البحث الحالي</> : null}
                </p>

                <p
                    aria-live="polite"
                    className={`inline-flex items-center gap-2 transition-opacity ${result.isFetching ? "opacity-100" : "opacity-0"}`}
                >
                    <Sparkles aria-hidden="true" className="size-4 text-brand" />
                    نحدّث منشوراتك
                </p>
            </div>

            <ul
                className={`grid gap-5 transition-opacity ${result.isPlaceholderData ? "opacity-65" : "opacity-100"}`}
            >
                {data.map((post) => (
                    <li key={post.id}>
                        <OwnedPostCard
                            post={post}
                            onDeleted={() => {
                                if (data.length === 1 && state.page > 1) {
                                    router.replace(buildMyPostsHref({...state, page: state.page - 1}));
                                }
                            }}
                        />
                    </li>
                ))}
            </ul>

            <MyPostsPagination meta={meta} state={state} />
        </div>
    );
}
