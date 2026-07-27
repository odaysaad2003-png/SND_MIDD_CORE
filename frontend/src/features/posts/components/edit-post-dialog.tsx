"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {LoaderCircle, Save, WifiOff} from "lucide-react";
import {useState} from "react";
import {useForm} from "react-hook-form";

import {sndToast} from "@/components/feedback/toast/snd-toast-store";
import {Button} from "@/components/ui/button";
import {ConfirmationDialog} from "@/components/ui/confirmation-dialog";
import {Feedback} from "@/components/ui/feedback";
import {Field} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {ModalDialog} from "@/components/ui/modal-dialog";
import {Textarea} from "@/components/ui/textarea";
import {ApiError} from "@/lib/api/api-error";

import {getPublicPost} from "../api/get-public-post";
import {mapPostManagementError, type PostManagementErrorPresentation} from "../errors/post-management-error-mapper";
import {usePostCacheActions, useUpdatePost} from "../hooks/use-post-authoring-mutations";
import {useOnlineStatus} from "../hooks/use-online-status";
import {
    POST_CONTENT_MAX_LENGTH,
    POST_TITLE_MAX_LENGTH,
    postAuthoringFormSchema,
    type PostAuthoringFormValues,
    type PostUpdatePayload,
} from "../schemas/post-authoring.schema";
import type {PublicPost} from "../schemas/public-posts.schema";

type EditPostDialogProps = Readonly<{
    open: boolean;
    post: PublicPost;
    onSaved?: (post: PublicPost) => void;
    onOpenChange: (open: boolean) => void;
}>;

