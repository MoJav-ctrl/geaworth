import registry from "./images.json";

/**
 * Image mapping. Every photo on the site is referenced by a KEY from images.json
 * ({ key: { id, alt } }), never by URL. To swap an image, change its entry in images.json
 * (or drop your own files into client/public/images as <key>-<width>.webp).
 */
export type PhotoKey = keyof typeof registry;

export const WIDTHS = [480, 800, 1200, 1600] as const;

const LOCAL = import.meta.env?.VITE_LOCAL_IMAGES === "true";

export function hasPhoto(name: string): name is PhotoKey {
  return name in registry;
}

export function photoAlt(name: string): string {
  return hasPhoto(name) ? registry[name].alt : "";
}

/** URL for one width. Remote mode lets the CDN negotiate AVIF/WebP via auto=format. */
export function photoUrl(name: PhotoKey, width: number, ext: "webp" | "avif" = "webp"): string {
  return LOCAL
    ? `/images/${name}-${width}.${ext}`
    : `https://images.unsplash.com/${registry[name].id}?auto=format&fit=crop&w=${width}&q=75`;
}

export function photoSrcSet(name: PhotoKey, ext: "webp" | "avif" = "webp"): string {
  return WIDTHS.map((w) => `${photoUrl(name, w, ext)} ${w}w`).join(", ");
}

export const LOCAL_IMAGES = LOCAL;
