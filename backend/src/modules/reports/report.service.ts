import {FilterQuery, PipelineStage, Types} from "mongoose";
import {ReportReason, ReportStatus, ReportTargetType} from "./report.constants";
import {PostModel} from "../posts/post.model";
import {CommentModel} from "../comments/comment.model";
import {AppError} from "../../utils/app-error";
import { IReport, ReportModel } from "./report.model";

interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface CreateReportInput {
    reporterId: string;
    targetType: ReportTargetType;
    targetId: string;
    reason: ReportReason;
    details?: string;
}

export interface SanitizedReportUser {
    id: string;
    name: string;
    avatar: string | null;
}

export interface SanitizedReportTarget {
    id: string;
    type: ReportTargetType;
    status: string | null;
    title?: string;
    content?: string;
    postId?: string;
    author?: SanitizedReportUser;
}

export interface SanitizedReport {
    id: string;
    reporter: SanitizedReportUser;
    targetType: ReportTargetType;
    targetId: string;
    target: SanitizedReportTarget | null;
    reason: ReportReason;
    details?: string;
    status: ReportStatus;
    reviewedBy: SanitizedReportUser | null;
    reviewedAt: Date | null;
    adminNote?: string;
    createdAt: Date;
    updatedAt: Date;
}

interface ReportAggregationResult {
    data: SanitizedReport[];
    meta: Array<{total: number}>;
}

function buildSort(sort: "latest" | "oldest"): Record<string, 1 | -1> {
    return sort === "oldest" ? {createdAt: 1, _id: 1} : {createdAt: -1, _id: -1};
}

function isDuplicateKeyError(error: unknown): boolean {
    return typeof error === "object" && error !== null && (error as {code?: number}).code === 11000;
}

function normalizeOptionalText(value?: string): string | undefined {
    const trimmed = value?.trim();

    return trimmed ? trimmed : undefined;
}

async function assertReportablePost(postId: string, reporterId: string): Promise<void> {
    const post = await PostModel.findOne({
        _id: postId,
        status: "active",
        deletedAt: null,
    }).select("_id author");

    if (!post) {
        throw AppError.notFound("Post not found");
    }

    if (post.author.toString() === reporterId) {
        throw AppError.forbidden("You cannot report your own post");
    }
}

async function assertReportableComment(commentId: string, reporterId: string): Promise<void> {
    const comment = await CommentModel.findOne({
        _id: commentId,
        status: "active",
        deletedAt: null,
    }).select("_id author post");

    if (!comment) {
        throw AppError.notFound("Comment not found");
    }

    if (comment.author.toString() === reporterId) {
        throw AppError.forbidden("You cannot report your own comment");
    }

    const parentPost = await PostModel.findOne({
        _id: comment.post,
        status: "active",
        deletedAt: null,
    }).select("_id");

    if (!parentPost) {
        throw AppError.notFound("Post not found");
    }
}

async function assertTargetIsReportable(
    targetType: ReportTargetType,
    targetId: string,
    reporterId: string
): Promise<void> {
    if (targetType === "post") {
        await assertReportablePost(targetId, reporterId);
        return;
    }

    if (targetType === "comment") {
        await assertReportableComment(targetId, reporterId);
        return;
    }

    throw AppError.internal("Unsupported report target type");
}

function buildReportListFilter(options: {status?: ReportStatus; targetType?: ReportTargetType}): FilterQuery<IReport> {
    const filter: FilterQuery<IReport> = {};

    if (options.status) {
        filter.status = options.status;
    }

    if (options.targetType) {
        filter.targetType = options.targetType;
    }

    return filter;
}

