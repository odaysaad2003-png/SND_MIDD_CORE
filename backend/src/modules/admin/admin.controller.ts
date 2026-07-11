import {Request, Response} from "express";
import {asyncHandler} from "../../utils/async-handler";
import {sendSuccess} from "../../utils/api-response";
import * as adminService from "./admin.service";
import {ListAdminUsersQuery} from "./admin.validation";

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as ListAdminUsersQuery;

    const result = await adminService.listUsers(req.user!.id, query);

    sendSuccess(res, {
        data: result.data,
        meta: {...result.meta},
    });
});

export const getUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await adminService.getUserById(req.user!.id, req.params.userId);

    sendSuccess(res, {data: user});
});

export const updateUserStatus = asyncHandler(async (req: Request, res: Response) => {
    const user = await adminService.updateUserStatus(
        req.user!.id,
        req.params.userId,
        {
            status: req.body.status,
            reason: req.body.reason,
        },
        {
            requestId: req.requestId,
        }
    );

    sendSuccess(res, {data: user});
});
