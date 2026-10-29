import { z } from "zod";
import { cleanText } from "../lib/sanitize.ts";

/** Sanitised required string. */
const text = (min: number, message: string, max = 2000) =>
  z.string().transform(cleanText).pipe(z.string().min(min, message).max(max, "That entry is too long"));

/** Sanitised optional string (defaults to ""). */
const optionalText = (max = 4000) =>
  z.string().optional().default("").transform(cleanText).pipe(z.string().max(max, "That entry is too long"));

const email = (message: string) =>
  z.string().trim().toLowerCase().pipe(z.string().email(message).max(254));

const phone = (message: string) =>
  z
    .string()
    .trim()
    .regex(/^\+?[0-9\s().-]{7,20}$/, message);

export const INTERESTS = ["buy", "rent", "shortlet", "management", "diaspora", "valuation"] as const;

export const inquirySchema = z.object({
  fullName: text(2, "Full name must be at least 2 characters", 120),
  email: email("Please enter a valid email address"),
  phone: phone("Please enter a valid phone or WhatsApp number"),
  primaryInterest: z.enum(INTERESTS, { message: "Please select a primary interest" }),
  preferredLocation: text(2, "Please select a preferred location", 120),
  estimatedBudget: text(1, "Please select an estimated budget range", 60),
  messageDetails: optionalText(),
  consent: z.boolean().refine((v) => v === true, { message: "Please consent to advisory contact" }),
});

export const valuationSchema = z.object({
  fullName: text(2, "Full name is required", 120),
  email: email("Please provide a valid email address"),
  phone: phone("A WhatsApp-enabled phone number is required"),
  propertyType: text(2, "Please select a property type", 120),
  location: text(2, "Please select the location", 120),
  expectedPrice: optionalText(40),
  saleStrategy: z.enum(["discreet", "public"]).default("discreet"),
  notes: optionalText(),
});

export const subscriptionSchema = z.object({
  email: email("Please enter a valid email address for the Lagos Dispatch"),
});

const priceParam = z.coerce.number().int().nonnegative().optional();

export const listingsQuerySchema = z.object({
  category: z.string().trim().max(40).optional(),
  type: z.string().trim().max(40).optional(),
  area: z.string().trim().max(60).optional(),
  minPrice: priceParam,
  maxPrice: priceParam,
  q: z.string().trim().max(100).optional(),
});

/** Flatten zod issues to { field: message } for inline form errors. */
export function fieldErrors(issues: ReadonlyArray<{ path: PropertyKey[]; message: string }>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Admin area                                                          */
/* ------------------------------------------------------------------ */

export const passwordSchema = z
  .string()
  .min(10, "Password must be at least 10 characters")
  .max(128, "Password must be 128 characters or fewer");

export const loginSchema = z.object({
  email: email("Please enter a valid email address"),
  password: z.string().min(1, "Please enter your password").max(200),
});

export const createUserSchema = z.object({
  name: text(2, "Name must be at least 2 characters", 80),
  email: email("Please enter a valid email address"),
  password: passwordSchema,
});

export const resetPasswordSchema = z.object({ newPassword: passwordSchema });

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Please enter your current password").max(200),
  newPassword: passwordSchema,
});

export const LISTING_CATEGORIES = ["sale", "rent", "shortlet", "commercial"] as const;
export const LISTING_PERIODS = ["yr", "mo", "night"] as const;
export const SUB_MARKETS = ["Island Corridors", "Mainland Prime"] as const;

const slug = (message: string) => z.string().trim().toLowerCase().regex(/^[a-z0-9-]{2,40}$/, message);
const count = (message: string, max: number) =>
  z.coerce.number({ message }).int(message).min(0, message).max(max, message);

/** Body of POST/PUT /api/admin/listings (sent as JSON in the multipart `data` field). */
export const listingInputSchema = z.object({
  title: text(5, "Title must be at least 5 characters", 140),
  category: z.enum(LISTING_CATEGORIES, { message: "Please select a category" }),
  type: slug("Please select a property type"),
  typeName: text(2, "Please select a property type", 60),
  area: slug("Please select an area"),
  areaName: text(2, "Please select an area", 80),
  subMarket: z.enum(SUB_MARKETS, { message: "Please select an area" }),
  address: text(5, "Please enter the street address", 200),
  price: z.coerce
    .number({ message: "Enter a valid price" })
    .int("Enter a valid price")
    .positive("Enter a price greater than 0")
    .max(100_000_000_000_000, "That price is too high"),
  period: z.enum(LISTING_PERIODS).nullable().default(null),
  beds: count("Enter the number of bedrooms", 50),
  baths: count("Enter the number of bathrooms", 50),
  sqm: count("Enter the size in square metres", 1_000_000),
  titleBadge: optionalText(40),
  featured: z.boolean().default(false),
  features: z
    .array(z.string())
    .max(20, "Add up to 20 features")
    .transform((list) => list.map(cleanText).filter(Boolean))
    .pipe(z.array(z.string().max(60, "Each feature must be 60 characters or fewer"))),
  description: text(20, "Description must be at least 20 characters", 4000),
  /**
   * Final photo order (first = cover). Each entry is either an existing image ref (edit only)
   * or `new:<n>` pointing at the n-th uploaded file. Anything omitted is dropped (existing) or appended (new).
   */
  imageOrder: z.array(z.string().max(200)).max(24).default([]),
});

export type ListingInput = z.infer<typeof listingInputSchema>;
