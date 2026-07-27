"use client";

import {Camera, ImagePlus, LoaderCircle, RotateCcw, X} from "lucide-react";
import Image from "next/image";
import {useCallback, useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent} from "react";

import {sndToast} from "@/components/feedback/toast/snd-toast-store";
import {Avatar} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";
import {Feedback} from "@/components/ui/feedback";
import {useAuth} from "@/features/auth/providers/auth-provider";

import {
    isAvatarUploadAbortError,
    mapAvatarUploadError,
    type AvatarUploadErrorPresentation,
} from "../errors/avatar-upload-error-mapper";
import {useUpdateMyAvatar} from "../hooks/use-update-my-avatar";
import {
    avatarFileSchema,
    MAX_AVATAR_SIZE_MB,
    SUPPORTED_AVATAR_MIME_TYPES,
    type AvatarFile,
} from "../schemas/avatar-file.schema";
import type {MyProfile} from "../schemas/my-profile.schema";

type ProfileAvatarSectionProps = Readonly<{
    profile: MyProfile;
}>;

const avatarAcceptValue = SUPPORTED_AVATAR_MIME_TYPES.join(",");

const arabicNumberFormatter = new Intl.NumberFormat("ar", {
    maximumFractionDigits: 1,
});

function formatFileSize(sizeInBytes: number): string {
    const sizeInMegabytes = sizeInBytes / (1024 * 1024);

    return `${arabicNumberFormatter.format(sizeInMegabytes)} ميجابايت`;
}

