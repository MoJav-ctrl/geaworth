import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { LISTING_MEDIA_DIR } from "./paths.ts";

export const MAX_IMAGES = 12;
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MEDIA_URL_PREFIX = "/media/listings/";

/** Only files we created ourselves: 24 hex chars + .webp. Anything else is never touched on disk. */
const UPLOADED = /^\/media\/listings\/[a-f0-9]{24}\.webp$/;
export const isUploadedImage = (ref: string) => UPLOADED.test(ref);

/** Real file signature check (JPEG, PNG, WEBP) – the client-declared MIME type is not trusted. */
export function hasImageSignature(b: Buffer): boolean {
  const jpeg = b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
  const png = b.subarray(0, 4).toString("hex") === "89504e47";
  const webp = b.subarray(0, 4).toString("latin1") === "RIFF" && b.subarray(8, 12).toString("latin1") === "WEBP";
  return jpeg || png || webp;
}

/** Decode, auto-rotate, downscale to max 1600px and re-encode as WebP. Re-encoding also strips metadata/EXIF. */
export async function saveListingImage(input: Buffer): Promise<string> {
  const out = await sharp(input, { failOn: "error" })
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 78 })
    .toBuffer();
  const name = `${crypto.randomBytes(12).toString("hex")}.webp`;
  fs.mkdirSync(LISTING_MEDIA_DIR, { recursive: true });
  fs.writeFileSync(path.join(LISTING_MEDIA_DIR, name), out);
  return `${MEDIA_URL_PREFIX}${name}`;
}

/**
 * Best-effort cleanup. A file that cannot be removed right now (e.g. still open on Windows) is left behind
 * as a harmless orphan rather than turning an already-saved delete/edit into a server error.
 */
export function deleteListingImage(ref: string): void {
  if (!isUploadedImage(ref)) return;
  try {
    fs.rmSync(path.join(LISTING_MEDIA_DIR, path.basename(ref)), { force: true });
  } catch (err) {
    console.warn(`Could not remove ${path.basename(ref)}:`, (err as Error).message);
  }
}
