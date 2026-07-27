"use client";

import {Eye, Heart, Images, PencilLine, Trash2} from "lucide-react";
import Link from "next/link";
import {useState} from "react";

import {sndToast} from "@/components/feedback/toast/snd-toast-store";
import {Button, buttonVariants} from "@/components/ui/button";
import {Card, CardContent, CardFooter, CardHeader} from "@/components/ui/card";
import {ConfirmationDialog} from "@/components/ui/confirmation-dialog";
import {Feedback} from "@/components/ui/feedback";
import {cn} from "@/lib/utils/cn";

import {mapPostManagementError, type PostManagementErrorPresentation} from "../errors/post-management-error-mapper";
import {useDeletePost} from "../hooks/use-post-authoring-mutations";
import type {PublicPost} from "../schemas/public-posts.schema";

import {EditPostDialog} from "./edit-post-dialog";
import {ManagePostImagesDialog} from "./manage-post-images-dialog";
import {PublicPostImages} from "./public-post-images";

const postDateFormatter = new Intl.DateTimeFormat("ar-PS", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Gaza",
});

const postCountFormatter = new Intl.NumberFormat("ar-PS");

type OwnedPostCardProps = Readonly<{
    post: PublicPost;
    onDeleted: () => void;
}>;

export function OwnedPostCard({post, onDeleted}: OwnedPostCardProps) {
    const deleteMutation = useDeletePost();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isImagesOpen, setIsImagesOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [presentation, setPresentation] = useState<PostManagementErrorPresentation | null>(null);

    const wasEdited = post.updatedAt !== post.createdAt;

    async function confirmDelete(): Promise<void> {
        if (deleteMutation.isPending) {
            return;
        }

        setPresentation(null);

        try {
            await deleteMutation.mutateAsync(post.id);

            sndToast.success({
                title: "تم حذف المنشور",
                description: "لن يظهر المنشور في المجتمع أو في قائمة منشوراتك النشطة.",
            });

            onDeleted();
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

    return (
        <>
            <Card className="overflow-hidden rounded-[1.75rem] transition-[border-color,box-shadow] duration-300 hover:border-brand/25 hover:shadow-lg">
                <CardHeader className="gap-4 p-5 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                            <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <span className="rounded-full border border-success/25 bg-success/10 px-2.5 py-1 font-bold text-success">
                                    منشور نشط
                                </span>
                                <time dateTime={post.createdAt}>نُشر {postDateFormatter.format(new Date(post.createdAt))}</time>
                                {wasEdited ? (
                                    <time dateTime={post.updatedAt}>· عُدّل {postDateFormatter.format(new Date(post.updatedAt))}</time>
                                ) : null}
                            </div>

                            <h2 className="break-words text-xl font-bold leading-8 text-foreground sm:text-2xl">
                                {post.title}
                            </h2>
                        </div>

                        <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-border bg-surface-muted/55 px-3 py-2 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1.5" aria-label={`عدد الصور: ${post.images.length}`}>
                                <Images aria-hidden="true" className="size-4" />
                                <span dir="ltr" className="font-bold text-foreground">{post.images.length}/5</span>
                            </span>
                            <span aria-hidden="true" className="h-4 w-px bg-border" />
                            <span className="inline-flex items-center gap-1.5" aria-label={`عدد الإعجابات: ${post.likesCount}`}>
                                <Heart aria-hidden="true" className="size-4" />
                                <span dir="ltr" className="font-bold text-foreground">
                                    {postCountFormatter.format(post.likesCount)}
                                </span>
                            </span>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="grid gap-5 px-5 pb-5 sm:px-6 sm:pb-6">
                    {presentation ? (
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
                    ) : null}

                    <p className="line-clamp-5 whitespace-pre-wrap break-words text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
                        {post.content}
                    </p>

                    <PublicPostImages images={post.images} title={post.title} />
                </CardContent>

                <CardFooter className="grid grid-cols-2 gap-2 bg-surface-muted/40 p-4 sm:flex sm:px-6">
                    <Button
                        type="button"
                        variant="secondary"
                        disabled={deleteMutation.isPending}
                        onClick={() => {
                            setPresentation(null);
                            setIsEditOpen(true);
                        }}
                        className="w-full sm:w-auto"
                    >
                        <PencilLine aria-hidden="true" />
                        تعديل النص
                    </Button>

                    <Button
                        type="button"
                        variant="secondary"
                        disabled={deleteMutation.isPending}
                        onClick={() => {
                            setPresentation(null);
                            setIsImagesOpen(true);
                        }}
                        className="w-full sm:w-auto"
                    >
                        <Images aria-hidden="true" />
                        إدارة الصور
                    </Button>

                    <Link
                        href={`/posts/${post.id}`}
                        className={cn(buttonVariants({variant: "ghost"}), "w-full sm:ms-auto sm:w-auto")}
                    >
                        <Eye aria-hidden="true" />
                        عرض المنشور
                    </Link>

                    <Button
                        type="button"
                        variant="ghost"
                        disabled={deleteMutation.isPending}
                        onClick={() => {
                            setPresentation(null);
                            setIsDeleteOpen(true);
                        }}
                        className="w-full text-danger hover:bg-danger/10 hover:text-danger sm:w-auto"
                    >
                        <Trash2 aria-hidden="true" />
                        حذف
                    </Button>
                </CardFooter>
            </Card>

            {isEditOpen ? (
                <EditPostDialog open post={post} onOpenChange={setIsEditOpen} />
            ) : null}

            {isImagesOpen ? (
                <ManagePostImagesDialog open post={post} onOpenChange={setIsImagesOpen} />
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
