import { useCallback, useEffect, useState } from "react";
import type { PropertyListing } from "../data/listings.ts";
import type { SearchFilters } from "../components/ui/SearchBar.tsx";
import { priceBracketToRange } from "../utils/pricing.ts";

type Status = "loading" | "ready" | "error";

const isAll = (v: string) => !v || v === "all" || v === "any";

/** Builds the query string for GET /api/listings from the search UI filters. */
export function buildListingsQuery(filters: SearchFilters): string {
  const p = new URLSearchParams();
  if (!isAll(filters.category)) p.set("category", filters.category);
  if (filters.keyword.trim()) p.set("q", filters.keyword.trim());
  if (!isAll(filters.subMarket)) p.set("area", filters.subMarket);
  if (!isAll(filters.propertyType)) p.set("type", filters.propertyType);
  const { minPrice, maxPrice } = priceBracketToRange(filters.priceBracket);
  if (minPrice !== undefined) p.set("minPrice", String(minPrice));
  if (maxPrice !== undefined) p.set("maxPrice", String(maxPrice));
  return p.toString();
}

/** Listings from the API, re-fetched (debounced for typing) whenever the filters change. */
export function useListings(filters: SearchFilters) {
  const [items, setItems] = useState<PropertyListing[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [attempt, setAttempt] = useState(0);
  const query = buildListingsQuery(filters);

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/listings${query ? `?${query}` : ""}`, { signal: controller.signal });
        const json = await res.json();
        if (!res.ok || !json.ok) throw new Error(json.error || "Request failed");
        setItems(json.data as PropertyListing[]);
        setStatus("ready");
      } catch (err) {
        if ((err as Error).name !== "AbortError") setStatus("error");
      }
    }, 200);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { items, status, retry };
}

/** A single listing by id or slug from GET /api/listings/:id. */
export function useListing(id: string | undefined) {
  const [listing, setListing] = useState<PropertyListing | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    setStatus("loading");
    fetch(`/api/listings/${encodeURIComponent(id)}`, { signal: controller.signal })
      .then(async (res) => {
        const json = await res.json();
        if (res.status === 404) {
          setListing(null);
          setStatus("ready");
          return;
        }
        if (!res.ok || !json.ok) throw new Error(json.error || "Request failed");
        setListing(json.data as PropertyListing);
        setStatus("ready");
      })
      .catch((err) => {
        if ((err as Error).name !== "AbortError") setStatus("error");
      });
    return () => controller.abort();
  }, [id]);

  return { listing, status };
}
