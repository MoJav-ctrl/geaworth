import type { Request, Response } from "express";
import { readSubmissions, writeSubmissions } from "../lib/store.ts";
import { notify } from "../lib/mailer.ts";
import { success, validationFailure } from "../lib/respond.ts";
import { subscriptionSchema } from "../validators/index.ts";

export function subscribe(req: Request, res: Response) {
  const parsed = subscriptionSchema.safeParse(req.body);
  if (!parsed.success) return validationFailure(res, parsed.error.issues, "Invalid email address");

  const { email } = parsed.data;
  const store = readSubmissions();

  if (store.subscribers.some((s) => s.email.toLowerCase() === email)) {
    const msg = "You are already subscribed to the Lagos Property Dispatch.";
    return success(res, { duplicate: true, message: msg }, msg, 200);
  }

  store.subscribers.push({ email, subscribedAt: new Date().toISOString() });
  writeSubmissions(store);
  notify("New Lagos Property Dispatch subscriber", { email });

  const msg = "Successfully subscribed to the Lagos Property Dispatch. Welcome aboard.";
  return success(res, { duplicate: false, message: msg }, msg, 201);
}
