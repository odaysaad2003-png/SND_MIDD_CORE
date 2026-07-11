import {ClientSession} from "mongoose";
import {UserModel} from "../../modules/users/user.model";
import {AppError} from "../../utils/app-error";

/**
 * Revalidates that the acting admin is, right now, a real, active,
 * admin-role account in the database. A token's `role: "admin"` claim is
 * only accurate as of token-issue time (AUTH_CONCEPTS.md); route-level
 * requireRole("admin") is a cheap first filter, not the authorization
 * decision itself.
 *
 * When called with a `session`, the read participates in that transaction
 * and sees exactly what that transaction sees — required by high-impact
 * operations (e.g. admin.service.ts#updateUserStatus) that must evaluate
 * "is this admin still authorized" from the same consistency boundary as
 * the write it's about to make. Read-only callers (report listing, etc.)
 * continue calling this with no session, unchanged.
 */
export async function assertCurrentAdmin(adminUserId: string, session?: ClientSession): Promise<void> {
    let query = UserModel.findById(adminUserId).select("_id role isActive");

    if (session) {
        query = query.session(session);
    }

    const admin = await query;

    if (!admin) {
        throw AppError.unauthorized("Admin account no longer exists");
    }

    if (!admin.isActive) {
        throw AppError.forbidden("This admin account has been deactivated");
    }

    if (admin.role !== "admin") {
        throw AppError.forbidden("You do not have permission to perform this action");
    }
}
