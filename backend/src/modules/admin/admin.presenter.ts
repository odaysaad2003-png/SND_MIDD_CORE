import {Types} from "mongoose";
import {IUser, UserRole} from "../users/user.model";

export interface SanitizedAdminUserSummary {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface SanitizedAdminUserDetail extends SanitizedAdminUserSummary {
    suspendedAt: Date | null;
    suspendedBy: {id: string; name: string} | null;
    suspensionReason: string | null;
}

export function sanitizeAdminUserSummary(user: IUser): SanitizedAdminUserSummary {
    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}

export function sanitizeAdminUserDetail(user: IUser): SanitizedAdminUserDetail {
    // suspendedBy may be a populated User doc, a raw (unpopulated)
    // ObjectId, or null. Only ever expose the { id, name } shape; never
    // leak a raw ObjectId as a stand-in for it.
    const raw = user.suspendedBy as unknown;
    let suspendedBy: {id: string; name: string} | null = null;

    if (raw && typeof raw === "object" && "name" in raw && "_id" in raw) {
        const populated = raw as {_id: Types.ObjectId; name?: string};
        if (populated.name) {
            suspendedBy = {id: populated._id.toString(), name: populated.name};
        }
    }

    return {
        ...sanitizeAdminUserSummary(user),
        // Defensive normalization: a User document written before Sprint
        // 7B has these fields absent from the raw driver document, not
        // just `null`. Mongoose applies schema defaults on hydration, but
        // `?? null` keeps the API contract stable even if that ever
        // changes (e.g. a lean() query bypassing defaults).
        suspendedAt: user.suspendedAt ?? null,
        suspendedBy,
        suspensionReason: user.suspensionReason ?? null,
    };
}
