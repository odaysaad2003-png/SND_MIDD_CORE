import {Router} from "express";
import * as authController from "./auth.controller";
import {validateRequest} from "../../middleware/validate-request";
import {authenticate} from "../../middleware/authenticate";
import {authRateLimiter} from "../../middleware/rate-limiter";
import {registerSchema, loginSchema, refreshSchema, logoutSchema} from "./auth.validation";

const router = Router();

router.post("/register", authRateLimiter, validateRequest(registerSchema), authController.register);

router.post("/login", authRateLimiter, validateRequest(loginSchema), authController.login);

router.post("/refresh", validateRequest(refreshSchema), authController.refresh);
router.post("/logout", validateRequest(logoutSchema), authController.logout);

router.get("/me", authenticate, authController.me);

export default router;
