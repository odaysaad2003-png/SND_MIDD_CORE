import "dotenv/config";
import { z } from "zod";

/**
 * Env schema. If any required var is missing/invalid, the process exits
 * immediately at startup instead of failing later at first use.
 * JWT_SECRET / JWT_EXPIRES_IN are validated now (per DEPLOYMENT_NOTES.md)
 * even though Auth v2 does not consume them until Sprint 2.
 */
const envSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(4000),
    MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
    JWT_SECRET: z.string().min(32, "JWT_SECRET is required"),
    JWT_EXPIRES_IN: z.string().min(1, "JWT_EXPIRES_IN is required"),
    CORS_ORIGIN: z.string().min(1, "CORS_ORIGIN is required"),
    BCRYPT_SALT_ROUNDS: z.coerce
    .number()
    .int()
    .min(4)
    .max(15, "BCRYPT_SALT_ROUNDS must be between 4 and 15")
    .default(10),
    REFRESH_TOKEN_SECRET: z.string().min(32, "REFRESH_TOKEN_SECRET is required"),
    REFRESH_TOKEN_EXPIRES_IN: z.string().min(1, "REFRESH_TOKEN_EXPIRES_IN is required"),
    CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME is required"),
    CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),
    CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET is required"),
    CLOUDINARY_ROOT_FOLDER: z.string().min(1, "CLOUDINARY_ROOT_FOLDER is required").default("snd-dev"),
});

function loadEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    // Fail fast: log a clear, human-readable list of what's wrong and exit.
    // Never print process.env itself (could contain secrets).
    // eslint-disable-next-line no-console
    console.error("❌ Invalid or missing environment variables:");
    for (const issue of parsed.error.issues) {
      // eslint-disable-next-line no-console
      console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
    }
    process.exit(1);
  }

  return parsed.data;
}

export const env = loadEnv();

export const isProduction = env.NODE_ENV === "production";
export const isDevelopment = env.NODE_ENV === "development";
export const isTest = env.NODE_ENV === "test";
