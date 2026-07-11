import {Schema, model, Document, Types} from "mongoose";
import {AUDIT_ACTIONS, AUDIT_TARGET_TYPES, AuditAction, AuditTargetType} from "./audit-event.constants";

export interface IAuditEvent extends Document {
    _id: Types.ObjectId;
    actor: Types.ObjectId;
    action: AuditAction;
    targetType: AuditTargetType;
    targetId: Types.ObjectId;
    reason: string;
    previousState: Record<string, unknown>;
    newState: Record<string, unknown>;
    requestId?: string;
    createdAt: Date;
}

const auditEventSchema = new Schema<IAuditEvent>(
    {
        actor: {type: Schema.Types.ObjectId, ref: "User", required: true},
        action: {type: String, enum: AUDIT_ACTIONS, required: true},
        targetType: {type: String, enum: AUDIT_TARGET_TYPES, required: true},
        targetId: {type: Schema.Types.ObjectId, required: true},
        reason: {type: String, required: true, trim: true, maxlength: 500},

        // Persistence stays Mixed so future heterogeneous audit-event
        // types (post moderation, etc. in 7C) don't require a schema
        // migration. Type safety for Sprint 7B lives at the SERVICE
        // BOUNDARY instead — see audit-event.service.ts#recordUserStatusAuditEvent,
        // which is the only writer Sprint 7B is allowed to use.
        previousState: {type: Schema.Types.Mixed, required: true},
        newState: {type: Schema.Types.Mixed, required: true},

        requestId: {type: String},
    },
    {
        timestamps: {createdAt: true, updatedAt: false},
    }
);

// No indexes beyond the default _id index: nothing in the current codebase
// queries AuditEvent by targetType/targetId or by actor yet. Add indexes
// when a real read model (audit-history view, Sprint 7D) actually needs
// them, sized to that query's real shape.

export const AuditEventModel = model<IAuditEvent>("AuditEvent", auditEventSchema);
