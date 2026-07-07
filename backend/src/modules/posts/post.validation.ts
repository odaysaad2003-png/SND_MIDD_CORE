import {z} from "zod";

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
