import multer, {FileFilterCallback} from "multer";
import {NextFunction, Request, Response} from "express";
import {ALLOWED_AVATAR_MIME_TO_EXT, MAX_AVATAR_SIZE_BYTES, MAX_AVATAR_SIZE_MB} from "../../config/upload";
import {AppError} from "../../utils/app-error";

function fileFilter(_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void {
    if (!ALLOWED_AVATAR_MIME_TO_EXT[file.mimetype]) {
        cb(AppError.validation("Only JPEG, PNG, or WEBP images are allowed for avatars."));
        return;
    }

    cb(null, true);
}

const avatarMulter = multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: {
        fileSize: MAX_AVATAR_SIZE_BYTES,
    },
});

export function uploadAvatar(req: Request, res: Response, next: NextFunction): void {
    avatarMulter.single("avatar")(req, res, (err: unknown) => {
        if (err instanceof multer.MulterError) {
            if (err.code === "LIMIT_FILE_SIZE") {
                next(AppError.validation(`Avatar file too large. Max size is ${MAX_AVATAR_SIZE_MB}MB.`));
                return;
            }

            if (err.code === "LIMIT_UNEXPECTED_FILE") {
                next(AppError.validation("Invalid avatar field. Use field name: avatar."));
                return;
            }

            next(AppError.validation(err.message));
            return;
        }

        if (err) {
            next(err);
            return;
        }

        if (!req.file) {
            next(AppError.validation("Avatar file is required."));
            return;
        }

        next();
    });
}
