import {Router} from "express";
import {authenticate} from "../../middleware/authenticate";
import {validateRequest} from "../../middleware/validate-request";
import {createPostSchema, updatePostSchema, postIdParamsSchema, listPostsQuerySchema} from "./post.validation";
import {listPosts, getPost, createPost, updatePost, deletePost, getMyPosts} from "./post.controller";
import {getMyPostsQuerySchema} from "./post.validation";

const router = Router();

// Public feed
router.get("/", validateRequest(listPostsQuerySchema), listPosts);


router.get("/me", authenticate, validateRequest(getMyPostsQuerySchema), getMyPosts);


// Public post details
router.get("/:postId", validateRequest(postIdParamsSchema), getPost);

// Protected create post
router.post("/", authenticate, validateRequest(createPostSchema), createPost);

// Protected update post
router.patch("/:postId", authenticate, validateRequest(updatePostSchema), updatePost);

// Protected delete post
router.delete("/:postId", authenticate, validateRequest(postIdParamsSchema), deletePost);

export default router;
