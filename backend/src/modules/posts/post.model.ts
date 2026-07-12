import {Schema, model, Document, Types} from "mongoose";

export type PostStatus = "active" | "deleted";
export type PostModerationStatus = "visible" | "hidden";

export interface IPost extends Document {
    _id: Types.ObjectId;
    title: string;
    content: string;
    author: Types.ObjectId;
    images: string[];
    imagePublicIds: string[];
    status: PostStatus;
    deletedAt: Date | null;
    moderationStatus?: PostModerationStatus;
    hiddenAt: Date | null;
    hiddenBy: Types.ObjectId | null;
    moderationReason: string | null;
    likesCount: number;
    createdAt: Date;
    updatedAt: Date;
}

const postSchema = new Schema<IPost>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 100,
        },

        content: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
            maxlength: 5000,
        },

        author: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        images: {
            type: [String],
            default: [],
        },

        imagePublicIds: {
            type: [String],
            default: [],
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

        // Sprint 7C — separate Admin moderation lifecycle. These fields
        // never replace or override the owner status/deletedAt lifecycle.
        moderationStatus: {
            type: String,
            enum: ["visible", "hidden"],
            default: "visible",
        },

        hiddenAt: {
            type: Date,
            default: null,
        },

        hiddenBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        moderationReason: {
            type: String,
            trim: true,
            maxlength: 500,
            default: null,
        },

        likesCount: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Supports "my posts" queries:
// Get posts for one author, ordered newest first.
postSchema.index({author: 1, createdAt: -1});

// Supports public feed queries:
// Get active posts, ordered newest first.
postSchema.index({status: 1, createdAt: -1});

// Prepared for future full-text search.
// Sprint 4 currently uses regex search in the service layer.
postSchema.index({title: "text", content: "text"});

export const PostModel = model<IPost>("Post", postSchema);
