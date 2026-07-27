"use client";

import {ImageOff, ImagePlus, LoaderCircle, Trash2, WifiOff} from "lucide-react";
import Image from "next/image";
import {useEffect, useRef, useState} from "react";

import {sndToast} from "@/components/feedback/toast/snd-toast-store";
import {Button} from "@/components/ui/button";
import {ConfirmationDialog} from "@/components/ui/confirmation-dialog";
import {Feedback} from "@/components/ui/feedback";
import {ModalDialog} from "@/components/ui/modal-dialog";
import {ApiError} from "@/lib/api/api-error";
import {isSupportedRemoteImage} from "@/lib/media/is-supported-remote-image";

import {getPublicPost} from "../api/get-public-post";

import {mapPostManagementError, type PostManagementErrorPresentation} from "../errors/post-management-error-mapper";
import {usePostCacheActions, useRemovePostImage, useUploadPostImages} from "../hooks/use-post-authoring-mutations";
import {useOnlineStatus} from "../hooks/use-online-status";
import {disposePostImageSelections, type PostImageSelection} from "../lib/post-image-selection";
import {MAX_POST_IMAGES} from "../schemas/post-authoring.schema";
import type {PublicPost} from "../schemas/public-posts.schema";

import {PostImagePicker} from "./post-image-picker";

type ManagePostImagesDialogProps = Readonly<{
    open: boolean;
    post: PublicPost;
    onChanged?: (post: PublicPost) => void;
    onOpenChange: (open: boolean) => void;
}>;

