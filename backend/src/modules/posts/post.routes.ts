import {Router} from "express";
import {authenticate} from "../../middleware/authenticate";
import {validateRequest} from "../../middleware/validate-request";
import {
    createPostSchema,
    updatePostSchema,
    postIdParamsSchema,
    listPostsQuerySchema,
    getMyPostsQuerySchema,
    removePostImageSchema,
} from "./post.validation";
import {
    listPosts,
    getPost,
    createPost,
    updatePost,
    deletePost,
    getMyPosts,
    uploadPostImages,
    removePostImage,
} from "./post.controller";
import {uploadPostImagesMiddleware} from "./post.upload.middleware";
import {postCommentsRouter} from "../comments/comment.routes";
import {postLikesRouter} from "../likes/like.routes";
import {postSavesRouter} from "../saves/save.routes";
import {postReportsRouter} from "../reports/report.routes";
const router = Router();

// Public feed
router.get("/", validateRequest(listPostsQuerySchema), listPosts);

// My posts
router.get("/me", authenticate, validateRequest(getMyPostsQuerySchema), getMyPosts);

// Nested comments (list is public, create requires auth — enforced inside
// postCommentsRouter itself). mergeParams gives it access to :postId.
router.use("/:postId/comments", postCommentsRouter);

// Nested likes — must be mounted before the generic "/:postId" GET route
// below, or "/:postId" would swallow "/:postId/likes" as an id segment.
router.use("/:postId/likes", postLikesRouter);

// Nested saves — must be mounted before the generic "/:postId" route.
router.use("/:postId/saves", postSavesRouter);

// Nested reports — users can report a specific post.
router.use("/:postId/reports", postReportsRouter);

// Public post details
router.get("/:postId", validateRequest(postIdParamsSchema), getPost);

// Protected create post
router.post("/", authenticate, validateRequest(createPostSchema), createPost);

// Protected upload post images
router.post(
    "/:postId/images",
    authenticate,
    validateRequest(postIdParamsSchema),
    uploadPostImagesMiddleware,
    uploadPostImages
);

// Protected remove one post image
router.delete("/:postId/images", authenticate, validateRequest(removePostImageSchema), removePostImage);

// Protected update post
router.patch("/:postId", authenticate, validateRequest(updatePostSchema), updatePost);

// Protected delete post
router.delete("/:postId", authenticate, validateRequest(postIdParamsSchema), deletePost);

export default router;
