import {Schema, model, Document, Types} from "mongoose";

export type UserRole = "user" | "admin";

export interface IUser extends Document {
    _id: Types.ObjectId;
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    isActive: boolean;
    refreshTokenHash: string | null;
    avatar: string | null;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },

        passwordHash: {
            type: String,
            required: true,
            select: false,
        },

        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        refreshTokenHash: {
            type: String,
            default: null,
            select: false,
        },

        avatar: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.index({email: 1}, {unique: true});

export const UserModel = model<IUser>("User", userSchema);
