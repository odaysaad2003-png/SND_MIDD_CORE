"use client";

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {Eye, EyeOff, Heart, Search, UserRound} from "lucide-react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {useState} from "react";

import {sndToast} from "@/components/feedback/toast/snd-toast-store";
import {Avatar} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {ModalDialog} from "@/components/ui/modal-dialog";
import {publicCommentKeys} from "@/features/comments/queries/public-comments.query";
import {postInteractionKeys} from "@/features/post-interactions/queries/post-interaction.queries";
import {PublicPostImages} from "@/features/posts/components/public-post-images";
import {publicPostKeys} from "@/features/posts/queries/public-posts.query";
import {savedPostKeys} from "@/features/saves/queries/saved-posts.query";

import {updateAdminPostModeration} from "../api/admin-api";
import {formatAdminDate, getAdminErrorContent} from "../lib/admin-display";
import {buildAdminPostsHref, type AdminPostsUrlState} from "../lib/admin-url-state";
import {
    adminKeys,
    adminPostDetailQueryOptions,
    adminPostsQueryOptions,
} from "../queries/admin.queries";
import type {AdminPostSummary} from "../schemas/admin.schema";
import {
    AdminActionDialog,
    AdminBadge,
    AdminDetailSkeleton,
    AdminEmptyState,
    AdminErrorState,
    AdminPageHeader,
    AdminPageSkeleton,
    AdminPagination,
    buildAdminFilterHrefFromForm,
} from "./admin-ui";

type PostModerationAction = Readonly<{
    post: AdminPostSummary;
    status: "visible" | "hidden";
}>;

