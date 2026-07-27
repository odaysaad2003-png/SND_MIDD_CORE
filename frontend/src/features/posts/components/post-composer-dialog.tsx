"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {CheckCircle2, ImageUp, LoaderCircle, Send, ShieldCheck, WifiOff} from "lucide-react";
import {useRouter} from "next/navigation";
import {useEffect, useRef, useState} from "react";
import {useForm} from "react-hook-form";

import {sndToast} from "@/components/feedback/toast/snd-toast-store";
import {Avatar} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";
import {ConfirmationDialog} from "@/components/ui/confirmation-dialog";
import {Feedback} from "@/components/ui/feedback";
import {Field} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {ModalDialog} from "@/components/ui/modal-dialog";
import {Textarea} from "@/components/ui/textarea";
import {useAuth} from "@/features/auth/providers/auth-provider";
import {ApiError} from "@/lib/api/api-error";

import {
    mapCreatePostError,
    mapPostImageUploadError,
    type PostComposerErrorPresentation,
} from "../errors/post-composer-error-mapper";
import {useCreatePost, usePostCacheActions, useUploadPostImages} from "../hooks/use-post-authoring-mutations";
import {useOnlineStatus} from "../hooks/use-online-status";
import {disposePostImageSelections, type PostImageSelection} from "../lib/post-image-selection";
import {getPublicPost} from "../api/get-public-post";
import {
    POST_CONTENT_MAX_LENGTH,
    POST_TITLE_MAX_LENGTH,
    postAuthoringFormSchema,
    type PostAuthoringFormValues,
} from "../schemas/post-authoring.schema";
import type {PublicPost} from "../schemas/public-posts.schema";

import {PostImagePicker} from "./post-image-picker";

type PostComposerDialogProps = Readonly<{
    open: boolean;
    onOpenChange: (open: boolean) => void;
}>;

type ComposerPhase = "editing" | "creating" | "uploading" | "upload-failed";

const defaultValues: PostAuthoringFormValues = {
    title: "",
    content: "",
};

