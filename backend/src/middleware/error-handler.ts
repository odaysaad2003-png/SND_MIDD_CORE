import { NextFunction, Request, Response } from "express";
import { isProduction } from "../config/env";
import { ErrorCodes } from "../constants/error-codes";
import { AppError } from "../utils/app-error";
import { logger } from "../utils/logger";

interface ParserErrorShape {
  type?: unknown;
  status?: unknown;
}

function getParserErrorType(err: unknown): string | undefined {
  if (typeof err !== "object" || err === null) {
    return undefined;
  }

  const type = (err as ParserErrorShape).type;
  return typeof type === "string" ? type : undefined;
}

function mapParserError(err: unknown): AppError | undefined {
  const errorType = getParserErrorType(err);

  if (errorType === "entity.parse.failed" || errorType === "entity.verify.failed") {
    return AppError.badRequest("Malformed request body");
  }

  if (errorType === "entity.too.large" || errorType === "parameters.too.many") {
    return AppError.payloadTooLarge("Request body is too large");
  }

  if (errorType === "encoding.unsupported" || errorType === "charset.unsupported") {
    return AppError.unsupportedMediaType("Request body encoding is not supported");
  }

  if (errorType === "request.aborted") {
    return AppError.badRequest("Request body was aborted before completion");
  }

  return undefined;
}

function sendOperationalError(req: Request, res: Response, err: AppError): void {
  logger.warn("Operational error", {
    requestId: req.requestId,
    method: req.method,
    path: req.path,
    statusCode: err.statusCode,
    code: err.code,
    message: err.message,
  });

  res.status(err.statusCode).json({
    success: false,
    error: {
      code: err.code,
      message: err.message,
      details: err.details ?? [],
    },
  });
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  const parserError = mapParserError(err);

  if (parserError) {
    sendOperationalError(req, res, parserError);
    return;
  }

  if (err instanceof AppError) {
    sendOperationalError(req, res, err);
    return;
  }

  const message = err instanceof Error ? err.message : "Unknown error";
  const stack = err instanceof Error ? err.stack : undefined;

  logger.error("Unhandled error", {
    requestId: req.requestId,
    method: req.method,
    path: req.path,
    message,
    stack,
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

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(AppError.notFound(`Route not found: ${req.method} ${req.path}`));
}
