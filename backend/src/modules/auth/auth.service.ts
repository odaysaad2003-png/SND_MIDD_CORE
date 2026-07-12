import {randomBytes, randomUUID, timingSafeEqual} from "crypto";
import bcrypt from "bcryptjs";
import {AppError} from "../../utils/app-error";
import {logger} from "../../utils/logger";
import {env} from "../../config/env";
import {UserModel, IUser, UserRole} from "../users/user.model";
import {
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken,
    VerifiedRefreshTokenPayload,
} from "../../utils/tokens";

export interface SanitizedUser {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface AuthSessionResult {
    user: SanitizedUser;
    accessToken: string;
    refreshToken: string;
    csrfToken: string;
}

interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

interface PreparedRefreshSession {
    tokens: AuthTokens;
    refreshTokenHash: string;
    refreshTokenId: string;
    csrfToken: string;
}

interface StoredRefreshSession {
    user: IUser;
    refreshTokenHash: string;
    refreshTokenId: string | null;
}

export function sanitizeUser(user: IUser): SanitizedUser {
    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}

function isMongoDuplicateKeyError(error: unknown): boolean {
    return typeof error === "object" && error !== null && "code" in error && (error as {code?: unknown}).code === 11000;
}

function createCsrfToken(): string {
    return randomBytes(32).toString("base64url");
}

function safeTokenEquals(expected: string, received: string): boolean {
    const expectedBuffer = Buffer.from(expected);
    const receivedBuffer = Buffer.from(received);

    return expectedBuffer.length === receivedBuffer.length && timingSafeEqual(expectedBuffer, receivedBuffer);
}

function assertCsrfToken(payload: VerifiedRefreshTokenPayload, csrfToken: string): void {
    if (!payload.csrf || !safeTokenEquals(payload.csrf, csrfToken)) {
        throw AppError.forbidden("Invalid CSRF token");
    }
}

function verifyRefreshTokenOrThrow(
    refreshToken: string,
    options?: {ignoreExpiration?: boolean}
): VerifiedRefreshTokenPayload {
    try {
        return verifyRefreshToken(refreshToken, options);
    } catch {
        throw AppError.unauthorized("Invalid or expired refresh session");
    }
}

async function prepareRefreshSession(user: IUser): Promise<PreparedRefreshSession> {
    const refreshTokenId = randomUUID();
    const csrfToken = createCsrfToken();

    const accessToken = signAccessToken({
        sub: user._id.toString(),
        role: user.role,
    });

    const refreshToken = signRefreshToken({
        sub: user._id.toString(),
        sid: refreshTokenId,
        csrf: csrfToken,
    });

    const refreshTokenHash = await bcrypt.hash(refreshToken, env.BCRYPT_SALT_ROUNDS);

    return {
        tokens: {accessToken, refreshToken},
        refreshTokenHash,
        refreshTokenId,
        csrfToken,
    };
}

async function issueAndStoreSession(user: IUser): Promise<PreparedRefreshSession> {
    const session = await prepareRefreshSession(user);

    user.refreshTokenHash = session.refreshTokenHash;
    user.refreshTokenId = session.refreshTokenId;

    await user.save();

    return session;
}

function toAuthSessionResult(user: IUser, session: PreparedRefreshSession): AuthSessionResult {
    return {
        user: sanitizeUser(user),
        accessToken: session.tokens.accessToken,
        refreshToken: session.tokens.refreshToken,
        csrfToken: session.csrfToken,
    };
}

function refreshSessionIdMatches(tokenSessionId: string | undefined, storedSessionId: string | null): boolean {
    if (tokenSessionId === undefined) {
        return storedSessionId === null;
    }

    return tokenSessionId === storedSessionId;
}

async function loadStoredRefreshSession(payload: VerifiedRefreshTokenPayload): Promise<StoredRefreshSession> {
    const user = await UserModel.findById(payload.sub).select("+refreshTokenHash +refreshTokenId");

    if (!user || !user.refreshTokenHash) {
        throw AppError.unauthorized("Invalid refresh session");
    }

    if (!user.isActive) {
        throw AppError.forbidden("This account has been deactivated");
    }

    const refreshTokenId = user.refreshTokenId ?? null;

    if (!refreshSessionIdMatches(payload.sid, refreshTokenId)) {
        logger.warn("Stale refresh token rejected", {
            userId: user._id.toString(),
        });

        throw AppError.unauthorized("Refresh session is no longer valid. Please log in again.");
    }

    return {
        user,
        refreshTokenHash: user.refreshTokenHash,
        refreshTokenId,
    };
}

async function revokeMatchingRefreshSession(session: StoredRefreshSession): Promise<void> {
    await UserModel.updateOne(
        {
            _id: session.user._id,
            refreshTokenHash: session.refreshTokenHash,
            refreshTokenId: session.refreshTokenId,
        },
        {
            $set: {
                refreshTokenHash: null,
                refreshTokenId: null,
            },
        }
    );
}

export async function registerUser(input: {name: string; email: string; password: string}): Promise<AuthSessionResult> {
    const existing = await UserModel.findOne({email: input.email});

    if (existing) {
        throw AppError.conflict("An account with this email already exists");
    }

    const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_SALT_ROUNDS);

