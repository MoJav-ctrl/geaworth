import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
process.env.STORAGE_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "gw-"));
const { listingInputSchema, createUserSchema, loginSchema } = await import("../validators/index.ts");
const images = await import("./images.ts");
const store = await import("./store.ts");
import sharp from "sharp";

const good = { title: "  4 Bedroom <b>Duplex</b> Ikoyi ", category: "sale", type: "duplex", typeName: "Detached Duplex", area: "ikoyi", areaName: "Ikoyi", subMarket: "Island Corridors", address: "12 Bourdillon Road, Ikoyi", price: "350000000", period: null, beds: "4", baths: 5, sqm: 420, titleBadge: "", featured: true, features: ["Pool", "  ", "BQ"], description: "A beautifully finished home with generous grounds.", imageOrder: [] };

test("listing schema accepts good input and cleans it", () => {
  const r = listingInputSchema.safeParse(good);
  assert.ok(r.success, JSON.stringify(r.error?.issues));
  assert.equal(r.data.price, 350000000);
  assert.deepEqual(r.data.features, ["Pool", "BQ"]);
  assert.ok(!r.data.title.includes("<"), "html stripped from title");
  assert.equal(r.data.period, null);
});
test("listing schema rejects bad input with friendly messages", () => {
  const r = listingInputSchema.safeParse({ ...good, price: 0, category: "hotel", beds: -1, description: "short", subMarket: "x" });
  assert.ok(!r.success);
  const msgs = r.error.issues.map((i) => i.message);
  assert.ok(msgs.includes("Enter a price greater than 0"), msgs.join("|"));
  assert.ok(msgs.includes("Please select a category"));
  assert.ok(msgs.includes("Description must be at least 20 characters"));
});
test("user + login schemas", () => {
  assert.ok(createUserSchema.safeParse({ name: "Ada", email: "ADA@Example.com", password: "long-enough-pw" }).success);
  assert.ok(!createUserSchema.safeParse({ name: "Ada", email: "ada@example.com", password: "short" }).success);
  assert.equal(loginSchema.parse({ email: " A@B.co ", password: "x" }).email, "a@b.co");
});
test("image pipeline: re-encodes to webp, caps size, rejects junk, safe delete", async () => {
  const png = await sharp({ create: { width: 3000, height: 2000, channels: 3, background: "#808080" } }).png().toBuffer();
  assert.ok(images.hasImageSignature(png));
  assert.ok(!images.hasImageSignature(Buffer.from("<?php echo 1;")));
  const url = await images.saveListingImage(png);
  assert.ok(images.isUploadedImage(url), url);
  const file = path.join(process.env.STORAGE_DIR!, "media/listings", path.basename(url));
  // Read into memory first: sharp(path) keeps the file open, and on Windows an open file cannot be deleted.
  const meta = await sharp(fs.readFileSync(file)).metadata();
  assert.equal(meta.format, "webp"); assert.equal(meta.width, 1600);
  await assert.rejects(() => images.saveListingImage(Buffer.from("not an image")));
  images.deleteListingImage("/media/listings/../../users.json"); // traversal ignored
  images.deleteListingImage(url);
  assert.ok(!fs.existsSync(file));
});
test("store seeds listings into STORAGE_DIR on first read and persists writes", () => {
  const first = store.readListings();
  assert.equal(first.length, 9);
  assert.ok(fs.existsSync(path.join(process.env.STORAGE_DIR!, "listings.json")));
  store.writeListings([{ ...first[0], title: "Changed" }, ...first.slice(1)]);
  assert.equal(JSON.parse(fs.readFileSync(path.join(process.env.STORAGE_DIR!, "listings.json"), "utf8"))[0].title, "Changed");
});
