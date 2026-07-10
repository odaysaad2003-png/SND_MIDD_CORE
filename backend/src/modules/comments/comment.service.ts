import {FilterQuery, Types} from "mongoose";
import {CommentModel, IComment, CommentStatus} from "./comment.model";
import {PostModel} from "../posts/post.model";
import {AppError} from "../../utils/app-error";
import {AUTHOR_PUBLIC_FIELDS} from "../../constants/post.constants";

export interface SanitizedCommentAuthor {
    id: string;
    name: string;
    avatar: string | null;
}

export interface SanitizedComment {
    id: string;
    content: string;
    post: string;
    author: SanitizedCommentAuthor;
    createdAt: Date;
    updatedAt: Date;
}

interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

function buildSort(sort: "latest" | "oldest") {
    return sort === "oldest" ? {createdAt: 1 as const} : {createdAt: -1 as const};
}

async function assertActivePostExists(postId: string): Promise<void> {
    const post = await PostModel.findOne({
        _id: postId,
        status: "active",
        deletedAt: null,
    }).select("_id");

    if (!post) {
        throw AppError.notFound("Post not found");
    }
}

function sanitizeComment(comment: IComment): SanitizedComment {
    const author = comment.author as unknown as {
        _id?: Types.ObjectId;
        name?: string;
        avatar?: string | null;
    };

    if (!author?._id || !author.name) {
        throw AppError.internal("Comment author was not populated correctly");
    }

    return {
        id: comment._id.toString(),
        content: comment.content,
        post: comment.post.toString(),
        author: {
            id: author._id.toString(),
            name: author.name,
            avatar: author.avatar ?? null,
        },
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
    };
}

/**
 * Phase 7A: owner-only. Admin override was intentionally removed for the
 * same reason as posts — silently rewriting/deleting another user's comment
 * through the owner route leaves no moderation trail. Admin hide/restore is
 * planned as a dedicated, auditable Phase 7C action instead.
 */
async function findOwnedActiveCommentOrThrow(commentId: string, userId: string): Promise<IComment> {
    const comment = await CommentModel.findOne({
        _id: commentId,
        status: "active",
        deletedAt: null,
    });

    if (!comment) {
        throw AppError.notFound("Comment not found");
    }

    await assertActivePostExists(comment.post.toString());

    const isOwner = comment.author.toString() === userId;

    if (!isOwner) {
        throw AppError.forbidden("You do not have permission to modify this comment");
    }

    return comment;
}

export async function createComment(postId: string, userId: string, content: string): Promise<SanitizedComment> {
    await assertActivePostExists(postId);

    const comment = await CommentModel.create({
        content,
        post: postId,
        author: userId,
        status: "active",
        deletedAt: null,
    });

    await comment.populate("author", AUTHOR_PUBLIC_FIELDS);

    return sanitizeComment(comment);
}

export async function listCommentsForPost(
    postId: string,
    options: {page: number; limit: number; sort: "latest" | "oldest"}
): Promise<{data: SanitizedComment[]; meta: PaginationMeta}> {
    await assertActivePostExists(postId);

    const {page, limit, sort} = options;

    const filter: FilterQuery<IComment> = {
        post: postId,
        status: "active",
        deletedAt: null,
    };

    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
        CommentModel.find(filter)
        .sort(buildSort(sort))
        .skip(skip)
        .limit(limit)
        .populate("author", AUTHOR_PUBLIC_FIELDS),

        CommentModel.countDocuments(filter),
    ]);

    return {
        data: docs.map(sanitizeComment),
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

export async function updateComment(commentId: string, userId: string, content: string): Promise<SanitizedComment> {
    const comment = await findOwnedActiveCommentOrThrow(commentId, userId);

    comment.content = content;

    await comment.save();
    await comment.populate("author", AUTHOR_PUBLIC_FIELDS);

    return sanitizeComment(comment);
}

export async function softDeleteComment(commentId: string, userId: string): Promise<void> {
    const comment = await findOwnedActiveCommentOrThrow(commentId, userId);

    comment.status = "deleted";
    comment.deletedAt = new Date();

    await comment.save();
}
