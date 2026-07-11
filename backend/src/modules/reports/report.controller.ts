import {Request, Response} from "express";
import {asyncHandler} from "../../utils/async-handler";
import {sendSuccess} from "../../utils/api-response";
import * as reportService from "./report.service";
import {ListReportsQuery} from "./report.validation";

export const reportPost = asyncHandler(async (req: Request, res: Response) => {
    const report = await reportService.createReport({
        reporterId: req.user!.id,
        targetType: "post",
        targetId: req.params.postId,
        reason: req.body.reason,
        details: req.body.details,
    });

    sendSuccess(res, {
        data: report,
        statusCode: 201,
    });
});

export const reportComment = asyncHandler(async (req: Request, res: Response) => {
    const report = await reportService.createReport({
        reporterId: req.user!.id,
        targetType: "comment",
        targetId: req.params.commentId,
        reason: req.body.reason,
        details: req.body.details,
    });

    sendSuccess(res, {
        data: report,
        statusCode: 201,
    });
});

export const listReports = asyncHandler(async (req: Request, res: Response) => {
    const {page, limit, sort, status, targetType} = req.query as unknown as ListReportsQuery;

    const result = await reportService.listReports(req.user!.id, {
        page,
        limit,
        sort,
        status,
        targetType,
    });

    sendSuccess(res, {
        data: result.data,
        meta: {...result.meta},
    });
});

export const getReport = asyncHandler(async (req: Request, res: Response) => {
    const report = await reportService.getReportByIdForAdmin(req.params.reportId, req.user!.id);

    sendSuccess(res, {
        data: report,
    });
});

export const updateReportStatus = asyncHandler(async (req: Request, res: Response) => {
    const report = await reportService.updateReportStatus(req.params.reportId, req.user!.id, {
        status: req.body.status,
        adminNote: req.body.adminNote,
    });

    sendSuccess(res, {
        data: report,
    });
});
