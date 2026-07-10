import {Schema, model, Document, Types} from "mongoose";
import {
    REPORT_REASONS,
    REPORT_STATUSES,
    REPORT_TARGET_TYPES,
    ReportReason,
    ReportStatus,
    ReportTargetType,
} from "./report.constants";

export interface IReport extends Document {
    _id: Types.ObjectId;
    reporter: Types.ObjectId;
    targetType: ReportTargetType;
    targetId: Types.ObjectId;
    reason: ReportReason;
    details?: string;
    status: ReportStatus;
    reviewedBy: Types.ObjectId | null;
    reviewedAt: Date | null;
    adminNote?: string;
    createdAt: Date;
    updatedAt: Date;
}

const reportSchema = new Schema<IReport>(
    {
        reporter: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        targetType: {
            type: String,
            enum: REPORT_TARGET_TYPES,
            required: true,
        },

        targetId: {
            type: Schema.Types.ObjectId,
            required: true,
        },

        reason: {
            type: String,
            enum: REPORT_REASONS,
            required: true,
        },

        details: {
            type: String,
            trim: true,
            maxlength: 1000,
        },

        status: {
            type: String,
            enum: REPORT_STATUSES,
            default: "pending",
        },

        reviewedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        reviewedAt: {
            type: Date,
            default: null,
        },

        adminNote: {
            type: String,
            trim: true,
            maxlength: 1000,
        },
    },
    {
        timestamps: true,
    }
);

// A user can report the same target only once.
reportSchema.index({reporter: 1, targetType: 1, targetId: 1}, {unique: true});

// Supports admin moderation queue.
reportSchema.index({status: 1, createdAt: -1});

// Supports viewing reports for a specific post/comment.
reportSchema.index({targetType: 1, targetId: 1, createdAt: -1});

// Supports future "my reports" feature.
reportSchema.index({reporter: 1, createdAt: -1});

export const ReportModel = model<IReport>("Report", reportSchema);
