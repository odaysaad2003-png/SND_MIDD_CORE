import {PipelineStage} from "mongoose";

export interface UserStatisticsRow {
    total: number;
    active: number;
    suspended: number;
    users: number;
    admins: number;
    unclassifiedRoles: number;
}

export interface PostStatisticsRow {
    total: number;
    publicVisible: number;
    adminHidden: number;
    ownerDeleted: number;
    unclassified: number;
}

export interface CommentStatisticsRow {
    total: number;
    active: number;
    deleted: number;
    unclassified: number;
}

export interface ReportStatisticsRow {
    total: number;
    pending: number;
    reviewed: number;
    dismissed: number;
    actioned: number;
    unclassified: number;
}

export const USER_STATISTICS_PIPELINE: PipelineStage[] = [
    {
        $group: {
            _id: null,
            total: {$sum: 1},
            active: {$sum: {$cond: [{$eq: ["$isActive", true]}, 1, 0]}},
            suspended: {$sum: {$cond: [{$eq: ["$isActive", false]}, 1, 0]}},
            users: {$sum: {$cond: [{$eq: ["$role", "user"]}, 1, 0]}},
            admins: {$sum: {$cond: [{$eq: ["$role", "admin"]}, 1, 0]}},
            unclassifiedRoles: {
                $sum: {
                    $cond: [{$in: ["$role", ["user", "admin"]]}, 0, 1],
                },
            },
        },
    },
    {
        $project: {
            _id: 0,
            total: 1,
            active: 1,
            suspended: 1,
            users: 1,
            admins: 1,
            unclassifiedRoles: 1,
        },
    },
];

export const POST_STATISTICS_PIPELINE: PipelineStage[] = [
    {
        $project: {
            classification: {
                $switch: {
                    branches: [
                        {
                            case: {
                                $or: [{$eq: ["$status", "deleted"]}, {$ne: [{$ifNull: ["$deletedAt", null]}, null]}],
                            },
                            then: "ownerDeleted",
                        },
                        {
                            case: {
                                $and: [
                                    {$eq: ["$status", "active"]},
                                    {$eq: [{$ifNull: ["$deletedAt", null]}, null]},
                                    {$eq: ["$moderationStatus", "hidden"]},
                                ],
                            },
                            then: "adminHidden",
                        },
                        {
                            case: {
                                $and: [
                                    {$eq: ["$status", "active"]},
                                    {$eq: [{$ifNull: ["$deletedAt", null]}, null]},
                                    {
                                        $or: [
                                            {$eq: ["$moderationStatus", "visible"]},
                                            {$eq: [{$type: "$moderationStatus"}, "missing"]},
                                        ],
                                    },
                                ],
                            },
                            then: "publicVisible",
                        },
                    ],
                    default: "unclassified",
                },
            },
        },
    },
    {
        $group: {
            _id: null,
            total: {$sum: 1},
            publicVisible: {
                $sum: {$cond: [{$eq: ["$classification", "publicVisible"]}, 1, 0]},
            },
            adminHidden: {
                $sum: {$cond: [{$eq: ["$classification", "adminHidden"]}, 1, 0]},
            },
            ownerDeleted: {
                $sum: {$cond: [{$eq: ["$classification", "ownerDeleted"]}, 1, 0]},
            },
            unclassified: {
                $sum: {$cond: [{$eq: ["$classification", "unclassified"]}, 1, 0]},
            },
        },
    },
    {
        $project: {
            _id: 0,
            total: 1,
            publicVisible: 1,
            adminHidden: 1,
            ownerDeleted: 1,
            unclassified: 1,
        },
    },
];

export const COMMENT_STATISTICS_PIPELINE: PipelineStage[] = [
    {
        $project: {
            classification: {
                $switch: {
                    branches: [
                        {
                            case: {
                                $or: [{$eq: ["$status", "deleted"]}, {$ne: [{$ifNull: ["$deletedAt", null]}, null]}],
                            },
                            then: "deleted",
                        },
                        {
                            case: {
                                $and: [{$eq: ["$status", "active"]}, {$eq: [{$ifNull: ["$deletedAt", null]}, null]}],
                            },
                            then: "active",
                        },
                    ],
                    default: "unclassified",
                },
            },
        },
    },
    {
        $group: {
            _id: null,
            total: {$sum: 1},
            active: {$sum: {$cond: [{$eq: ["$classification", "active"]}, 1, 0]}},
            deleted: {$sum: {$cond: [{$eq: ["$classification", "deleted"]}, 1, 0]}},
            unclassified: {
                $sum: {$cond: [{$eq: ["$classification", "unclassified"]}, 1, 0]},
            },
        },
    },
    {
        $project: {
            _id: 0,
            total: 1,
            active: 1,
            deleted: 1,
            unclassified: 1,
        },
    },
];

export const REPORT_STATISTICS_PIPELINE: PipelineStage[] = [
    {
        $group: {
            _id: null,
            total: {$sum: 1},
            pending: {$sum: {$cond: [{$eq: ["$status", "pending"]}, 1, 0]}},
            reviewed: {$sum: {$cond: [{$eq: ["$status", "reviewed"]}, 1, 0]}},
            dismissed: {$sum: {$cond: [{$eq: ["$status", "dismissed"]}, 1, 0]}},
            actioned: {$sum: {$cond: [{$eq: ["$status", "actioned"]}, 1, 0]}},
            unclassified: {
                $sum: {
                    $cond: [{$in: ["$status", ["pending", "reviewed", "dismissed", "actioned"]]}, 0, 1],
                },
            },
        },
    },
    {
        $project: {
            _id: 0,
            total: 1,
            pending: 1,
            reviewed: 1,
            dismissed: 1,
            actioned: 1,
            unclassified: 1,
        },
    },
];
