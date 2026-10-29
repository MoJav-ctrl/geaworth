import { LOCAL_IMAGES, hasPhoto, photoAlt, photoSrcSet, photoUrl } from "../../data/images.ts";

interface PhotoProps {
  /** Key from data/images.json (or an absolute URL / path as a last resort). */
  name: string;
  alt?: string;
  className?: string;
  /** Intrinsic size – reserves the aspect ratio so nothing shifts while loading. */
  width?: number;
  height?: number;
  /** Responsive hint: how wide the image renders at each breakpoint. */
  sizes?: string;
  /** Above-the-fold hero only: loads eagerly with high priority. Everything else is lazy. */
  priority?: boolean;
}

export function Photo({
  name,
  alt,
  className,
  width = 1200,
  height = 800,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  priority = false,
}: PhotoProps) {
  const common = {
    alt: alt ?? photoAlt(name),
    className,
    width,
    height,
    decoding: "async" as const,
    loading: priority ? ("eager" as const) : ("lazy" as const),
    fetchPriority: priority ? ("high" as const) : ("auto" as const),
  };

  // Unknown key (e.g. a raw URL coming from the API): render as-is.
  if (!hasPhoto(name)) return <img src={name} {...common} />;

  const img = <img src={photoUrl(name, 800)} srcSet={photoSrcSet(name)} sizes={sizes} {...common} />;
  if (!LOCAL_IMAGES) return img;

  // Local files: AVIF first, WebP fallback.
  return (
    <picture>
      <source type="image/avif" srcSet={photoSrcSet(name, "avif")} sizes={sizes} />
      <source type="image/webp" srcSet={photoSrcSet(name, "webp")} sizes={sizes} />
      {img}
    </picture>
  );
}