function buildReportAggregationPipeline(options: {
    match: FilterQuery<IReport>;
    sort: "latest" | "oldest";
    skip: number;
    limit: number;
}): PipelineStage[] {
    const sortStage = buildSort(options.sort);

    return [
        {
            $match: options.match,
        },
        {
            $sort: sortStage,
        },
        {
            $facet: {
                data: [
                    {
                        $skip: options.skip,
                    },
                    {
                        $limit: options.limit,
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "reporter",
                            foreignField: "_id",
                            as: "reporter",
                        },
                    },
                    {
                        $unwind: "$reporter",
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "reviewedBy",
                            foreignField: "_id",
                            as: "reviewedBy",
                        },
                    },
                    {
                        $unwind: {
                            path: "$reviewedBy",
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $lookup: {
                            from: "posts",
                            localField: "targetId",
                            foreignField: "_id",
                            as: "targetPost",
                        },
                    },
                    {
                        $lookup: {
                            from: "comments",
                            localField: "targetId",
                            foreignField: "_id",
                            as: "targetComment",
                        },
                    },
                    {
                        $unwind: {
                            path: "$targetPost",
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $unwind: {
                            path: "$targetComment",
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "targetPost.author",
                            foreignField: "_id",
                            as: "postAuthor",
                        },
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "targetComment.author",
                            foreignField: "_id",
                            as: "commentAuthor",
                        },
                    },
                    {
                        $unwind: {
                            path: "$postAuthor",
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $unwind: {
                            path: "$commentAuthor",
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            id: {
                                $toString: "$_id",
                            },
                            reporter: {
                                id: {
                                    $toString: "$reporter._id",
                                },
                                name: "$reporter.name",
                                avatar: {
                                    $ifNull: ["$reporter.avatar", null],
                                },
                            },
                            targetType: 1,
                            targetId: {
                                $toString: "$targetId",
                            },
                            target: {
                                $switch: {
                                    branches: [
                                        {
                                            case: {$eq: ["$targetType", "post"]},
                                            then: {
                                                id: {
                                                    $cond: [
                                                        {$ifNull: ["$targetPost._id", false]},
                                                        {$toString: "$targetPost._id"},
                                                        null,
                                                    ],
                                                },
                                                type: "post",
                                                status: {
                                                    $ifNull: ["$targetPost.status", null],
                                                },
                                                title: "$targetPost.title",
                                                content: "$targetPost.content",
                                                author: {
                                                    id: {
                                                        $cond: [
                                                            {$ifNull: ["$postAuthor._id", false]},
                                                            {$toString: "$postAuthor._id"},
                                                            null,
                                                        ],
                                                    },
                                                    name: "$postAuthor.name",
                                                    avatar: {
                                                        $ifNull: ["$postAuthor.avatar", null],
                                                    },
                                                },
                                            },
                                        },
                                        {
                                            case: {$eq: ["$targetType", "comment"]},
                                            then: {
                                                id: {
                                                    $cond: [
                                                        {$ifNull: ["$targetComment._id", false]},
                                                        {$toString: "$targetComment._id"},
                                                        null,
                                                    ],
                                                },
                                                type: "comment",
                                                status: {
                                                    $ifNull: ["$targetComment.status", null],
                                                },
                                                content: "$targetComment.content",
                                                postId: {
                                                    $cond: [
                                                        {$ifNull: ["$targetComment.post", false]},
                                                        {$toString: "$targetComment.post"},
                                                        null,
                                                    ],
                                                },
                                                author: {
                                                    id: {
                                                        $cond: [
                                                            {$ifNull: ["$commentAuthor._id", false]},
                                                            {$toString: "$commentAuthor._id"},
                                                            null,
                                                        ],
                                                    },
                                                    name: "$commentAuthor.name",
                                                    avatar: {
                                                        $ifNull: ["$commentAuthor.avatar", null],
                                                    },
                                                },
                                            },
                                        },
                                    ],
                                    default: null,
                                },
                            },
                            reason: 1,
                            details: 1,
                            status: 1,
                            reviewedBy: {
                                $cond: [
                                    {$ifNull: ["$reviewedBy._id", false]},
                                    {
                                        id: {
                                            $toString: "$reviewedBy._id",
                                        },
                                        name: "$reviewedBy.name",
                                        avatar: {
                                            $ifNull: ["$reviewedBy.avatar", null],
                                        },
                                    },
                                    null,
                                ],
                            },
                            reviewedAt: {
                                $ifNull: ["$reviewedAt", null],
                            },
                            adminNote: 1,
                            createdAt: 1,
                            updatedAt: 1,
                        },
                    },
                ],
                meta: [
                    {
                        $count: "total",
                    },
                ],
            },
        },
    ];
}

export async function createReport(input: CreateReportInput): Promise<SanitizedReport> {
    const details = normalizeOptionalText(input.details);

    await assertTargetIsReportable(input.targetType, input.targetId, input.reporterId);

    let report: IReport;

    try {
        report = await ReportModel.create({
            reporter: input.reporterId,
            targetType: input.targetType,
            targetId: input.targetId,
            reason: input.reason,
            details,
            status: "pending",
            reviewedBy: null,
            reviewedAt: null,
        });
    } catch (error) {
        if (isDuplicateKeyError(error)) {
            throw AppError.conflict("You have already reported this content");
        }

        throw error;
    }

    return getReportById(report._id.toString());
}

export async function listReports(options: {
    page: number;
    limit: number;
    sort: "latest" | "oldest";
    status?: ReportStatus;
    targetType?: ReportTargetType;
}): Promise<{data: SanitizedReport[]; meta: PaginationMeta}> {
    const {page, limit, sort, status, targetType} = options;
    const skip = (page - 1) * limit;

    const match = buildReportListFilter({
        status,
        targetType,
    });

    const [result] = await ReportModel.aggregate<ReportAggregationResult>(
        buildReportAggregationPipeline({
            match,
            sort,
            skip,
            limit,
        })
    );

    const data = result?.data ?? [];
    const total = result?.meta?.[0]?.total ?? 0;

    return {
        data,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

export async function getReportById(reportId: string): Promise<SanitizedReport> {
    const [result] = await ReportModel.aggregate<ReportAggregationResult>(
        buildReportAggregationPipeline({
            match: {
                _id: new Types.ObjectId(reportId),
            },
            sort: "latest",
            skip: 0,
            limit: 1,
        })
    );

    const report = result?.data?.[0];

    if (!report) {
        throw AppError.notFound("Report not found");
    }

    return report;
}

export async function updateReportStatus(
    reportId: string,
    adminUserId: string,
    data: {
        status: ReportStatus;
        adminNote?: string;
    }
): Promise<SanitizedReport> {
    const adminNote = normalizeOptionalText(data.adminNote);

    const report = await ReportModel.findByIdAndUpdate(
        reportId,
        {
            $set: {
                status: data.status,
                reviewedBy: adminUserId,
                reviewedAt: new Date(),
                ...(adminNote !== undefined ? {adminNote} : {}),
            },
        },
        {
            new: true,
        }
    ).select("_id");

    if (!report) {
        throw AppError.notFound("Report not found");
    }

    return getReportById(report._id.toString());
}
