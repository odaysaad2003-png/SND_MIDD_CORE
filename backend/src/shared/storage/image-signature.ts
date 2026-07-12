import { AppError } from "../../utils/app-error";

export type SupportedImageMimeType = "image/jpeg" | "image/png" | "image/webp";

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function hasPrefix(buffer: Buffer, signature: Buffer): boolean {
  return buffer.length >= signature.length && buffer.subarray(0, signature.length).equals(signature);
}

export function detectImageMimeType(buffer: Buffer): SupportedImageMimeType | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  if (hasPrefix(buffer, PNG_SIGNATURE)) {
    return "image/png";
  }

  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }

  return null;
}

export function assertValidImageSignature(file: Express.Multer.File): void {
  const detectedMimeType = detectImageMimeType(file.buffer);

  if (!detectedMimeType) {
    throw AppError.unsupportedMediaType("Uploaded file is not a supported image");
  }

  if (detectedMimeType !== file.mimetype) {
    throw AppError.unsupportedMediaType("Uploaded image content does not match its declared type");
  }
}
