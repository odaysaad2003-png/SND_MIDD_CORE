import {NextFunction, Request, Response} from "express";
import {AppError} from "../utils/app-error";
import type {UserRole} from "../modules/users/user.model";


export function requireRole(...allowedRoles: UserRole[]) {
    return (req: Request, _res: Response, next: NextFunction) => {
        const user = req.user;

        if (!user) {
            return next(AppError.unauthorized("Authentication required"));
        }

        if (!allowedRoles.includes(user.role)) {
            return next(AppError.forbidden("You do not have permission to access this resource"));
        }

        return next();
    };
}
