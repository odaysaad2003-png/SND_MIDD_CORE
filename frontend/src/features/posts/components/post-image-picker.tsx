"use client";

import {ImagePlus, LoaderCircle, Trash2} from "lucide-react";
import Image from "next/image";
import {useId, useRef, useState, type ChangeEvent} from "react";

import {Button} from "@/components/ui/button";
import {Feedback} from "@/components/ui/feedback";

import {
    createPostImageSelections,
    disposePostImageSelections,
    formatPostImageSize,
    PostImageSelectionError,
    type PostImageSelection,
} from "../lib/post-image-selection";
import {
    MAX_POST_IMAGES,
    MAX_POST_IMAGE_SIZE_MB,
    POST_IMAGE_ACCEPT,
} from "../schemas/post-authoring.schema";

type PostImagePickerProps = Readonly<{
    images: readonly PostImageSelection[];
    disabled?: boolean;
    existingImageCount?: number;
    onChange: (images: readonly PostImageSelection[]) => void;
}>;

export function PostImagePicker({
    images,
    disabled = false,
    existingImageCount = 0,
    onChange,
}: PostImagePickerProps) {
    const inputId = useId();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [selectionError, setSelectionError] = useState<string | null>(null);
    const [isInspecting, setIsInspecting] = useState(false);

    const occupiedCount = existingImageCount + images.length;
    const remainingSlots = MAX_POST_IMAGES - occupiedCount;

    async function handleFileChange(event: ChangeEvent<HTMLInputElement>): Promise<void> {
        const files = Array.from(event.currentTarget.files ?? []);

        event.currentTarget.value = "";

        if (files.length === 0) {
            return;
        }

        setSelectionError(null);
        setIsInspecting(true);

        try {
            const nextSelections = await createPostImageSelections(files, occupiedCount);
            onChange([...images, ...nextSelections]);
        } catch (error) {
            if (error instanceof PostImageSelectionError) {
                setSelectionError(
                    error.fileName ? `${error.fileName}: ${error.message}` : error.message
                );
            } else {
                setSelectionError("تعذر فحص الصور المختارة. حاول اختيارها مرة أخرى.");
            }
        } finally {
            setIsInspecting(false);
        }
    }

    function removeImage(selectionId: string): void {
        const removedSelection = images.find((selection) => selection.id === selectionId);

        if (removedSelection) {
            disposePostImageSelections([removedSelection]);
        }

        onChange(images.filter((selection) => selection.id !== selectionId));
        setSelectionError(null);
    }

    return (
        <section aria-labelledby={`${inputId}-heading`} className="grid gap-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h3 id={`${inputId}-heading`} className="font-bold text-foreground">
                        صور المنشور <span className="font-medium text-muted-foreground">(اختيارية)</span>
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        حتى {MAX_POST_IMAGES} صور، وبحد أقصى {MAX_POST_IMAGE_SIZE_MB} ميجابايت للصورة. JPEG أو PNG أو WEBP.
                    </p>
                </div>

                <span className="rounded-full border border-border bg-surface-muted px-3 py-1 text-xs font-bold text-muted-foreground">
                    {occupiedCount}/{MAX_POST_IMAGES}
                </span>
            </div>

            {selectionError ? (
                <Feedback variant="danger" title="تعذر إضافة الصورة" description={selectionError} />
            ) : null}

            {images.length > 0 ? (
                <ul aria-label="الصور المختارة" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {images.map((selection, index) => (
                        <li
                            key={selection.id}
                            className="group relative overflow-hidden rounded-2xl border border-border bg-surface-muted"
                        >
                            <div className="relative aspect-square overflow-hidden">
                                <Image
                                    src={selection.previewUrl}
                                    alt={`معاينة الصورة ${index + 1}: ${selection.file.name}`}
                                    fill
                                    unoptimized
                                    sizes="(max-width: 640px) 50vw, 220px"
                                    className="object-cover"
                                />

                                <Button
                                    type="button"
                                    size="icon"
                                    variant="danger"
                                    disabled={disabled}
                                    aria-label={`إزالة الصورة ${selection.file.name}`}
                                    onClick={() => {
                                        removeImage(selection.id);
                                    }}
                                    className="absolute end-2 top-2 size-10 min-h-10 rounded-full shadow-lg"
                                >
                                    <Trash2 aria-hidden="true" />
                                </Button>
                            </div>

                            <div className="min-w-0 p-3">
                                <p title={selection.file.name} className="truncate text-xs font-bold text-foreground">
                                    {selection.file.name}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {formatPostImageSize(selection.file.size)}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : remainingSlots > 0 ? (
                <button
                    type="button"
                    disabled={disabled || isInspecting}
                    onClick={() => inputRef.current?.click()}
                    className="grid min-h-40 place-items-center rounded-3xl border border-dashed border-border-strong bg-surface-muted/45 p-5 text-center transition-colors hover:border-brand/45 hover:bg-brand/5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <span className="grid gap-3">
                        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-brand/10 text-brand">
                            {isInspecting ? (
                                <LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" />
                            ) : (
                                <ImagePlus aria-hidden="true" />
                            )}
                        </span>
                        <span>
                            <span className="block font-bold text-foreground">
                                {isInspecting ? "نفحص الصور…" : "أضف صورًا للمنشور"}
                            </span>
                            <span className="mt-1 block text-sm text-muted-foreground">
                                الصور اختيارية ويمكن حفظ المنشور بدونها
                            </span>
                        </span>
                    </span>
                </button>
            ) : (
                <Feedback
                    variant="info"
                    title="اكتمل الحد الأقصى للصور"
                    description="احذف صورة حالية قبل إضافة صورة أخرى إلى هذا المنشور."
                />
            )}

            {images.length > 0 && remainingSlots > 0 ? (
                <Button
                    type="button"
                    variant="secondary"
                    disabled={disabled || isInspecting}
                    onClick={() => inputRef.current?.click()}
                    className="w-full sm:w-fit"
                >
                    {isInspecting ? (
                        <LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" />
                    ) : (
                        <ImagePlus aria-hidden="true" />
                    )}
                    {isInspecting ? "نفحص الصور" : `إضافة صور أخرى (${remainingSlots} متبقية)`}
                </Button>
            ) : null}

            <input
                ref={inputRef}
                id={inputId}
                type="file"
                accept={POST_IMAGE_ACCEPT}
                multiple
                disabled={disabled || isInspecting || remainingSlots === 0}
                onChange={(event) => {
                    void handleFileChange(event);
                }}
                className="sr-only"
            />
        </section>
    );
}
