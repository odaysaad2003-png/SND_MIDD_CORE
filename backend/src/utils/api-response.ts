import { Response } from "express";

interface SuccessOptions<T> {
  data: T;
  meta?: Record<string, unknown>;
  statusCode?: number;
}

/**
 * Sends a response in the standard success shape defined in
 * API_CONVENTIONS.md:
 * { success: true, data, meta? }
 */
export function sendSuccess<T>(res: Response, { data, meta, statusCode = 200 }: SuccessOptions<T>): Response {
  const body: Record<string, unknown> = { success: true, data };
  if (meta !== undefined) {
    body.meta = meta;
  }
  return res.status(statusCode).json(body);
}
