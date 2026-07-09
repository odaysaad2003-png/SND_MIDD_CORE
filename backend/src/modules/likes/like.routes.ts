import {Router} from "express";
import {authenticate} from "../../middleware/authenticate";
import {validateRequest} from "../../middleware/validate-request";
import {likePostIdParamsSchema} from "./like.validation";
import {likePost, unlikePost, getMyLikeStatus} from "./like.controller";

// Mounted under /api/v1/posts/:postId/likes.
// mergeParams is required so req.params.postId is visible in this router.
export const postLikesRouter = Router({mergeParams: true});

postLikesRouter.post("/", authenticate, validateRequest(likePostIdParamsSchema), likePost);
postLikesRouter.delete("/", authenticate, validateRequest(likePostIdParamsSchema), unlikePost);
postLikesRouter.get("/me", authenticate, validateRequest(likePostIdParamsSchema), getMyLikeStatus);

export default postLikesRouter;
