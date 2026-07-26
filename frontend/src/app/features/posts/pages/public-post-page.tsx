import Link from "next/link";
import {notFound} from "next/navigation";
import {Suspense} from "react";

import {buttonVariants} from "@/components/ui/button";
import {Feedback} from "@/components/ui/feedback";
import {
    PublicCommentsControls,
    PublicCommentsList,
    PublicCommentsSkeleton,
} from "@/features/comments/server";
import {
    buildPublicCommentsHref,
    parsePublicCommentsUrlState,
} from "@/features/comments/lib/public-comments-url-state";
import {ApiError} from "@/lib/api/api-error";
import {cn} from "@/lib/utils/cn";

import {getPublicPostForRoute} from "../api/get-public-post-for-route";
import {isPublicPostUnavailableError} from "../api/get-public-post";
import {PublicPostDetail} from "../components/public-post-detail";
import type {PublicPost} from "../schemas/public-posts.schema";
import type {PublicPostPageProps} from "../types/public-post-route";

export async function PublicPostPage({params, searchParams}: PublicPostPageProps) {
    const [{postId}, rawSearchParams] = await Promise.all([params, searchParams]);
    const commentsState = parsePublicCommentsUrlState(rawSearchParams);

    let post: PublicPost;

    try {
        post = await getPublicPostForRoute(postId);
    } catch (error) {
        if (isPublicPostUnavailableError(error)) {
            notFound();
        }

        const requestId = error instanceof ApiError ? error.requestId : null;
        const retryHref = buildPublicCommentsHref(postId, commentsState);

        return (
            <div className="px-4 py-10 sm:px-6 sm:py-14">
                <div className="mx-auto grid max-w-3xl gap-5">
                    <Feedback
                        variant="danger"
                        title="تعذر تحميل المنشور"
                        description={
                            <div className="grid gap-3">
                                <p>
                                    لم نتمكن من الوصول إلى المنشور الآن. يمكنك إعادة المحاولة أو العودة إلى المنشورات العامة.
                                </p>

                                {requestId ? (
                                    <p className="text-xs text-muted-foreground">
                                        معرّف الطلب: <code dir="ltr">{requestId}</code>
                                    </p>
                                ) : null}

                                <div className="flex flex-wrap gap-3">
                                    <Link
                                        href={retryHref}
                                        className={cn(
                                            buttonVariants({size: "sm", variant: "secondary"}),
                                        )}
                                    >
                                        إعادة المحاولة
                                    </Link>
                                    <Link
                                        href="/posts"
                                        className={cn(
                                            buttonVariants({size: "sm", variant: "ghost"}),
                                        )}
                                    >
                                        العودة للمنشورات
                                    </Link>
                                </div>
                            </div>
                        }
                    />
                </div>
            </div>
        );
    }

    const commentsSuspenseKey = `${postId}:${commentsState.page}:${commentsState.sort}`;

    return (
        <div className="px-4 py-8 sm:px-6 sm:py-12">
            <div className="mx-auto grid max-w-3xl gap-8">
                <nav aria-label="مسار الصفحة" className="text-sm text-muted-foreground">
                    <Link href="/posts" className="rounded-sm hover:text-foreground hover:underline">
                        المنشورات العامة
                    </Link>
                    <span aria-hidden="true"> / </span>
                    <span>تفاصيل المنشور</span>
                </nav>

                <PublicPostDetail post={post} />

                <section
                    id="comments"
                    aria-labelledby="comments-heading"
                    className="scroll-mt-6 grid gap-5"
                >
                    <header className="grid gap-2">
                        <p className="text-sm font-semibold text-brand">المحادثة العامة</p>
                        <h2
                            id="comments-heading"
                            className="text-2xl font-bold text-foreground sm:text-3xl"
                        >
                            التعليقات
                        </h2>
                        <p className="leading-7 text-muted-foreground">
                            اقرأ التعليقات العامة المرتبطة بهذا المنشور. سيُطلب تسجيل الدخول فقط عندما تختار التعليق أو التفاعل.
                        </p>
                    </header>

                    <PublicCommentsControls postId={postId} state={commentsState} />

                    <Suspense key={commentsSuspenseKey} fallback={<PublicCommentsSkeleton />}>
                        <PublicCommentsList postId={postId} state={commentsState} />
                    </Suspense>
                </section>
            </div>
        </div>
    );
}
