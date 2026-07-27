import {z} from "zod";

const apiDateTimeSchema = z.string().datetime();

export const adminPaginationMetaSchema = z
    .object({
        page: z.number().int().positive(),
        limit: z.number().int().positive().max(50),
        total: z.number().int().nonnegative(),
        totalPages: z.number().int().nonnegative(),
    })
    .strict();

export const adminDashboardSummarySchema = z
    .object({
        users: z
            .object({
                total: z.number().int().nonnegative(),
                byStatus: z
                    .object({
                        active: z.number().int().nonnegative(),
                        suspended: z.number().int().nonnegative(),
                    })
                    .strict(),
                byRole: z
                    .object({
                        users: z.number().int().nonnegative(),
                        admins: z.number().int().nonnegative(),
                    })
                    .strict(),
            })
            .strict(),
        posts: z
            .object({
                total: z.number().int().nonnegative(),
                publicVisible: z.number().int().nonnegative(),
                adminHidden: z.number().int().nonnegative(),
                ownerDeleted: z.number().int().nonnegative(),
            })
            .strict(),
        comments: z
            .object({
                total: z.number().int().nonnegative(),
                active: z.number().int().nonnegative(),
                deleted: z.number().int().nonnegative(),
            })
            .strict(),
        engagement: z
            .object({
                activeLikes: z.number().int().nonnegative(),
                activeSaves: z.number().int().nonnegative(),
            })
            .strict(),
        reports: z
            .object({
                total: z.number().int().nonnegative(),
                pending: z.number().int().nonnegative(),
                reviewed: z.number().int().nonnegative(),
                dismissed: z.number().int().nonnegative(),
                actioned: z.number().int().nonnegative(),
            })
            .strict(),
        generatedAt: apiDateTimeSchema,
    })
    .strict();

export const adminDashboardResultSchema = z
    .object({
        data: adminDashboardSummarySchema,
    })
    .strict();

export const adminUserSummarySchema = z
    .object({
        id: z.string().min(1),
        name: z.string().min(2).max(100),
        email: z.string().email(),
        role: z.enum(["user", "admin"]),
        avatar: z.string().min(1).nullable(),
        isActive: z.boolean(),
        createdAt: apiDateTimeSchema,
        updatedAt: apiDateTimeSchema,
    })
    .strict();

export const adminUserDetailSchema = adminUserSummarySchema
    .extend({
        suspendedAt: apiDateTimeSchema.nullable(),
        suspendedBy: z
            .object({
                id: z.string().min(1),
                name: z.string().min(1).max(100),
            })
            .strict()
            .nullable(),
        suspensionReason: z.string().max(500).nullable(),
    })
    .strict();

export const adminUsersResultSchema = z
    .object({
        data: z.array(adminUserSummarySchema),
        meta: adminPaginationMetaSchema,
    })
    .strict();

export const adminUserResultSchema = z
    .object({
        data: adminUserDetailSchema,
    })
    .strict();

export const updateAdminUserStatusInputSchema = z
    .object({
        status: z.enum(["active", "suspended"]),
        reason: z
            .string()
            .trim()
            .min(5, "اكتب سببًا واضحًا من 5 أحرف على الأقل")
            .max(500, "السبب يجب ألا يتجاوز 500 حرف"),
    })
    .strict();

const adminPostAuthorSchema = z
    .object({
        id: z.string().min(1),
        name: z.string().min(1).max(100),
        avatar: z.string().min(1).nullable(),
    })
    .strict();

export const adminPostSummarySchema = z
    .object({
        id: z.string().min(1),
        title: z.string().min(1).max(100),
        author: adminPostAuthorSchema,
        lifecycleStatus: z.enum(["active", "deleted"]),
        deletedAt: apiDateTimeSchema.nullable(),
        moderationStatus: z.enum(["visible", "hidden"]),
        hiddenAt: apiDateTimeSchema.nullable(),
        moderationReason: z.string().max(500).nullable(),
        likesCount: z.number().int().nonnegative(),
        createdAt: apiDateTimeSchema,
        updatedAt: apiDateTimeSchema,
    })
    .strict();

export const adminPostDetailSchema = adminPostSummarySchema
    .extend({
        content: z.string().min(1).max(5000),
        images: z.array(z.string().min(1)).max(5),
        hiddenBy: z
            .object({
                id: z.string().min(1),
                name: z.string().min(1).max(100),
            })
            .strict()
            .nullable(),
    })
    .strict();

