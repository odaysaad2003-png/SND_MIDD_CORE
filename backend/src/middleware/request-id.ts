import { randomUUID } from "crypto";
import { NextFunction, Request, Response } from "express";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

export const REQUEST_ID_HEADER = "X-Request-Id";

/**
 * Generates a server-controlled correlation id for every request.
 * Client-supplied ids are intentionally not trusted because they can be
 * duplicated or crafted to confuse logs and incident investigation.
 */
export function requestId(req: Request, res: Response, next: NextFunction): void {
  req.requestId = randomUUID();
  res.setHeader(REQUEST_ID_HEADER, req.requestId);
  next();
}
