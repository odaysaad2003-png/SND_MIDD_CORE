import {Request, Response} from "express";
import {asyncHandler} from "../../utils/async-handler";
import {sendSuccess} from "../../utils/api-response";
import * as likeService from "./like.service";

export const likePost = asyncHandler(async (req: Request, res: Response) => {
    const {result, created} = await likeService.likePost(req.params.postId, req.user!.id);

    sendSuccess(res, {
        data: result,
        statusCode: created ? 201 : 200,
    });
});

export const unlikePost = asyncHandler(async (req: Request, res: Response) => {
    const result = await likeService.unlikePost(req.params.postId, req.user!.id);

    sendSuccess(res, {
        data: result,
        statusCode: 200,
    });
});

export const getMyLikeStatus = asyncHandler(async (req: Request, res: Response) => {
    const result = await likeService.getMyLikeStatus(req.params.postId, req.user!.id);

    sendSuccess(res, {
        data: result,
    });
});
