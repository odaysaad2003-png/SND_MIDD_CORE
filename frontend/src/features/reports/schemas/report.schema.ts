import {z} from "zod";

export const reportReasons = ["spam", "harassment", "hate_speech", "violence", "scam", "sexual_content", "misinformation", "other"] as const;
export const reportReasonSchema = z.enum(reportReasons);
export const reportTargetSchema = z.object({type: z.enum(["post", "comment"]), id: z.string().min(1)}).strict();
export const reportInputSchema = z.object({
    reason: reportReasonSchema,
    details: z.string().trim().max(1000, "التفاصيل يجب ألا تتجاوز 1000 حرف").optional(),
}).strict();

const userSchema = z.object({id: z.string().min(1), name: z.string().min(1), avatar: z.string().nullable()}).strict();
const targetSchema = z.object({
    id: z.string().min(1),
    type: z.enum(["post", "comment"]),
    status: z.string().nullable(),
    title: z.string().optional(),
    content: z.string().optional(),
    postId: z.string().optional(),
    author: userSchema.optional(),
}).strict();
const reportReceiptSchema = z.object({
    id: z.string().min(1),
    reporter: userSchema,
    targetType: z.enum(["post", "comment"]),
    targetId: z.string().min(1),
    target: targetSchema.nullable(),
    reason: reportReasonSchema,
    details: z.string().optional(),
    status: z.enum(["pending", "reviewed", "dismissed", "actioned"]),
    reviewedBy: userSchema.nullable(),
    reviewedAt: z.string().datetime().nullable(),
    adminNote: z.string().optional(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
}).strict();
export const reportResultSchema = z.object({data: reportReceiptSchema}).strict();

export type ReportInput = z.input<typeof reportInputSchema>;
export type ReportTarget = z.infer<typeof reportTargetSchema>;
export type ReportReason = z.infer<typeof reportReasonSchema>;
