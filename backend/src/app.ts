import express, {Express} from "express";
import cors from "cors";
import helmet from "helmet";
import {env} from "./config/env";
import {requestId} from "./middleware/request-id";
import {generalRateLimiter} from "./middleware/rate-limiter";
import {errorHandler, notFoundHandler} from "./middleware/error-handler";
import healthRoutes from "./modules/health/health.routes";
import authRoutes from "./modules/auth/auth.routes";

import path from "path";
import usersRoutes from "./modules/users/user.routes";
import postRoutes from "./modules/posts/post.routes";

export function createApp(): Express {
    const app = express();

    app.use(helmet());

    app.use(
        cors({
            origin: env.CORS_ORIGIN,
            credentials: true,
        })
    );

    app.use(express.json());
    app.use(express.urlencoded({extended: true}));

    app.use(requestId);

    app.use("/api", generalRateLimiter);

    app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));


    // Routes
    app.use("/api/v1/health", healthRoutes);
    app.use("/api/v1/auth", authRoutes);
    
    app.use("/api/v1/users", usersRoutes);
    app.use("/api/v1/posts", postRoutes);

    // Error handling

    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}
