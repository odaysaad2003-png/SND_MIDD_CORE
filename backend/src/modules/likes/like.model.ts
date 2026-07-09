import {Schema, model, Document, Types} from "mongoose";

export type LikeStatus = "active" | "deleted";

export interface ILike extends Document {
    _id: Types.ObjectId;
    post: Types.ObjectId;
    user: Types.ObjectId;
    status: LikeStatus;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

const likeSchema = new Schema<ILike>(
    {
        post: {
            type: Schema.Types.ObjectId,
            ref: "Post",
            required: true,
        },

        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        status: {
            type: String,
            enum: ["active", "deleted"],
            default: "active",
        },

        deletedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// One like document per user per post, ever. Toggled via status, not
// recreated — this index is the final, DB-level guard against duplicate
// likes even under concurrent requests (findOne + save is not atomic).
likeSchema.index({post: 1, user: 1}, {unique: true});

// Supports counting/listing active likes for a post, newest first.
likeSchema.index({post: 1, status: 1, createdAt: -1});

// Supports author-scoped lookups (e.g. future "posts I liked").
likeSchema.index({user: 1, status: 1, createdAt: -1});

export const LikeModel = model<ILike>("Like", likeSchema);
