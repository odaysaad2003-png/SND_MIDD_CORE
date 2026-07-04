import mongoose from "mongoose";
import { env } from "./env";
import { logger } from "../utils/logger";

/**
 * Single place that owns the Mongoose connection.
 * Never logs the raw MONGODB_URI (it may contain credentials) —
 * only host/db name are logged.
 */
export async function connectDB(): Promise<void> {
  mongoose.set("strictQuery", true);

  mongoose.connection.on("connected", () => {
    const { host, name } = mongoose.connection;
    logger.info("✅ MongoDB connected successfully");
  });

  mongoose.connection.on("error", (err) => {
    logger.error("MongoDB connection error", { message: err?.message });
  });

  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB disconnected");
  });

  // Fail fast instead of hanging indefinitely if Mongo is unreachable.
  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  });
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}

export function isDBConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