export function ProfileAvatarSection({profile}: ProfileAvatarSectionProps) {
    const fileInputId = useId();
    const fileDescriptionId = `${fileInputId}-description`;
    const fileErrorId = `${fileInputId}-error`;

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    /*
     * نحتفظ بالـObject URL الحالي في Ref حتى نستطيع إلغاءه
     * قبل إنشاء URL جديدة وعند إزالة الـComponent.
     */
    const previewUrlRef = useRef<string | null>(null);

    const [selectedFile, setSelectedFile] = useState<AvatarFile | null>(null);

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [fileError, setFileError] = useState<string | null>(null);

    const [uploadError, setUploadError] = useState<AvatarUploadErrorPresentation | null>(null);

    const {updateCurrentUserIdentity} = useAuth();

    const {
        mutateAsync: uploadAvatar,
        isPending,
        reset: resetAvatarMutation,
    } = useUpdateMyAvatar({
        onIdentityUpdated: updateCurrentUserIdentity,
    });

    const replacePreview = useCallback((file: AvatarFile | null) => {
        if (previewUrlRef.current) {
            URL.revokeObjectURL(previewUrlRef.current);

            previewUrlRef.current = null;
        }

        if (!file) {
            setPreviewUrl(null);
            return;
        }

        const nextPreviewUrl = URL.createObjectURL(file);

        previewUrlRef.current = nextPreviewUrl;

        setPreviewUrl(nextPreviewUrl);
    }, []);

    /*
     * Object URL تحجز مرجعًا إلى الملف داخل ذاكرة المتصفح.
     * يجب تحريرها عندما تختفي الواجهة حتى لا تتراكم الذاكرة.
     */
    useEffect(() => {
        return () => {
            if (previewUrlRef.current) {
                URL.revokeObjectURL(previewUrlRef.current);
            }
        };
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedFile(null);
        setFileError(null);
        setUploadError(null);

        replacePreview(null);
        resetAvatarMutation();

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }, [replacePreview, resetAvatarMutation]);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.currentTarget.files?.[0] ?? null;

        setUploadError(null);
        resetAvatarMutation();

        if (!file) {
            clearSelection();
            return;
        }

        const parsedFile = avatarFileSchema.safeParse(file);

        if (!parsedFile.success) {
            const firstMessage = parsedFile.error.issues[0]?.message ?? "اختر ملف صورة صالحًا";

            setSelectedFile(null);
            setFileError(firstMessage);
            replacePreview(null);

            /*
             * يسمح للمستخدم باختيار الملف نفسه مرة أخرى
             * بعد تعديله أو استبداله.
             */
            event.currentTarget.value = "";

            return;
        }

        setFileError(null);
        setSelectedFile(parsedFile.data);
        replacePreview(parsedFile.data);
    };

    const submitSelectedAvatar = async () => {
        if (!selectedFile) {
            setFileError("اختر صورة قبل بدء الرفع");

            fileInputRef.current?.focus();
            return;
        }

        setFileError(null);
        setUploadError(null);

        const toastId = sndToast.loading({
            title: "جار رفع الصورة",
            description: "نرفع الصورة ونحدّث حسابك الآن.",
        });

        try {
            const updatedProfile = await uploadAvatar(selectedFile);

            sndToast.success({
                id: toastId,
                title: "تم تحديث الصورة",
                description: "ظهرت الصورة الجديدة في حسابك.",
            });

            /*
             * الـMutation حدّثت Query Cache وAuth Identity.
             * نمسح الملف المحلي لأن الصورة النهائية أصبحت
             * قادمة من السيرفر.
             */
            clearSelection();

            return updatedProfile;
        } catch (error) {
            if (isAvatarUploadAbortError(error)) {
                sndToast.dismiss(toastId);
                return;
            }

            const presentation = mapAvatarUploadError(error);

            setUploadError(presentation);

            if (presentation.fileMessage) {
                setFileError(presentation.fileMessage);
            }

            sndToast.error({
                id: toastId,
                title: presentation.title,
                description: presentation.description,
                durationMs: presentation.toastDurationMs,
            });
        }
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        void submitSelectedAvatar();
    };

    const openFilePicker = () => {
        fileInputRef.current?.click();
    };

    const describedBy = fileError ? `${fileDescriptionId} ${fileErrorId}` : fileDescriptionId;

    return (
        <section
            id="profile-avatar"
            aria-labelledby="profile-avatar-heading"
            className="scroll-mt-28 rounded-3xl border border-border bg-surface-raised p-5 shadow-sm sm:p-6"
        >
            <div className="grid gap-6">
                <header className="grid gap-1">
                    <h2 id="profile-avatar-heading" className="text-lg font-bold text-foreground">
                        صورة الحساب
                    </h2>

                    <p className="text-sm leading-6 text-muted-foreground">
                        اختر صورة واضحة تساعد الآخرين على التعرّف إليك داخل مجتمع سند.
                    </p>
                </header>

                <form noValidate aria-busy={isPending} onSubmit={handleSubmit} className="grid gap-5">
                    {uploadError ? (
                        <Feedback
                            variant={uploadError.tone}
                            title={uploadError.title}
                            description={
                                <div className="grid gap-3">
                                    <p>{uploadError.description}</p>

                                    {uploadError.requestId ? (
                                        <p className="text-xs">
                                            رقم الطلب:{" "}
                                            <span dir="ltr" className="font-mono">
                                                {uploadError.requestId}
                                            </span>
                                        </p>
                                    ) : null}

                                    {uploadError.retryable ? (
                                        <div>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="secondary"
                                                disabled={isPending}
                                                onClick={() => {
                                                    void submitSelectedAvatar();
                                                }}
                                            >
                                                <RotateCcw aria-hidden="true" />
                                                إعادة المحاولة
                                            </Button>
                                        </div>
                                    ) : null}
                                </div>
                            }
                        />
                    ) : null}

                    <div className="grid gap-5 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
                        <div className="relative mx-auto size-32 sm:mx-0">
                            {previewUrl ? (
                                <span className="relative block size-32 overflow-hidden rounded-full border-4 border-brand/15 bg-surface-muted shadow-sm">
                                    <Image
                                        src={previewUrl}
                                        alt="معاينة الصورة المختارة"
                                        fill
                                        sizes="128px"
                                        unoptimized
                                        className="object-cover"
                                    />
                                </span>
                            ) : (
                                <Avatar
                                    name={profile.name}
                                    imageUrl={profile.avatar}
                                    sizes="128px"
                                    className="size-32 border-4 border-brand/15 text-3xl shadow-sm"
                                />
                            )}

                            <span
                                aria-hidden="true"
                                className="absolute -bottom-1 -end-1 grid size-10 place-items-center rounded-full border-4 border-surface-raised bg-brand text-brand-foreground shadow-sm"
                            >
                                <Camera className="size-4" />
                            </span>
                        </div>

                        <div className="min-w-0 grid gap-4">
                            <div id={fileDescriptionId} className="grid gap-1 text-sm leading-6">
                                <p className="font-semibold text-foreground">
                                    {selectedFile ? "الصورة جاهزة للرفع" : "JPEG أو PNG أو WEBP"}
                                </p>

                                <p className="text-muted-foreground">
                                    الحد الأقصى {MAX_AVATAR_SIZE_MB} ميجابايت. سنعرض معاينة محلية قبل إرسال الملف.
                                </p>
                            </div>

                            {selectedFile ? (
                                <div
                                    aria-live="polite"
                                    className="min-w-0 rounded-2xl border border-brand/15 bg-brand/5 px-4 py-3"
                                >
                                    <p className="break-all text-sm font-semibold text-foreground">
                                        {selectedFile.name}
                                    </p>

                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {formatFileSize(selectedFile.size)}
                                    </p>
                                </div>
                            ) : null}

                            <input
                                ref={fileInputRef}
                                id={fileInputId}
                                type="file"
                                accept={avatarAcceptValue}
                                disabled={isPending}
                                aria-invalid={fileError ? "true" : undefined}
                                aria-describedby={describedBy}
                                onChange={handleFileChange}
                                className="sr-only"
                            />

                            <div className="flex flex-wrap gap-3">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    disabled={isPending}
                                    aria-describedby={describedBy}
                                    onClick={openFilePicker}
                                >
                                    <ImagePlus aria-hidden="true" />

                                    {selectedFile ? "اختيار صورة أخرى" : "اختيار صورة"}
                                </Button>

                                {selectedFile ? (
                                    <Button type="button" variant="ghost" disabled={isPending} onClick={clearSelection}>
                                        <X aria-hidden="true" />
                                        إلغاء الاختيار
                                    </Button>
                                ) : null}
                            </div>

                            {fileError ? (
                                <p id={fileErrorId} role="alert" className="text-sm font-medium text-danger">
                                    {fileError}
                                </p>
                            ) : null}
                        </div>
                    </div>

                    <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm leading-6 text-muted-foreground">
                            لا يتم إرسال الملف قبل الضغط على زر رفع الصورة.
                        </p>

                        <Button
                            type="submit"
                            disabled={!selectedFile || isPending}
                            aria-busy={isPending}
                            className="w-full sm:w-auto"
                        >
                            {isPending ? (
                                <LoaderCircle aria-hidden="true" className="animate-spin" />
                            ) : (
                                <Camera aria-hidden="true" />
                            )}

                            {isPending ? "جار رفع الصورة" : "رفع الصورة"}
                        </Button>
                    </div>
                </form>
            </div>
        </section>
    );
}
