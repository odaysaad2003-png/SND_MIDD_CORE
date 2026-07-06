import {Router} from "express";
import {validateRequest} from "../../middleware/validate-request";
import {listPostsQuerySchema} from "./post.validation";
import {listPosts} from "./post.controller";

const router = Router();

router.get("/", validateRequest(listPostsQuerySchema), listPosts);

export default router;
