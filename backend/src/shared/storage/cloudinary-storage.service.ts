import { Readable } from "stream";
import type { UploadApiResponse } from "cloudinary";
import { cloudinary } from "../../config/cloudinary";
import { env } from "../../config/env";
import { AppError } from "../../utils/app-error";
import { logger } from "../../utils/logger";
import { UploadedAsset } from "./storage.types";

interface UploadImageOptions {
  folder: string;
}

interface CloudinaryErrorShape {
  message?: unknown;
  name?: unknown;
  http_code?: unknown;
}

function getCloudinaryErrorMeta(error: unknown): Record<string, unknown> {
  if (typeof error !== "object" || error === null) {
    return { message: String(error) };
  }

  const cloudinaryError = error as CloudinaryErrorShape;

  return {
    name: typeof cloudinaryError.name === "string" ? cloudinaryError.name : undefined,
    message: typeof cloudinaryError.message === "string" ? cloudinaryError.message : "Unknown Cloudinary error",
    httpCode: typeof cloudinaryError.http_code === "number" ? cloudinaryError.http_code : undefined,
  };
}

function uploadBufferToCloudinary(buffer: Buffer, options: UploadImageOptions): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `${env.CLOUDINARY_ROOT_FOLDER}/${options.folder}`,
        resource_type: "image",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        use_filename: false,
        unique_filename: true,
        overwrite: false,
      },
      (error, result) => {
        if (error) {
          logger.error("Cloudinary image upload failed", {
            provider: "cloudinary",
            operation: "upload",
            error: getCloudinaryErrorMeta(error),
          });
          reject(AppError.serviceUnavailable("Image storage is temporarily unavailable"));
          return;
        }

        if (!result) {
          logger.error("Cloudinary image upload returned no result", {
            provider: "cloudinary",
            operation: "upload",
          });
          reject(AppError.serviceUnavailable("Image storage is temporarily unavailable"));
          return;
        }

        resolve(result);
      }
    );

    Readable.from([buffer]).pipe(uploadStream);
  });
}

export async function uploadImageToCloudinary(
  file: Express.Multer.File,
  options: UploadImageOptions
): Promise<UploadedAsset> {
  const result = await uploadBufferToCloudinary(file.buffer, options);

  return {
    provider: "cloudinary",
    url: result.secure_url,
    publicId: result.public_id,
    bytes: result.bytes,
    format: result.format,
  };
}

export async function deleteImageFromCloudinary(publicId: string): Promise<void> {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
      invalidate: true,
    });

    if (result.result !== "ok" && result.result !== "not found") {
      logger.error("Cloudinary image deletion returned an unexpected result", {
        provider: "cloudinary",
        operation: "delete",
        result: result.result,
      });
      throw AppError.serviceUnavailable("Image storage is temporarily unavailable");
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logger.error("Cloudinary image deletion failed", {
      provider: "cloudinary",
      operation: "delete",
      error: getCloudinaryErrorMeta(error),
    });
    throw AppError.serviceUnavailable("Image storage is temporarily unavailable");
  }
}
