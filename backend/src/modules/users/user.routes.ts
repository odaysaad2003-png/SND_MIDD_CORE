import {Router} from "express";
import {authenticate} from "../../middleware/authenticate";
import {requireActiveUser} from "../../middleware/require-active-user";
import {uploadRateLimiter} from "../../middleware/rate-limiter";
import {validateRequest} from "../../middleware/validate-request";
import {uploadAvatar} from "./upload.middleware";
import {updateProfileSchema} from "./user.validation";
import {getMe, updateMe, updateMyAvatar} from "./user.controller";

const router = Router();

router.use(authenticate);
// Phase 7A: a validly-signed token doesn't mean the account is still
// active. Applied once here since every route below is "act as the
// current authenticated user."
router.use(requireActiveUser);

router.get("/me", getMe);

router.patch("/me", validateRequest(updateProfileSchema), updateMe);

router.patch("/me/avatar", uploadRateLimiter, uploadAvatar, updateMyAvatar);

export default router;
