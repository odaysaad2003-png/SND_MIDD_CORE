import {Schema, model, Document, Types} from "mongoose";

export type SaveStatus = "active" | "deleted";

export interface ISave extends Document {
    _id: Types.ObjectId;
    post: Types.ObjectId;
    user: Types.ObjectId;
    status: SaveStatus;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

const saveSchema = new Schema<ISave>(
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

// One save document per user per post.
// We toggle status instead of creating duplicates.
saveSchema.index({post: 1, user: 1}, {unique: true});

// Supports checking whether a user saved a specific post.
saveSchema.index({user: 1, post: 1, status: 1});

// Supports listing "my saved posts", newest first.
saveSchema.index({user: 1, status: 1, createdAt: -1});

// Supports future analytics or admin queries per post.
saveSchema.index({post: 1, status: 1, createdAt: -1});

export const SaveModel = model<ISave>("Save", saveSchema);
