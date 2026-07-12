import { Server } from "http";
import { createApp } from "./app";
import { connectDB, disconnectDB } from "./config/db";
import { env } from "./config/env";
import { logger } from "./utils/logger";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function registerShutdownHandlers(server: Server): void {
  let isShuttingDown = false;

  const shutdown = (reason: string, requestedExitCode = 0): void => {
    if (isShuttingDown) {
      logger.warn("Shutdown already in progress", { reason });
      return;
    }

    isShuttingDown = true;
    logger.info("Graceful shutdown started", {
      reason,
      timeoutMs: env.SHUTDOWN_TIMEOUT_MS,
    });

    const forceShutdownTimer = setTimeout(() => {
      logger.error("Graceful shutdown timed out; forcing connection closure", {
        reason,
        timeoutMs: env.SHUTDOWN_TIMEOUT_MS,
      });
      server.closeAllConnections();
      process.exit(1);
    }, env.SHUTDOWN_TIMEOUT_MS);

    forceShutdownTimer.unref();

    server.close((serverCloseError?: Error) => {
      void (async () => {
        let exitCode = requestedExitCode;

        if (serverCloseError) {
          exitCode = 1;
          logger.error("HTTP server failed to close cleanly", {
            reason,
            message: serverCloseError.message,
          });
        }

        try {
          await disconnectDB();
        } catch (error) {
          exitCode = 1;
          logger.error("MongoDB disconnect failed during shutdown", {
            reason,
            message: getErrorMessage(error),
          });
        }

        clearTimeout(forceShutdownTimer);
        logger.info("Graceful shutdown completed", { reason, exitCode });
        process.exit(exitCode);
      })();
    });
  };

  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));

  process.once("unhandledRejection", (reason) => {
    logger.error("Unhandled promise rejection", {
      message: getErrorMessage(reason),
    });
    shutdown("unhandledRejection", 1);
  });

  process.once("uncaughtException", (error) => {
    logger.error("Uncaught exception", {
      message: getErrorMessage(error),
      stack: error.stack,
    });
    shutdown("uncaughtException", 1);
  });
}

async function start(): Promise<void> {
  await connectDB();

  const app = createApp();
  const server = app.listen(env.PORT, "0.0.0.0", () => {
    logger.info(`Server listening on port ${env.PORT}`, {
      env: env.NODE_ENV,
      trustProxyHops: env.TRUST_PROXY_HOPS,
      corsOrigins: env.CORS_ORIGINS.length,
      mongoMaxPoolSize: env.MONGODB_MAX_POOL_SIZE,
      mongooseAutoIndex: env.MONGOOSE_AUTO_INDEX,
    });
  });

  registerShutdownHandlers(server);
}

start().catch((error) => {
  logger.error("Failed to start server", {
    message: getErrorMessage(error),
  });
  process.exit(1);
});
