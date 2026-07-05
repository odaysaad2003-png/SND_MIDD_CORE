import rateLimit from "express-rate-limit";
import {Request, Response} from "express";
import {ErrorCodes} from "../constants/error-codes";

const rateLimitHandler = (_req: Request, res: Response) => {
    res.status(429).json({
        success: false,
        error: {
            code: ErrorCodes.TOO_MANY_REQUESTS,
            message: "Too many requests. Please try again later.",
            details: [],
        },
    });
};

/**
 * General-purpose API rate limiter (Sprint 1 baseline).
 */
export const generalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler,
});

/**
 * Stricter limiter for auth endpoints prone to brute-forcing
 * (register/login). Deferred to Sprint 2 per SECURITY_RULES.md /
 * PROJECT_STATE.md Sprint 1 TODO.
 */
export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler,
});
