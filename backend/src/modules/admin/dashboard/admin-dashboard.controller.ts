import {Request, Response} from "express";
import {sendSuccess} from "../../../utils/api-response";
import {asyncHandler} from "../../../utils/async-handler";
import {getDashboardSummary} from "./admin-dashboard.service";

export const getSummary = asyncHandler(async (req: Request, res: Response) => {
    const summary = await getDashboardSummary(req.user!.id);

    sendSuccess(res, {
        data: summary,
    });
});
