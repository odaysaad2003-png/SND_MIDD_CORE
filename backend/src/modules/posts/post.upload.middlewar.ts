import {NextFunction, Request, Response} from "express";
import multer from "multer";
import {mkdirSync, promises as fsPromises} from "fs";
import {randomUUID} from "crypto";

import {AppError} from "../../utils/app-error";
import {
    ALLOWED_POST_IMAGE_MIME_TO_EXT,
    MAX_POST_IMAGE_SIZE_BYTES,
    MAX_POST_IMAGE_SIZE_MB,
    MAX_POST_IMAGES_PER_POST,
    POST_IMAGES_PUBLIC_URL_PATH,
    POST_IMAGES_UPLOAD_DIR,
} from "../../constants/post.constants";

mkdirSync(POST_IMAGES_UPLOAD_DIR, {recursive: true});

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, POST_IMAGES_UPLOAD_DIR);
    },

    filename: (_req, file, cb) => {
        const ext = ALLOWED_POST_IMAGE_MIME_TO_EXT[file.mimetype as keyof typeof ALLOWED_POST_IMAGE_MIME_TO_EXT];

        const safeFileName = `post-${Date.now()}-${randomUUID()}${ext}`;

        cb(null, safeFileName);
    },
});

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
    const isAllowed = Object.prototype.hasOwnProperty.call(ALLOWED_POST_IMAGE_MIME_TO_EXT, file.mimetype);

    if (!isAllowed) {
        cb(new Error("Only JPEG, PNG, and WEBP images are allowed"));
        return;
    }

    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_POST_IMAGE_SIZE_BYTES,
    },
}).array("images", MAX_POST_IMAGES_PER_POST);

export const uploadPostImagesMiddleware = (req: Request, res: Response, next: NextFunction) => {
    upload(req, res, async (err) => {
        if (err) {
            const uploadedFiles = (req.files as Express.Multer.File[] | undefined) ?? [];

            await deleteLocalFiles(uploadedFiles);

            if (err instanceof multer.MulterError) {
                if (err.code === "LIMIT_FILE_SIZE") {
                    return next(AppError.badRequest(`Each image must be at most ${MAX_POST_IMAGE_SIZE_MB}MB`));
                }

                if (err.code === "LIMIT_UNEXPECTED_FILE") {
                    return next(AppError.badRequest(`You can upload up to ${MAX_POST_IMAGES_PER_POST} images`));
                }

                return next(AppError.badRequest(err.message));
            }

            if (err instanceof Error) {
                return next(AppError.badRequest(err.message));
            }

            return next(AppError.badRequest("Invalid image upload"));
        }

        next();
    });
};

export function getPostImagePublicUrl(file: Express.Multer.File): string {
    return `${POST_IMAGES_PUBLIC_URL_PATH}/${file.filename}`;
}

export async function deleteLocalFiles(files: Express.Multer.File[]): Promise<void> {
    await Promise.allSettled(files.map((file) => fsPromises.unlink(file.path)));
}
