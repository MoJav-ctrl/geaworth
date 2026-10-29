/** Listing shape returned by GET /api/listings. Starter data lives in server/seed/listings.json; new ones come from the admin area. */
export interface PropertyListing {
  id: string;
  slug: string;
  title: string;
  area: string;
  areaName: string;
  subMarket: string;
  address: string;
  category: "sale" | "rent" | "shortlet" | "commercial";
  type: string;
  typeName: string;
  price: number;
  period?: string | null;
  beds: number;
  baths: number;
  sqm: number;
  titleBadge: string;
  featured?: boolean;
  features: string[];
  /** Cover image: a key into data/images.json (starter listings) or a /media/listings/… URL (uploaded). */
  image: string;
  images: string[];
  description: string;
  createdAt?: string;
  updatedAt?: string;
}
