import { Request, Response } from "express";
import { sendSuccess } from "../../utils/api-response";
import { AppError } from "../../utils/app-error";
import { asyncHandler } from "../../utils/async-handler";
import { getHealthStatus, getReadinessStatus } from "./health.service";

function disableHealthCaching(res: Response): void {
  res.setHeader("Cache-Control", "no-store");
}

export const getHealth = asyncHandler(async (_req: Request, res: Response) => {
  disableHealthCaching(res);
  sendSuccess(res, { data: getHealthStatus() });
});

export const getReadiness = asyncHandler(async (_req: Request, res: Response) => {
  disableHealthCaching(res);

  const readiness = getReadinessStatus();

  if (!readiness) {
    throw AppError.serviceUnavailable("Service is not ready");
  }

  sendSuccess(res, { data: readiness });
});
