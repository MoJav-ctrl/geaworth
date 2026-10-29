import type { Request, Response } from "express";
import { readListings } from "../lib/store.ts";
import { failure, success, validationFailure } from "../lib/respond.ts";
import { toPublicListing } from "../lib/listingUtils.ts";
import { listingsQuerySchema } from "../validators/index.ts";

const isAll = (v?: string) => !v || ["all", "any"].includes(v.toLowerCase());

export function listListings(req: Request, res: Response) {
  const parsed = listingsQuerySchema.safeParse(req.query);
  if (!parsed.success) return validationFailure(res, parsed.error.issues, "Invalid listing filters");

  const { category, type, area, minPrice, maxPrice, q } = parsed.data;
  let items = readListings();

  if (!isAll(category)) items = items.filter((i) => i.category.toLowerCase() === category!.toLowerCase());
  if (!isAll(type)) items = items.filter((i) => i.type.toLowerCase() === type!.toLowerCase());
  if (!isAll(area)) {
    const a = area!.toLowerCase();
    items = items.filter((i) => i.area.toLowerCase() === a || i.areaName?.toLowerCase().includes(a));
  }
  if (minPrice !== undefined) items = items.filter((i) => i.price >= minPrice);
  if (maxPrice !== undefined) items = items.filter((i) => i.price <= maxPrice);
  if (q) {
    const needle = q.toLowerCase();
    items = items.filter(
      (i) =>
        i.title.toLowerCase().includes(needle) ||
        i.address.toLowerCase().includes(needle) ||
        i.areaName?.toLowerCase().includes(needle) ||
        i.features.some((f) => f.toLowerCase().includes(needle)),
    );
  }
  return res.json({ ok: true, data: items.map(toPublicListing), count: items.length });
}

export function getListing(req: Request, res: Response) {
  const id = String(req.params.id);
  const match = readListings().find((i) => i.id === id || i.slug === id);
  if (!match) return failure(res, 404, "Listing not found");
  return success(res, toPublicListing(match));
}
