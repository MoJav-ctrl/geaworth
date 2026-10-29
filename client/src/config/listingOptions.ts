/**
 * Single source of truth for the choices a listing can have. Used by the homepage search bar
 * AND the admin listing form, so a listing can never be tagged with an area/type the filters don't know.
 */
export interface AreaOption {
  id: string;
  label: string;
}

export const AREA_GROUPS: { group: "Island Corridors" | "Mainland Prime"; areas: AreaOption[] }[] = [
  {
    group: "Island Corridors",
    areas: [
      { id: "ikoyi", label: "Ikoyi" },
      { id: "banana-island", label: "Banana Island" },
      { id: "victoria-island", label: "Victoria Island" },
      { id: "lekki-1", label: "Lekki Phase 1" },
      { id: "ikate", label: "Ikate Elegushi" },
      { id: "chevron", label: "Chevron / Orchid" },
      { id: "oniru", label: "Oniru Axis" },
      { id: "epe", label: "Epe Corridor" },
    ],
  },
  {
    group: "Mainland Prime",
    areas: [
      { id: "ikeja-gra", label: "Ikeja GRA" },
      { id: "magodo", label: "Magodo Phase 2" },
      { id: "yaba", label: "Yaba / Tech Hub" },
      { id: "surulere", label: "Surulere" },
      { id: "gbagada", label: "Gbagada Phase 1 & 2" },
      { id: "ogudu", label: "Ogudu GRA" },
      { id: "opebi", label: "Opebi & Allen" },
    ],
  },
];

export const PROPERTY_TYPES: { id: string; label: string }[] = [
  { id: "duplex", label: "Detached Duplex" },
  { id: "terrace", label: "Terraced House" },
  { id: "luxury-apartment", label: "Luxury Apartment" },
  { id: "penthouse", label: "Penthouse" },
  { id: "shortlet", label: "Serviced Shortlet" },
  { id: "land", label: "Commercial Land" },
];

export const LISTING_CATEGORIES: { id: "sale" | "rent" | "shortlet" | "commercial"; label: string }[] = [
  { id: "sale", label: "For Sale" },
  { id: "rent", label: "For Rent" },
  { id: "shortlet", label: "Shortlet" },
  { id: "commercial", label: "Commercial / Land" },
];

export const PRICE_PERIODS: { id: "" | "yr" | "mo" | "night"; label: string }[] = [
  { id: "", label: "One-off price (sale)" },
  { id: "yr", label: "Per year" },
  { id: "mo", label: "Per month" },
  { id: "night", label: "Per night" },
];

export function findArea(id: string): (AreaOption & { group: string }) | undefined {
  for (const g of AREA_GROUPS) {
    const hit = g.areas.find((a) => a.id === id);
    if (hit) return { ...hit, group: g.group };
  }
  return undefined;
}
