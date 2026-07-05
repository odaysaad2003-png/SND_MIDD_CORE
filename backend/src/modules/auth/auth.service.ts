import bcrypt from "bcryptjs";
import {AppError} from "../../utils/app-error";
import {logger} from "../../utils/logger";
import {env} from "../../config/env";
import {UserModel, IUser} from "./user.model";
import {signAccessToken, signRefreshToken, verifyRefreshToken} from "../../utils/tokens";

export interface SafeUser {
    id: string;
    name: string;
    email: string;
    role: "user" | "admin";
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

function toSafeUser(user: IUser): SafeUser {
    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}

function isMongoDuplicateKeyError(error: unknown): boolean {
    return typeof error === "object" && error !== null && "code" in error && (error as {code?: unknown}).code === 11000;
}

async function issueAndStoreTokens(user: IUser): Promise<AuthTokens> {
    const accessToken = signAccessToken({
        sub: user._id.toString(),
        role: user.role,
    });

    const refreshToken = signRefreshToken({
        sub: user._id.toString(),
    });

    user.refreshTokenHash = await bcrypt.hash(refreshToken, env.BCRYPT_SALT_ROUNDS);

    await user.save();

    return {accessToken, refreshToken};
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
            user: toSafeUser(user),
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
        user: toSafeUser(user),
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

    const user = await UserModel.findById(payload.sub).select("+refreshTokenHash");

    if (!user || !user.refreshTokenHash) {
        throw AppError.unauthorized("Invalid refresh token");
    }

    if (!user.isActive) {
        throw AppError.forbidden("This account has been deactivated");
    }

    const matches = await bcrypt.compare(refreshToken, user.refreshTokenHash);

    if (!matches) {
        user.refreshTokenHash = null;
        await user.save();

        logger.warn("Refresh token reuse suspected — session revoked", {
            userId: user._id.toString(),
        });

        throw AppError.unauthorized("Refresh token is no longer valid. Please log in again.");
    }

    const tokens = await issueAndStoreTokens(user);

    return {
        user: toSafeUser(user),
        ...tokens,
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

    const user = await UserModel.findById(payload.sub).select("+refreshTokenHash");

    if (!user || !user.refreshTokenHash) {
        return;
    }

    const matches = await bcrypt.compare(refreshToken, user.refreshTokenHash);

    if (!matches) {
        return;
    }

    user.refreshTokenHash = null;
    await user.save();
}

export async function getCurrentUser(userId: string): Promise<SafeUser> {
    const user = await UserModel.findById(userId);

    if (!user || !user.isActive) {
        throw AppError.unauthorized("User not found or inactive");
    }

    return toSafeUser(user);
}
