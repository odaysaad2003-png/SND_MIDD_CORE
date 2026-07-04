import { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler";
import { sendSuccess } from "../../utils/api-response";
import { getHealthStatus } from "./health.service";

export const getHealth = asyncHandler(async (_req: Request, res: Response) => {
  const health = getHealthStatus();
  sendSuccess(res, { data: health });
});
