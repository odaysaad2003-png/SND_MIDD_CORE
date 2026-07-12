import { isDBConnected } from "../../config/db";

export interface HealthStatus {
  status: "ok" | "degraded";
  uptimeSeconds: number;
  database: "connected" | "disconnected";
  timestamp: string;
}

export interface ReadinessStatus {
  status: "ready";
  database: "connected";
  timestamp: string;
}

export function getHealthStatus(): HealthStatus {
  const dbConnected = isDBConnected();

  return {
    status: dbConnected ? "ok" : "degraded",
    uptimeSeconds: Math.round(process.uptime()),
    database: dbConnected ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  };
}

export function getReadinessStatus(): ReadinessStatus | null {
  if (!isDBConnected()) {
    return null;
  }

  return {
    status: "ready",
    database: "connected",
    timestamp: new Date().toISOString(),
  };
}
