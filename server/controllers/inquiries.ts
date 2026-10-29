import type { Request, Response } from "express";
import { readSubmissions, writeSubmissions } from "../lib/store.ts";
import { notify } from "../lib/mailer.ts";
import { success, validationFailure } from "../lib/respond.ts";
import { inquirySchema } from "../validators/index.ts";

const MESSAGE =
  "Inquiry Received. A dedicated Geaworth property director will reach out via WhatsApp and email within 45 minutes with verified matching dossiers.";

export function createInquiry(req: Request, res: Response) {
  const parsed = inquirySchema.safeParse(req.body);
  if (!parsed.success) return validationFailure(res, parsed.error.issues, "Invalid inquiry data submitted");

  const store = readSubmissions();
  const record = {
    id: `inq-${Date.now()}`,
    ...parsed.data,
    receivedAt: new Date().toISOString(),
    status: "new",
  };
  store.inquiries.push(record);
  writeSubmissions(store);
  notify(`New inquiry – ${record.fullName} (${record.primaryInterest})`, record);

  return success(res, { id: record.id, message: MESSAGE }, MESSAGE, 201);
}
