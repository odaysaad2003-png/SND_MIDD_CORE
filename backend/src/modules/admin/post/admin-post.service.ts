import mongoose, {ClientSession, FilterQuery, Types} from "mongoose";
import {assertCurrentAdmin} from "../../../shared/authorization/admin.service";
import {AppError} from "../../../utils/app-error";
import {recordPostModerationAuditEvent} from "../../audit/audit-event.service";
import {IPost, PostModel, PostModerationStatus} from "../../posts/post.model";
import {buildVisibleOrLegacyModerationFilter, resolveEffectivePostModerationStatus} from "../../posts/post-visibility";
import {
    sanitizeAdminPostDetail,
    sanitizeAdminPostSummary,
    SanitizedAdminPostDetail,
    SanitizedAdminPostSummary,
} from "./admin-post.presenter";
import {ListAdminPostsQuery, UpdatePostModerationBody} from "./admin-post.validation";

interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface UpdatePostModerationContext {
    requestId?: string;
}

function escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildSort(sort: "latest" | "oldest"): Record<string, 1 | -1> {
    return sort === "oldest" ? {createdAt: 1, _id: 1} : {createdAt: -1, _id: -1};
}

function buildAdminPostListFilter(query: ListAdminPostsQuery): FilterQuery<IPost> {
    const clauses: FilterQuery<IPost>[] = [];

    if (query.lifecycleStatus === "active") {
        clauses.push({status: "active", deletedAt: null});
    }

    if (query.lifecycleStatus === "deleted") {
        clauses.push({
            $or: [{status: "deleted"}, {deletedAt: {$exists: true, $ne: null}}],
        });
    }

    if (query.moderationStatus === "visible") {
        clauses.push(buildVisibleOrLegacyModerationFilter());
    }

    if (query.moderationStatus === "hidden") {
        clauses.push({moderationStatus: "hidden"});
    }

    if (query.q) {
        const regex = new RegExp(escapeRegex(query.q), "i");
        clauses.push({$or: [{title: regex}, {content: regex}]});
    }

    return clauses.length > 0 ? {$and: clauses} : {};
}

async function findAdminPostOrThrow(postId: string, session?: ClientSession): Promise<IPost> {
    let query = PostModel.findById(postId).populate("author", "name avatar").populate("hiddenBy", "name");

    if (session) {
        query = query.session(session);
    }

    const post = await query;

    if (!post) {
        throw AppError.notFound("Post not found");
    }

    return post;
}

function normalizeModerationReason(reason: string): string {
    const normalized = reason.trim();

    if (normalized.length < 5 || normalized.length > 500) {
        throw AppError.badRequest("Moderation reason must be between 5 and 500 characters");
    }

    return normalized;
}

function assertOwnerLifecycleAllowsModeration(post: IPost): void {
    if (post.status === "deleted" || post.deletedAt != null) {
        throw AppError.conflict("Owner-deleted posts cannot be hidden or restored through moderation");
    }
}

function applyModerationTransition(
    post: IPost,
    currentStatus: PostModerationStatus,
    requestedStatus: PostModerationStatus,
    adminUserId: string,
    reason: string
): void {
    if (currentStatus === requestedStatus) {
        throw AppError.conflict(`Post is already ${requestedStatus}`);
    }

    if (requestedStatus === "hidden") {
        post.moderationStatus = "hidden";
        post.hiddenAt = new Date();
        post.hiddenBy = new Types.ObjectId(adminUserId);
        post.moderationReason = reason;
        return;
    }

    post.moderationStatus = "visible";
    post.hiddenAt = null;
    post.hiddenBy = null;
    post.moderationReason = null;
}

export async function listPosts(
    adminUserId: string,
    query: ListAdminPostsQuery
): Promise<{data: SanitizedAdminPostSummary[]; meta: PaginationMeta}> {
    await assertCurrentAdmin(adminUserId);

    const {page, limit, sort} = query;
    const skip = (page - 1) * limit;
    const filter = buildAdminPostListFilter(query);

    const [posts, total] = await Promise.all([
        PostModel.find(filter).sort(buildSort(sort)).skip(skip).limit(limit).populate("author", "name avatar"),
        PostModel.countDocuments(filter),
    ]);

    return {
        data: posts.map(sanitizeAdminPostSummary),
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

export async function getPostById(adminUserId: string, postId: string): Promise<SanitizedAdminPostDetail> {
    await assertCurrentAdmin(adminUserId);
    const post = await findAdminPostOrThrow(postId);
    return sanitizeAdminPostDetail(post);
}

/**
 * Owns the complete high-impact state transition. Current-admin
 * revalidation, target re-read, state validation, Post write and AuditEvent
 * write all happen inside one transaction and one ClientSession.
 */
export async function updatePostModeration(
    adminUserId: string,
    postId: string,
    input: UpdatePostModerationBody,
    context: UpdatePostModerationContext = {}
): Promise<SanitizedAdminPostDetail> {
    const reason = normalizeModerationReason(input.reason);
    const session = await mongoose.startSession();

    try {
        await session.withTransaction(async () => {
            await assertCurrentAdmin(adminUserId, session);

            const post = await PostModel.findById(postId).session(session);

            if (!post) {
                throw AppError.notFound("Post not found");
            }

            assertOwnerLifecycleAllowsModeration(post);

            const previousStatus = resolveEffectivePostModerationStatus(post.moderationStatus);

            applyModerationTransition(post, previousStatus, input.status, adminUserId, reason);

            await post.save({session});

            await recordPostModerationAuditEvent(
                {
                    actor: adminUserId,
                    action: input.status === "hidden" ? "POST_HIDDEN" : "POST_RESTORED",
                    targetId: postId,
                    reason,
                    previousState: {moderationStatus: previousStatus},
                    newState: {moderationStatus: input.status},
                    requestId: context.requestId,
                },
                session
            );
        });
    } finally {
        await session.endSession();
    }

    const updatedPost = await findAdminPostOrThrow(postId);
    return sanitizeAdminPostDetail(updatedPost);
}
