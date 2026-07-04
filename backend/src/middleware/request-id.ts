import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

const REQUEST_ID_HEADER = "X-Request-Id";

/**
 * Assigns a unique id to every incoming request so a single request can be
 * traced across middleware/controller/service logs (and in the response,
 * for client-side bug reports). Reuses an inbound id if a trusted upstream
 * (e.g. load balancer) already set one.
 */
export function requestId(req: Request, res: Response, next: NextFunction): void {
  const incoming = req.header(REQUEST_ID_HEADER);
  req.requestId = incoming && incoming.length > 0 ? incoming : uuidv4();
  res.setHeader(REQUEST_ID_HEADER, req.requestId);
  next();
}
