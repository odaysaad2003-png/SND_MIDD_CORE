import {FilterQuery, Types} from "mongoose";
import {IPost, PostModel, PostStatus} from "./post.model";

const AUTHOR_PUBLIC_FIELDS = "name avatar";

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

function escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
