import { z } from "zod";

/** Same rule as the server (server/validators): digits, spaces, + ( ) . - */
const PHONE = /^\+?[0-9\s().-]{7,20}$/;

/**
 * Turns what a visitor typed into an international number.
 *  "803 000 7890" / "0803 000 7890" -> "+234 803 000 7890"
 *  "+44 7700 900123" / "0044 7700 900123" -> kept as international (diaspora clients)
 */
export function normalizePhone(raw: string): string {
  const v = raw.trim();
  if (!v) return "";
  if (v.startsWith("+")) return v;
  if (v.startsWith("00")) return `+${v.slice(2).trim()}`;
  if (v.startsWith("0")) return `+234 ${v.slice(1).trim()}`;
  return `+234 ${v}`;
}

/** Flatten zod issues to { field: message } for inline form errors. */
export function fieldErrors(issues: ReadonlyArray<{ path: PropertyKey[]; message: string }>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export const inquirySchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
  email: z.string().trim().email("Please enter a valid email address"),
  phone: z.string().trim().regex(PHONE, "Please enter a valid phone or WhatsApp number"),
  primaryInterest: z.enum(["buy", "rent", "shortlet", "management", "diaspora", "valuation"], {
    message: "Please select a primary interest",
  }),
  preferredLocation: z.string().trim().min(2, "Please select a preferred location"),
  estimatedBudget: z.string().trim().min(1, "Please select an estimated budget range"),
  messageDetails: z.string().trim().optional().default(""),
  consent: z.boolean().refine((val) => val === true, {
    message: "Please consent to advisory contact"
  })
});

export type InquiryInput = z.infer<typeof inquirySchema>;

export const valuationSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required"),
  email: z.string().trim().email("Please provide a valid email address"),
  phone: z.string().trim().regex(PHONE, "A WhatsApp-enabled phone number is required"),
  propertyType: z.string().trim().min(2, "Please select property type"),
  location: z.string().trim().min(2, "Please select the neighborhood"),
  expectedPrice: z.string().trim().optional().default(""),
  saleStrategy: z.enum(["discreet", "public"]).default("discreet"),
  notes: z.string().trim().optional().default("")
});

export type ValuationInput = z.infer<typeof valuationSchema>;

export const subscriptionSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address for the Lagos Dispatch")
});

export type SubscriptionInput = z.infer<typeof subscriptionSchema>;
