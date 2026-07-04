import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/app-error";
import { ErrorCodes } from "../constants/error-codes";
import { logger } from "../utils/logger";
import { isProduction } from "../config/env";

/**
 * Single place responsible for turning any thrown/forwarded error into the
 * standard error response shape from API_CONVENTIONS.md:
 * { success: false, error: { code, message, details } }
 *
 * - AppError (operational, expected) -> its own status/code/message are used.
 * - Anything else (a real bug) -> logged with full detail server-side,
 *   but the client only ever gets a generic 500 message in production.
 *   Must be registered LAST, after all routes.
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    logger.warn("Operational error", {
      requestId: req.requestId,
      code: err.code,
      message: err.message,
      path: req.originalUrl,
    });

    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details ?? [],
      },
    });
    return;
  }

  // Unexpected error: never leak stack traces or internal messages.
  const message = err instanceof Error ? err.message : "Unknown error";
  const stack = err instanceof Error ? err.stack : undefined;

  logger.error("Unhandled error", {
    requestId: req.requestId,
    message,
    stack,
    path: req.originalUrl,
  });

  res.status(500).json({
    success: false,
    error: {
      code: ErrorCodes.INTERNAL_ERROR,
      message: isProduction ? "Something went wrong. Please try again later." : message,
      details: [],
    },
  });
}

/**
 * Catches requests that matched no route. Registered after all routes,
 * before the global error handler.
 */
export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(AppError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}
