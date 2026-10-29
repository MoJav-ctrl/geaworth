import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

export const SERVER_DIR = path.resolve(here, "..");
export const ROOT_DIR = path.resolve(SERVER_DIR, "..");
/** Default runtime folder (git-ignored). */
export const DATA_DIR = path.join(SERVER_DIR, "data");
/** Seed data shipped with the app (read-only). Copied into STORAGE_DIR on first run. */
export const SEED_DIR = path.join(SERVER_DIR, "seed");
/** Runtime data: listings, users, submissions, uploads, media. Set STORAGE_DIR to a mounted volume in Docker. */
export const STORAGE_DIR = process.env.STORAGE_DIR ? path.resolve(process.env.STORAGE_DIR) : DATA_DIR;
export const UPLOADS_DIR = path.join(STORAGE_DIR, "uploads");
/** Publicly served files (resized listing photos) live under MEDIA_ROOT and are exposed at /media. */
export const MEDIA_ROOT = path.join(STORAGE_DIR, "media");
export const LISTING_MEDIA_DIR = path.join(MEDIA_ROOT, "listings");
export const ASSETS_DIR = path.join(SERVER_DIR, "assets");
export const DIST_DIR = path.join(ROOT_DIR, "dist");
export const CLIENT_DIR = path.join(ROOT_DIR, "client");
export const SUBMISSIONS_FILE = path.join(STORAGE_DIR, "submissions.json");
export const LISTINGS_FILE = path.join(STORAGE_DIR, "listings.json");
export const SEED_LISTINGS_FILE = path.join(SEED_DIR, "listings.json");
export const USERS_FILE = path.join(STORAGE_DIR, "users.json");
export const SESSION_SECRET_FILE = path.join(STORAGE_DIR, ".session-secret");
