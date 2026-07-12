import {LikeModel} from "./like.model";
import {PostModel} from "../posts/post.model";
import {AppError} from "../../utils/app-error";
import {buildPublicPostVisibilityFilter} from "../posts/post-visibility";

export interface LikeStatusResult {
    likedByMe: boolean;
    likesCount: number;
}

async function findActivePostOrThrow(postId: string) {
    const post = await PostModel.findOne(
        buildPublicPostVisibilityFilter([{_id: postId}])
    ).select("_id likesCount");

    if (!post) {
        throw AppError.notFound("Post not found");
    }

    return post;
}

async function readCurrentLikesCount(postId: string): Promise<number> {
    const post = await PostModel.findById(postId).select("likesCount");

    return post?.likesCount ?? 0;
}

async function incrementLikesCount(postId: string): Promise<number> {
    const post = await PostModel.findByIdAndUpdate(postId, {$inc: {likesCount: 1}}, {new: true}).select("likesCount");

    return post?.likesCount ?? 0;
}

async function decrementLikesCount(postId: string): Promise<number> {
    const post = await PostModel.findOneAndUpdate(
        {
            _id: postId,
            likesCount: {$gt: 0},
        },
        {
            $inc: {likesCount: -1},
        },
        {
            new: true,
        }
    ).select("likesCount");

    if (!post) {
        return readCurrentLikesCount(postId);
    }

    return post.likesCount ?? 0;
}

export async function likePost(postId: string, userId: string): Promise<{result: LikeStatusResult; created: boolean}> {
    await findActivePostOrThrow(postId);

    const activeLike = await LikeModel.findOne({
        post: postId,
        user: userId,
        status: "active",
    }).select("_id");

    if (activeLike) {
        const likesCount = await readCurrentLikesCount(postId);

        return {
            result: {
                likedByMe: true,
                likesCount,
            },
            created: false,
        };
    }

    const restoredLike = await LikeModel.findOneAndUpdate(
        {
            post: postId,
            user: userId,
            status: "deleted",
        },
        {
            $set: {
                status: "active",
                deletedAt: null,
            },
        },
        {
            new: true,
        }
    ).select("_id");

    if (restoredLike) {
        const likesCount = await incrementLikesCount(postId);

        return {
            result: {
                likedByMe: true,
                likesCount,
            },
            created: false,
        };
    }

    try {
        await LikeModel.create({
            post: postId,
            user: userId,
            status: "active",
            deletedAt: null,
        });

        const likesCount = await incrementLikesCount(postId);

        return {
            result: {
                likedByMe: true,
                likesCount,
            },
            created: true,
        };
    } catch (error) {
        const isDuplicateKeyError =
            typeof error === "object" && error !== null && (error as {code?: number}).code === 11000;

        if (!isDuplicateKeyError) {
            throw error;
        }

        const likesCount = await readCurrentLikesCount(postId);

        return {
            result: {
                likedByMe: true,
                likesCount,
            },
            created: false,
        };
    }
}

export async function unlikePost(postId: string, userId: string): Promise<LikeStatusResult> {
    await findActivePostOrThrow(postId);

    const deletedLike = await LikeModel.findOneAndUpdate(
        {
            post: postId,
            user: userId,
            status: "active",
        },
        {
            $set: {
                status: "deleted",
                deletedAt: new Date(),
            },
        },
        {
            new: true,
        }
    ).select("_id");

    if (!deletedLike) {
        const likesCount = await readCurrentLikesCount(postId);

        return {
            likedByMe: false,
            likesCount,
        };
    }

    const likesCount = await decrementLikesCount(postId);

    return {
        likedByMe: false,
        likesCount,
    };
}

export async function getMyLikeStatus(postId: string, userId: string): Promise<LikeStatusResult> {
    const post = await findActivePostOrThrow(postId);

    const activeLike = await LikeModel.findOne({
        post: postId,
        user: userId,
        status: "active",
    }).select("_id");

    return {
        likedByMe: Boolean(activeLike),
        likesCount: post.likesCount ?? 0,
    };
}