export function EditPostDialog({open, post, onSaved, onOpenChange}: EditPostDialogProps) {
    const mutation = useUpdatePost();
    const postCache = usePostCacheActions();
    const isOnline = useOnlineStatus();
    const [presentation, setPresentation] = useState<PostManagementErrorPresentation | null>(null);
    const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);

    const form = useForm<PostAuthoringFormValues>({
        resolver: zodResolver(postAuthoringFormSchema),
        defaultValues: {
            title: post.title,
            content: post.content,
        },
        mode: "onSubmit",
        reValidateMode: "onChange",
    });

    const titleValue = form.watch("title");
    const contentValue = form.watch("content");

    function closeDialog(): void {
        form.reset({title: post.title, content: post.content});
        setPresentation(null);
        onOpenChange(false);
    }

    function requestOpenChange(nextOpen: boolean): void {
        if (nextOpen) {
            onOpenChange(true);
            return;
        }

        if (mutation.isPending) {
            return;
        }

        if (form.formState.isDirty) {
            setIsDiscardDialogOpen(true);
            return;
        }

        closeDialog();
    }

    const submit = form.handleSubmit(async (values) => {
        if (!isOnline) {
            sndToast.warning({
                title: "الحفظ يحتاج اتصالًا بالإنترنت",
                description: "احتفظنا بالتعديلات داخل النافذة، ولم نرسل أي طلب إلى الخادم.",
            });
            return;
        }

        const payload: PostUpdatePayload = {};
        const nextTitle = values.title.trim();
        const nextContent = values.content.trim();

        if (nextTitle !== post.title) {
            payload.title = nextTitle;
        }

        if (nextContent !== post.content) {
            payload.content = nextContent;
        }

        if (Object.keys(payload).length === 0) {
            form.reset({title: post.title, content: post.content});
            sndToast.info({
                title: "لا توجد تغييرات للحفظ",
                description: "العنوان والمحتوى مطابقان للنسخة الحالية.",
            });
            return;
        }

        setPresentation(null);

        try {
            const updatedPost = await mutation.mutateAsync({postId: post.id, values: payload});

            sndToast.success({
                title: "تم تحديث المنشور",
                description: "حُفظ العنوان والمحتوى وحدثنا ظهوره في القوائم.",
            });

            onSaved?.(updatedPost);
            closeDialog();
        } catch (error) {
            const shouldReconcile =
                error instanceof ApiError &&
                (error.kind === "network" || error.kind === "invalid-response");

            if (shouldReconcile) {
                try {
                    const reconciledPost = await getPublicPost(post.id);
                    const titleMatches = payload.title === undefined || reconciledPost.title === payload.title;
                    const contentMatches = payload.content === undefined || reconciledPost.content === payload.content;

                    if (titleMatches && contentMatches) {
                        postCache.synchronizePost(reconciledPost);
                        void postCache.invalidatePostLists();

                        sndToast.success({
                            title: "تم تحديث المنشور",
                            description: "تأكدنا من التعديلات بعد انقطاع الرد وحدّثنا القوائم.",
                        });

                        onSaved?.(reconciledPost);
                        closeDialog();
                        return;
                    }
                } catch {
                    // عند تعذر المصالحة نحتفظ بالنموذج ونستخدم رسالة الاسترداد أدناه.
                }
            }

            const errorPresentation = mapPostManagementError(error, "edit");
            setPresentation(errorPresentation);

            const showToast = errorPresentation.tone === "warning" ? sndToast.warning : sndToast.error;

            showToast({
                title: errorPresentation.title,
                description: "احتفظنا بالتعديلات داخل النافذة لتتمكن من إعادة المحاولة.",
                durationMs: errorPresentation.tone === "warning" ? 0 : undefined,
            });
        }
    });

    const footer = (
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p aria-live="polite" className="min-h-6 text-sm text-muted-foreground">
                {!isOnline ? "أنت غير متصل. يمكنك مواصلة الكتابة، وسيعود الحفظ عند عودة الاتصال." : null}
                {isOnline && mutation.isPending ? "نحفظ التعديلات ونحدّث قوائم المنشورات…" : null}
                {isOnline && !mutation.isPending ? "لن تتغير الصور من هذه النافذة." : null}
            </p>

            <div className="flex flex-col-reverse gap-2 sm:flex-row">
                <Button
                    type="button"
                    variant="secondary"
                    disabled={mutation.isPending}
                    onClick={() => requestOpenChange(false)}
                    className="w-full sm:w-auto"
                >
                    إلغاء
                </Button>

                <Button
                    type="button"
                    disabled={mutation.isPending || !form.formState.isDirty || !isOnline}
                    aria-busy={mutation.isPending}
                    onClick={() => void submit()}
                    className="w-full sm:min-w-40 sm:w-auto"
                >
                    {mutation.isPending ? (
                        <LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" />
                    ) : isOnline ? (
                        <Save aria-hidden="true" />
                    ) : (
                        <WifiOff aria-hidden="true" />
                    )}
                    {mutation.isPending ? "جار الحفظ" : isOnline ? "حفظ التعديلات" : "بانتظار الاتصال"}
                </Button>
            </div>
        </div>
    );

    return (
        <>
            <ModalDialog
                open={open}
                title="تعديل المنشور"
                description="عدّل الرسالة مع الحفاظ على وضوحها. إدارة الصور لها مساحة مستقلة حتى لا تختلط العمليات."
                isBusy={mutation.isPending}
                onOpenChange={requestOpenChange}
                footer={footer}
            >
                <form
                    noValidate
                    aria-busy={mutation.isPending}
                    onSubmit={(event) => {
                        event.preventDefault();
                        void submit();
                    }}
                    className="grid gap-6"
                >
                    {!isOnline ? (
                        <Feedback
                            variant="warning"
                            title="وضع عدم الاتصال"
                            description="يمكنك تعديل الحقول الآن، لكن زر الحفظ سيبقى معطلًا حتى يعود اتصال المتصفح."
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

                    <Field
                        htmlFor={`edit-post-title-${post.id}`}
                        label="عنوان المنشور"
                        required
                        error={form.formState.errors.title?.message}
                        description="اجعله مباشرًا وقابلًا للفهم من أول قراءة."
                    >
                        <Input
                            id={`edit-post-title-${post.id}`}
                            autoFocus
                            maxLength={POST_TITLE_MAX_LENGTH}
                            disabled={mutation.isPending}
                            aria-invalid={form.formState.errors.title ? "true" : undefined}
                            {...form.register("title")}
                        />
                        <p className="text-end text-xs text-muted-foreground" aria-live="polite">
                            {titleValue.length}/{POST_TITLE_MAX_LENGTH}
                        </p>
                    </Field>

                    <Field
                        htmlFor={`edit-post-content-${post.id}`}
                        label="محتوى المنشور"
                        required
                        error={form.formState.errors.content?.message}
                        description="التعديل سيظهر في المنشور العام فور نجاح الخادم."
                    >
                        <Textarea
                            id={`edit-post-content-${post.id}`}
                            maxLength={POST_CONTENT_MAX_LENGTH}
                            disabled={mutation.isPending}
                            aria-invalid={form.formState.errors.content ? "true" : undefined}
                            {...form.register("content")}
                        />
                        <p className="text-end text-xs text-muted-foreground" aria-live="polite">
                            {contentValue.length}/{POST_CONTENT_MAX_LENGTH}
                        </p>
                    </Field>
                </form>
            </ModalDialog>

            <ConfirmationDialog
                open={isDiscardDialogOpen}
                title="تجاهل التعديلات؟"
                description="ستفقد التغييرات غير المحفوظة في العنوان أو المحتوى، ولن يتغير المنشور الموجود على الخادم."
                confirmLabel="تجاهل التعديلات"
                cancelLabel="العودة للتعديل"
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
