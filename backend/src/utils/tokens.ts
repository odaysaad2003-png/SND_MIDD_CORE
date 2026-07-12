import jwt, {SignOptions} from "jsonwebtoken";
import {env} from "../config/env";

export interface AccessTokenPayload {
    sub: string;
    role: "user" | "admin";
}

export interface RefreshTokenPayload {
    sub: string;
    sid: string;
    csrf: string;
}

export interface VerifiedRefreshTokenPayload {
    sub: string;
    sid?: string;
    csrf?: string;
}

export function signAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN,
    } as SignOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
    return jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload;
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
    return jwt.sign(payload, env.REFRESH_TOKEN_SECRET, {
        expiresIn: env.REFRESH_TOKEN_EXPIRES_IN,
    } as SignOptions);
}

export function verifyRefreshToken(
    token: string,
    options?: {ignoreExpiration?: boolean}
): VerifiedRefreshTokenPayload {
    return jwt.verify(token, env.REFRESH_TOKEN_SECRET, options) as VerifiedRefreshTokenPayload;
}

export function getRefreshTokenRemainingLifetimeMs(token: string): number {
    const decoded = jwt.decode(token);

    if (typeof decoded !== "object" || decoded === null || typeof decoded.exp !== "number") {
        throw new Error("Refresh token is missing an expiration claim");
    }

    return Math.max(0, decoded.exp * 1_000 - Date.now());
}
