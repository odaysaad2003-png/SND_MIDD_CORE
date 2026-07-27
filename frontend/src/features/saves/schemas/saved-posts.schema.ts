import {z} from "zod";

import {
    paginationMetaSchema,
    publicPostSchema,
} from "@/features/posts/schemas/public-posts.schema";

export const SAVED_POSTS_PAGE_SIZE = 6;

export const savedPostSchema = publicPostSchema.extend({
    savedAt: z.string().datetime(),
});

export const savedPostsQuerySchema = z
    .object({
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().max(50).default(SAVED_POSTS_PAGE_SIZE),
        sort: z.enum(["latest", "oldest"]).default("latest"),
    })
    .strict();

export const savedPostsResultSchema = z
    .object({
        data: z.array(savedPostSchema),
        meta: paginationMetaSchema,
    })
    .strict();

export type SavedPost = z.infer<typeof savedPostSchema>;
export type SavedPostsQueryInput = z.input<typeof savedPostsQuerySchema>;
export type SavedPostsQuery = z.output<typeof savedPostsQuerySchema>;
export type SavedPostsResult = z.infer<typeof savedPostsResultSchema>;
