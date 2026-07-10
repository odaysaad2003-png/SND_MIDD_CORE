import {Request, Response, NextFunction} from "express";
import {AppError} from "../utils/app-error";
import {asyncHandler} from "../utils/async-handler";
import {UserModel} from "../modules/users/user.model";

/**
 * Minimal, explicitly-typed current-user state attached by requireActiveUser.
 * Deliberately excludes passwordHash / refreshTokenHash / avatarPublicId and
 * any other internal field — this is a safety boundary, not a full user
 * projection.
 */
export interface CurrentActiveUser {
    id: string;
    role: "user" | "admin";
    isActive: true;
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            currentUser?: CurrentActiveUser;
        }
    }
}

/**
 * Authorization middleware, distinct from authentication (see
 * middleware/authenticate.ts). `authenticate` only proves the request carries
 * a validly-signed, unexpired token; it says nothing about whether the
 * account behind that token is still allowed to act *today*. A token minted
 * before a suspension is cryptographically indistinguishable from a token
 * minted after — only a database lookup can tell the two apart.
 *
 * Must run AFTER `authenticate` (needs req.user.id). Does not replace
 * ownership/role checks in the service layer — it only answers "does this
 * account still exist and is it currently active."
 */
export const requireActiveUser = asyncHandler(
    async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
        if (!req.user) {
            next(AppError.unauthorized("Authentication required"));
            return;
        }

        const user = await UserModel.findById(req.user.id).select("_id role isActive");

        if (!user) {
            next(AppError.unauthorized("Account no longer exists"));
            return;
        }

        if (!user.isActive) {
            next(AppError.forbidden("This account has been deactivated"));
            return;
        }

        req.currentUser = {
            id: user._id.toString(),
            role: user.role,
            isActive: true,
        };

        next();
    }
);
