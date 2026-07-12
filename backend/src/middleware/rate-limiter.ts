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

const authenticatedActorKey = (req: Request): string => {
    if (req.user?.id) {
        return `user:${req.user.id}`;
    }

    return "unauthenticated-upload";
};

/**
 * Limits storage-expensive authenticated upload requests. Mount only after
 * authenticate so normal users are keyed by account rather than shared NAT IP.
 */
export const uploadRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: authenticatedActorKey,
    handler: rateLimitHandler,
});

/**
 * Limits cookie-session operations such as CSRF bootstrap, refresh rotation,
 * and logout. These routes are intentionally keyed by client IP because they
 * run before access-token authentication.
 */
export const authSessionRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 60,
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler,
});
