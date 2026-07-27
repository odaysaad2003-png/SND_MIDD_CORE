import {
    MAX_POST_IMAGES,
    MAX_POST_IMAGE_SIZE_BYTES,
    MAX_POST_IMAGE_SIZE_MB,
} from "../schemas/post-authoring.schema";

export type PostImageSelection = Readonly<{
    id: string;
    file: File;
    previewUrl: string;
}>;

type SupportedPostImageMimeType = "image/jpeg" | "image/png" | "image/webp";

const supportedMimeTypes = new Set<SupportedPostImageMimeType>([
    "image/jpeg",
    "image/png",
    "image/webp",
]);

export class PostImageSelectionError extends Error {
    readonly fileName: string | null;

    constructor(message: string, fileName: string | null = null) {
        super(message);
        this.name = "PostImageSelectionError";
        this.fileName = fileName;
    }
}

function isSupportedMimeType(value: string): value is SupportedPostImageMimeType {
    return supportedMimeTypes.has(value as SupportedPostImageMimeType);
}

function hasPrefix(bytes: Uint8Array, signature: readonly number[]): boolean {
    return signature.every((value, index) => bytes[index] === value);
}

async function detectImageMimeType(file: File): Promise<SupportedPostImageMimeType | null> {
    const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());

    if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
        return "image/jpeg";
    }

    if (bytes.length >= 8 && hasPrefix(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
        return "image/png";
    }

    const riff = String.fromCharCode(...bytes.slice(0, 4));
    const webp = String.fromCharCode(...bytes.slice(8, 12));

    if (bytes.length >= 12 && riff === "RIFF" && webp === "WEBP") {
        return "image/webp";
    }

    return null;
}

function createSelectionId(index: number): string {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
    }

    return `post-image-${Date.now()}-${index}`;
}

export async function createPostImageSelections(
    files: readonly File[],
    existingCount: number
): Promise<PostImageSelection[]> {
    if (existingCount + files.length > MAX_POST_IMAGES) {
        throw new PostImageSelectionError(`يمكنك اختيار ${MAX_POST_IMAGES} صور كحد أقصى لكل منشور`);
    }

    const selections: PostImageSelection[] = [];

    try {
        for (const [index, file] of files.entries()) {
            if (!isSupportedMimeType(file.type)) {
                throw new PostImageSelectionError("الصيغ المدعومة هي JPEG وPNG وWEBP فقط", file.name);
            }

            if (file.size > MAX_POST_IMAGE_SIZE_BYTES) {
                throw new PostImageSelectionError(
                    `حجم كل صورة يجب ألا يتجاوز ${MAX_POST_IMAGE_SIZE_MB} ميجابايت`,
                    file.name
                );
            }

            const detectedMimeType = await detectImageMimeType(file);

            if (!detectedMimeType || detectedMimeType !== file.type) {
                throw new PostImageSelectionError(
                    "محتوى الملف لا يطابق نوع الصورة المعلن. اختر صورة أصلية بصيغة مدعومة",
                    file.name
                );
            }

            selections.push({
                id: createSelectionId(index),
                file,
                previewUrl: URL.createObjectURL(file),
            });
        }

        return selections;
    } catch (error) {
        disposePostImageSelections(selections);
        throw error;
    }
}

export function disposePostImageSelections(selections: readonly PostImageSelection[]): void {
    selections.forEach((selection) => {
        URL.revokeObjectURL(selection.previewUrl);
    });
}

export function formatPostImageSize(size: number): string {
    if (size < 1024 * 1024) {
        return `${Math.max(1, Math.round(size / 1024))} كيلوبايت`;
    }

    return `${(size / (1024 * 1024)).toFixed(1)} ميجابايت`;
}