export function PostComposerDialog({open, onOpenChange}: PostComposerDialogProps) {
    const router = useRouter();
    const {user} = useAuth();
    const createMutation = useCreatePost();
    const uploadMutation = useUploadPostImages();
    const postCache = usePostCacheActions();
    const isOnline = useOnlineStatus();

    const [images, setImages] = useState<readonly PostImageSelection[]>([]);
    const imagesRef = useRef<readonly PostImageSelection[]>([]);
    const [createdPost, setCreatedPost] = useState<PublicPost | null>(null);
    const [phase, setPhase] = useState<ComposerPhase>("editing");
    const [presentation, setPresentation] = useState<PostComposerErrorPresentation | null>(null);
    const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);

    const form = useForm<PostAuthoringFormValues>({
        resolver: zodResolver(postAuthoringFormSchema),
        defaultValues,
        mode: "onSubmit",
        reValidateMode: "onChange",
    });

    const titleValue = form.watch("title");
    const contentValue = form.watch("content");

    const isBusy = phase === "creating" || phase === "uploading";
    const hasDraft = form.formState.isDirty || images.length > 0;

    useEffect(() => {
        imagesRef.current = images;
    }, [images]);

    useEffect(() => {
        return () => {
            disposePostImageSelections(imagesRef.current);
        };
    }, []);

    function resetComposer(): void {
        disposePostImageSelections(imagesRef.current);
        imagesRef.current = [];
        setImages([]);
        setCreatedPost(null);
        setPresentation(null);
        setPhase("editing");
        form.reset(defaultValues);
        createMutation.reset();
        uploadMutation.reset();
    }

    function closeComposer(): void {
        resetComposer();
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

        if (createdPost || hasDraft) {
            setIsDiscardDialogOpen(true);
            return;
        }

        closeComposer();
    }

    function finishPublishedPost(post: PublicPost, withImages: boolean): void {
        const postId = post.id;

        sndToast.success({
            title: "تم نشر المنشور",
            description: withImages
                ? "نُشر النص واكتمل رفع الصور بنجاح."
                : "نُشر المنشور النصي ويمكنك إضافة الصور لاحقًا من إدارة منشوراتك.",
            action: {
                label: "عرض المنشور",
                onClick: () => {
                    router.push(`/posts/${postId}`);
                },
            },
        });

        closeComposer();
    }

    async function uploadSelectedImages(post: PublicPost): Promise<void> {
        if (images.length === 0) {
            finishPublishedPost(post, false);
            return;
        }

        if (!isOnline) {
            sndToast.warning({
                title: "رفع الصور يحتاج اتصالًا بالإنترنت",
                description: "المنشور النصي موجود، واحتفظنا بالصور لإعادة الرفع بعد عودة الاتصال.",
            });
            setPhase("upload-failed");
            return;
        }

        setPresentation(null);
        setPhase("uploading");

        try {
            const updatedPost = await uploadMutation.mutateAsync({
                postId: post.id,
                files: images.map((selection) => selection.file),
            });

            finishPublishedPost(updatedPost, true);
        } catch (error) {
            const shouldReconcile =
                error instanceof ApiError &&
                (error.kind === "network" || error.kind === "invalid-response");

            if (shouldReconcile) {
                try {
                    const reconciledPost = await getPublicPost(post.id);
                    const expectedImageCount = post.images.length + images.length;

                    if (reconciledPost.images.length === expectedImageCount) {
                        postCache.synchronizePost(reconciledPost);
                        void postCache.invalidatePostLists();

                        finishPublishedPost(reconciledPost, true);
                        return;
                    }
                } catch {
                    // نعرض حالة الاسترداد الآمنة أدناه عندما يتعذر حسم نتيجة الرفع.
                }
            }

            const errorPresentation = mapPostImageUploadError(error);

            setPresentation(errorPresentation);
            setPhase("upload-failed");

            sndToast.warning({
                title: errorPresentation.title,
                description: "المنشور النصي موجود بالفعل، ولن نعيد إنشاءه عند محاولة رفع الصور مجددًا.",
                durationMs: 0,
            });
        }
    }

    const submit = form.handleSubmit(async (values) => {
        if (!isOnline) {
            sndToast.warning({
                title: "النشر يحتاج اتصالًا بالإنترنت",
                description: "احتفظنا بالنص والصور داخل النافذة، ولم نرسل أي طلب إلى الخادم.",
            });
            return;
        }

        if (createdPost) {
            await uploadSelectedImages(createdPost);
            return;
        }

        setPresentation(null);
        setPhase("creating");

        try {
            const post = await createMutation.mutateAsync(values);

            setCreatedPost(post);

            if (images.length === 0) {
                finishPublishedPost(post, false);
                return;
            }

            await uploadSelectedImages(post);
        } catch (error) {
            const errorPresentation = mapCreatePostError(error);

            setPresentation(errorPresentation);
            setPhase("editing");

            sndToast.error({
                title: errorPresentation.title,
                description: errorPresentation.ambiguousCreate
                    ? "احتفظنا بالنص. تحقق من منشوراتك قبل إعادة الإرسال لتجنب التكرار."
                    : "احتفظنا بجميع الحقول والصور داخل أداة النشر.",
                durationMs: errorPresentation.ambiguousCreate ? 0 : undefined,
            });
        }
    });

    if (!user) {
        return null;
    }

    const footer = (
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div aria-live="polite" className="min-h-6 text-sm text-muted-foreground">
                {!isOnline ? "أنت غير متصل. ستبقى المسودة والصور داخل النافذة حتى عودة الاتصال." : null}
                {isOnline && phase === "creating" ? "ننشر النص أولًا…" : null}
                {isOnline && phase === "uploading" ? "نُشر النص، والآن نرفع الصور دون إنشاء منشور جديد…" : null}
                {isOnline && phase === "upload-failed" ? "المنشور موجود بدون الصور المختارة." : null}
                {isOnline && phase === "editing" ? "لن تُرفع الصور إلا بعد نجاح نشر النص." : null}
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row">
                {phase === "upload-failed" && createdPost ? (
                    <Button
                        type="button"
                        variant="secondary"
                        disabled={isBusy}
                        onClick={() => {
                            finishPublishedPost(createdPost, false);
                        }}
                        className="w-full sm:w-auto"
                    >
                        <CheckCircle2 aria-hidden="true" />
                        متابعة بدون صور
                    </Button>
                ) : (
                    <Button
                        type="button"
                        variant="secondary"
                        disabled={isBusy}
                        onClick={() => requestOpenChange(false)}
                        className="w-full sm:w-auto"
                    >
                        إلغاء
                    </Button>
                )}

                <Button
                    type="button"
                    disabled={isBusy || !isOnline}
                    aria-busy={isBusy}
                    onClick={() => {
                        void submit();
                    }}
                    className="w-full sm:min-w-44 sm:w-auto"
                >
                    {isBusy ? <LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" /> : null}
                    {!isBusy && !isOnline ? <WifiOff aria-hidden="true" /> : null}
                    {!isOnline ? "بانتظار الاتصال" : null}
                    {isOnline && phase === "creating" ? "جار نشر النص" : null}
                    {isOnline && phase === "uploading" ? "جار رفع الصور" : null}
                    {isOnline && phase === "upload-failed" ? (
                        <>
                            <ImageUp aria-hidden="true" />
                            إعادة رفع الصور
                        </>
                    ) : null}
                    {isOnline && phase === "editing" ? (
                        <>
                            <Send aria-hidden="true" />
                            {images.length > 0 ? `نشر ورفع ${images.length} صور` : "نشر المنشور"}
                        </>
                    ) : null}
                </Button>
            </div>
        </div>
    );

    return (
        <>
            <ModalDialog
                open={open}
                title="إنشاء منشور جديد"
                description="اكتب رسالتك بوضوح، وأضف الصور فقط عندما تساعد على فهمها."
                isBusy={isBusy}
                onOpenChange={requestOpenChange}
                footer={footer}
            >
                <form
                    noValidate
                    aria-busy={isBusy}
                    onSubmit={(event) => {
                        event.preventDefault();
                        void submit();
                    }}
                    className="grid gap-6"
                >
                    <div className="flex items-center gap-3 rounded-2xl border border-brand/15 bg-brand/5 p-3">
                        <Avatar
                            name={user.name}
                            imageUrl={user.avatar}
                            sizes="48px"
                            className="size-12 border-2 border-background ring-2 ring-brand/15"
                        />

                        <div className="min-w-0 flex-1">
                            <p className="truncate font-bold text-foreground">{user.name}</p>
                            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                                <ShieldCheck aria-hidden="true" className="size-3.5 text-success" />
                                سيظهر اسمك وصورتك مع المنشور
                            </p>
                        </div>
                    </div>

                    {!isOnline ? (
                        <Feedback
                            variant="warning"
                            title="وضع عدم الاتصال"
                            description="يمكنك كتابة المنشور واختيار الصور الآن، لكن الإرسال سيبقى معطلًا حتى يعود اتصال المتصفح."
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

                    {createdPost ? (
                        <Feedback
                            variant="success"
                            title="تم نشر النص بنجاح"
                            description="نحتفظ بمعرّف المنشور ونستخدمه لرفع الصور فقط. إعادة المحاولة لن تنشئ منشورًا نصيًا ثانيًا."
                        />
                    ) : null}

                    <Field
                        htmlFor="post-title"
                        label="عنوان المنشور"
                        required
                        error={form.formState.errors.title?.message}
                        description={`عنوان مباشر من 3 إلى ${POST_TITLE_MAX_LENGTH} حرفًا.`}
                    >
                        <Input
                            id="post-title"
                            autoFocus
                            maxLength={POST_TITLE_MAX_LENGTH}
                            disabled={isBusy || Boolean(createdPost)}
                            aria-invalid={form.formState.errors.title ? "true" : undefined}
                            aria-describedby={form.formState.errors.title ? "post-title-error" : "post-title-description"}
                            placeholder="مثال: أبحث عن مساعدة في…"
                            {...form.register("title")}
                        />
                        <p className="text-end text-xs text-muted-foreground" aria-live="polite">
                            {titleValue.length}/{POST_TITLE_MAX_LENGTH}
                        </p>
                    </Field>

                    <Field
                        htmlFor="post-content"
                        label="تفاصيل المنشور"
                        required
                        error={form.formState.errors.content?.message}
                        description="اشرح ما تحتاجه أو ترغب في مشاركته بلغة واضحة ومحترمة."
                    >
                        <Textarea
                            id="post-content"
                            maxLength={POST_CONTENT_MAX_LENGTH}
                            disabled={isBusy || Boolean(createdPost)}
                            aria-invalid={form.formState.errors.content ? "true" : undefined}
                            aria-describedby={form.formState.errors.content ? "post-content-error" : "post-content-description"}
                            placeholder="اكتب التفاصيل التي تساعد الآخرين على فهم المنشور…"
                            {...form.register("content")}
                        />
                        <p className="text-end text-xs text-muted-foreground" aria-live="polite">
                            {contentValue.length}/{POST_CONTENT_MAX_LENGTH}
                        </p>
                    </Field>

                    <PostImagePicker
                        images={images}
                        disabled={isBusy}
                        onChange={(nextImages) => {
                            setImages(nextImages);
                            setPresentation(null);
                        }}
                    />
                </form>
            </ModalDialog>

            <ConfirmationDialog
                open={isDiscardDialogOpen}
                title={createdPost ? "إغلاق أداة النشر؟" : "حذف المسودة الحالية؟"}
                description={
                    createdPost ? (
                        <>
                            المنشور النصي <strong className="text-foreground">نُشر بالفعل</strong>. سيؤدي الإغلاق إلى
                            المتابعة بدونهـا، ولن يُحذف المنشور.
                        </>
                    ) : (
                        "ستفقد النص والصور المختارة داخل هذه النافذة. لم يتم إرسال أي شيء إلى الخادم بعد."
                    )
                }
                confirmLabel={createdPost ? "إغلاق والمتابعة بدون صور" : "حذف المسودة"}
                cancelLabel="العودة للمنشور"
                variant="danger"
                onConfirm={() => {
                    setIsDiscardDialogOpen(false);
                    closeComposer();
                }}
                onOpenChange={setIsDiscardDialogOpen}
            />
        </>
    );
}
