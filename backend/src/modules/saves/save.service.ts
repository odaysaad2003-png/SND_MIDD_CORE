import {Types} from "mongoose";
import {SaveModel} from "./save.model";
import {PostModel, PostStatus} from "../posts/post.model";
import {AppError} from "../../utils/app-error";
import {buildJoinedPublicPostVisibilityMatch, buildPublicPostVisibilityFilter} from "../posts/post-visibility";
export interface SaveStatusResult {
    savedByMe: boolean;
}

export interface SanitizedSavedPostAuthor {
    id: string;
    name: string;
    avatar: string | null;
}

export interface SanitizedSavedPost {
    id: string;
    title: string;
    content: string;
    author: SanitizedSavedPostAuthor;
    images: string[];
    status: PostStatus;
    likesCount: number;
    savedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface SavedPostsAggregationResult {
    data: SanitizedSavedPost[];
    meta: Array<{total: number}>;
}

function buildSortDirection(sort: "latest" | "oldest"): 1 | -1 {
    return sort === "oldest" ? 1 : -1;
}

async function findActivePostOrThrow(postId: string) {
    const post = await PostModel.findOne(
        buildPublicPostVisibilityFilter([{_id: postId}])
    ).select("_id");

    if (!post) {
        throw AppError.notFound("Post not found");
    }

    return post;
}

export async function savePost(postId: string, userId: string): Promise<{result: SaveStatusResult; created: boolean}> {
    await findActivePostOrThrow(postId);

    const activeSave = await SaveModel.findOne({
        post: postId,
        user: userId,
        status: "active",
        deletedAt: null,
    }).select("_id");

    if (activeSave) {
        return {
            result: {
                savedByMe: true,
            },
            created: false,
        };
    }

    const restoredSave = await SaveModel.findOneAndUpdate(
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

    if (restoredSave) {
        return {
            result: {
                savedByMe: true,
            },
            created: false,
        };
    }

    try {
        await SaveModel.create({
            post: postId,
            user: userId,
            status: "active",
            deletedAt: null,
        });

        return {
            result: {
                savedByMe: true,
            },
            created: true,
        };
    } catch (error) {
        const isDuplicateKeyError =
            typeof error === "object" && error !== null && (error as {code?: number}).code === 11000;

        if (!isDuplicateKeyError) {
            throw error;
        }

        return {
            result: {
                savedByMe: true,
            },
            created: false,
        };
    }
}

export async function unsavePost(postId: string, userId: string): Promise<SaveStatusResult> {
    await findActivePostOrThrow(postId);

    const deletedSave = await SaveModel.findOneAndUpdate(
        {
            post: postId,
            user: userId,
            status: "active",
            deletedAt: null,
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

    if (!deletedSave) {
        return {
            savedByMe: false,
        };
    }

    return {
        savedByMe: false,
    };
}

export async function getMySaveStatus(postId: string, userId: string): Promise<SaveStatusResult> {
    await findActivePostOrThrow(postId);

    const activeSave = await SaveModel.findOne({
        post: postId,
        user: userId,
        status: "active",
        deletedAt: null,
    }).select("_id");

    return {
        savedByMe: Boolean(activeSave),
    };
}

export async function listMySavedPosts(
    userId: string,
    options: {page: number; limit: number; sort: "latest" | "oldest"}
): Promise<{data: SanitizedSavedPost[]; meta: PaginationMeta}> {
    const {page, limit, sort} = options;

    const skip = (page - 1) * limit;
    const sortDirection = buildSortDirection(sort);

    const [result] = await SaveModel.aggregate<SavedPostsAggregationResult>([
        {
            $match: {
                user: new Types.ObjectId(userId),
                status: "active",
                deletedAt: null,
            },
        },
        {
            $lookup: {
                from: "posts",
                localField: "post",
                foreignField: "_id",
                as: "post",
            },
        },
        {
            $unwind: "$post",
        },
        {
            $match: buildJoinedPublicPostVisibilityMatch("post"),
        },
        {
            $sort: {
                updatedAt: sortDirection,
                _id: sortDirection,
            },
        },
        {
            $facet: {
                data: [
                    {
                        $skip: skip,
                    },
                    {
                        $limit: limit,
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "post.author",
                            foreignField: "_id",
                            as: "author",
                        },
                    },
                    {
                        $unwind: "$author",
                    },
                    {
                        $project: {
                            _id: 0,
                            id: {
                                $toString: "$post._id",
                            },
                            title: "$post.title",
                            content: "$post.content",
                            author: {
                                id: {
                                    $toString: "$author._id",
                                },
                                name: "$author.name",
                                avatar: {
                                    $ifNull: ["$author.avatar", null],
                                },
                            },
                            images: {
                                $ifNull: ["$post.images", []],
                            },
                            status: "$post.status",
                            likesCount: {
                                $ifNull: ["$post.likesCount", 0],
                            },
                            savedAt: "$updatedAt",
                            createdAt: "$post.createdAt",
                            updatedAt: "$post.updatedAt",
                        },
                    },
                ],
                meta: [
                    {
                        $count: "total",
                    },
                ],
            },
        },
    ]);

    const data = result?.data ?? [];
    const total = result?.meta?.[0]?.total ?? 0;

    return {
        data,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}
