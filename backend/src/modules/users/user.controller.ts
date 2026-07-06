import {Request, Response} from "express";
import {asyncHandler} from "../../utils/async-handler";
import {sendSuccess} from "../../utils/api-response";
import * as userService from "./user.service";

export const getMe = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.getCurrentUser(req.user!.id);

    sendSuccess(res, {
        data: user,
    });
});

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.updateCurrentUser(req.user!.id, {
        name: req.body.name,
    });

    sendSuccess(res, {
        data: user,
    });
});

export const updateMyAvatar = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.updateAvatar(req.user!.id, req.file!.filename);

    sendSuccess(res, {
        data: user,
    });
});
