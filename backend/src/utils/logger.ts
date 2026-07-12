type LogLevel = "debug" | "info" | "warn" | "error";

interface LogMeta {
  [key: string]: unknown;
}

const REDACTED_VALUE = "[REDACTED]";
const MAX_LOG_DEPTH = 6;
const MAX_LOG_ARRAY_ITEMS = 50;
const MAX_LOG_STRING_LENGTH = 4_000;

function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function isSensitiveKey(key: string): boolean {
  const normalized = normalizeKey(key);

  return (
    normalized === "authorization" ||
    normalized.includes("password") ||
    normalized.includes("token") ||
    normalized.includes("secret") ||
    normalized.includes("cookie") ||
    normalized === "apikey" ||
    normalized === "mongodburi" ||
    normalized.includes("connectionstring")
  );
}

function sanitizeString(value: string): string {
  const redacted = value
    .replace(/\bBearer\s+[A-Za-z0-9\-._~+/]+=*/gi, "Bearer [REDACTED]")
    .replace(/\b(mongodb(?:\+srv)?:\/\/)([^@\s/]+)@/gi, "$1[REDACTED]@");

  if (redacted.length <= MAX_LOG_STRING_LENGTH) {
    return redacted;
  }

  return `${redacted.slice(0, MAX_LOG_STRING_LENGTH)}...[TRUNCATED]`;
}

function sanitizeValue(
  value: unknown,
  depth = 0,
  visited: WeakSet<object> = new WeakSet<object>()
): unknown {
  if (value === null || typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return sanitizeString(value);
  }

  if (typeof value === "undefined") {
    return undefined;
  }

  if (typeof value === "bigint") {
    return value.toString();
  }

  if (typeof value === "symbol" || typeof value === "function") {
    return String(value);
  }

  if (Buffer.isBuffer(value)) {
    return `[Buffer ${value.length} bytes]`;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: sanitizeString(value.message),
      stack: value.stack ? sanitizeString(value.stack) : undefined,
    };
  }

  if (typeof value !== "object") {
    return String(value);
  }

  if (depth >= MAX_LOG_DEPTH) {
    return "[MAX_DEPTH]";
  }

  if (visited.has(value)) {
    return "[CIRCULAR]";
  }

  visited.add(value);

  if (Array.isArray(value)) {
    return value
      .slice(0, MAX_LOG_ARRAY_ITEMS)
      .map((item) => sanitizeValue(item, depth + 1, visited));
  }

  const sanitized: Record<string, unknown> = {};

  for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
    sanitized[key] = isSensitiveKey(key)
      ? REDACTED_VALUE
      : sanitizeValue(nestedValue, depth + 1, visited);
  }

  return sanitized;
}

function write(level: LogLevel, message: string, meta?: LogMeta): void {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message: sanitizeString(message),
    ...(meta ? { meta: sanitizeValue(meta) } : {}),
  };

  const line = JSON.stringify(entry);

  if (level === "error") {
    // eslint-disable-next-line no-console
    console.error(line);
    return;
  }

  if (level === "warn") {
    // eslint-disable-next-line no-console
    console.warn(line);
    return;
  }

  // eslint-disable-next-line no-console
  console.log(line);
}

export const logger = {
  debug: (message: string, meta?: LogMeta) => write("debug", message, meta),
  info: (message: string, meta?: LogMeta) => write("info", message, meta),
  warn: (message: string, meta?: LogMeta) => write("warn", message, meta),
  error: (message: string, meta?: LogMeta) => write("error", message, meta),
};
