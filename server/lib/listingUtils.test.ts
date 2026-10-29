import test from "node:test";
import assert from "node:assert/strict";
import { canModifyListing, composeImages, slugify, toPublicListing } from "./listingUtils.ts";
import type { Listing } from "./store.ts";

test("slugify makes clean url slugs", () => {
  assert.equal(slugify("5-Bedroom Duplex w/ Pool, Ikate!"), "5-bedroom-duplex-w-pool-ikate");
  assert.equal(slugify("  Café   Résidence "), "cafe-residence");
  assert.equal(slugify("!!!"), "listing");
});

test("admins edit everything, uploaders only their own listings", () => {
  const admin = { id: "a", role: "admin" as const };
  const up = { id: "u1", role: "uploader" as const };
  assert.equal(canModifyListing(admin, {}), true);
  assert.equal(canModifyListing(admin, { createdBy: "u1" }), true);
  assert.equal(canModifyListing(up, { createdBy: "u1" }), true);
  assert.equal(canModifyListing(up, { createdBy: "u2" }), false);
  assert.equal(canModifyListing(up, {}), false, "seed listings (no owner) are admin-only");
});

test("public listings never expose who created them", () => {
  const l = { id: "x", createdBy: "u1", createdByName: "Ada", title: "T" } as unknown as Listing;
  const out = toPublicListing(l) as Record<string, unknown>;
  assert.equal(out.createdBy, undefined);
  assert.equal(out.createdByName, undefined);
  assert.equal(out.title, "T");
});

test("composeImages honours the chosen order, drops removed photos, appends unmentioned uploads", () => {
  const existing = ["a", "b", "c"];
  const added = ["/media/listings/n0.webp", "/media/listings/n1.webp"];
  // new photo made the cover, "b" removed
  assert.deepEqual(composeImages(["new:1", "a", "c", "new:0"], existing, added), ["/media/listings/n1.webp", "a", "c", "/media/listings/n0.webp"]);
  // unknown refs are ignored (cannot smuggle in arbitrary paths)
  assert.deepEqual(composeImages(["/etc/passwd", "a"], existing, []), ["a"]);
  // forgotten upload still appended
  assert.deepEqual(composeImages(["a"], existing, added), ["a", ...added]);
  // duplicate / out-of-range uploads rejected
  assert.equal(composeImages(["new:0", "new:0"], existing, added), null);
  assert.equal(composeImages(["new:5"], existing, added), null);
});
