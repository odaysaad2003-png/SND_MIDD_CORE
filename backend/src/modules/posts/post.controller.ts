import {Request, Response} from "express";
import {asyncHandler} from "../../utils/async-handler";
import {sendSuccess} from "../../utils/api-response";
import * as postService from "./post.service";

export const listPosts = asyncHandler(async (req: Request, res: Response) => {
    const {page, limit, sort, search} = req.query as unknown as {
        page: number;
        limit: number;
        sort: "latest" | "oldest";
        search?: string;
    };

    const {posts, meta} = await postService.listActivePosts({
        page,
        limit,
        sort,
        search,
    });

    sendSuccess(res, {
        data: posts,
        meta,
    });
});

export const createPost = asyncHandler(async (req: Request, res: Response) => {
    const post = await postService.createPost(req.user!.id, {
        title: req.body.title,
        content: req.body.content,
    });

    sendSuccess(res, {
        data: post,
        statusCode: 201,
    });
});