    try {
        const user = await UserModel.create({
            name: input.name,
            email: input.email,
            passwordHash,
        });

        const session = await issueAndStoreSession(user);

        logger.info("User registered", {
            userId: user._id.toString(),
        });

        return toAuthSessionResult(user, session);
    } catch (error) {
        if (isMongoDuplicateKeyError(error)) {
            throw AppError.conflict("An account with this email already exists");
        }

        throw error;
    }
}

export async function loginUser(input: {email: string; password: string}): Promise<AuthSessionResult> {
    const user = await UserModel.findOne({email: input.email}).select("+passwordHash");

    if (!user) {
        throw AppError.unauthorized("Invalid email or password");
    }

    const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);

    if (!passwordMatches) {
        throw AppError.unauthorized("Invalid email or password");
    }

    if (!user.isActive) {
        throw AppError.forbidden("This account has been deactivated");
    }

    const session = await issueAndStoreSession(user);

    logger.info("User logged in", {
        userId: user._id.toString(),
    });

    return toAuthSessionResult(user, session);
}

export async function getRefreshCsrfToken(refreshToken: string): Promise<string> {
    const payload = verifyRefreshTokenOrThrow(refreshToken);

    if (!payload.csrf) {
        throw AppError.unauthorized("Refresh session must be renewed by logging in again");
    }

    const session = await loadStoredRefreshSession(payload);
    const matches = await bcrypt.compare(refreshToken, session.refreshTokenHash);

    if (!matches) {
        throw AppError.unauthorized("Refresh session is no longer valid. Please log in again.");
    }

    return payload.csrf;
}

export async function refreshTokens(refreshToken: string, csrfToken: string): Promise<AuthSessionResult> {
    const payload = verifyRefreshTokenOrThrow(refreshToken);
    assertCsrfToken(payload, csrfToken);

    const currentSession = await loadStoredRefreshSession(payload);
    const matches = await bcrypt.compare(refreshToken, currentSession.refreshTokenHash);

    if (!matches) {
        await revokeMatchingRefreshSession(currentSession);

        logger.warn("Refresh token verification failed — current session revoked", {
            userId: currentSession.user._id.toString(),
        });

        throw AppError.unauthorized("Refresh session is no longer valid. Please log in again.");
    }

    const nextSession = await prepareRefreshSession(currentSession.user);

    const rotationResult = await UserModel.updateOne(
        {
            _id: currentSession.user._id,
            isActive: true,
            refreshTokenHash: currentSession.refreshTokenHash,
            refreshTokenId: currentSession.refreshTokenId,
        },
        {
            $set: {
                refreshTokenHash: nextSession.refreshTokenHash,
                refreshTokenId: nextSession.refreshTokenId,
            },
        }
    );

    if (rotationResult.modifiedCount !== 1) {
        logger.warn("Concurrent refresh token rotation rejected", {
            userId: currentSession.user._id.toString(),
        });

        throw AppError.unauthorized("Refresh session is no longer valid. Please log in again.");
    }

    return toAuthSessionResult(currentSession.user, nextSession);
}

export async function logoutUser(refreshToken: string, csrfToken: string): Promise<void> {
    let payload: VerifiedRefreshTokenPayload;

    try {
        payload = verifyRefreshToken(refreshToken, {
            ignoreExpiration: true,
        });
    } catch {
        return;
    }

    assertCsrfToken(payload, csrfToken);

    const user = await UserModel.findById(payload.sub).select("+refreshTokenHash +refreshTokenId");

    if (!user || !user.refreshTokenHash) {
        return;
    }

    const currentSession: StoredRefreshSession = {
        user,
        refreshTokenHash: user.refreshTokenHash,
        refreshTokenId: user.refreshTokenId ?? null,
    };

    if (!refreshSessionIdMatches(payload.sid, currentSession.refreshTokenId)) {
        return;
    }

    const matches = await bcrypt.compare(refreshToken, currentSession.refreshTokenHash);

    if (!matches) {
        return;
    }

    await revokeMatchingRefreshSession(currentSession);
}

export async function getCurrentUser(userId: string): Promise<SanitizedUser> {
    const user = await UserModel.findById(userId);

    if (!user || !user.isActive) {
        throw AppError.unauthorized("User not found or inactive");
    }

    return sanitizeUser(user);
}
