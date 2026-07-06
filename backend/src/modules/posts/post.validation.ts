import {z} from "zod";

export const listPostsQuerySchema = z.object({
    query: z.object({
        page: z.coerce.number().int().positive().default(1),

        limit: z.coerce.number().int().positive().max(50).default(10),

        sort: z.enum(["latest", "oldest"]).default("latest"),

        search: z.string().trim().max(100).optional(),
    })
    .strict(),
});
