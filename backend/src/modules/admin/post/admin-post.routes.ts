import {Router} from "express";
import {validateRequest} from "../../../middleware/validate-request";
import {getPost, listPosts, updatePostModeration} from "./admin-post.controller";
import {adminPostIdParamsSchema, listAdminPostsQuerySchema, updatePostModerationSchema} from "./admin-post.validation";

const router = Router();

// Mounted under admin.routes.ts after authenticate + requireRole("admin").
// Every service still revalidates the current admin from MongoDB.
router.get("/", validateRequest(listAdminPostsQuerySchema), listPosts);
router.get("/:postId", validateRequest(adminPostIdParamsSchema), getPost);
router.patch("/:postId/moderation", validateRequest(updatePostModerationSchema), updatePostModeration);

export default router;
