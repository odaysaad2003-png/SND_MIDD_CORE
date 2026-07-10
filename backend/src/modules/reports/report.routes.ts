import {Router} from "express";
import {authenticate} from "../../middleware/authenticate";
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

postReportsRouter.post("/", authenticate, validateRequest(reportPostParamsSchema), reportPost);

commentReportsRouter.post("/", authenticate, validateRequest(reportCommentParamsSchema), reportComment);

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
