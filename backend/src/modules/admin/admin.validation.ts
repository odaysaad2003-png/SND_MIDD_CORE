import {z} from "zod";
import {Types} from "mongoose";

const objectId = z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid id",
});

export const listAdminUsersQuerySchema = z.object({
    query: z
    .object({
        page: z.coerce.number().int().positive().default(1),
        limit: z.coerce.number().int().positive().max(50).default(10),
        q: z.string().trim().max(100).optional(),
        status: z.enum(["active", "suspended"]).optional(),
        role: z.enum(["user", "admin"]).optional(),
        sort: z.enum(["latest", "oldest"]).default("latest"),
    })
    .strict(),
});

export const adminUserIdParamsSchema = z.object({
    params: z.object({userId: objectId}).strict(),
});

export const updateUserStatusSchema = z.object({
    params: z.object({userId: objectId}).strict(),

    body: z
    .object({
        status: z.enum(["active", "suspended"]),
        reason: z
        .string()
        .trim()
        .min(5, "Reason must be at least 5 characters")
        .max(500, "Reason must be at most 500 characters"),
    })
    .strict(),
});

export type ListAdminUsersQuery = z.infer<typeof listAdminUsersQuerySchema>["query"];
