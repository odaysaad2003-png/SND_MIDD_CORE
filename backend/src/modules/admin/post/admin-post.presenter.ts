import {Types} from "mongoose";
import {AppError} from "../../../utils/app-error";
import {IPost, PostModerationStatus, PostStatus} from "../../posts/post.model";
import {resolveEffectivePostModerationStatus} from "../../posts/post-visibility";

export interface SanitizedAdminPostAuthor {
    id: string;
    name: string;
    avatar: string | null;
}

export interface SanitizedAdminPostModerator {
    id: string;
    name: string;
}

export interface SanitizedAdminPostSummary {
    id: string;
    title: string;
    author: SanitizedAdminPostAuthor;
    lifecycleStatus: PostStatus;
    deletedAt: Date | null;
    moderationStatus: PostModerationStatus;
    hiddenAt: Date | null;
    moderationReason: string | null;
    likesCount: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface SanitizedAdminPostDetail extends SanitizedAdminPostSummary {
    content: string;
    images: string[];
    hiddenBy: SanitizedAdminPostModerator | null;
}

interface PopulatedUserReference {
    _id: Types.ObjectId;
    name: string;
    avatar?: string | null;
}

function readPopulatedUser(value: unknown, fieldName: string): PopulatedUserReference {
    if (!value || typeof value !== "object" || !("_id" in value) || !("name" in value)) {
        throw AppError.internal(`Post ${fieldName} was not populated correctly`);
    }

    const populated = value as Partial<PopulatedUserReference>;

    if (!populated._id || typeof populated.name !== "string" || populated.name.length === 0) {
        throw AppError.internal(`Post ${fieldName} was not populated correctly`);
    }

    return populated as PopulatedUserReference;
}

function resolveEffectiveLifecycleStatus(post: IPost): PostStatus {
    if (post.status === "deleted" || post.deletedAt != null) {
        return "deleted";
    }

    if (post.status === "active" && post.deletedAt == null) {
        return "active";
    }

    throw AppError.internal("Post has an invalid owner lifecycle state");
}

export function sanitizeAdminPostSummary(post: IPost): SanitizedAdminPostSummary {
    const author = readPopulatedUser(post.author as unknown, "author");

    return {
        id: post._id.toString(),
        title: post.title,
        author: {
            id: author._id.toString(),
            name: author.name,
            avatar: author.avatar ?? null,
        },
        lifecycleStatus: resolveEffectiveLifecycleStatus(post),
        deletedAt: post.deletedAt ?? null,
        moderationStatus: resolveEffectivePostModerationStatus(post.moderationStatus),
        hiddenAt: post.hiddenAt ?? null,
        moderationReason: post.moderationReason ?? null,
        likesCount: post.likesCount ?? 0,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
    };
}

export function sanitizeAdminPostDetail(post: IPost): SanitizedAdminPostDetail {
    const rawHiddenBy = post.hiddenBy as unknown;
    let hiddenBy: SanitizedAdminPostModerator | null = null;

    if (rawHiddenBy != null) {
        const populatedHiddenBy = readPopulatedUser(rawHiddenBy, "hiddenBy");
        hiddenBy = {
            id: populatedHiddenBy._id.toString(),
            name: populatedHiddenBy.name,
        };
    }

    return {
        ...sanitizeAdminPostSummary(post),
        content: post.content,
        images: Array.isArray(post.images) ? post.images : [],
        hiddenBy,
    };
}
