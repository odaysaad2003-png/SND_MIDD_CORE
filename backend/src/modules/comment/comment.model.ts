import {Schema, model, Document, Types} from "mongoose";

export type CommentStatus = "active" | "deleted";

export interface IComment extends Document {
    _id: Types.ObjectId;
    content: string;
    post: Types.ObjectId;
    author: Types.ObjectId;
    status: CommentStatus;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
    {
        content: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
            maxlength: 1000,
        },

        post: {
            type: Schema.Types.ObjectId,
            ref: "Post",
            required: true,
        },

        author: {
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

// Supports listing active comments for a post, newest/oldest first.
commentSchema.index({post: 1, status: 1, createdAt: -1});

// Supports author-scoped lookups (e.g. future "my comments").
commentSchema.index({author: 1, createdAt: -1});

export const CommentModel = model<IComment>("Comment", commentSchema);
