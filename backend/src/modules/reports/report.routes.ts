import {Router} from "express";
import {authenticate} from "../../middleware/authenticate";
import {requireActiveUser} from "../../middleware/require-active-user";
import {requireRole} from "../../middleware/require-role";
import {validateRequest} from "../../middleware/validate-request";
import {
    reportPostParamsSchema,
    reportCommentParamsSchema,
    reportIdParamsSchema,
    listReportsQuerySchema,
    updateReportStatusSchema,
} from "./report.validation";
import {reportPost, reportComment, listReports, getReport, updateReportStatus} from "./report.controller";

export const postReportsRouter = Router({mergeParams: true});
export const commentReportsRouter = Router({mergeParams: true});

// Reporter identity matters here — a suspended user should not be able to
// file reports. Not applied to the admin routes below: assertCurrentAdmin
// already performs a fuller (isActive + role) check in the service layer,
// so adding requireActiveUser there would just duplicate the same query.
postReportsRouter.post("/", authenticate, requireActiveUser, validateRequest(reportPostParamsSchema), reportPost);

commentReportsRouter.post(
    "/",
    authenticate,
    requireActiveUser,
    validateRequest(reportCommentParamsSchema),
    reportComment
);

const router = Router();

router.get("/", authenticate, requireRole("admin"), validateRequest(listReportsQuerySchema), listReports);

router.get("/:reportId", authenticate, requireRole("admin"), validateRequest(reportIdParamsSchema), getReport);

router.patch(
    "/:reportId/status",
    authenticate,
    requireRole("admin"),
    validateRequest(updateReportStatusSchema),
    updateReportStatus
);

export default router;
