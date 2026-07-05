import express, {Express} from "express";
import cors from "cors";
import helmet from "helmet";
import {env} from "./config/env";
import {requestId} from "./middleware/request-id";
import {generalRateLimiter} from "./middleware/rate-limiter";
import {errorHandler, notFoundHandler} from "./middleware/error-handler";
import healthRoutes from "./modules/health/health.routes";
import authRoutes from "./modules/auth/auth.routes";

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

    // Routes
    app.use("/api/v1/health", healthRoutes);
    app.use("/api/v1/auth", authRoutes);

    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}
