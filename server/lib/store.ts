import { LISTINGS_FILE, SEED_LISTINGS_FILE, SUBMISSIONS_FILE } from "./paths.ts";
import { readJson, writeJsonAtomic } from "./jsonFile.ts";

export interface Submissions {
  inquiries: Record<string, unknown>[];
  valuations: Record<string, unknown>[];
  subscribers: { email: string; subscribedAt: string }[];
}

const EMPTY = (): Submissions => ({ inquiries: [], valuations: [], subscribers: [] });

export function readSubmissions(): Submissions {
  return { ...EMPTY(), ...readJson<Partial<Submissions>>(SUBMISSIONS_FILE, EMPTY) };
}

export function writeSubmissions(data: Submissions): void {
  writeJsonAtomic(SUBMISSIONS_FILE, data);
}

export interface Listing {
  id: string;
  slug: string;
  title: string;
  area: string;
  areaName?: string;
  subMarket?: string;
  address: string;
  category: string;
  type: string;
  typeName?: string;
  price: number;
  period: string | null;
  beds: number;
  baths: number;
  sqm: number;
  titleBadge: string;
  featured?: boolean;
  features: string[];
  /** Cover image (first of `images`). */
  image?: string;
  /** Registry keys (seed data) or /media/listings/<file>.webp URLs (uploaded). */
  images: string[];
  description: string;
  /** Set for listings created through the admin area; seed listings have none. */
  createdBy?: string;
  createdByName?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

let listingsCache: Listing[] | null = null;

/** Listings live in STORAGE_DIR/listings.json; the first run copies the seed set there. */
export function readListings(): Listing[] {
  if (listingsCache) return listingsCache;
  const seed = () => readJson<Listing[]>(SEED_LISTINGS_FILE, () => []);
  let items: Listing[];
  if (readJson<Listing[] | null>(LISTINGS_FILE, () => null) === null) {
    items = seed();
    writeJsonAtomic(LISTINGS_FILE, items);
  } else {
    items = readJson<Listing[]>(LISTINGS_FILE, seed);
  }
  listingsCache = items;
  return listingsCache;
}

export function writeListings(items: Listing[]): void {
  writeJsonAtomic(LISTINGS_FILE, items);
  listingsCache = items;
}
