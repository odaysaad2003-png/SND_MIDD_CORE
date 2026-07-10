import {Router} from "express";
import {authenticate} from "../../middleware/authenticate";
import {requireActiveUser} from "../../middleware/require-active-user";
import {validateRequest} from "../../middleware/validate-request";
import {savePostIdParamsSchema, listMySavedPostsQuerySchema} from "./save.validation";
import {savePost, unsavePost, getMySaveStatus, listMySavedPosts} from "./save.controller";

// Mounted under /api/v1/posts/:postId/saves.
// mergeParams is required so req.params.postId is visible here.
export const postSavesRouter = Router({mergeParams: true});

postSavesRouter.post("/", authenticate, requireActiveUser, validateRequest(savePostIdParamsSchema), savePost);
postSavesRouter.delete("/", authenticate, requireActiveUser, validateRequest(savePostIdParamsSchema), unsavePost);
postSavesRouter.get("/me", authenticate, requireActiveUser, validateRequest(savePostIdParamsSchema), getMySaveStatus);

// Mounted under /api/v1/saves.
export const savesRouter = Router();

savesRouter.get("/me", authenticate, requireActiveUser, validateRequest(listMySavedPostsQuerySchema), listMySavedPosts);

export default savesRouter;
