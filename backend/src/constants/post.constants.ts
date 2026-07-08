import path from "path";

export const AUTHOR_PUBLIC_FIELDS = "name avatar";

export const MAX_POST_IMAGES_PER_POST = 5;

export const MAX_POST_IMAGE_SIZE_MB = 5;

export const MAX_POST_IMAGE_SIZE_BYTES = MAX_POST_IMAGE_SIZE_MB * 1024 * 1024;

export const UPLOADS_ROOT_DIR = path.join(process.cwd(), "uploads");

export const POST_IMAGES_UPLOAD_DIR = path.join(UPLOADS_ROOT_DIR, "posts");

export const POST_IMAGES_PUBLIC_URL_PATH = "/uploads/posts";

export const ALLOWED_POST_IMAGE_MIME_TO_EXT = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
} as const;
