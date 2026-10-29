import { useEffect } from "react";
import { DEFAULT_SEO, SITE_URL, type SeoEntry } from "../config/seo.ts";

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/** Sets <title>, meta description, Open Graph/Twitter tags and canonical URL for the current page. */
export function useSeo(seo: SeoEntry = DEFAULT_SEO, path?: string) {
  const { title, description } = seo;
  useEffect(() => {
    const url = `${SITE_URL}${path ?? window.location.pathname}`;
    document.title = title;
    setMeta("name", "description", description);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", url);
    setMeta("property", "og:image", `${SITE_URL}/assets/logo.png`);
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = url;
  }, [title, description, path]);
}
