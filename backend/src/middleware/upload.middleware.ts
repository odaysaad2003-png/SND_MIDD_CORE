import fs from "fs";
import crypto from "crypto";
import multer, {FileFilterCallback} from "multer";
import {NextFunction, Request, Response} from "express";
import {
    ALLOWED_AVATAR_MIME_TO_EXT,
    AVATAR_UPLOAD_DIR,
    MAX_AVATAR_SIZE_BYTES,
    MAX_AVATAR_SIZE_MB,
} from "../config/upload";
import {AppError} from "../utils/app-error";

fs.mkdirSync(AVATAR_UPLOAD_DIR, {recursive: true});

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, AVATAR_UPLOAD_DIR);
    },

    filename: (_req, file, cb) => {
        const ext = ALLOWED_AVATAR_MIME_TO_EXT[file.mimetype];

        if (!ext) {
            cb(new Error("Invalid avatar file type"), "");
            return;
        }

        const uniqueFileName = `${Date.now()}-${crypto.randomBytes(16).toString("hex")}${ext}`;

        cb(null, uniqueFileName);
    },
});

function fileFilter(_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void {
    if (!ALLOWED_AVATAR_MIME_TO_EXT[file.mimetype]) {
        cb(AppError.validation("Only JPEG, PNG, or WEBP images are allowed for avatars."));
        return;
    }

    cb(null, true);
}

const avatarMulter = multer({
    storage,
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