export function AdminPosts({state}: Readonly<{state: AdminPostsUrlState}>) {
    const queryClient = useQueryClient();
    const router = useRouter();
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
    const [moderationAction, setModerationAction] = useState<PostModerationAction | null>(null);

    const postsQuery = useQuery(adminPostsQueryOptions(state));
    const detailQuery = useQuery({
        ...adminPostDetailQueryOptions(selectedPostId ?? ""),
        enabled: Boolean(selectedPostId),
    });

    const moderationMutation = useMutation({
        mutationFn: async ({
            postId,
            status,
            reason,
        }: {
            postId: string;
            status: "visible" | "hidden";
            reason: string;
        }) => updateAdminPostModeration(postId, {status, reason}),
        onSuccess: async (updatedPost) => {
            queryClient.setQueryData(adminKeys.posts.detail(updatedPost.id), updatedPost);
            await Promise.all([
                queryClient.invalidateQueries({queryKey: adminKeys.posts.lists}),
                queryClient.invalidateQueries({queryKey: adminKeys.summary}),
                queryClient.invalidateQueries({queryKey: publicPostKeys.all}),
                queryClient.invalidateQueries({queryKey: publicCommentKeys.byPost(updatedPost.id)}),
                queryClient.invalidateQueries({queryKey: postInteractionKeys.likeStatus(updatedPost.id)}),
                queryClient.invalidateQueries({queryKey: postInteractionKeys.saveStatus(updatedPost.id)}),
                queryClient.invalidateQueries({queryKey: savedPostKeys.all}),
            ]);

            sndToast.success({
                title: updatedPost.moderationStatus === "hidden" ? "تم إخفاء المنشور" : "تمت استعادة ظهور المنشور",
                description: "تأكد الخادم من القرار وحدّثنا البيانات المرتبطة.",
            });
            setModerationAction(null);
        },
        onError: (error) => {
            const content = getAdminErrorContent(error, "تحديث حالة المنشور");
            sndToast.error({
                title: content.title,
                description: content.description,
                durationMs: 0,
            });
        },
    });

    if (postsQuery.isPending) {
        return <AdminPageSkeleton />;
    }

    const filtered = Boolean(
        state.q || state.lifecycleStatus || state.moderationStatus || state.sort !== "latest"
    );
    const pageOutOfRange = Boolean(
        postsQuery.data &&
            postsQuery.data.data.length === 0 &&
            postsQuery.data.meta.totalPages > 0 &&
            state.page > postsQuery.data.meta.totalPages
    );

    return (
        <div className="grid gap-6" aria-busy={postsQuery.isFetching}>
            <AdminPageHeader
                eyebrow="سلامة المحتوى"
                title="إدارة المنشورات"
                description="راجع دورة حياة المنشور وحالة ظهوره. الإخفاء الإداري منفصل تمامًا عن حذف المنشور بواسطة صاحبه."
            />

            <form
                action="/admin/posts"
                method="get"
                role="search"
                onSubmit={(event) => {
                    event.preventDefault();
                    router.push(buildAdminFilterHrefFromForm("/admin/posts", event.currentTarget));
                }}
                className="grid gap-4 rounded-[1.75rem] border border-border bg-surface p-4 sm:grid-cols-2 xl:grid-cols-[minmax(15rem,1fr)_11rem_11rem_11rem_auto] xl:items-end"
            >
                <div className="grid gap-2 sm:col-span-2 xl:col-span-1">
                    <label htmlFor="admin-post-search" className="text-sm font-bold text-foreground">
                        العنوان أو المحتوى
                    </label>
                    <div className="relative">
                        <Search
                            aria-hidden="true"
                            className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                        />
                        <Input
                            id="admin-post-search"
                            name="q"
                            defaultValue={state.q ?? ""}
                            maxLength={100}
                            dir="auto"
                            placeholder="ابحث في المنشورات"
                            className="ps-10"
                        />
                    </div>
                </div>

                <div className="grid gap-2">
                    <label htmlFor="admin-post-lifecycle" className="text-sm font-bold text-foreground">
                        دورة الحياة
                    </label>
                    <select
                        id="admin-post-lifecycle"
                        name="lifecycleStatus"
                        defaultValue={state.lifecycleStatus ?? ""}
                        className="h-11 rounded-xl border border-border bg-surface px-3 text-foreground"
                    >
                        <option value="">الكل</option>
                        <option value="active">نشط</option>
                        <option value="deleted">حذفه صاحبه</option>
                    </select>
                </div>

                <div className="grid gap-2">
                    <label htmlFor="admin-post-moderation" className="text-sm font-bold text-foreground">
                        الظهور الإداري
                    </label>
                    <select
                        id="admin-post-moderation"
                        name="moderationStatus"
                        defaultValue={state.moderationStatus ?? ""}
                        className="h-11 rounded-xl border border-border bg-surface px-3 text-foreground"
                    >
                        <option value="">الكل</option>
                        <option value="visible">ظاهر</option>
                        <option value="hidden">مخفي</option>
                    </select>
                </div>

                <div className="grid gap-2">
                    <label htmlFor="admin-post-sort" className="text-sm font-bold text-foreground">
                        الترتيب
                    </label>
                    <select
                        id="admin-post-sort"
                        name="sort"
                        defaultValue={state.sort}
                        className="h-11 rounded-xl border border-border bg-surface px-3 text-foreground"
                    >
                        <option value="latest">الأحدث</option>
                        <option value="oldest">الأقدم</option>
                    </select>
                </div>

                <div className="flex gap-2">
                    <Button type="submit" className="flex-1 xl:flex-none">
                        تطبيق
                    </Button>
                    {filtered ? (
                        <Button asChild variant="ghost" className="flex-1 xl:flex-none">
                            <Link href="/admin/posts">مسح</Link>
                        </Button>
                    ) : null}
                </div>
            </form>

            {postsQuery.isError ? (
                <AdminErrorState
                    content={getAdminErrorContent(postsQuery.error, "قائمة المنشورات الإدارية")}
                    isRetrying={postsQuery.isFetching}
                    onRetry={() => {
                        void postsQuery.refetch();
                    }}
                />
            ) : postsQuery.data.data.length === 0 ? (
                <AdminEmptyState
                    filtered={filtered || pageOutOfRange}
                    title={
                        pageOutOfRange
                            ? "هذه الصفحة لم تعد متاحة"
                            : filtered
                              ? "لا توجد منشورات تطابق الفلاتر"
                              : "لا توجد منشورات بعد"
                    }
                    description={
                        pageOutOfRange
                            ? "ربما تغيّر عدد المنشورات بعد قرار إشراف حديث."
                            : filtered
                            ? "غيّر حالة الظهور أو دورة الحياة أو عبارة البحث."
                            : "ستظهر منشورات المجتمع هنا عند إنشائها."
                    }
                    resetHref={
                        pageOutOfRange
                            ? buildAdminPostsHref({...state, page: postsQuery.data.meta.totalPages})
                            : "/admin/posts"
                    }
                    actionLabel={pageOutOfRange ? "الانتقال إلى آخر صفحة متاحة" : "مسح الفلاتر"}
                />
            ) : (
                <section className="grid gap-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                        <p>
                            <strong className="text-foreground">{postsQuery.data.meta.total}</strong> منشورًا ضمن النتائج
                        </p>
                        <p aria-live="polite" className={postsQuery.isFetching ? "opacity-100" : "opacity-0"}>
                            جار تحديث القائمة…
                        </p>
                    </div>

                    <ul
                        className={`grid gap-4 transition-opacity ${
                            postsQuery.isPlaceholderData ? "opacity-60" : "opacity-100"
                        }`}
                    >
                        {postsQuery.data.data.map((post) => {
                            const ownerDeleted = post.lifecycleStatus === "deleted";

                            return (
                                <li key={post.id} className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
                                    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <AdminBadge tone={ownerDeleted ? "danger" : "success"}>
                                                    {ownerDeleted ? "محذوف بواسطة صاحبه" : "نشط"}
                                                </AdminBadge>
                                                <AdminBadge
                                                    tone={post.moderationStatus === "hidden" ? "warning" : "brand"}
                                                >
                                                    {post.moderationStatus === "hidden" ? "مخفي إداريًا" : "ظاهر"}
                                                </AdminBadge>
                                            </div>
                                            <h3 dir="auto" className="mt-3 text-lg font-black text-foreground">
                                                {post.title}
                                            </h3>
                                            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                                                <span className="inline-flex items-center gap-2">
                                                    <Avatar
                                                        name={post.author.name}
                                                        imageUrl={post.author.avatar}
                                                        sizes="28px"
                                                        className="size-7 text-xs"
                                                    />
                                                    {post.author.name}
                                                </span>
                                                <span className="inline-flex items-center gap-1.5">
                                                    <Heart aria-hidden="true" className="size-4" />
                                                    {post.likesCount} إعجاب
                                                </span>
                                                <span>{formatAdminDate(post.createdAt)}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 sm:flex-row">
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={() => setSelectedPostId(post.id)}
                                            >
                                                <Eye aria-hidden="true" />
                                                التفاصيل
                                            </Button>
                                            <Button
                                                type="button"
                                                variant={post.moderationStatus === "visible" ? "danger" : "secondary"}
                                                disabled={ownerDeleted}
                                                title={
                                                    ownerDeleted
                                                        ? "لا يمكن تغيير ظهور منشور حذفه صاحبه"
                                                        : undefined
                                                }
                                                onClick={() =>
                                                    setModerationAction({
                                                        post,
                                                        status:
                                                            post.moderationStatus === "visible" ? "hidden" : "visible",
                                                    })
                                                }
                                            >
                                                {post.moderationStatus === "visible" ? (
                                                    <EyeOff aria-hidden="true" />
                                                ) : (
                                                    <Eye aria-hidden="true" />
                                                )}
                                                {post.moderationStatus === "visible" ? "إخفاء" : "استعادة الظهور"}
                                            </Button>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>

                    <AdminPagination
                        meta={postsQuery.data.meta}
                        buildHref={(page) => buildAdminPostsHref({...state, page})}
                    />
                </section>
            )}

            <ModalDialog
                open={Boolean(selectedPostId)}
                title="تفاصيل المنشور"
                description="معاينة إدارية للسياق وحالة المحتوى."
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedPostId(null);
                    }
                }}
            >
                {detailQuery.isPending ? (
                    <AdminDetailSkeleton />
                ) : detailQuery.isError ? (
                    <AdminErrorState
                        content={getAdminErrorContent(detailQuery.error, "تفاصيل المنشور")}
                        isRetrying={detailQuery.isFetching}
                        onRetry={() => {
                            void detailQuery.refetch();
                        }}
                    />
                ) : (
                    <article className="grid gap-5">
                        <div className="flex flex-wrap gap-2">
                            <AdminBadge tone={detailQuery.data.lifecycleStatus === "deleted" ? "danger" : "success"}>
                                {detailQuery.data.lifecycleStatus === "deleted" ? "محذوف بواسطة صاحبه" : "نشط"}
                            </AdminBadge>
                            <AdminBadge tone={detailQuery.data.moderationStatus === "hidden" ? "warning" : "brand"}>
                                {detailQuery.data.moderationStatus === "hidden" ? "مخفي إداريًا" : "ظاهر"}
                            </AdminBadge>
                        </div>
                        <div>
                            <h3 dir="auto" className="text-2xl font-black text-foreground">
                                {detailQuery.data.title}
                            </h3>
                            <p dir="auto" className="mt-3 whitespace-pre-wrap leading-8 text-foreground">
                                {detailQuery.data.content}
                            </p>
                        </div>
                        <PublicPostImages images={detailQuery.data.images} title={detailQuery.data.title} />
                        <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface-muted/50 p-4">
                            <Avatar
                                name={detailQuery.data.author.name}
                                imageUrl={detailQuery.data.author.avatar}
                                sizes="44px"
                            />
                            <div>
                                <p className="inline-flex items-center gap-2 font-bold text-foreground">
                                    <UserRound aria-hidden="true" className="size-4" />
                                    {detailQuery.data.author.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    نُشر في {formatAdminDate(detailQuery.data.createdAt)}
                                </p>
                            </div>
                        </div>
                        {detailQuery.data.moderationReason ? (
                            <div className="rounded-2xl border border-warning/30 bg-warning/10 p-4">
                                <p className="text-xs font-bold text-foreground">سبب الإخفاء الحالي</p>
                                <p className="mt-2 whitespace-pre-wrap leading-7 text-foreground">
                                    {detailQuery.data.moderationReason}
                                </p>
                                {detailQuery.data.hiddenBy ? (
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        نفّذه {detailQuery.data.hiddenBy.name}
                                        {detailQuery.data.hiddenAt
                                            ? ` في ${formatAdminDate(detailQuery.data.hiddenAt)}`
                                            : ""}
                                    </p>
                                ) : null}
                            </div>
                        ) : null}
                    </article>
                )}
            </ModalDialog>

            {moderationAction ? (
                <AdminActionDialog
                    open
                    title={
                        moderationAction.status === "hidden"
                            ? "تأكيد إخفاء المنشور"
                            : "تأكيد استعادة ظهور المنشور"
                    }
                    description={
                        <>
                            القرار يغيّر الظهور العام للمنشور <strong>{moderationAction.post.title}</strong>، لكنه لا
                            يحذف الصور أو التفاعلات ولا يغيّر حالة البلاغات تلقائيًا.
                        </>
                    }
                    inputLabel="سبب قرار الإشراف"
                    inputPlaceholder="اكتب سببًا واضحًا وقابلًا للتدقيق"
                    confirmLabel={moderationAction.status === "hidden" ? "إخفاء المنشور" : "استعادة الظهور"}
                    pendingLabel="جار حفظ القرار"
                    minLength={5}
                    maxLength={500}
                    danger={moderationAction.status === "hidden"}
                    isPending={moderationMutation.isPending}
                    serverError={
                        moderationMutation.isError
                            ? getAdminErrorContent(moderationMutation.error, "تحديث حالة المنشور").description
                            : null
                    }
                    onConfirm={(reason) => {
                        moderationMutation.mutate({
                            postId: moderationAction.post.id,
                            status: moderationAction.status,
                            reason,
                        });
                    }}
                    onOpenChange={(open) => {
                        if (!open && !moderationMutation.isPending) {
                            moderationMutation.reset();
                            setModerationAction(null);
                        }
                    }}
                />
            ) : null}
        </div>
    );
}