export function ManagePostImagesDialog({open, post, onChanged, onOpenChange}: ManagePostImagesDialogProps) {
    const uploadMutation = useUploadPostImages();
    const removeMutation = useRemovePostImage();
    const postCache = usePostCacheActions();
    const isOnline = useOnlineStatus();

    const [selectedImages, setSelectedImages] = useState<readonly PostImageSelection[]>([]);
    const selectedImagesRef = useRef<readonly PostImageSelection[]>([]);
    const [presentation, setPresentation] = useState<PostManagementErrorPresentation | null>(null);
    const [imageToRemove, setImageToRemove] = useState<string | null>(null);
    const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);

    const isBusy = uploadMutation.isPending || removeMutation.isPending;

    useEffect(() => {
        selectedImagesRef.current = selectedImages;
    }, [selectedImages]);

    useEffect(() => {
        return () => {
            disposePostImageSelections(selectedImagesRef.current);
        };
    }, []);

    function resetLocalSelection(): void {
        disposePostImageSelections(selectedImagesRef.current);
        selectedImagesRef.current = [];
        setSelectedImages([]);
        setPresentation(null);
        setImageToRemove(null);
        uploadMutation.reset();
        removeMutation.reset();
    }

    function closeDialog(): void {
        resetLocalSelection();
        onOpenChange(false);
    }

    function requestOpenChange(nextOpen: boolean): void {
        if (nextOpen) {
            onOpenChange(true);
            return;
        }

        if (isBusy) {
            return;
        }

        if (selectedImages.length > 0) {
            setIsDiscardDialogOpen(true);
            return;
        }

        closeDialog();
    }

    async function uploadSelectedImages(): Promise<void> {
        if (selectedImages.length === 0 || isBusy) {
            return;
        }

        if (!isOnline) {
            sndToast.warning({
                title: "رفع الصور يحتاج اتصالًا بالإنترنت",
                description: "احتفظنا بالصور المختارة داخل النافذة، ولم نرسل أي طلب.",
            });
            return;
        }

        setPresentation(null);

        try {
            const updatedPost = await uploadMutation.mutateAsync({
                postId: post.id,
                files: selectedImages.map((selection) => selection.file),
            });

            disposePostImageSelections(selectedImagesRef.current);
            selectedImagesRef.current = [];
            setSelectedImages([]);

            sndToast.success({
                title: "تمت إضافة الصور",
                description: "رفعنا الصور وربطناها بالمنشور دون تغيير النص.",
            });

            onChanged?.(updatedPost);
        } catch (error) {
            const shouldReconcile =
                error instanceof ApiError &&
                (error.kind === "network" || error.kind === "invalid-response");

            if (shouldReconcile) {
                try {
                    const reconciledPost = await getPublicPost(post.id);
                    const expectedImageCount = post.images.length + selectedImages.length;

                    if (reconciledPost.images.length === expectedImageCount) {
                        postCache.synchronizePost(reconciledPost);
                        void postCache.invalidatePostLists();

                        disposePostImageSelections(selectedImagesRef.current);
                        selectedImagesRef.current = [];
                        setSelectedImages([]);

                        sndToast.success({
                            title: "تمت إضافة الصور",
                            description: "تأكدنا من الرفع بعد انقطاع الرد وحدّثنا المنشور.",
                        });

                        onChanged?.(reconciledPost);
                        return;
                    }
                } catch {
                    // نحتفظ بالصور المحلية عندما لا نستطيع حسم نتيجة الرفع.
                }
            }

            const errorPresentation = mapPostManagementError(error, "upload-images");
            setPresentation(errorPresentation);

            const showToast = errorPresentation.tone === "warning" ? sndToast.warning : sndToast.error;

            showToast({
                title: errorPresentation.title,
                description: "احتفظنا بالصور المختارة داخل النافذة لإعادة المحاولة.",
                durationMs: errorPresentation.tone === "warning" ? 0 : undefined,
            });
        }
    }

    async function confirmRemoveImage(): Promise<void> {
        if (!imageToRemove || isBusy) {
            return;
        }

        if (!isOnline) {
            setImageToRemove(null);
            sndToast.warning({
                title: "حذف الصورة يحتاج اتصالًا بالإنترنت",
                description: "لم نرسل أي طلب، والصورة ما زالت مرتبطة بالمنشور.",
            });
            return;
        }

        setPresentation(null);

        try {
            const updatedPost = await removeMutation.mutateAsync({
                postId: post.id,
                imageUrl: imageToRemove,
            });

            setImageToRemove(null);

            sndToast.success({
                title: "تم حذف الصورة",
                description: "أزلنا الصورة من المنشور وحدّثنا القوائم.",
            });

            onChanged?.(updatedPost);
        } catch (error) {
            const shouldReconcile =
                error instanceof ApiError &&
                (error.kind === "network" || error.kind === "invalid-response");

            if (shouldReconcile) {
                try {
                    const reconciledPost = await getPublicPost(post.id);

                    if (!reconciledPost.images.includes(imageToRemove)) {
                        postCache.synchronizePost(reconciledPost);
                        void postCache.invalidatePostLists();
                        setImageToRemove(null);

                        sndToast.success({
                            title: "تم حذف الصورة",
                            description: "تأكدنا من الحذف بعد انقطاع الرد وحدّثنا المنشور.",
                        });

                        onChanged?.(reconciledPost);
                        return;
                    }
                } catch {
                    // نعرض الخطأ دون افتراض نجاح حذف لم يؤكده الخادم.
                }
            }

            const errorPresentation = mapPostManagementError(error, "remove-image");
            setImageToRemove(null);
            setPresentation(errorPresentation);

            const showToast = errorPresentation.tone === "warning" ? sndToast.warning : sndToast.error;

            showToast({
                title: errorPresentation.title,
                description: "لم نخفِ الصورة من الواجهة لأن الخادم لم يؤكد حذفها.",
                durationMs: errorPresentation.tone === "warning" ? 0 : undefined,
            });
        }
    }

    const remainingSlots = Math.max(0, MAX_POST_IMAGES - post.images.length - selectedImages.length);

    const footer = (
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p aria-live="polite" className="min-h-6 text-sm text-muted-foreground">
                {!isOnline ? "أنت غير متصل. ستبقى الصور المختارة محليًا حتى عودة الاتصال." : null}
                {isOnline && uploadMutation.isPending ? "نرفع الصور الجديدة ونحدّث المنشور…" : null}
                {isOnline && removeMutation.isPending ? "نحذف الصورة من المنشور…" : null}
                {isOnline && !isBusy && selectedImages.length > 0
                    ? `${selectedImages.length} صور جاهزة للرفع، و${remainingSlots} أماكن متبقية.`
                    : null}
                {isOnline && !isBusy && selectedImages.length === 0
                    ? "حذف صورة موجودة يتم فور تأكيدك، أما الصور الجديدة فلا تُرفع إلا بزر الإضافة."
                    : null}
            </p>

            <div className="flex flex-col-reverse gap-2 sm:flex-row">
                <Button
                    type="button"
                    variant="secondary"
                    disabled={isBusy}
                    onClick={() => requestOpenChange(false)}
                    className="w-full sm:w-auto"
                >
                    إغلاق
                </Button>

                <Button
                    type="button"
                    disabled={isBusy || selectedImages.length === 0 || !isOnline}
                    aria-busy={uploadMutation.isPending}
                    onClick={() => void uploadSelectedImages()}
                    className="w-full sm:min-w-44 sm:w-auto"
                >
                    {uploadMutation.isPending ? (
                        <LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" />
                    ) : isOnline ? (
                        <ImagePlus aria-hidden="true" />
                    ) : (
                        <WifiOff aria-hidden="true" />
                    )}
                    {uploadMutation.isPending
                        ? "جار رفع الصور"
                        : !isOnline
                          ? "بانتظار الاتصال"
                          : selectedImages.length > 0
                            ? `إضافة ${selectedImages.length} صور`
                            : "اختر صورًا أولًا"}
                </Button>
            </div>
        </div>
    );

    return (
        <>
            <ModalDialog
                open={open}
                title="إدارة صور المنشور"
                description="أضف صورًا جديدة أو احذف صورة موجودة، مع بقاء العنوان والمحتوى كما هما."
                isBusy={isBusy}
                onOpenChange={requestOpenChange}
                footer={footer}
            >
                <div className="grid gap-7">
                    {!isOnline ? (
                        <Feedback
                            variant="warning"
                            title="وضع عدم الاتصال"
                            description="يمكنك اختيار الصور ومراجعتها محليًا، لكن الرفع والحذف سيبقيان معطلين حتى يعود الاتصال."
                        />
                    ) : null}

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

                    <section aria-labelledby={`existing-images-${post.id}`} className="grid gap-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h3 id={`existing-images-${post.id}`} className="font-bold text-foreground">
                                    الصور الحالية
                                </h3>
                                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                    حذف الصورة لا يحذف المنشور نفسه، لكنه لا يملك زر تراجع في الواجهة الحالية.
                                </p>
                            </div>

                            <span className="rounded-full border border-border bg-surface-muted px-3 py-1 text-xs font-bold text-muted-foreground">
                                {post.images.length}/{MAX_POST_IMAGES}
                            </span>
                        </div>

                        {post.images.length > 0 ? (
                            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3" aria-label="صور المنشور الحالية">
                                {post.images.map((imageUrl, index) => {
                                    const canRenderImage = isSupportedRemoteImage(imageUrl);

                                    return (
                                        <li
                                            key={`${imageUrl}-${index}`}
                                            className="relative overflow-hidden rounded-2xl border border-border bg-surface-muted"
                                        >
                                            <div className="relative aspect-square overflow-hidden">
                                                {canRenderImage ? (
                                                    <Image
                                                        src={imageUrl}
                                                        alt={`الصورة الحالية ${index + 1} للمنشور: ${post.title}`}
                                                        fill
                                                        sizes="(max-width: 640px) 50vw, 220px"
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="grid h-full place-items-center p-4 text-center text-muted-foreground">
                                                        <span className="grid gap-2">
                                                            <ImageOff aria-hidden="true" className="mx-auto size-8" />
                                                            <span className="text-xs leading-5">
                                                                مرجع صورة قديم غير قابل للعرض، ويمكنك حذفه بأمان.
                                                            </span>
                                                        </span>
                                                    </div>
                                                )}

                                                <Button
                                                    type="button"
                                                    variant="danger"
                                                    size="icon"
                                                    disabled={isBusy || !isOnline}
                                                    aria-label={`حذف الصورة الحالية رقم ${index + 1}`}
                                                    onClick={() => {
                                                        setPresentation(null);
                                                        setImageToRemove(imageUrl);
                                                    }}
                                                    className="absolute end-2 top-2 size-10 min-h-10 rounded-full shadow-lg"
                                                >
                                                    <Trash2 aria-hidden="true" />
                                                </Button>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <Feedback
                                variant="info"
                                title="لا توجد صور في هذا المنشور"
                                description="يمكنك إبقاء المنشور نصيًا أو اختيار صور جديدة من القسم التالي."
                            />
                        )}
                    </section>

                    <div className="border-t border-border pt-6">
                        <PostImagePicker
                            images={selectedImages}
                            existingImageCount={post.images.length}
                            disabled={isBusy}
                            onChange={(nextImages) => {
                                setSelectedImages(nextImages);
                                setPresentation(null);
                            }}
                        />
                    </div>
                </div>
            </ModalDialog>

            <ConfirmationDialog
                open={Boolean(imageToRemove)}
                title="حذف هذه الصورة؟"
                description="ستُزال الصورة من المنشور فور نجاح الخادم. لا يتوفر زر استعادة للصورة المحذوفة في الواجهة الحالية."
                confirmLabel="حذف الصورة"
                pendingLabel="جار حذف الصورة"
                cancelLabel="الاحتفاظ بالصورة"
                variant="danger"
                isPending={removeMutation.isPending}
                onConfirm={() => void confirmRemoveImage()}
                onOpenChange={(nextOpen) => {
                    if (!nextOpen && !removeMutation.isPending) {
                        setImageToRemove(null);
                    }
                }}
            />

            <ConfirmationDialog
                open={isDiscardDialogOpen}
                title="تجاهل الصور المختارة؟"
                description="هذه الصور لم تُرفع بعد. سيؤدي الإغلاق إلى حذف المعاينات المحلية فقط، دون تغيير صور المنشور الحالية."
                confirmLabel="تجاهل الاختيارات"
                cancelLabel="العودة لإدارة الصور"
                variant="danger"
                onConfirm={() => {
                    setIsDiscardDialogOpen(false);
                    closeDialog();
                }}
                onOpenChange={setIsDiscardDialogOpen}
            />
        </>
    );
}
