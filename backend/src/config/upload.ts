import path from "path";

export const UPLOADS_ROOT_DIR = path.join(process.cwd(), "uploads");

export const AVATAR_UPLOAD_DIR = path.join(UPLOADS_ROOT_DIR, "avatars");

export const AVATAR_PUBLIC_URL_PATH = "/uploads/avatars";

export const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export const MAX_AVATAR_SIZE_MB = 5;

export const ALLOWED_AVATAR_MIME_TO_EXT: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
};
