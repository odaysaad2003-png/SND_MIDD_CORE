import type { CorsOptions } from "cors";
import { AppError } from "../utils/app-error";
import { env } from "./env";

const REQUEST_ID_HEADER = "X-Request-Id";
const allowedOrigins = new Set(env.CORS_ORIGINS);

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    // Requests without an Origin header include health probes, Postman,
    // server-to-server calls, and same-origin non-browser clients.
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    callback(AppError.forbidden("Origin is not allowed by CORS"));
  },
  credentials: true,
  exposedHeaders: [REQUEST_ID_HEADER],
  maxAge: env.CORS_MAX_AGE_SECONDS,
  optionsSuccessStatus: 204,
};
