import rateLimit from "express-rate-limit";
import { Request, Response } from "express";
import { ErrorCodes } from "../constants/error-codes";

/**
 * General-purpose API rate limiter (Sprint 1 baseline).
 * Stricter, route-specific limits (e.g. login/register brute-force
 * protection) are layered on in Sprint 2 once those routes exist.
 */
export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: {
        code: ErrorCodes.TOO_MANY_REQUESTS,
        message: "Too many requests. Please try again later.",
        details: [],
      },
    });
  },
});
