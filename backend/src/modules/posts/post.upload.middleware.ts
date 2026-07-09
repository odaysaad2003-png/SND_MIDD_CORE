import {NextFunction, Request, Response} from "express";
import multer from "multer";

import {AppError} from "../../utils/app-error";
import {
    ALLOWED_POST_IMAGE_MIME_TO_EXT,
    MAX_POST_IMAGE_SIZE_BYTES,
    MAX_POST_IMAGE_SIZE_MB,
    MAX_POST_IMAGES_PER_POST,
} from "../../constants/post.constants";

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
    const isAllowed = Object.prototype.hasOwnProperty.call(ALLOWED_POST_IMAGE_MIME_TO_EXT, file.mimetype);

    if (!isAllowed) {
        cb(new Error("Only JPEG, PNG, and WEBP images are allowed"));
        return;
    }

    cb(null, true);
};

const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: {
        fileSize: MAX_POST_IMAGE_SIZE_BYTES,
        files: MAX_POST_IMAGES_PER_POST,
    },
}).array("images", MAX_POST_IMAGES_PER_POST);

export const uploadPostImagesMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    upload(req, res, (err: unknown) => {
        if (err instanceof multer.MulterError) {
            if (err.code === "LIMIT_FILE_SIZE") {
                next(AppError.badRequest(`Each image must be at most ${MAX_POST_IMAGE_SIZE_MB}MB`));
                return;
            }

            if (err.code === "LIMIT_UNEXPECTED_FILE" || err.code === "LIMIT_FILE_COUNT") {
                next(AppError.badRequest(`You can upload up to ${MAX_POST_IMAGES_PER_POST} images`));
                return;
            }

            next(AppError.badRequest(err.message));
            return;
        }

        if (err instanceof Error) {
            next(AppError.badRequest(err.message));
            return;
        }

        if (err) {
            next(AppError.badRequest("Invalid image upload"));
            return;
        }

        next();
    });
};