export const adminPostsResultSchema = z
    .object({
        data: z.array(adminPostSummarySchema),
        meta: adminPaginationMetaSchema,
    })
    .strict();

export const adminPostResultSchema = z
    .object({
        data: adminPostDetailSchema,
    })
    .strict();

export const updateAdminPostModerationInputSchema = z
    .object({
        status: z.enum(["visible", "hidden"]),
        reason: z
            .string()
            .trim()
            .min(5, "اكتب سببًا واضحًا من 5 أحرف على الأقل")
            .max(500, "السبب يجب ألا يتجاوز 500 حرف"),
    })
    .strict();

export const reportReasons = [
    "spam",
    "harassment",
    "hate_speech",
    "violence",
    "scam",
    "sexual_content",
    "misinformation",
    "other",
] as const;

export const reportStatuses = ["pending", "reviewed", "dismissed", "actioned"] as const;
export const reportReviewStatuses = ["reviewed", "dismissed", "actioned"] as const;

const adminReportUserSchema = z
    .object({
        id: z.string().min(1),
        name: z.string().min(1).max(100),
        avatar: z.string().min(1).nullable(),
    })
    .strict();

const adminReportPostTargetSchema = z
    .object({
        id: z.string().min(1),
        type: z.literal("post"),
        status: z.string().min(1).nullable(),
        title: z.string().min(1),
        content: z.string().min(1),
        author: adminReportUserSchema,
    })
    .strict();

const adminReportCommentTargetSchema = z
    .object({
        id: z.string().min(1),
        type: z.literal("comment"),
        status: z.string().min(1).nullable(),
        content: z.string().min(1),
        postId: z.string().min(1),
        author: adminReportUserSchema,
    })
    .strict();

export const adminReportSchema = z
    .object({
        id: z.string().min(1),
        reporter: adminReportUserSchema,
        targetType: z.enum(["post", "comment"]),
        targetId: z.string().min(1),
        target: z
            .discriminatedUnion("type", [adminReportPostTargetSchema, adminReportCommentTargetSchema])
            .nullable(),
        reason: z.enum(reportReasons),
        details: z.string().max(1000).optional(),
        status: z.enum(reportStatuses),
        reviewedBy: adminReportUserSchema.nullable(),
        reviewedAt: apiDateTimeSchema.nullable(),
        adminNote: z.string().max(1000).optional(),
        createdAt: apiDateTimeSchema,
        updatedAt: apiDateTimeSchema,
    })
    .strict();

export const adminReportsResultSchema = z
    .object({
        data: z.array(adminReportSchema),
        meta: adminPaginationMetaSchema,
    })
    .strict();

export const adminReportResultSchema = z
    .object({
        data: adminReportSchema,
    })
    .strict();

export const updateAdminReportStatusInputSchema = z
    .object({
        status: z.enum(reportReviewStatuses),
        adminNote: z.string().trim().max(1000, "الملاحظة يجب ألا تتجاوز 1000 حرف").optional(),
    })
    .strict();

export type AdminPaginationMeta = z.infer<typeof adminPaginationMetaSchema>;
export type AdminDashboardSummary = z.infer<typeof adminDashboardSummarySchema>;
export type AdminUserSummary = z.infer<typeof adminUserSummarySchema>;
export type AdminUserDetail = z.infer<typeof adminUserDetailSchema>;
export type AdminUsersResult = z.infer<typeof adminUsersResultSchema>;
export type UpdateAdminUserStatusInput = z.output<typeof updateAdminUserStatusInputSchema>;
export type AdminPostSummary = z.infer<typeof adminPostSummarySchema>;
export type AdminPostDetail = z.infer<typeof adminPostDetailSchema>;
export type AdminPostsResult = z.infer<typeof adminPostsResultSchema>;
export type UpdateAdminPostModerationInput = z.output<typeof updateAdminPostModerationInputSchema>;
export type ReportReason = (typeof reportReasons)[number];
export type ReportStatus = (typeof reportStatuses)[number];
export type ReportReviewStatus = (typeof reportReviewStatuses)[number];
export type AdminReport = z.infer<typeof adminReportSchema>;
export type AdminReportsResult = z.infer<typeof adminReportsResultSchema>;
export type UpdateAdminReportStatusInput = z.output<typeof updateAdminReportStatusInputSchema>;
