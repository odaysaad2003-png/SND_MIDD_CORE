import {z} from "zod";

export const likeStatusSchema = z
    .object({
        likedByMe: z.boolean(),
        likesCount: z.number().int().nonnegative(),
    })
    .strict();

export const saveStatusSchema = z
    .object({
        savedByMe: z.boolean(),
    })
    .strict();

export const likeStatusResultSchema = z.object({data: likeStatusSchema}).strict();
export const saveStatusResultSchema = z.object({data: saveStatusSchema}).strict();

export type LikeStatus = z.infer<typeof likeStatusSchema>;
export type SaveStatus = z.infer<typeof saveStatusSchema>;
