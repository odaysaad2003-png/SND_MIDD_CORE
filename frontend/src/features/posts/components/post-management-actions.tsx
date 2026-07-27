"use client";

import {Eye, Images, PencilLine, Settings2, Trash2, WifiOff} from "lucide-react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {useState} from "react";

import {sndToast} from "@/components/feedback/toast/snd-toast-store";
import {Button, buttonVariants} from "@/components/ui/button";
import {ConfirmationDialog} from "@/components/ui/confirmation-dialog";
import {Feedback} from "@/components/ui/feedback";
import {ModalDialog} from "@/components/ui/modal-dialog";
import {cn} from "@/lib/utils/cn";

import {mapPostManagementError, type PostManagementErrorPresentation} from "../errors/post-management-error-mapper";
import {useDeletePost} from "../hooks/use-post-authoring-mutations";
import {useOnlineStatus} from "../hooks/use-online-status";
import type {PublicPost} from "../schemas/public-posts.schema";
import {EditPostDialog} from "./edit-post-dialog";
import {ManagePostImagesDialog} from "./manage-post-images-dialog";

type PostManagementActionsProps = Readonly<{
    post: PublicPost;
    variant: "compact" | "detail" | "workspace";
    afterDeleteHref?: string;
    refreshAfterMutation?: boolean;
    onDeleted?: () => void;
}>;

