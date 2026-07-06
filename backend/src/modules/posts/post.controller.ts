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
