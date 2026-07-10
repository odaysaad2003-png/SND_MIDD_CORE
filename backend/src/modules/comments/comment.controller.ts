import {Request, Response} from "express";
import {asyncHandler} from "../../utils/async-handler";
import {sendSuccess} from "../../utils/api-response";
import * as commentService from "./comment.service";
import {ListCommentsQuery} from "./comment.validation";

export const createComment = asyncHandler(async (req: Request, res: Response) => {
    const comment = await commentService.createComment(req.params.postId, req.user!.id, req.body.content);

    sendSuccess(res, {
        data: comment,
        statusCode: 201,
    });
});

export const listComments = asyncHandler(async (req: Request, res: Response) => {
    const {page, limit, sort} = req.query as unknown as ListCommentsQuery;

    const result = await commentService.listCommentsForPost(req.params.postId, {page, limit, sort});

    sendSuccess(res, {
        data: result.data,
        meta: {...result.meta},
    });
});

export const updateComment = asyncHandler(async (req: Request, res: Response) => {
    const comment = await commentService.updateComment(req.params.commentId, req.user!.id, req.body.content);

    sendSuccess(res, {
        data: comment,
    });
});

export const deleteComment = asyncHandler(async (req: Request, res: Response) => {
    await commentService.softDeleteComment(req.params.commentId, req.user!.id);

    res.status(204).send();
});
