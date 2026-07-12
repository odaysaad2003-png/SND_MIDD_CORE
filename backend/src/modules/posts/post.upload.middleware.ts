import { NextFunction, Request, Response } from "express";
import multer from "multer";
import {
  ALLOWED_POST_IMAGE_MIME_TO_EXT,
  MAX_POST_IMAGE_SIZE_BYTES,
  MAX_POST_IMAGE_SIZE_MB,
  MAX_POST_IMAGES_PER_POST,
} from "../../constants/post.constants";
import { assertValidImageSignature } from "../../shared/storage/image-signature";
import { AppError } from "../../utils/app-error";

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  const isAllowed = Object.prototype.hasOwnProperty.call(ALLOWED_POST_IMAGE_MIME_TO_EXT, file.mimetype);

  if (!isAllowed) {
    cb(AppError.unsupportedMediaType("Only JPEG, PNG, or WEBP images are allowed"));
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
    fields: 0,
    parts: MAX_POST_IMAGES_PER_POST,
  },
}).array("images", MAX_POST_IMAGES_PER_POST);

export const uploadPostImagesMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  upload(req, res, (err: unknown) => {
    if (err instanceof AppError) {
      next(err);
      return;
    }

    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        next(AppError.payloadTooLarge(`Each image must be at most ${MAX_POST_IMAGE_SIZE_MB}MB`));
        return;
      }

      if (err.code === "LIMIT_UNEXPECTED_FILE" || err.code === "LIMIT_FILE_COUNT") {
        next(AppError.validation(`You can upload up to ${MAX_POST_IMAGES_PER_POST} images`));
        return;
      }

      if (err.code === "LIMIT_FIELD_COUNT" || err.code === "LIMIT_PART_COUNT") {
        next(AppError.validation("Image upload must contain only image files"));
        return;
      }

      next(AppError.validation("Invalid image upload"));
      return;
    }

    if (err) {
      next(err);
      return;
    }

    const files = (req.files as Express.Multer.File[] | undefined) ?? [];

    try {
      for (const file of files) {
        assertValidImageSignature(file);
      }

      next();
    } catch (signatureError) {
      next(signatureError);
    }
  });
};
