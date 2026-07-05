import {Router} from "express";
import {authenticate} from "../../middleware/authenticate";
import {validateRequest} from "../../middleware/validate-request";
import {uploadAvatar} from "../../middleware/upload.middleware";
import {updateProfileSchema} from "./user.validation";
import {getMe, updateMe, updateMyAvatar} from "./user.controller";

const router = Router();

router.use(authenticate);

router.get("/me", getMe);

router.patch("/me", validateRequest(updateProfileSchema), updateMe);

router.patch("/me/avatar", uploadAvatar, updateMyAvatar);

export default router;
