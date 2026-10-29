import type { Request, Response } from "express";
import { readSubmissions } from "../lib/store.ts";
import { success } from "../lib/respond.ts";

const newestFirst = <T extends Record<string, unknown>>(rows: T[]) =>
  [...rows].sort((a, b) => String(b.receivedAt ?? b.subscribedAt ?? "").localeCompare(String(a.receivedAt ?? a.subscribedAt ?? "")));

/** Admin-only read-only view of inquiries, valuation requests and newsletter sign-ups. */
export function getSubmissions(_req: Request, res: Response) {
  const s = readSubmissions();
  return success(res, {
    inquiries: newestFirst(s.inquiries),
    valuations: newestFirst(s.valuations),
    subscribers: newestFirst(s.subscribers as unknown as Record<string, unknown>[]),
  });
}
