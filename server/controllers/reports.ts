import fs from "node:fs";
import path from "node:path";
import type { Request, Response } from "express";
import { ASSETS_DIR } from "../lib/paths.ts";
import { failure } from "../lib/respond.ts";

const REPORT = path.join(ASSETS_DIR, "lagos-q3-report.pdf");

export function downloadLagosQ3(_req: Request, res: Response) {
  if (!fs.existsSync(REPORT)) return failure(res, 404, "Report not available yet.");
  return res.download(REPORT, "Geaworth-Properties-Lagos-Q3-Report.pdf");
}
