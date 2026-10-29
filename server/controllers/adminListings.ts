import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import path from "node:path";
import { failure, success, validationFailure } from "../lib/respond.ts";
import { readListings, writeListings, type Listing } from "../lib/store.ts";
import { canModifyListing, composeImages, newListingId, newListingSlug } from "../lib/listingUtils.ts";
import {
  MAX_IMAGES,
  MAX_IMAGE_BYTES,
  deleteListingImage,
  hasImageSignature,
  isUploadedImage,
  saveListingImage,
} from "../lib/images.ts";
import { listingInputSchema } from "../validators/index.ts";

const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

const uploader = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES, files: MAX_IMAGES, fields: 5, fieldSize: 64 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = ALLOWED_EXT.has(path.extname(file.originalname).toLowerCase()) && ALLOWED_MIME.has(file.mimetype);
    if (ok && file.fieldname === "images") return cb(null, true);
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
  },
});

/** multer wrapper so upload problems come back as our JSON envelope, never an HTML 500. */
export function parseImages(req: Request, res: Response, next: NextFunction) {
  uploader.array("images", MAX_IMAGES)(req, res, (err: unknown) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      const msg =
        err.code === "LIMIT_FILE_SIZE"
          ? `Each photo must be ${MAX_IMAGE_BYTES / 1024 / 1024} MB or smaller.`
          : err.code === "LIMIT_FILE_COUNT"
            ? `You can upload up to ${MAX_IMAGES} photos.`
            : "Only JPG, PNG or WEBP photos are allowed.";
      return failure(res, 400, msg);
    }
    return failure(res, 400, "Could not read the uploaded photos.");
  });
}

/** Admins see every listing; uploaders see (and manage) only their own. */
export function listAdminListings(req: Request, res: Response) {
  const user = req.user!;
  const items = readListings()
    .filter((l) => user.role === "admin" || l.createdBy === user.id)
    .map((l) => ({ ...l, canEdit: canModifyListing(user, l) }));
  return success(res, items);
}

export function getAdminListing(req: Request, res: Response) {
  const listing = readListings().find((l) => l.id === String(req.params.id));
  if (!listing) return failure(res, 404, "Listing not found.");
  if (!canModifyListing(req.user!, listing)) return failure(res, 403, "You can only manage listings you created.");
  return success(res, listing);
}

function parseInput(req: Request, res: Response) {
  let raw: unknown;
  try {
    raw = JSON.parse(String(req.body?.data ?? ""));
  } catch {
    failure(res, 400, "Invalid listing data.");
    return null;
  }
  const parsed = listingInputSchema.safeParse(raw);
  if (!parsed.success) {
    validationFailure(res, parsed.error.issues, "Please check the listing details");
    return null;
  }
  return parsed.data;
}

/** Re-encodes each new photo; on any failure the ones already written are cleaned up. */
async function storeNewImages(files: Express.Multer.File[]): Promise<string[] | "invalid"> {
  const saved: string[] = [];
  try {
    for (const f of files) {
      if (!hasImageSignature(f.buffer)) throw new Error("bad signature");
      saved.push(await saveListingImage(f.buffer));
    }
    return saved;
  } catch {
    saved.forEach(deleteListingImage);
    return "invalid";
  }
}

export async function createListing(req: Request, res: Response) {
  const input = parseInput(req, res);
  if (!input) return;
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  if (files.length < 1) return failure(res, 400, "Please add at least one photo.", { images: "Please add at least one photo." });

  const added = await storeNewImages(files);
  if (added === "invalid") return failure(res, 400, "One of the photos is not a valid image.", { images: "One of the photos is not a valid image." });
  const images = composeImages(input.imageOrder, [], added);
  if (!images || images.length < 1) {
    added.forEach(deleteListingImage);
    return failure(res, 400, "Please add at least one photo.", { images: "Please add at least one photo." });
  }

  const now = new Date().toISOString();
  const { imageOrder: _order, ...fields } = input;
  const listing: Listing = {
    ...fields,
    id: newListingId(),
    slug: newListingSlug(input.title),
    titleBadge: input.titleBadge || "Verified Title",
    image: images[0],
    images,
    createdBy: req.user!.id,
    createdByName: req.user!.name,
    createdAt: now,
    updatedAt: now,
  };
  // Newest first, so a fresh upload shows at the top of the homepage grid.
  writeListings([listing, ...readListings()]);
  return success(res, { ...listing, canEdit: true }, "Listing published.", 201);
}

export async function updateListing(req: Request, res: Response) {
  const all = readListings();
  const existing = all.find((l) => l.id === String(req.params.id));
  if (!existing) return failure(res, 404, "Listing not found.");
  if (!canModifyListing(req.user!, existing)) return failure(res, 403, "You can only manage listings you created.");

  const input = parseInput(req, res);
  if (!input) return;

  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  const added = await storeNewImages(files);
  if (added === "invalid") return failure(res, 400, "One of the photos is not a valid image.", { images: "One of the photos is not a valid image." });

  // Only photos this listing already has can be kept; the order decides the cover.
  const images = composeImages(input.imageOrder, existing.images, added);
  if (!images || images.length < 1 || images.length > MAX_IMAGES) {
    added.forEach(deleteListingImage);
    const msg = images && images.length > MAX_IMAGES ? `You can have up to ${MAX_IMAGES} photos.` : "Please keep at least one photo.";
    return failure(res, 400, msg, { images: msg });
  }

  const { imageOrder: _order, ...fields } = input;
  const updated: Listing = {
    ...existing,
    ...fields,
    titleBadge: input.titleBadge || existing.titleBadge || "Verified Title",
    image: images[0],
    images,
    updatedAt: new Date().toISOString(),
  };
  writeListings(all.map((l) => (l.id === existing.id ? updated : l)));
  existing.images.filter((ref) => !images.includes(ref) && isUploadedImage(ref)).forEach(deleteListingImage);
  return success(res, { ...updated, canEdit: true }, "Listing updated.");
}

export function deleteListing(req: Request, res: Response) {
  const all = readListings();
  const existing = all.find((l) => l.id === String(req.params.id));
  if (!existing) return failure(res, 404, "Listing not found.");
  if (!canModifyListing(req.user!, existing)) return failure(res, 403, "You can only manage listings you created.");
  writeListings(all.filter((l) => l.id !== existing.id));
  existing.images.forEach(deleteListingImage);
  return success(res, null, "Listing deleted.");
}
