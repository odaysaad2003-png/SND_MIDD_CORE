import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";

function getSafeRequestPath(req: Request): string {
  return req.originalUrl.split("?", 1)[0] || req.path;
}

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startedAt = process.hrtime.bigint();

  res.once("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    const metadata = {
      requestId: req.requestId,
      method: req.method,
      path: getSafeRequestPath(req),
      statusCode: res.statusCode,
      durationMs: Number(durationMs.toFixed(2)),
      ip: req.ip,
      actorId: req.user?.id,
    };

    if (res.statusCode >= 500) {
      logger.error("HTTP request completed", metadata);
      return;
    }

    if (res.statusCode >= 400) {
      logger.warn("HTTP request completed", metadata);
      return;
    }

    logger.info("HTTP request completed", metadata);
  });

  next();
}
