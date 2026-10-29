import type { Request, Response } from "express";
import { success } from "../lib/respond.ts";

export function health(_req: Request, res: Response) {
  success(res, {
    service: "Geaworth Properties API",
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}
