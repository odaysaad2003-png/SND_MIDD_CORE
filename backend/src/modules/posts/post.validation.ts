import {z} from "zod";
import {Types} from "mongoose";

export const createPostSchema = z.object({
    body: z
    .object({
        title: z
        .string()
        .trim()
        .min(3, "Title must be at least 3 characters")
        .max(100, "Title must be at most 100 characters"),

        content: z.string().trim().min(1, "Content is required").max(5000, "Content must be at most 5000 characters"),
    })
    .strict(),
});

const objectId = z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid id",
});

export const postIdParamsSchema = z.object({
    params: z.object({postId: objectId}).strict(),
});

export const updatePostSchema = z.object({
    params: z.object({postId: objectId}).strict(),

    body: z
    .object({
        title: z.string().trim().min(3).max(120).optional(),
        content: z.string().trim().min(1).max(5000).optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one of title or content must be provided",
    }),
});

export const listPostsQuerySchema = z.object({
    query: z
    .object({
        page: z.coerce.number().int().positive().default(1),
        limit: z.coerce.number().int().positive().max(50).default(10),
        sort: z.enum(["latest", "oldest"]).default("latest"),
        search: z.string().trim().max(100).optional(),
    })
    .strict(),
});

export const getMyPostsQuerySchema = z.object({
    query: z
    .object({
        page: z.coerce.number().int().positive().default(1),
        limit: z.coerce.number().int().positive().max(50).default(10),
        q: z.string().trim().max(100).optional(),
        status: z.enum(["active", "deleted"]).optional(),
        sort: z.enum(["createdAt", "-createdAt", "updatedAt", "-updatedAt"]).default("-createdAt"),
    })
    .strict(),
});

export const removePostImageSchema = z.object({
    params: z.object({postId: objectId}).strict(),

    body: z
    .object({
        imageUrl: z.string().trim().url("Invalid image URL"),
    })
    .strict(),
});

export type GetMyPostsQuery = z.infer<typeof getMyPostsQuerySchema>["query"];
