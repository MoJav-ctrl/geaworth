import type { NextFunction, Request, RequestHandler, Response } from "express";

/** Express 4 does not catch rejected promises; this forwards them to the JSON error handler. */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => unknown | Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
