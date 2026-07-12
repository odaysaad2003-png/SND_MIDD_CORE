import mongoose from "mongoose";
import { logger } from "../utils/logger";
import { env } from "./env";

let listenersRegistered = false;

function registerConnectionListeners(): void {
  if (listenersRegistered) {
    return;
  }

  listenersRegistered = true;

  mongoose.connection.on("connected", () => {
    logger.info("MongoDB connected", {
      database: mongoose.connection.name,
      maxPoolSize: env.MONGODB_MAX_POOL_SIZE,
      autoIndex: env.MONGOOSE_AUTO_INDEX,
    });
  });

  mongoose.connection.on("error", (error) => {
    logger.error("MongoDB connection error", {
      message: error instanceof Error ? error.message : String(error),
    });
  });

  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB disconnected");
  });
}

/**
 * Owns the Mongoose connection lifecycle. The raw connection URI is never logged.
 */
export async function connectDB(): Promise<void> {
  mongoose.set("strictQuery", true);
  mongoose.set("bufferCommands", false);
  registerConnectionListeners();

  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: env.MONGODB_SERVER_SELECTION_TIMEOUT_MS,
    maxPoolSize: env.MONGODB_MAX_POOL_SIZE,
    autoIndex: env.MONGOOSE_AUTO_INDEX,
  });
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}

export function isDBConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
