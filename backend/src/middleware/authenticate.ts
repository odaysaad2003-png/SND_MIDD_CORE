import {NextFunction, Request, Response} from "express";
import {AppError} from "../utils/app-error";
import {verifyAccessToken} from "../utils/tokens";

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            user?: {id: string; role: "user" | "admin"};
        }
    }
}

/**
 * Authenticates a request via the Access Token in the Authorization
 * header. Does NOT check the database — that's an authorization/ownership
 * concern for the service layer (per SECURITY_RULES.md, auth first, then
 * authorize). Attaches only the minimal, non-sensitive claims to req.user.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
    const header = req.header("Authorization");

    if (!header || !header.startsWith("Bearer ")) {
        next(AppError.unauthorized("Missing or invalid Authorization header"));
        return;
    }

    const token = header.slice("Bearer ".length).trim();

    try {
        const payload = verifyAccessToken(token);
        req.user = {id: payload.sub, role: payload.role};
        next();
    } catch {
        next(AppError.unauthorized("Invalid or expired access token"));
    }
}
