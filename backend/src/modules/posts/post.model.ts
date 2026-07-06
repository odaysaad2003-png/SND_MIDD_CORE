import {Schema, model, Document, Types} from "mongoose";

export type PostStatus = "active" | "deleted";

export interface IPost extends Document {
    _id: Types.ObjectId;
    title: string;
    content: string;
    author: Types.ObjectId;
    images: string[];
    status: PostStatus;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

const postSchema = new Schema<IPost>(
    {
        title: {type: String, required: true, trim: true, minlength: 3, maxlength: 120},
        content: {type: String, required: true, trim: true, minlength: 1, maxlength: 5000},
        author: {type: Schema.Types.ObjectId, ref: "User", required: true},
        images: {type: [String], default: []},
        status: {type: String, enum: ["active", "deleted"], default: "active"},
        deletedAt: {type: Date, default: null},
    },
    {timestamps: true}
);

// Supports "my posts" queries (author's posts, newest first).
postSchema.index({author: 1, createdAt: -1});

// Supports the public feed (active posts, newest first).
postSchema.index({status: 1, createdAt: -1});

// Optional: available for future $text search. Sprint 4's search uses a
// regex instead (see post.service.ts) — simpler for partial substring
// matches at this scale; revisit with $text/external search in Sprint 10.
postSchema.index({title: "text", content: "text"});

export const PostModel = model<IPost>("Post", postSchema);
