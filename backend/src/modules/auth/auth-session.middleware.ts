import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../utils/app-error";
import { CSRF_HEADER_NAME, readRefreshTokenCookie } from "./auth-cookie";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      refreshSession?: {
        refreshToken: string;
        csrfToken?: string;
      };
    }
  }
}

export function requireRefreshCookie(req: Request, _res: Response, next: NextFunction): void {
  const refreshToken = readRefreshTokenCookie(req);

  if (!refreshToken) {
    next(AppError.unauthorized("Refresh session is missing or expired"));
    return;
  }

  req.refreshSession = { refreshToken };
  next();
}

export function requireRefreshCsrf(req: Request, res: Response, next: NextFunction): void {
  requireRefreshCookie(req, res, (cookieError?: unknown) => {
    if (cookieError) {
      next(cookieError);
      return;
    }

    const csrfToken = req.header(CSRF_HEADER_NAME)?.trim();

    if (!csrfToken || csrfToken.length > 256) {
      next(AppError.forbidden("Valid CSRF token is required"));
      return;
    }

    req.refreshSession = {
      refreshToken: req.refreshSession!.refreshToken,
      csrfToken,
    };

    next();
  });
}
