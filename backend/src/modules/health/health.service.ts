import { isDBConnected } from "../../config/db";

export interface HealthStatus {
  status: "ok" | "degraded";
  uptimeSeconds: number;
  database: "connected" | "disconnected";
  timestamp: string;
}

/**
 * Framework-agnostic: no req/res here. Just answers "is the system healthy?"
 */
export function getHealthStatus(): HealthStatus {
  const dbConnected = isDBConnected();

  return {
    status: dbConnected ? "ok" : "degraded",
    uptimeSeconds: Math.round(process.uptime()),
    database: dbConnected ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  };
}
