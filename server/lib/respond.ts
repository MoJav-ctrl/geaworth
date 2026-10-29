import type { Response } from "express";
import { fieldErrors } from "../validators/index.ts";

/** Consistent envelope: { ok: true, data, message? } | { ok: false, error, fields? } */
export function success(res: Response, data: unknown, message?: string, status = 200) {
  return res.status(status).json({ ok: true, ...(message ? { message } : {}), data });
}

export function failure(res: Response, status: number, error: string, fields?: Record<string, string>) {
  return res.status(status).json({ ok: false, error, ...(fields ? { fields } : {}) });
}

export function validationFailure(
  res: Response,
  issues: ReadonlyArray<{ path: PropertyKey[]; message: string }>,
  fallback: string,
) {
  const fields = fieldErrors(issues);
  return failure(res, 400, issues[0]?.message || fallback, fields);
}
