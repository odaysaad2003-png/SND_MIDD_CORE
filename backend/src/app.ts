import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env";
import { requestId } from "./middleware/request-id";
import { generalRateLimiter } from "./middleware/rate-limiter";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";
import healthRoutes from "./modules/health/health.routes";

/**
 * Builds and returns the Express app. Does NOT call app.listen() —
 * that's server.ts's job. Keeping these separate lets tests import the
 * app without starting a real network listener.
 */
export function createApp(): Express {
  const app = express();

  // Security headers (Sprint 1 requirement)
  app.use(helmet());

  // CORS: origin comes from env, never wildcard when credentials matter
  // (SECURITY_RULES.md / DEPLOYMENT_NOTES.md)
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request tracing id, available to every downstream handler/log line
  app.use(requestId);

  // Baseline rate limiting on all API routes
  app.use("/api", generalRateLimiter);

  // Routes
  app.use("/api/v1/health", healthRoutes);

  // 404 for anything unmatched, then the global error handler
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
