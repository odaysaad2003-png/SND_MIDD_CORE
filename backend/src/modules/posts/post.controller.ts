import {Request, Response} from "express";
import {asyncHandler} from "../../utils/async-handler";
import {sendSuccess} from "../../utils/api-response";
import * as postService from "./post.service";
import { GetMyPostsQuery } from "./post.validation";
import { AppError } from "../../utils/app-error";



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

    sendSuccess(res, {data: posts,meta:{...meta}});
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

export const getPost = asyncHandler(async (req: Request, res: Response) => {
    const post = await postService.getActivePostById(req.params.postId);

    sendSuccess(res, {
        data: post,
    });
});


export const getMyPosts = asyncHandler(async (req, res) => {
    const userId = req.user!.id;

    const result = await postService.getMyPosts(userId, req.query as unknown as GetMyPostsQuery);

    sendSuccess(res, {
        statusCode: 200,
        data: result.data,
        meta: {...result.meta},
    });
});



export const updatePost = asyncHandler(async (req: Request, res: Response) => {
    const post = await postService.updatePost(req.params.postId, req.user!.id, req.user!.role, {
        title: req.body.title,
        content: req.body.content,
    });

    sendSuccess(res, {
        data: post,
    });
});

export const deletePost = asyncHandler(async (req: Request, res: Response) => {
    await postService.softDeletePost(req.params.postId, req.user!.id, req.user!.role);

    res.status(204).send();
});



export const uploadPostImages = asyncHandler(async (req: Request, res: Response) => {
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];

    if (files.length === 0) {
        throw AppError.badRequest("At least one image is required");
    }

    const post = await postService.addPostImages(req.params.postId, req.user!.id, req.user!.role, files);

    sendSuccess(res, {
        statusCode: 200,
        data: post,
    });
});