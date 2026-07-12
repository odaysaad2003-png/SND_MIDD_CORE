import {randomUUID} from "crypto";
import bcrypt from "bcryptjs";
import {AppError} from "../../utils/app-error";
import {logger} from "../../utils/logger";
import {env} from "../../config/env";
import {UserModel, IUser, UserRole} from "../users/user.model";
import {signAccessToken, signRefreshToken, verifyRefreshToken} from "../../utils/tokens";

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

interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

interface PreparedRefreshSession {
    tokens: AuthTokens;
    refreshTokenHash: string;
    refreshTokenId: string;
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

async function prepareRefreshSession(user: IUser): Promise<PreparedRefreshSession> {
    const refreshTokenId = randomUUID();

    const accessToken = signAccessToken({
        sub: user._id.toString(),
        role: user.role,
    });

    const refreshToken = signRefreshToken({
        sub: user._id.toString(),
        sid: refreshTokenId,
    });

    const refreshTokenHash = await bcrypt.hash(refreshToken, env.BCRYPT_SALT_ROUNDS);

    return {
        tokens: {accessToken, refreshToken},
        refreshTokenHash,
        refreshTokenId,
    };
}

async function issueAndStoreTokens(user: IUser): Promise<AuthTokens> {
    const session = await prepareRefreshSession(user);

    user.refreshTokenHash = session.refreshTokenHash;
    user.refreshTokenId = session.refreshTokenId;

    await user.save();

    return session.tokens;
}

function refreshSessionIdMatches(tokenSessionId: string | undefined, storedSessionId: string | null): boolean {
    if (tokenSessionId === undefined) {
        // Compatibility path for refresh tokens issued before sid was added.
        // After the next successful rotation, every session has an ID.
        return storedSessionId === null;
    }

    return tokenSessionId === storedSessionId;
}

export async function registerUser(input: {name: string; email: string; password: string}) {
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

        const tokens = await issueAndStoreTokens(user);

        logger.info("User registered", {
            userId: user._id.toString(),
        });

        return {
            user: sanitizeUser(user),
            ...tokens,
        };
    } catch (error) {
        if (isMongoDuplicateKeyError(error)) {
            throw AppError.conflict("An account with this email already exists");
        }

        throw error;
    }
}

export async function loginUser(input: {email: string; password: string}) {
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

    const tokens = await issueAndStoreTokens(user);

    logger.info("User logged in", {
        userId: user._id.toString(),
    });

    return {
        user: sanitizeUser(user),
        ...tokens,
    };
}

export async function refreshTokens(refreshToken: string) {
    let payload;

    try {
        payload = verifyRefreshToken(refreshToken);
    } catch {
        throw AppError.unauthorized("Invalid or expired refresh token");
    }

    const user = await UserModel.findById(payload.sub).select("+refreshTokenHash +refreshTokenId");

    if (!user || !user.refreshTokenHash) {
        throw AppError.unauthorized("Invalid refresh token");
    }

    if (!user.isActive) {
        throw AppError.forbidden("This account has been deactivated");
    }

    const currentRefreshTokenHash = user.refreshTokenHash;
    const currentRefreshTokenId = user.refreshTokenId ?? null;

    if (!refreshSessionIdMatches(payload.sid, currentRefreshTokenId)) {
        logger.warn("Stale refresh token rejected", {
            userId: user._id.toString(),
        });

        throw AppError.unauthorized("Refresh token is no longer valid. Please log in again.");
    }

    const matches = await bcrypt.compare(refreshToken, currentRefreshTokenHash);

    if (!matches) {
        await UserModel.updateOne(
            {
                _id: user._id,
                refreshTokenHash: currentRefreshTokenHash,
                refreshTokenId: currentRefreshTokenId,
            },
            {
                $set: {
                    refreshTokenHash: null,
                    refreshTokenId: null,
                },
            }
        );

        logger.warn("Refresh token verification failed — current session revoked", {
            userId: user._id.toString(),
        });

        throw AppError.unauthorized("Refresh token is no longer valid. Please log in again.");
    }

    const nextSession = await prepareRefreshSession(user);

    const rotationResult = await UserModel.updateOne(
        {
            _id: user._id,
            isActive: true,
            refreshTokenHash: currentRefreshTokenHash,
            refreshTokenId: currentRefreshTokenId,
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
            userId: user._id.toString(),
        });

        throw AppError.unauthorized("Refresh token is no longer valid. Please log in again.");
    }

    return {
        user: sanitizeUser(user),
        ...nextSession.tokens,
    };
}

export async function logoutUser(refreshToken: string): Promise<void> {
    let payload;

    try {
        payload = verifyRefreshToken(refreshToken, {
            ignoreExpiration: true,
        });
    } catch {
        return;
    }

    const user = await UserModel.findById(payload.sub).select("+refreshTokenHash +refreshTokenId");

    if (!user || !user.refreshTokenHash) {
        return;
    }

    const currentRefreshTokenHash = user.refreshTokenHash;
    const currentRefreshTokenId = user.refreshTokenId ?? null;

    if (!refreshSessionIdMatches(payload.sid, currentRefreshTokenId)) {
        return;
    }

    const matches = await bcrypt.compare(refreshToken, currentRefreshTokenHash);

    if (!matches) {
        return;
    }

    await UserModel.updateOne(
        {
            _id: user._id,
            refreshTokenHash: currentRefreshTokenHash,
            refreshTokenId: currentRefreshTokenId,
        },
        {
            $set: {
                refreshTokenHash: null,
                refreshTokenId: null,
            },
        }
    );
}

export async function getCurrentUser(userId: string): Promise<SanitizedUser> {
    const user = await UserModel.findById(userId);

    if (!user || !user.isActive) {
        throw AppError.unauthorized("User not found or inactive");
    }

    return sanitizeUser(user);
}
