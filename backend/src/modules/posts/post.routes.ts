import {Router} from "express";
import {authenticate} from "../../middleware/authenticate";
import {validateRequest} from "../../middleware/validate-request";
import {createPostSchema, updatePostSchema, postIdParamsSchema, listPostsQuerySchema} from "./post.validation";
import {listPosts, getPost, createPost, updatePost, deletePost} from "./post.controller";

const router = Router();

// Public feed
router.get("/", validateRequest(listPostsQuerySchema), listPosts);

// Public post details
router.get("/:postId", validateRequest(postIdParamsSchema), getPost);

// Protected create post
router.post("/", authenticate, validateRequest(createPostSchema), createPost);

// Protected update post
router.patch("/:postId", authenticate, validateRequest(updatePostSchema), updatePost);

// Protected delete post
router.delete("/:postId", authenticate, validateRequest(postIdParamsSchema), deletePost);

export default router;
