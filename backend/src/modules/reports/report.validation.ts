import {z} from "zod";
import {Types} from "mongoose";
import {REPORT_REASONS, REPORT_STATUSES} from "./report.constants";

const objectId = z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid id",
});

export const reportPostParamsSchema = z.object({
    params: z.object({postId: objectId}).strict(),

    body: z
    .object({
        reason: z.enum(REPORT_REASONS),
        details: z.string().trim().max(1000, "Details must be at most 1000 characters").optional(),
    })
    .strict(),
});

export const reportCommentParamsSchema = z.object({
    params: z.object({commentId: objectId}).strict(),

    body: z
    .object({
        reason: z.enum(REPORT_REASONS),
        details: z.string().trim().max(1000, "Details must be at most 1000 characters").optional(),
    })
    .strict(),
});

export const reportIdParamsSchema = z.object({
    params: z.object({reportId: objectId}).strict(),
});

export const listReportsQuerySchema = z.object({
    query: z
    .object({
        page: z.coerce.number().int().positive().default(1),
        limit: z.coerce.number().int().positive().max(50).default(10),
        status: z.enum(REPORT_STATUSES).optional(),
        targetType: z.enum(["post", "comment"]).optional(),
        sort: z.enum(["latest", "oldest"]).default("latest"),
    })
    .strict(),
});

export const updateReportStatusSchema = z.object({
    params: z.object({reportId: objectId}).strict(),

    body: z
    .object({
        status: z.enum(REPORT_STATUSES),
        adminNote: z.string().trim().max(1000, "Admin note must be at most 1000 characters").optional(),
    })
    .strict(),
});

export type ListReportsQuery = z.infer<typeof listReportsQuerySchema>["query"];
