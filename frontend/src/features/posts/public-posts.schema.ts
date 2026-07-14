import {z} from "zod";

const apiDateTimeSchema = z.string().datetime();

export const publicAuthorSchema = z
.object({
    id: z.string().min(1),
    name: z.string().min(2).max(100),
    avatar: z.string().min(1).nullable(),
})
.strict();

export const publicPostSchema = z
.object({
    id: z.string().min(1),
    title: z.string().min(3).max(100),
    content: z.string().min(1).max(5000),
    author: publicAuthorSchema,
    images: z.array(z.string().min(1)).max(5),
    status: z.literal("active"),
    likesCount: z.number().int().nonnegative(),
    createdAt: apiDateTimeSchema,
    updatedAt: apiDateTimeSchema,
})
.strict();

export const paginationMetaSchema = z
.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive().max(50),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
})
.strict();

export const publicPostsQuerySchema = z
.object({
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(50).default(10),
    sort: z.enum(["latest", "oldest"]).default("latest"),
    search: z.string().trim().max(100,"Search term is too long").optional(),
})
.strict();

export const publicPostsResultSchema = z
.object({
    data: z.array(publicPostSchema),
    meta: paginationMetaSchema,
})
.strict();

export type PublicAuthor = z.infer<typeof publicAuthorSchema>;
export type PublicPost = z.infer<typeof publicPostSchema>;
export type PaginationMeta = z.infer<typeof paginationMetaSchema>;
export type PublicPostsQueryInput = z.input<typeof publicPostsQuerySchema>;
export type PublicPostsQuery = z.output<typeof publicPostsQuerySchema>;
export type PublicPostsResult = z.infer<typeof publicPostsResultSchema>;
