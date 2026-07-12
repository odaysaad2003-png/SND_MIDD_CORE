import path from "path";
import cors from "cors";
import express, { Express } from "express";
import helmet from "helmet";
import { corsOptions } from "./config/cors";
import { env, isProduction } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";
import { generalRateLimiter } from "./middleware/rate-limiter";
import { requestId } from "./middleware/request-id";
import { requestLogger } from "./middleware/request-logger";
import adminRoutes from "./modules/admin/admin.routes";
import authRoutes from "./modules/auth/auth.routes";
import commentsRoutes from "./modules/comments/comment.routes";
import healthRoutes from "./modules/health/health.routes";
import postRoutes from "./modules/posts/post.routes";
import reportsRoutes from "./modules/reports/report.routes";
import savesRoutes from "./modules/saves/save.routes";
import usersRoutes from "./modules/users/user.routes";

const JSON_BODY_LIMIT = "1mb";
const URL_ENCODED_BODY_LIMIT = "100kb";
const URL_ENCODED_PARAMETER_LIMIT = 100;

export function createApp(): Express {
  const app = express();

  app.disable("x-powered-by");

  if (env.TRUST_PROXY_HOPS > 0) {
    app.set("trust proxy", env.TRUST_PROXY_HOPS);
  }

  app.use(requestId);
  app.use(requestLogger);
  app.use(helmet());

  app.use(cors(corsOptions));

  // Operational probes must remain reachable even when the API limiter is saturated.
  app.use("/api/v1/health", healthRoutes);

  app.use("/api", generalRateLimiter);

  app.use(express.json({ limit: JSON_BODY_LIMIT, strict: true }));
  app.use(
    express.urlencoded({
      extended: true,
      limit: URL_ENCODED_BODY_LIMIT,
      parameterLimit: URL_ENCODED_PARAMETER_LIMIT,
    })
  );

  if (!isProduction) {
    app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
  }

  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/users", usersRoutes);
  app.use("/api/v1/posts", postRoutes);
  app.use("/api/v1/comments", commentsRoutes);
  app.use("/api/v1/saves", savesRoutes);
  app.use("/api/v1/reports", reportsRoutes);
  app.use("/api/v1/admin", adminRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
