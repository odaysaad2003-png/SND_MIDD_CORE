import {Router} from "express";
import * as authController from "./auth.controller";
import {validateRequest} from "../../middleware/validate-request";
import {authenticate} from "../../middleware/authenticate";
import {authRateLimiter, authSessionRateLimiter} from "../../middleware/rate-limiter";
import {requireJsonContentType} from "../../middleware/require-json";
import {loginSchema, registerSchema} from "./auth.validation";
import {requireRefreshCookie, requireRefreshCsrf} from "./auth-session.middleware";

const router = Router();

router.post(
    "/register",
    authRateLimiter,
    requireJsonContentType,
    validateRequest(registerSchema),
    authController.register
);

router.post(
    "/login",
    authRateLimiter,
    requireJsonContentType,
    validateRequest(loginSchema),
    authController.login
);

router.get(
    "/csrf",
    authSessionRateLimiter,
    requireRefreshCookie,
    authController.csrf
);

router.post(
    "/refresh",
    authSessionRateLimiter,
    requireRefreshCsrf,
    authController.refresh
);

router.post(
    "/logout",
    authSessionRateLimiter,
    requireRefreshCsrf,
    authController.logout
);

router.get("/me", authenticate, authController.me);

export default router;
