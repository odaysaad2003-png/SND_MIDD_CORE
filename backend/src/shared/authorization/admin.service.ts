import {UserModel} from "../../modules/users/user.model";
import {AppError} from "../../utils/app-error";

/**
 * Revalidates that the acting admin is, right now, a real, active,
 * admin-role account in the database.
 *
 * A token's `role: "admin"` claim is only accurate as of the moment the
 * token was issued (see AUTH_CONCEPTS.md — "Role and User-State
 * Considerations"). Route-level `requireRole("admin")` is a cheap first
 * filter, not the authorization decision itself; high-impact admin
 * operations must confirm current state before acting
 * (SECURITY_RULES.md — "Role Security").
 *
 * Intentionally service-level (no Express req/res) so it can be called from
 * any module's service layer without coupling to HTTP.
 */
export async function assertCurrentAdmin(adminUserId: string): Promise<void> {
    const admin = await UserModel.findById(adminUserId).select("_id role isActive");

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
