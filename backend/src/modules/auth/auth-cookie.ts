import type { CookieOptions, Request, Response } from "express";
import { env } from "../../config/env";
import { getRefreshTokenRemainingLifetimeMs } from "../../utils/tokens";

export const CSRF_HEADER_NAME = "X-CSRF-Token";
export const REFRESH_COOKIE_PATH = "/api/v1/auth";

function getBaseCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.AUTH_COOKIE_SECURE,
    sameSite: env.AUTH_COOKIE_SAME_SITE,
    path: REFRESH_COOKIE_PATH,
    ...(env.AUTH_COOKIE_DOMAIN ? { domain: env.AUTH_COOKIE_DOMAIN } : {}),
  };
}

function decodeCookieValue(value: string): string | null {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

export function readRefreshTokenCookie(req: Request): string | null {
  const cookieHeader = req.headers.cookie;

  if (!cookieHeader) {
    return null;
  }

  for (const cookiePart of cookieHeader.split(";")) {
    const separatorIndex = cookiePart.indexOf("=");

    if (separatorIndex < 0) {
      continue;
    }

    const name = cookiePart.slice(0, separatorIndex).trim();

    if (name !== env.AUTH_REFRESH_COOKIE_NAME) {
      continue;
    }

    const value = cookiePart.slice(separatorIndex + 1).trim();
    return decodeCookieValue(value);
  }

  return null;
}

export function setRefreshTokenCookie(res: Response, refreshToken: string): void {
  res.cookie(env.AUTH_REFRESH_COOKIE_NAME, refreshToken, {
    ...getBaseCookieOptions(),
    maxAge: getRefreshTokenRemainingLifetimeMs(refreshToken),
  });
}

export function clearRefreshTokenCookie(res: Response): void {
  res.clearCookie(env.AUTH_REFRESH_COOKIE_NAME, getBaseCookieOptions());
}

export function setPrivateAuthResponseHeaders(res: Response): void {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Pragma", "no-cache");
}
