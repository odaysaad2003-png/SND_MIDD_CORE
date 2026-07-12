import {Schema, model, Document, Types} from "mongoose";

export type UserRole = "user" | "admin";
export type AvatarProvider = "local" | "cloudinary";

export interface IUser extends Document {
    _id: Types.ObjectId;
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    isActive: boolean;
    refreshTokenHash: string | null;
    refreshTokenId: string | null;
    avatar: string | null;
    avatarProvider: AvatarProvider | null;
    avatarPublicId: string | null;
    suspendedAt: Date | null;
    suspendedBy: Types.ObjectId | null;
    suspensionReason: string | null;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>(
    {
        name: {type: String, required: true, trim: true},
        email: {type: String, required: true, lowercase: true, trim: true},
        passwordHash: {type: String, required: true, select: false},
        role: {type: String, enum: ["user", "admin"], default: "user"},
        isActive: {type: Boolean, default: true},
        refreshTokenHash: {type: String, default: null, select: false},
        refreshTokenId: {type: String, default: null, select: false},
        avatar: {type: String, default: null},
        avatarProvider: {type: String, enum: ["local", "cloudinary"], default: null},
        avatarPublicId: {type: String, default: null, select: false},

        // Sprint 7B — User Administration
        suspendedAt: {
            type: Date,
            default: null,
        },
        suspendedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        suspensionReason: {
            type: String,
            trim: true,
            maxlength: 500,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.index({email: 1}, {unique: true});


export const UserModel = model<IUser>("User", userSchema);
