import fs from "fs/promises";
import path from "path";
import {IUser, UserModel, UserRole} from "../auth/user.model";
import {AppError} from "../../utils/app-error";
import {AVATAR_PUBLIC_URL_PATH, AVATAR_UPLOAD_DIR} from "../../config/upload";

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

function sanitizeUser(user: IUser): SanitizedUser {
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

async function findActiveUserOrThrow(userId: string): Promise<IUser> {
    const user = await UserModel.findById(userId);

    if (!user || !user.isActive) {
        throw AppError.notFound("User not found");
    }

    return user;
}

async function safeDeleteFile(filePath: string): Promise<void> {
    try {
        await fs.unlink(filePath);
    } catch {
        // Best-effort cleanup. Ignore missing/deleted files.
    }
}

function avatarUrlToFilePath(avatarUrl: string): string | null {
    if (!avatarUrl.startsWith(`${AVATAR_PUBLIC_URL_PATH}/`)) {
        return null;
    }

    const fileName = path.basename(avatarUrl);
    return path.join(AVATAR_UPLOAD_DIR, fileName);
}

export async function getCurrentUser(userId: string): Promise<SanitizedUser> {
    const user = await findActiveUserOrThrow(userId);
    return sanitizeUser(user);
}

export async function updateCurrentUser(userId: string, updates: {name: string}): Promise<SanitizedUser> {
    const user = await findActiveUserOrThrow(userId);

    user.name = updates.name;

    await user.save();

    return sanitizeUser(user);
}

export async function updateAvatar(userId: string, filename: string): Promise<SanitizedUser> {
    const newAvatarPath = path.join(AVATAR_UPLOAD_DIR, path.basename(filename));
    const newAvatarUrl = `${AVATAR_PUBLIC_URL_PATH}/${path.basename(filename)}`;

    try {
        const user = await findActiveUserOrThrow(userId);
        const previousAvatar = user.avatar;

        user.avatar = newAvatarUrl;

        await user.save();

        if (previousAvatar) {
            const previousAvatarPath = avatarUrlToFilePath(previousAvatar);

            if (previousAvatarPath) {
                await safeDeleteFile(previousAvatarPath);
            }
        }

        return sanitizeUser(user);
    } catch (error) {
        await safeDeleteFile(newAvatarPath);
        throw error;
    }
}
