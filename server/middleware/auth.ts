import type { NextFunction, Request, Response } from "express";
import { failure } from "../lib/respond.ts";
import { passwordStamp, readSession } from "../lib/session.ts";
import { findUserById, type User } from "../lib/users.ts";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

/** Requires a valid session whose user still exists and whose password has not changed since sign-in. */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const session = readSession(req);
  const user = session ? findUserById(session.uid) : undefined;
  if (!session || !user || session.pv !== passwordStamp(user.passwordHash)) {
    return failure(res, 401, "Please sign in to continue.");
  }
  req.user = user;
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== "admin") return failure(res, 403, "Only an administrator can do that.");
  next();
}

/**
 * Defence in depth on top of SameSite=Strict cookies: a state-changing request that
 * carries an Origin header must come from this site (or an explicitly allowed origin).
 */
export function sameOrigin(req: Request, res: Response, next: NextFunction) {
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") return next();
  const origin = req.get("origin");
  if (!origin) return next();
  const allowed = new Set<string>([req.get("host") ?? ""]);
  for (const o of [process.env.SITE_URL ?? "", ...(process.env.CORS_ORIGINS ?? "").split(",")]) {
    try {
      if (o.trim()) allowed.add(new URL(o.trim()).host);
    } catch {
      /* ignore malformed entries */
    }
  }
  try {
    if (allowed.has(new URL(origin).host)) return next();
  } catch {
    /* fall through */
  }
  return failure(res, 403, "Cross-origin request blocked.");
}
