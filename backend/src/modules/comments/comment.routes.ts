import {Router} from "express";
import {authenticate} from "../../middleware/authenticate";
import {requireActiveUser} from "../../middleware/require-active-user";
import {validateRequest} from "../../middleware/validate-request";
import {
    createCommentSchema,
    listCommentsQuerySchema,
    updateCommentSchema,
    commentIdParamsSchema,
} from "./comment.validation";
import {createComment, listComments, updateComment, deleteComment} from "./comment.controller";
import {commentReportsRouter} from "../reports/report.routes";

// Nested under /api/v1/posts/:postId/comments — mounted from post.routes.ts.
// mergeParams is required so req.params.postId is visible in this router.
export const postCommentsRouter = Router({mergeParams: true});

postCommentsRouter.get("/", validateRequest(listCommentsQuerySchema), listComments);
postCommentsRouter.post("/", authenticate, requireActiveUser, validateRequest(createCommentSchema), createComment);

// Direct comment mutation routes — mounted at /api/v1/comments in app.ts.
export const commentsRouter = Router();

commentsRouter.use("/:commentId/reports", commentReportsRouter);

commentsRouter.patch(
    "/:commentId",
    authenticate,
    requireActiveUser,
    validateRequest(updateCommentSchema),
    updateComment
);
commentsRouter.delete(
    "/:commentId",
    authenticate,
    requireActiveUser,
    validateRequest(commentIdParamsSchema),
    deleteComment
);

export default commentsRouter;
