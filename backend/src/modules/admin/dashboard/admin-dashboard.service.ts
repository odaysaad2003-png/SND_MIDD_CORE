import {assertCurrentAdmin} from "../../../shared/authorization/admin.service";
import {AppError} from "../../../utils/app-error";
import {CommentModel} from "../../comments/comment.model";
import {LikeModel} from "../../likes/like.model";
import {PostModel} from "../../posts/post.model";
import {ReportModel} from "../../reports/report.model";
import {SaveModel} from "../../saves/save.model";
import {UserModel} from "../../users/user.model";
import {
    COMMENT_STATISTICS_PIPELINE,
    CommentStatisticsRow,
    POST_STATISTICS_PIPELINE,
    PostStatisticsRow,
    REPORT_STATISTICS_PIPELINE,
    ReportStatisticsRow,
    USER_STATISTICS_PIPELINE,
    UserStatisticsRow,
} from "./admin-dashboard.pipeline";

export interface AdminDashboardSummary {
    users: {
        total: number;
        byStatus: {
            active: number;
            suspended: number;
        };
        byRole: {
            users: number;
            admins: number;
        };
    };
    posts: {
        total: number;
        publicVisible: number;
        adminHidden: number;
        ownerDeleted: number;
    };
    comments: {
        total: number;
        active: number;
        deleted: number;
    };
    engagement: {
        activeLikes: number;
        activeSaves: number;
    };
    reports: {
        total: number;
        pending: number;
        reviewed: number;
        dismissed: number;
        actioned: number;
    };
    generatedAt: string;
}

const EMPTY_USER_STATISTICS: UserStatisticsRow = {
    total: 0,
    active: 0,
    suspended: 0,
    users: 0,
    admins: 0,
    unclassifiedRoles: 0,
};

const EMPTY_POST_STATISTICS: PostStatisticsRow = {
    total: 0,
    publicVisible: 0,
    adminHidden: 0,
    ownerDeleted: 0,
    unclassified: 0,
};

const EMPTY_COMMENT_STATISTICS: CommentStatisticsRow = {
    total: 0,
    active: 0,
    deleted: 0,
    unclassified: 0,
};

const EMPTY_REPORT_STATISTICS: ReportStatisticsRow = {
    total: 0,
    pending: 0,
    reviewed: 0,
    dismissed: 0,
    actioned: 0,
    unclassified: 0,
};

function firstOrDefault<T>(rows: T[], fallback: T): T {
    return rows[0] ?? fallback;
}

function assertDashboardDataIntegrity(
    users: UserStatisticsRow,
    posts: PostStatisticsRow,
    comments: CommentStatisticsRow,
    reports: ReportStatisticsRow
): void {
    const userStatusesAreComplete = users.total === users.active + users.suspended;
    const userRolesAreComplete = users.total === users.users + users.admins && users.unclassifiedRoles === 0;
    const postsAreComplete =
        posts.total === posts.publicVisible + posts.adminHidden + posts.ownerDeleted && posts.unclassified === 0;
    const commentsAreComplete = comments.total === comments.active + comments.deleted && comments.unclassified === 0;
    const reportsAreComplete =
        reports.total === reports.pending + reports.reviewed + reports.dismissed + reports.actioned &&
        reports.unclassified === 0;

    if (
        !userStatusesAreComplete ||
        !userRolesAreComplete ||
        !postsAreComplete ||
        !commentsAreComplete ||
        !reportsAreComplete
    ) {
        throw AppError.internal("Dashboard statistics could not be classified safely");
    }
}

/**
 * Returns a read-only operational snapshot. The individual domain reads run
 * concurrently and intentionally do not share a transaction: this endpoint
 * is not a financial ledger or a cross-document write invariant, so a small
 * amount of natural read-time skew is acceptable and keeps the dashboard
 * inexpensive and scalable at the project's current stage.
 */
export async function getDashboardSummary(adminUserId: string): Promise<AdminDashboardSummary> {
    await assertCurrentAdmin(adminUserId);

    const [userRows, postRows, commentRows, activeLikes, activeSaves, reportRows] = await Promise.all([
        UserModel.aggregate<UserStatisticsRow>(USER_STATISTICS_PIPELINE),
        PostModel.aggregate<PostStatisticsRow>(POST_STATISTICS_PIPELINE),
        CommentModel.aggregate<CommentStatisticsRow>(COMMENT_STATISTICS_PIPELINE),
        LikeModel.countDocuments({status: "active", deletedAt: null}),
        SaveModel.countDocuments({status: "active", deletedAt: null}),
        ReportModel.aggregate<ReportStatisticsRow>(REPORT_STATISTICS_PIPELINE),
    ]);

    const users = firstOrDefault(userRows, EMPTY_USER_STATISTICS);
    const posts = firstOrDefault(postRows, EMPTY_POST_STATISTICS);
    const comments = firstOrDefault(commentRows, EMPTY_COMMENT_STATISTICS);
    const reports = firstOrDefault(reportRows, EMPTY_REPORT_STATISTICS);

    assertDashboardDataIntegrity(users, posts, comments, reports);

    return {
        users: {
            total: users.total,
            byStatus: {
                active: users.active,
                suspended: users.suspended,
            },
            byRole: {
                users: users.users,
                admins: users.admins,
            },
        },
        posts: {
            total: posts.total,
            publicVisible: posts.publicVisible,
            adminHidden: posts.adminHidden,
            ownerDeleted: posts.ownerDeleted,
        },
        comments: {
            total: comments.total,
            active: comments.active,
            deleted: comments.deleted,
        },
        engagement: {
            activeLikes,
            activeSaves,
        },
        reports: {
            total: reports.total,
            pending: reports.pending,
            reviewed: reports.reviewed,
            dismissed: reports.dismissed,
            actioned: reports.actioned,
        },
        generatedAt: new Date().toISOString(),
    };
}
