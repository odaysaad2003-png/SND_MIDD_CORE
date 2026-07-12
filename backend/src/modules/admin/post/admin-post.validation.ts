import {Types} from "mongoose";
import {z} from "zod";

const objectId = z.string().refine((value) => Types.ObjectId.isValid(value), {
    message: "Invalid id",
});

export const listAdminPostsQuerySchema = z.object({
    query: z
    .object({
        page: z.coerce.number().int().positive().default(1),
        limit: z.coerce.number().int().positive().max(50).default(10),
        q: z.string().trim().max(100).optional(),
        lifecycleStatus: z.enum(["active", "deleted"]).optional(),
        moderationStatus: z.enum(["visible", "hidden"]).optional(),
        sort: z.enum(["latest", "oldest"]).default("latest"),
    })
    .strict(),
});

export const adminPostIdParamsSchema = z.object({
    params: z.object({postId: objectId}).strict(),
});

export const updatePostModerationSchema = z.object({
    params: z.object({postId: objectId}).strict(),

    body: z
    .object({
        status: z.enum(["hidden", "visible"]),
        reason: z
        .string()
        .trim()
        .min(5, "Reason must be at least 5 characters")
        .max(500, "Reason must be at most 500 characters"),
    })
    .strict(),
});

export type ListAdminPostsQuery = z.infer<typeof listAdminPostsQuerySchema>["query"];
export type UpdatePostModerationBody = z.infer<typeof updatePostModerationSchema>["body"];
