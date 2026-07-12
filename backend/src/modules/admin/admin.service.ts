import mongoose, {FilterQuery, Types} from "mongoose";
import {UserModel, IUser} from "../users/user.model";
import {AppError} from "../../utils/app-error";
import {assertCurrentAdmin} from "../../shared/authorization/admin.service";
import {recordUserStatusAuditEvent} from "../audit/audit-event.service";
import {
    sanitizeAdminUserDetail,
    sanitizeAdminUserSummary,
    SanitizedAdminUserDetail,
    SanitizedAdminUserSummary,
} from "./admin.presenter";
import {ListAdminUsersQuery} from "./admin.validation";

interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

/**
 * Correlation-only metadata. Never used for authorization or identity —
 * see admin.service.ts#updateUserStatus, where the acting admin is always
 * `adminUserId` derived from verified auth context, never from this object.
 */
export interface UpdateUserStatusContext {
    requestId?: string;
}

function escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildSort(sort: "latest" | "oldest"): Record<string, 1 | -1> {
    return sort === "oldest" ? {createdAt: 1, _id: 1} : {createdAt: -1, _id: -1};
}

async function findUserOrThrow(userId: string): Promise<IUser> {
    const user = await UserModel.findById(userId).populate("suspendedBy", "name");

    if (!user) {
        throw AppError.notFound("User not found");
    }

    return user;
}

export async function listUsers(
    adminUserId: string,
    query: ListAdminUsersQuery
): Promise<{data: SanitizedAdminUserSummary[]; meta: PaginationMeta}> {
    await assertCurrentAdmin(adminUserId);

    const {page, limit, q, status, role, sort} = query;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<IUser> = {};

    if (status === "active") filter.isActive = true;
    if (status === "suspended") filter.isActive = false;
    if (role) filter.role = role;

    if (q) {
        const regex = new RegExp(escapeRegex(q), "i");
        filter.$or = [{name: regex}, {email: regex}];
    }

    const [docs, total] = await Promise.all([
        UserModel.find(filter).sort(buildSort(sort)).skip(skip).limit(limit),
        UserModel.countDocuments(filter),
    ]);

    return {
        data: docs.map(sanitizeAdminUserSummary),
        meta: {page, limit, total, totalPages: Math.ceil(total / limit)},
    };
}

export async function getUserById(adminUserId: string, targetUserId: string): Promise<SanitizedAdminUserDetail> {
    await assertCurrentAdmin(adminUserId);
    const user = await findUserOrThrow(targetUserId);
    return sanitizeAdminUserDetail(user);
}

/**
 * The single high-impact operation in Sprint 7B. One transaction is the
 * one consistency boundary: current-admin revalidation, target load,
 * transition validation, the User write, and the AuditEvent write all read
 * and write through the same ClientSession. Nothing about "is this
 * transition allowed" is decided from data read before the transaction
 * started — that's what makes this safe against both a stale admin (e.g.
 * deactivated moments ago) and a stale target read (e.g. suspended by a
 * concurrent request moments ago).
 */
export async function updateUserStatus(
    adminUserId: string,
    targetUserId: string,
    input: {status: "active" | "suspended"; reason: string},
    context: UpdateUserStatusContext = {}
): Promise<SanitizedAdminUserDetail> {
    // Safe to check before the transaction: comparing two immutable IDs
    // from verified auth/route context, not database state.
    if (adminUserId === targetUserId) {
        throw AppError.forbidden("You cannot change your own account status");
    }

    const session = await mongoose.startSession();

    try {
        await session.withTransaction(async () => {
            await assertCurrentAdmin(adminUserId, session);

            const targetUser = await UserModel.findById(targetUserId).select("+refreshTokenHash +refreshTokenId").session(session);

            if (!targetUser) {
                throw AppError.notFound("User not found");
            }

            if (targetUser.role !== "user") {
                throw AppError.forbidden("Admin accounts cannot be suspended or reactivated through this endpoint");
            }

            const previousState = {isActive: targetUser.isActive};

            if (input.status === "suspended") {
                if (!targetUser.isActive) {
                    throw AppError.conflict("User is already suspended");
                }

                targetUser.isActive = false;
                targetUser.refreshTokenHash = null;
                targetUser.refreshTokenId = null;
                targetUser.suspendedAt = new Date();
                targetUser.suspendedBy = new Types.ObjectId(adminUserId);
                targetUser.suspensionReason = input.reason;
            } else {
                if (targetUser.isActive) {
                    throw AppError.conflict("User is already active");
                }

                targetUser.isActive = true;
                targetUser.suspendedAt = null;
                targetUser.suspendedBy = null;
                targetUser.suspensionReason = null;
                // Refresh session fields are left as-is (already null from the
                // suspending write). The old session is never restored —
                // the user must log in again.
            }

            await targetUser.save({session});

            await recordUserStatusAuditEvent(
                {
                    actor: adminUserId,
                    action: input.status === "suspended" ? "USER_SUSPENDED" : "USER_REACTIVATED",
                    targetId: targetUserId,
                    reason: input.reason,
                    previousState,
                    newState: {isActive: targetUser.isActive},
                    requestId: context.requestId,
                },
                session
            );
        });
    } finally {
        await session.endSession();
    }

    // Post-commit read, outside the transaction — the write already
    // durably committed at this point; this is presentation, not a
    // decision. See "Failure and Retry Semantics" for what happens if
    // this specific read fails.
    const updated = await findUserOrThrow(targetUserId);
    return sanitizeAdminUserDetail(updated);
}