export function PostManagementActions({
    post,
    variant,
    afterDeleteHref,
    refreshAfterMutation = false,
    onDeleted,
}: PostManagementActionsProps) {
    const router = useRouter();
    const deleteMutation = useDeletePost();
    const isOnline = useOnlineStatus();

    const [isCompactMenuOpen, setIsCompactMenuOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isImagesOpen, setIsImagesOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [presentation, setPresentation] = useState<PostManagementErrorPresentation | null>(null);

    function handleConfirmedMutation(): void {
        setPresentation(null);

        if (refreshAfterMutation) {
            router.refresh();
        }
    }

    function requestDelete(): void {
        setPresentation(null);

        if (!isOnline) {
            const offlinePresentation: PostManagementErrorPresentation = {
                title: "الحذف يحتاج اتصالًا بالإنترنت",
                description: "لم نرسل أي طلب، والمنشور ما زال محفوظًا كما هو. أعد المحاولة بعد عودة الاتصال.",
                tone: "warning",
                requestId: null,
            };

            setPresentation(offlinePresentation);
            setIsCompactMenuOpen(false);

            sndToast.warning({
                title: offlinePresentation.title,
                description: offlinePresentation.description,
            });
            return;
        }

        setIsCompactMenuOpen(false);
        setIsDeleteOpen(true);
    }

    async function confirmDelete(): Promise<void> {
        if (deleteMutation.isPending) {
            return;
        }

        if (!isOnline) {
            setIsDeleteOpen(false);
            requestDelete();
            return;
        }

        setPresentation(null);

        try {
            await deleteMutation.mutateAsync(post.id);

            setIsDeleteOpen(false);

            sndToast.success({
                title: "تم حذف المنشور",
                description: "لن يظهر المنشور في المجتمع أو في قائمة منشوراتك النشطة.",
            });

            onDeleted?.();

            if (afterDeleteHref) {
                router.replace(afterDeleteHref);
            }
        } catch (error) {
            const errorPresentation = mapPostManagementError(error, "delete");
            setIsDeleteOpen(false);
            setPresentation(errorPresentation);

            const showToast = errorPresentation.tone === "warning" ? sndToast.warning : sndToast.error;

            showToast({
                title: errorPresentation.title,
                description: "أبقينا المنشور ظاهرًا حتى يؤكد الخادم نتيجة الحذف.",
                durationMs: errorPresentation.tone === "warning" ? 0 : undefined,
            });
        }
    }

    const feedback = presentation ? (
        <Feedback
            variant={presentation.tone}
            title={presentation.title}
            description={
                <div className="grid gap-2">
                    <p>{presentation.description}</p>
                    {presentation.requestId ? (
                        <p className="text-xs text-muted-foreground">
                            معرّف الطلب: <code dir="ltr">{presentation.requestId}</code>
                        </p>
                    ) : null}
                </div>
            }
        />
    ) : null;

    const editButton = (
        <Button
            type="button"
            variant="secondary"
            disabled={deleteMutation.isPending}
            onClick={() => {
                setPresentation(null);
                setIsCompactMenuOpen(false);
                setIsEditOpen(true);
            }}
            className={variant === "workspace" ? "w-full sm:w-auto" : undefined}
        >
            <PencilLine aria-hidden="true" />
            تعديل النص
        </Button>
    );

    const imagesButton = (
        <Button
            type="button"
            variant="secondary"
            disabled={deleteMutation.isPending}
            onClick={() => {
                setPresentation(null);
                setIsCompactMenuOpen(false);
                setIsImagesOpen(true);
            }}
            className={variant === "workspace" ? "w-full sm:w-auto" : undefined}
        >
            <Images aria-hidden="true" />
            إدارة الصور
        </Button>
    );

    const deleteButton = (
        <Button
            type="button"
            variant="ghost"
            disabled={deleteMutation.isPending}
            onClick={requestDelete}
            className={cn(
                "text-danger hover:bg-danger/10 hover:text-danger",
                variant === "workspace" && "w-full sm:w-auto"
            )}
        >
            {isOnline ? <Trash2 aria-hidden="true" /> : <WifiOff aria-hidden="true" />}
            حذف
        </Button>
    );

    return (
        <>
            {variant === "compact" ? (
                <>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={deleteMutation.isPending}
                        aria-label={`إدارة منشورك: ${post.title}`}
                        onClick={() => {
                            setPresentation(null);
                            setIsCompactMenuOpen(true);
                        }}
                        className="shrink-0 rounded-xl text-brand hover:bg-brand/10 hover:text-brand"
                    >
                        <Settings2 aria-hidden="true" />
                        <span className="hidden sm:inline">إدارة</span>
                    </Button>

                    <ModalDialog
                        open={isCompactMenuOpen}
                        title="إدارة منشورك"
                        description="يمكنك تعديل النص أو إدارة الصور أو حذف المنشور من هنا."
                        onOpenChange={setIsCompactMenuOpen}
                        bodyClassName="grid gap-5"
                    >
                        <div className="rounded-2xl border border-border bg-surface-muted/55 p-4">
                            <p className="text-xs font-bold text-brand">المنشور المحدد</p>
                            <p className="mt-2 line-clamp-2 break-words font-bold leading-7 text-foreground">{post.title}</p>
                        </div>

                        {feedback}

                        <div className="grid gap-3 sm:grid-cols-2">
                            {editButton}
                            {imagesButton}
                            <Link
                                href={`/posts/${post.id}`}
                                className={cn(buttonVariants({variant: "secondary"}), "w-full")}
                                onClick={() => setIsCompactMenuOpen(false)}
                            >
                                <Eye aria-hidden="true" />
                                فتح التفاصيل
                            </Link>
                            {deleteButton}
                        </div>
                    </ModalDialog>
                </>
            ) : (
                <div className="grid w-full gap-3">
                    {feedback}

                    <div
                        className={cn(
                            "flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center",
                            variant === "detail" && "rounded-2xl border border-brand/15 bg-brand/5 p-3"
                        )}
                    >
                        {variant === "detail" ? (
                            <p className="me-auto text-sm font-bold text-foreground">أنت مالك هذا المنشور</p>
                        ) : null}

                        {editButton}
                        {imagesButton}

                        {variant === "workspace" ? (
                            <Link
                                href={`/posts/${post.id}`}
                                className={cn(buttonVariants({variant: "ghost"}), "w-full sm:ms-auto sm:w-auto")}
                            >
                                <Eye aria-hidden="true" />
                                عرض المنشور
                            </Link>
                        ) : null}

                        {deleteButton}
                    </div>
                </div>
            )}

            {isEditOpen ? (
                <EditPostDialog
                    open
                    post={post}
                    onSaved={handleConfirmedMutation}
                    onOpenChange={setIsEditOpen}
                />
            ) : null}

            {isImagesOpen ? (
                <ManagePostImagesDialog
                    open
                    post={post}
                    onChanged={handleConfirmedMutation}
                    onOpenChange={setIsImagesOpen}
                />
            ) : null}

            <ConfirmationDialog
                open={isDeleteOpen}
                title="حذف المنشور من سند؟"
                description={
                    <div className="grid gap-2">
                        <p>
                            سيختفي <strong className="text-foreground">{post.title}</strong> من المجتمع ومن قائمة منشوراتك النشطة.
                        </p>
                        <p>الخادم يستخدم حذفًا منطقيًا، لكن لا توجد حاليًا واجهة أو صلاحية للمالك لاستعادته.</p>
                    </div>
                }
                confirmLabel="حذف المنشور"
                pendingLabel="جار حذف المنشور"
                cancelLabel="الاحتفاظ بالمنشور"
                variant="danger"
                isPending={deleteMutation.isPending}
                onConfirm={() => void confirmDelete()}
                onOpenChange={(nextOpen) => {
                    if (!deleteMutation.isPending) {
                        setIsDeleteOpen(nextOpen);
                    }
                }}
            />
        </>
    );
}
