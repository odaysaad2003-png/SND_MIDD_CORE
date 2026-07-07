import {Router} from "express";
import {authenticate} from "../../middleware/authenticate";
import {validateRequest} from "../../middleware/validate-request";
import {createPostSchema, listPostsQuerySchema} from "./post.validation";
import {listPosts, createPost} from "./post.controller";

const router = Router();

// Public feed
router.get("/", validateRequest(listPostsQuerySchema), listPosts);

// Protected create post
router.post("/", authenticate, validateRequest(createPostSchema), createPost);

export default router;
