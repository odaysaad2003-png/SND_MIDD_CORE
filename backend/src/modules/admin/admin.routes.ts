import {Router} from "express";
import {authenticate} from "../../middleware/authenticate";
import {requireRole} from "../../middleware/require-role";
import {validateRequest} from "../../middleware/validate-request";
import {listAdminUsersQuerySchema, adminUserIdParamsSchema, updateUserStatusSchema} from "./admin.validation";
import {listUsers, getUser, updateUserStatus} from "./admin.controller";
import adminPostRoutes from "./post/admin-post.routes";
import adminDashboardRoutes from "./dashboard/admin-dashboard.routes";

const router = Router();

// Baseline gate. The real authorization source of truth is the
// service-level assertCurrentAdmin DB revalidation in admin.service.ts —
// SECURITY_RULES.md "Role Security": a token's role claim can go stale.
router.use(authenticate, requireRole("admin"));

router.get("/users", validateRequest(listAdminUsersQuerySchema), listUsers);
router.get("/users/:userId", validateRequest(adminUserIdParamsSchema), getUser);
router.patch("/users/:userId/status", validateRequest(updateUserStatusSchema), updateUserStatus);

router.use("/dashboard", adminDashboardRoutes);
router.use("/posts", adminPostRoutes);

export default router;
