import {z} from "zod";
import {Types} from "mongoose";

const objectId = z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid id",
});

export const createCommentSchema = z.object({
    params: z.object({postId: objectId}).strict(),

    body: z
    .object({
        content: z.string().trim().min(1, "Content is required").max(1000, "Content must be at most 1000 characters"),
    })
    .strict(),
});

export const listCommentsQuerySchema = z.object({
    params: z.object({postId: objectId}).strict(),

    query: z
    .object({
        page: z.coerce.number().int().positive().default(1),
        limit: z.coerce.number().int().positive().max(50).default(10),
        sort: z.enum(["latest", "oldest"]).default("latest"),
    })
    .strict(),
});

export const commentIdParamsSchema = z.object({
    params: z.object({commentId: objectId}).strict(),
});

export const updateCommentSchema = z.object({
    params: z.object({commentId: objectId}).strict(),

    body: z
    .object({
        content: z.string().trim().min(1, "Content is required").max(1000, "Content must be at most 1000 characters"),
    })
    .strict(),
});

export type ListCommentsQuery = z.infer<typeof listCommentsQuerySchema>["query"];
