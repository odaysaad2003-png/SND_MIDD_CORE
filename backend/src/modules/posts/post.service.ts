import {FilterQuery, SortOrder, Types} from "mongoose";
import {IPost, PostModel, PostStatus} from "./post.model";
import {AppError} from "../../utils/app-error";
import {GetMyPostsQuery} from "./post.validation";
import {AUTHOR_PUBLIC_FIELDS, MAX_POST_IMAGES_PER_POST} from "../../constants/post.constants";

export interface SanitizedPostAuthor {
    id: string;
    name: string;
    avatar: string | null;
}

export interface SanitizedPost {
    id: string;
    title: string;
    content: string;
    author: SanitizedPostAuthor;
    images: string[];
    status: PostStatus;
    createdAt: Date;
    updatedAt: Date;
}

interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

function sanitizePost(post: IPost): SanitizedPost {
    const author = post.author as unknown as {
        _id: Types.ObjectId;
        name: string;
        avatar: string | null;
    };

    return {
        id: post._id.toString(),
        title: post.title,
        content: post.content,
        author: {
            id: author._id.toString(),
            name: author.name,
            avatar: author.avatar ?? null,
        },
        images: post.images,
        status: post.status,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
    };
}

function buildSort(sort: "latest" | "oldest") {
    return sort === "oldest" ? {createdAt: 1 as const} : {createdAt: -1 as const};
}
function buildMyPostsSort(sort: GetMyPostsQuery["sort"]): Record<string, SortOrder> {
    switch (sort) {
        case "createdAt":
            return {createdAt: 1};

        case "updatedAt":
            return {updatedAt: 1};

        case "-updatedAt":
            return {updatedAt: -1};

        case "-createdAt":
        default:
            return {createdAt: -1};
    }
}

function escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function findPostOrThrow(postId: string): Promise<IPost> {
    const post = await PostModel.findById(postId);

    if (!post) {
        throw AppError.notFound("Post not found");
    }

    return post;
}

async function findOwnedPostOrThrow(postId: string, userId: string, role: "user" | "admin"): Promise<IPost> {
    const post = await findPostOrThrow(postId);

    const isOwner = post.author.toString() === userId;

    if (!isOwner && role !== "admin") {
        throw AppError.forbidden("You do not have permission to modify this post");
    }

    return post;
}

export async function listActivePosts(options: {
    page: number;
    limit: number;
    sort: "latest" | "oldest";
    search?: string;
}): Promise<{posts: SanitizedPost[]; meta: PaginationMeta}> {
    const {page, limit, sort, search} = options;

    const filter: FilterQuery<IPost> = {
        status: "active",
    };

    if (search) {
        const regex = new RegExp(escapeRegex(search), "i");

        filter.$or = [{title: regex}, {content: regex}];
    }

    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
        PostModel.find(filter).sort(buildSort(sort)).skip(skip).limit(limit).populate("author", AUTHOR_PUBLIC_FIELDS),

        PostModel.countDocuments(filter),
    ]);

    return {
        posts: docs.map(sanitizePost),
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

export async function createPost(userId: string, data: {title: string; content: string}): Promise<SanitizedPost> {
    const post = await PostModel.create({
        title: data.title,
        content: data.content,
        author: userId,
        images: [],
        status: "active",
        deletedAt: null,
    });

    await post.populate("author", AUTHOR_PUBLIC_FIELDS);

    return sanitizePost(post);
}

export async function getMyPosts(
    userId: string,
    query: GetMyPostsQuery
): Promise<{data: SanitizedPost[]; meta: PaginationMeta}> {
    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<IPost> = {
        author: userId,
    };

    if (query.status) {
        filter.status = query.status;
    } else {
        filter.status = "active";
    }

    if (query.q) {
        const regex = new RegExp(escapeRegex(query.q), "i");

        filter.$or = [{title: regex}, {content: regex}];
    }

    const [docs, total] = await Promise.all([
        PostModel.find(filter)
        .sort(buildMyPostsSort(query.sort))
        .skip(skip)
        .limit(limit)
        .populate("author", AUTHOR_PUBLIC_FIELDS),

        PostModel.countDocuments(filter),
    ]);

    return {
        data: docs.map(sanitizePost),
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

export async function getActivePostById(postId: string): Promise<SanitizedPost> {
    const post = await PostModel.findOne({
        _id: postId,
        status: "active",
    }).populate("author", AUTHOR_PUBLIC_FIELDS);

    if (!post) {
        throw AppError.notFound("Post not found");
    }

    return sanitizePost(post);
}

export async function updatePost(
    postId: string,
    userId: string,
    role: "user" | "admin",
    updates: {title?: string; content?: string}
): Promise<SanitizedPost> {
    const post = await findOwnedPostOrThrow(postId, userId, role);

    if (post.status === "deleted") {
        throw AppError.notFound("Post not found");
    }

    if (updates.title !== undefined) {
        post.title = updates.title;
    }

    if (updates.content !== undefined) {
        post.content = updates.content;
    }

    await post.save();

    await post.populate("author", AUTHOR_PUBLIC_FIELDS);

    return sanitizePost(post);
}

export async function softDeletePost(postId: string, userId: string, role: "user" | "admin"): Promise<void> {
    const post = await findOwnedPostOrThrow(postId, userId, role);

    if (post.status === "deleted") {
        return;
    }

    post.status = "deleted";
    post.deletedAt = new Date();

    await post.save();
}

export async function addPostImages(
    postId: string,
    userId: string,
    role: "user" | "admin",
    imageUrls: string[]
): Promise<SanitizedPost> {
    if (imageUrls.length === 0) {
        throw AppError.badRequest("At least one image is required");
    }

    const post = await findOwnedPostOrThrow(postId, userId, role);

    if (post.status === "deleted") {
        throw AppError.notFound("Post not found");
    }

    const nextImageCount = post.images.length + imageUrls.length;

    if (nextImageCount > MAX_POST_IMAGES_PER_POST) {
        throw AppError.badRequest(`A post can have at most ${MAX_POST_IMAGES_PER_POST} images`);
    }

    post.images.push(...imageUrls);

    await post.save();

    await post.populate("author", AUTHOR_PUBLIC_FIELDS);

    return sanitizePost(post);
}