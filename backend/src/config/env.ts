import "dotenv/config";
import { z } from "zod";

const booleanStringSchema = z.enum(["true", "false"]);

function emptyStringToUndefined(value: unknown): unknown {
  return typeof value === "string" && value.trim() === "" ? undefined : value;
}

function splitCorsOrigins(value: string): string[] {
  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function normalizeCorsOrigins(origins: string[]): string[] {
  return origins.map((origin) => new URL(origin).origin);
}

function isValidHttpOrigin(value: string): boolean {
  try {
    const url = new URL(value);

    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      url.username === "" &&
      url.password === "" &&
      url.pathname === "/" &&
      url.search === "" &&
      url.hash === ""
    );
  } catch {
    return false;
  }
}

/**
 * Environment variables are validated before the application starts.
 * Secrets are never printed when validation fails.
 */
const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().max(65_535).default(4000),
    TRUST_PROXY_HOPS: z.coerce.number().int().min(0).max(5).default(0),
    SHUTDOWN_TIMEOUT_MS: z.coerce.number().int().min(1_000).max(60_000).default(10_000),

    MONGODB_URI: z
      .string()
      .min(1, "MONGODB_URI is required")
      .refine(
        (value) => value.startsWith("mongodb://") || value.startsWith("mongodb+srv://"),
        "MONGODB_URI must use mongodb:// or mongodb+srv://"
      ),
    MONGODB_SERVER_SELECTION_TIMEOUT_MS: z.coerce
      .number()
      .int()
      .min(1_000)
      .max(60_000)
      .default(5_000),
    MONGODB_MAX_POOL_SIZE: z.coerce.number().int().min(1).max(100).default(20),
    MONGOOSE_AUTO_INDEX: booleanStringSchema.optional(),

    JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
    JWT_EXPIRES_IN: z.string().min(1, "JWT_EXPIRES_IN is required"),
    REFRESH_TOKEN_SECRET: z
      .string()
      .min(32, "REFRESH_TOKEN_SECRET must be at least 32 characters"),
    REFRESH_TOKEN_EXPIRES_IN: z.string().min(1, "REFRESH_TOKEN_EXPIRES_IN is required"),

    AUTH_REFRESH_COOKIE_NAME: z
      .string()
      .regex(/^[A-Za-z0-9_-]{1,64}$/, "AUTH_REFRESH_COOKIE_NAME contains invalid characters")
      .default("snd_refresh"),
    AUTH_COOKIE_SECURE: booleanStringSchema.optional(),
    AUTH_COOKIE_SAME_SITE: z.enum(["strict", "lax", "none"]).default("lax"),
    AUTH_COOKIE_DOMAIN: z.preprocess(
      emptyStringToUndefined,
      z.string().trim().min(1).max(253).optional()
    ),

    CORS_ORIGIN: z.string().min(1, "CORS_ORIGIN is required"),
    CORS_MAX_AGE_SECONDS: z.coerce.number().int().min(0).max(86_400).default(600),

    BCRYPT_SALT_ROUNDS: z.coerce
      .number()
      .int()
      .min(4)
      .max(15, "BCRYPT_SALT_ROUNDS must be between 4 and 15")
      .default(10),

    CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME is required"),
    CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),
    CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET is required"),
    CLOUDINARY_ROOT_FOLDER: z.string().min(1, "CLOUDINARY_ROOT_FOLDER is required"),
  })
  .superRefine((values, ctx) => {
    if (values.JWT_SECRET === values.REFRESH_TOKEN_SECRET) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["REFRESH_TOKEN_SECRET"],
        message: "Access-token and refresh-token secrets must be different",
      });
    }

    const cookieSecure =
      values.AUTH_COOKIE_SECURE === undefined
        ? values.NODE_ENV === "production"
        : values.AUTH_COOKIE_SECURE === "true";

    if (values.NODE_ENV === "production" && !cookieSecure) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["AUTH_COOKIE_SECURE"],
        message: "AUTH_COOKIE_SECURE must be true in production",
      });
    }

    if (values.AUTH_COOKIE_SAME_SITE === "none" && !cookieSecure) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["AUTH_COOKIE_SAME_SITE"],
        message: "SameSite=None requires secure cookies",
      });
    }

    if (
      values.AUTH_COOKIE_DOMAIN &&
      (values.AUTH_COOKIE_DOMAIN.includes("://") ||
        values.AUTH_COOKIE_DOMAIN.includes("/") ||
        values.AUTH_COOKIE_DOMAIN.includes(":"))
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["AUTH_COOKIE_DOMAIN"],
        message: "AUTH_COOKIE_DOMAIN must be a hostname without protocol, path, or port",
      });
    }

    const origins = splitCorsOrigins(values.CORS_ORIGIN);

    if (origins.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["CORS_ORIGIN"],
        message: "At least one CORS origin is required",
      });
      return;
    }

    for (const origin of origins) {
      if (origin === "*" || !isValidHttpOrigin(origin)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["CORS_ORIGIN"],
          message: `Invalid CORS origin: ${origin}`,
        });
      }
    }
  });

function loadEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    // eslint-disable-next-line no-console
    console.error("Invalid or missing environment variables:");
    for (const issue of parsed.error.issues) {
      // eslint-disable-next-line no-console
      console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
    }
    process.exit(1);
  }

  const autoIndexFromEnv = parsed.data.MONGOOSE_AUTO_INDEX;
  const cookieSecureFromEnv = parsed.data.AUTH_COOKIE_SECURE;

  return {
    ...parsed.data,
    AUTH_COOKIE_SECURE:
      cookieSecureFromEnv === undefined
        ? parsed.data.NODE_ENV === "production"
        : cookieSecureFromEnv === "true",
    AUTH_COOKIE_DOMAIN: parsed.data.AUTH_COOKIE_DOMAIN || undefined,
    CORS_ORIGINS: normalizeCorsOrigins(splitCorsOrigins(parsed.data.CORS_ORIGIN)),
    MONGOOSE_AUTO_INDEX:
      autoIndexFromEnv === undefined
        ? parsed.data.NODE_ENV !== "production"
        : autoIndexFromEnv === "true",
  };
}

export const env = loadEnv();

export const isProduction = env.NODE_ENV === "production";
export const isDevelopment = env.NODE_ENV === "development";
export const isTest = env.NODE_ENV === "test";
