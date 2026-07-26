import {z} from "zod";

import {
    paginationMetaSchema,
    publicAuthorSchema,
} from "@/features/posts";

const apiDateTimeSchema = z.string().datetime();

export const publicCommentSchema = z
    .object({
        id: z.string().min(1),
        content: z.string().min(1).max(1000),
        post: z.string().min(1),
        author: publicAuthorSchema,
        createdAt: apiDateTimeSchema,
        updatedAt: apiDateTimeSchema,
    })
    .strict();

export const publicCommentsQuerySchema = z
    .object({
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().max(50).default(10),
        sort: z.enum(["latest", "oldest"]).default("latest"),
    })
    .strict();

export const publicCommentsResultSchema = z
    .object({
        data: z.array(publicCommentSchema),
        meta: paginationMetaSchema,
    })
    .strict();

export type PublicComment = z.infer<typeof publicCommentSchema>;
export type PublicCommentsQueryInput = z.input<typeof publicCommentsQuerySchema>;
export type PublicCommentsQuery = z.output<typeof publicCommentsQuerySchema>;
export type PublicCommentsResult = z.infer<typeof publicCommentsResultSchema>;
