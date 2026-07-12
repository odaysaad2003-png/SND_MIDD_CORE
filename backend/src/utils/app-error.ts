import { ErrorCode, ErrorCodeStatusMap } from "../constants/error-codes";

/**
 * AppError represents an expected, "operational" error — something we
 * threw on purpose (validation failure, not found, forbidden, etc.) as
 * opposed to a genuine bug/crash. The global error handler uses
 * `isOperational` to decide whether it's safe to expose `message` to the
 * client, or whether to hide it behind a generic message.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly details?: unknown;
  public readonly isOperational = true;

  constructor(code: ErrorCode, message: string, details?: unknown, statusCode?: number) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode ?? ErrorCodeStatusMap[code];
    this.details = details;

    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace?.(this, AppError);
  }

  static validation(message: string, details?: unknown) {
    return new AppError("VALIDATION_ERROR", message, details);
  }

  static notFound(message = "Resource not found") {
    return new AppError("NOT_FOUND", message);
  }

  static unauthorized(message = "Authentication required") {
    return new AppError("UNAUTHORIZED", message);
  }

  static forbidden(message = "You are not allowed to perform this action") {
    return new AppError("FORBIDDEN", message);
  }

  static conflict(message = "Resource conflict") {
    return new AppError("CONFLICT", message);
  }

  static payloadTooLarge(message = "Payload too large") {
    return new AppError("PAYLOAD_TOO_LARGE", message);
  }

  static unsupportedMediaType(message = "Unsupported media type") {
    return new AppError("UNSUPPORTED_MEDIA_TYPE", message);
  }

  static serviceUnavailable(message = "Service unavailable") {
    return new AppError("SERVICE_UNAVAILABLE", message);
  }

  static tooManyRequests(message = "Too many requests") {
    return new AppError("TOO_MANY_REQUESTS", message);
  }

  static internal(message = "Internal server error") {
    return new AppError("INTERNAL_ERROR", message);
  }
  static badRequest(message = "Bad request") {
    return new AppError("BAD_REQUEST", message);
  }
}
