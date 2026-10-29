import crypto from "node:crypto";
import type { Listing } from "./store.ts";
import type { User } from "./users.ts";

export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60)
      .replace(/-+$/, "") || "listing"
  );
}

export const newListingId = () => `gw-${Date.now().toString(36)}${crypto.randomBytes(2).toString("hex")}`;

/** Slug = readable title + short random suffix, so two listings with the same title never collide. */
export const newListingSlug = (title: string) => `${slugify(title)}-${crypto.randomBytes(3).toString("hex")}`;

/** Admins manage every listing; uploaders manage only the ones they created. */
export function canModifyListing(user: Pick<User, "id" | "role">, listing: Pick<Listing, "createdBy">): boolean {
  return user.role === "admin" || (!!listing.createdBy && listing.createdBy === user.id);
}

/** What the public site may see: no internal user ids or names. */
export function toPublicListing(listing: Listing): Omit<Listing, "createdBy" | "createdByName"> {
  const { createdBy: _by, createdByName: _name, ...rest } = listing;
  return rest;
}

/**
 * Builds the final photo list from the person's chosen order.
 * Entries are existing image refs (must already belong to the listing) or `new:<n>` (n-th uploaded file).
 * Uploaded files the order forgot to mention are appended, never silently lost.
 * Returns null if the order points at an upload that does not exist or uses one twice.
 */
export function composeImages(order: string[], existing: string[], added: string[]): string[] | null {
  const out: string[] = [];
  const usedNew = new Set<number>();
  for (const entry of order) {
    const m = /^new:(\d+)$/.exec(entry);
    if (m) {
      const i = Number(m[1]);
      if (!added[i] || usedNew.has(i)) return null;
      usedNew.add(i);
      out.push(added[i]);
    } else if (existing.includes(entry) && !out.includes(entry)) {
      out.push(entry);
    }
  }
  added.forEach((url, i) => {
    if (!usedNew.has(i)) out.push(url);
  });
  return out;
}
