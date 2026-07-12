import mongoose, {ClientSession} from "mongoose";
import {LikeModel} from "./like.model";
import {PostModel} from "../posts/post.model";
import {AppError} from "../../utils/app-error";
import {buildPublicPostVisibilityFilter} from "../posts/post-visibility";

export interface LikeStatusResult {
    likedByMe: boolean;
    likesCount: number;
}

interface LikeMutationResult {
    result: LikeStatusResult;
    created: boolean;
}

async function findActivePostOrThrow(postId: string, session?: ClientSession) {
    const query = PostModel.findOne(
        buildPublicPostVisibilityFilter([{_id: postId}])
    ).select("_id likesCount");

    if (session) {
        query.session(session);
    }

    const post = await query;

    if (!post) {
        throw AppError.notFound("Post not found");
    }

    return post;
}

async function incrementLikesCount(postId: string, session: ClientSession): Promise<number> {
    const post = await PostModel.findOneAndUpdate(
        buildPublicPostVisibilityFilter([{_id: postId}]),
        {
            $inc: {
                likesCount: 1,
            },
        },
        {
            new: true,
            session,
        }
    ).select("likesCount");

    if (!post) {
        throw AppError.notFound("Post not found");
    }

    return post.likesCount ?? 0;
}

async function decrementLikesCount(postId: string, session: ClientSession): Promise<number> {
    const post = await PostModel.findOneAndUpdate(
        buildPublicPostVisibilityFilter([
            {_id: postId},
            {likesCount: {$gt: 0}},
        ]),
        {
            $inc: {
                likesCount: -1,
            },
        },
        {
            new: true,
            session,
        }
    ).select("likesCount");

    if (post) {
        return post.likesCount ?? 0;
    }

    // A legacy counter may already be zero even though an active Like
    // relation existed. The relationship transition is still valid; keep
    // the counter at zero and let the reconciliation command repair any
    // wider historical drift without ever allowing a negative value.
    const activePost = await findActivePostOrThrow(postId, session);
    return activePost.likesCount ?? 0;
}

export async function likePost(postId: string, userId: string): Promise<LikeMutationResult> {
    const session = await mongoose.startSession();
    let result: LikeMutationResult | undefined;

    try {
        await session.withTransaction(async () => {
            const post = await findActivePostOrThrow(postId, session);

            /**
             * One indexed upsert owns the complete relationship transition:
             * - null pre-image means a new Like document was inserted
             * - deleted pre-image means it was restored
             * - active pre-image means this request is an idempotent no-op
             *
             * Returning the pre-image is what lets us update likesCount only
             * when the relationship actually became active.
             */
            const previousLike = await LikeModel.findOneAndUpdate(
                {
                    post: postId,
                    user: userId,
                },
                {
                    $set: {
                        status: "active",
                        deletedAt: null,
                    },
                },
                {
                    upsert: true,
                    new: false,
                    setDefaultsOnInsert: true,
                    session,
                }
            );

            const created = previousLike === null;
            const becameActive = created || previousLike.status !== "active";
            const likesCount = becameActive
                ? await incrementLikesCount(postId, session)
                : post.likesCount ?? 0;

            result = {
                result: {
                    likedByMe: true,
                    likesCount,
                },
                created,
            };
        });
    } finally {
        await session.endSession();
    }

    if (!result) {
        throw AppError.internal("Like operation did not complete");
    }

    return result;
}

export async function unlikePost(postId: string, userId: string): Promise<LikeStatusResult> {
    const session = await mongoose.startSession();
    let result: LikeStatusResult | undefined;

    try {
        await session.withTransaction(async () => {
            const post = await findActivePostOrThrow(postId, session);

            const previousLike = await LikeModel.findOneAndUpdate(
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
                    new: false,
                    session,
                }
            );

            const likesCount = previousLike
                ? await decrementLikesCount(postId, session)
                : post.likesCount ?? 0;

            result = {
                likedByMe: false,
                likesCount,
            };
        });
    } finally {
        await session.endSession();
    }

    if (!result) {
        throw AppError.internal("Unlike operation did not complete");
    }

    return result;
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
