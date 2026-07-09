import {Request, Response} from "express";
import {asyncHandler} from "../../utils/async-handler";
import {sendSuccess} from "../../utils/api-response";
import * as saveService from "./save.service";
import {ListMySavedPostsQuery} from "./save.validation";

export const savePost = asyncHandler(async (req: Request, res: Response) => {
    const {result, created} = await saveService.savePost(req.params.postId, req.user!.id);

    sendSuccess(res, {
        data: result,
        statusCode: created ? 201 : 200,
    });
});

export const unsavePost = asyncHandler(async (req: Request, res: Response) => {
    const result = await saveService.unsavePost(req.params.postId, req.user!.id);

    sendSuccess(res, {
        data: result,
        statusCode: 200,
    });
});

export const getMySaveStatus = asyncHandler(async (req: Request, res: Response) => {
    const result = await saveService.getMySaveStatus(req.params.postId, req.user!.id);

    sendSuccess(res, {
        data: result,
    });
});

export const listMySavedPosts = asyncHandler(async (req: Request, res: Response) => {
    const {page, limit, sort} = req.query as unknown as ListMySavedPostsQuery;

    const result = await saveService.listMySavedPosts(req.user!.id, {
        page,
        limit,
        sort,
    });

    sendSuccess(res, {
        data: result.data,
        meta: {...result.meta},
    });
});
