import {z} from "zod";
import {Types} from "mongoose";

const objectId = z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid id",
});

// Client sends no body for like/unlike/status — only postId in params.
export const likePostIdParamsSchema = z.object({
    params: z.object({postId: objectId}).strict(),
});
