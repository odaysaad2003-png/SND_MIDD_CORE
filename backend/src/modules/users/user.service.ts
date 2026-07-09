import fs from "fs/promises";
import path from "path";
import {IUser, UserModel, UserRole} from "./user.model";
import {AppError} from "../../utils/app-error";
import {AVATAR_PUBLIC_URL_PATH, AVATAR_UPLOAD_DIR} from "../../config/upload";
import {deleteImageFromCloudinary, uploadImageToCloudinary} from "../../shared/storage/cloudinary-storage.service";
import type {UploadedAsset} from "../../shared/storage/storage.types";

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
    const user = await UserModel.findById(userId).select("+avatarPublicId");

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

async function cleanupPreviousAvatar(options: {
    previousAvatar: string | null;
    previousAvatarProvider: string | null;
    previousAvatarPublicId: string | null;
}): Promise<void> {
    const {previousAvatar, previousAvatarProvider, previousAvatarPublicId} = options;

    if (previousAvatarProvider === "cloudinary" && previousAvatarPublicId) {
        await deleteImageFromCloudinary(previousAvatarPublicId);
        return;
    }

    if (previousAvatar) {
        const previousAvatarPath = avatarUrlToFilePath(previousAvatar);

        if (previousAvatarPath) {
            await safeDeleteFile(previousAvatarPath);
        }
    }
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

export async function updateAvatar(userId: string, file: Express.Multer.File): Promise<SanitizedUser> {
    const user = await findActiveUserOrThrow(userId);

    const previousAvatar = user.avatar;
    const previousAvatarProvider = user.avatarProvider;
    const previousAvatarPublicId = user.avatarPublicId;

    let uploadedAvatar: UploadedAsset | null = null;

    try {
        uploadedAvatar = await uploadImageToCloudinary(file, {
            folder: `users/${userId}/avatar`,
        });

        user.avatar = uploadedAvatar.url;
        user.avatarProvider = uploadedAvatar.provider;
        user.avatarPublicId = uploadedAvatar.publicId;

        await user.save();

        await cleanupPreviousAvatar({
            previousAvatar,
            previousAvatarProvider,
            previousAvatarPublicId,
        }).catch(() => {
            // Best-effort cleanup. Do not fail the request after DB was updated successfully.
        });

        return sanitizeUser(user);
    } catch (error) {
        if (uploadedAvatar?.publicId) {
            await deleteImageFromCloudinary(uploadedAvatar.publicId).catch(() => {
                // Best-effort cleanup if DB save failed after Cloudinary upload.
            });
        }

        throw error;
    }
}
