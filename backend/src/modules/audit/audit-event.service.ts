import {ClientSession} from "mongoose";
import {AuditEventModel} from "./audit-event.model";

/**
 * The only user-state snapshot Sprint 7B is allowed to persist. Narrower
 * than the schema itself on purpose: a future caller cannot pass an entire
 * User document through this type even by accident.
 */
export interface UserStatusAuditState {
    isActive: boolean;
}

interface RecordUserStatusAuditEventInput {
    actor: string;
    action: "USER_SUSPENDED" | "USER_REACTIVATED";
    targetId: string;
    reason: string;
    previousState: UserStatusAuditState;
    newState: UserStatusAuditState;
    requestId?: string;
}

/**
 * The only Post moderation snapshot Sprint 7C is allowed to persist. It
 * intentionally excludes Post content, images, storage IDs and arbitrary
 * state so audit writes cannot become an accidental sensitive-data dump.
 */
export interface PostModerationAuditState {
    moderationStatus: "visible" | "hidden";
}

interface RecordPostModerationAuditEventInput {
    actor: string;
    action: "POST_HIDDEN" | "POST_RESTORED";
    targetId: string;
    reason: string;
    previousState: PostModerationAuditState;
    newState: PostModerationAuditState;
    requestId?: string;
}

/**
 * Narrow, allowlisted audit-write entry point for user status transitions.
 * `session` is required so this write cannot accidentally happen outside
 * the same transaction as the User write it audits.
 */
export async function recordUserStatusAuditEvent(
    input: RecordUserStatusAuditEventInput,
    session: ClientSession
): Promise<void> {
    await AuditEventModel.create(
        [
            {
                actor: input.actor,
                action: input.action,
                targetType: "user",
                targetId: input.targetId,
                reason: input.reason,
                previousState: input.previousState,
                newState: input.newState,
                requestId: input.requestId,
            },
        ],
        {session}
    );
}

/**
 * Narrow, allowlisted audit-write entry point for Post hide/restore
 * transitions. The required ClientSession enforces the invariant that the
 * Post state and its AuditEvent commit or roll back together.
 */
export async function recordPostModerationAuditEvent(
    input: RecordPostModerationAuditEventInput,
    session: ClientSession
): Promise<void> {
    await AuditEventModel.create(
        [
            {
                actor: input.actor,
                action: input.action,
                targetType: "post",
                targetId: input.targetId,
                reason: input.reason,
                previousState: input.previousState,
                newState: input.newState,
                requestId: input.requestId,
            },
        ],
        {session}
    );
}


export interface ReportStatusAuditState {
    status: "pending" | "reviewed" | "dismissed" | "actioned";
}

interface RecordReportStatusAuditEventInput {
    actor: string;
    action: "REPORT_REVIEWED" | "REPORT_DISMISSED" | "REPORT_ACTIONED";
    targetId: string;
    previousState: ReportStatusAuditState;
    newState: ReportStatusAuditState;
    requestId?: string;
}

/**
 * Records the report workflow transition in the same transaction as the
 * Report write. The audit reason is derived from the allowlisted state
 * transition; the optional admin note remains on the Report itself.
 */
export async function recordReportStatusAuditEvent(
    input: RecordReportStatusAuditEventInput,
    session: ClientSession
): Promise<void> {
    await AuditEventModel.create(
        [
            {
                actor: input.actor,
                action: input.action,
                targetType: "report",
                targetId: input.targetId,
                reason: `Report status changed from ${input.previousState.status} to ${input.newState.status}`,
                previousState: input.previousState,
                newState: input.newState,
                requestId: input.requestId,
            },
        ],
        {session}
    );
}
