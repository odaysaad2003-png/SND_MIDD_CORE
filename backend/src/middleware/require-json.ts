import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/app-error";

/**
 * Prevents browser form submissions from reaching JSON-only authentication
 * endpoints. Cross-origin JSON requests require a CORS preflight, while a
 * plain HTML form does not.
 */
export function requireJsonContentType(req: Request, _res: Response, next: NextFunction): void {
  if (!req.is("application/json")) {
    next(AppError.unsupportedMediaType("Content-Type must be application/json"));
    return;
  }

  next();
}
