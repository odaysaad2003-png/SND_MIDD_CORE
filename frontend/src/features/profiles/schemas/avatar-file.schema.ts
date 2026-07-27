import {z} from "zod";

export const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;
export const MAX_AVATAR_SIZE_MB = 5;

export const SUPPORTED_AVATAR_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

const supportedAvatarMimeTypes = new Set<string>(SUPPORTED_AVATAR_MIME_TYPES);

export const avatarFileSchema = z
.custom<File>((value) => typeof File !== "undefined" && value instanceof File, {
    message: "اختر ملف صورة صالحًا",
})
.refine((file) => file.size > 0, {
    message: "ملف الصورة فارغ",
})
.refine((file) => supportedAvatarMimeTypes.has(file.type), {
    message: "صيغة الصورة غير مدعومة. استخدم JPEG أو PNG أو WEBP",
})
.refine((file) => file.size <= MAX_AVATAR_SIZE_BYTES, {
    message: "حجم الصورة يجب ألا يتجاوز 5 ميجابايت",
});

export type AvatarFile = z.infer<typeof avatarFileSchema>;
