import {ClientSession} from "mongoose";
import {AuditEventModel} from "./audit-event.model";

/**
 * The only user-state snapshot Sprint 7B is allowed to persist. Narrower
 * than the schema itself on purpose: a future caller cannot pass an entire
 * User document through this type even by accident — the compiler rejects
 * anything that isn't exactly { isActive: boolean }.
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
 * Narrow, allowlisted audit-write entry point for user status transitions.
 * `session` is required (not optional): this write must always happen
 * inside the same transaction as the User document write it's auditing
 * (admin.service.ts#updateUserStatus) — a standalone, non-transactional
 * call to this function would defeat the "both commit or both roll back"
 * invariant, so the type signature itself makes that impossible to do by
 * accident.
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
