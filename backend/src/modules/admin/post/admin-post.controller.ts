import {Request, Response} from "express";
import {sendSuccess} from "../../../utils/api-response";
import {asyncHandler} from "../../../utils/async-handler";
import * as adminPostService from "./admin-post.service";
import {ListAdminPostsQuery, UpdatePostModerationBody} from "./admin-post.validation";

export const listPosts = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as ListAdminPostsQuery;
    const result = await adminPostService.listPosts(req.user!.id, query);

    sendSuccess(res, {
        data: result.data,
        meta: {...result.meta},
    });
});

export const getPost = asyncHandler(async (req: Request, res: Response) => {
    const post = await adminPostService.getPostById(req.user!.id, req.params.postId);
    sendSuccess(res, {data: post});
});

export const updatePostModeration = asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as UpdatePostModerationBody;

    const post = await adminPostService.updatePostModeration(
        req.user!.id,
        req.params.postId,
        input,
        {requestId: req.requestId}
    );

    sendSuccess(res, {data: post});
});
