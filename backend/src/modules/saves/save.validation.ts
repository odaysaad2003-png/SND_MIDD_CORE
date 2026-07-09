import {z} from "zod";
import {Types} from "mongoose";

const objectId = z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid id",
});

export const savePostIdParamsSchema = z.object({
    params: z.object({postId: objectId}).strict(),
});

export const listMySavedPostsQuerySchema = z.object({
    query: z
    .object({
        page: z.coerce.number().int().positive().default(1),
        limit: z.coerce.number().int().positive().max(50).default(10),
        sort: z.enum(["latest", "oldest"]).default("latest"),
    })
    .strict(),
});

export type ListMySavedPostsQuery = z.infer<typeof listMySavedPostsQuerySchema>["query"];
