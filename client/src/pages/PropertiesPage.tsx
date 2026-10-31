import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import type { PropertyListing } from "../data/listings.ts";
import { useListings } from "../hooks/useListings.ts";
import { PropertyCard } from "../components/ui/PropertyCard.tsx";
import { PropertyDetailModal } from "../components/ui/PropertyDetailModal.tsx";
import { SearchBar, SearchFilters } from "../components/ui/SearchBar.tsx";

const NO_FILTERS: SearchFilters = { category: "all", keyword: "", subMarket: "", propertyType: "", priceBracket: "" };

/** "Explore More": every listing, with the same search and filters as the Home page. */
export function PropertiesPage() {
  const [searchParams] = useSearchParams();
  const [selectedProperty, setSelectedProperty] = useState<PropertyListing | null>(null);

  // URL params: ?area=ikoyi&category=rent (same as the Home page), applied from the first load.
  const [filters, setFilters] = useState<SearchFilters>(() => ({
    ...NO_FILTERS,
    subMarket: searchParams.get("area") ?? "",
    category: searchParams.get("category") ?? "all",
  }));

  // Keep filters in sync if the link changes while this page is already open.
  useEffect(() => {
    const area = searchParams.get("area");
    const category = searchParams.get("category");
    if (area || category) {
      setFilters((prev) => ({ ...prev, subMarket: area ?? prev.subMarket, category: category ?? prev.category }));
    }
  }, [searchParams]);

  const { items: properties, status, retry } = useListings(filters);

  return (
    <div className="w-full">
      {/* Page heading */}
      <section className="w-full max-w-7xl mx-auto px-5 md:px-8 lg:px-12 pt-12 sm:pt-16 pb-8">
        <span className="text-[12px] uppercase tracking-[0.08em] text-brand-navy font-bold block mb-1">
          Explore More
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-ink tracking-tight">
          All Verified Properties
        </h1>
        <p className="text-[15px] text-brand-nav mt-1.5 max-w-xl">
          Every home and asset we list is title-verified. Search by area, property type and budget to find your next move in Lagos.
        </p>
      </section>

      {/* Search + filters */}
      <section className="w-full max-w-7xl mx-auto px-5 md:px-8 lg:px-12 mb-10">
        <SearchBar key={JSON.stringify(filters)} initialFilters={filters} onSearch={(f) => setFilters(f)} />
      </section>

      {/* Results */}
      <section className="w-full max-w-7xl mx-auto px-5 md:px-8 lg:px-12 pb-16">
        <p className="text-[13px] text-brand-muted mb-6" role="status" aria-live="polite">
          {status === "ready" ? `${properties.length} ${properties.length === 1 ? "property" : "properties"} found` : "\u00A0"}
        </p>

        {status === "loading" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8" aria-busy="true">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white border border-brand-border rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-[16/10] bg-brand-sand" />
                <div className="p-5 flex flex-col gap-3">
                  <div className="h-6 w-1/2 bg-brand-sand rounded" />
                  <div className="h-4 w-4/5 bg-brand-tint2 rounded" />
                  <div className="h-10 bg-brand-tint2 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : status === "error" ? (
          <div role="alert" className="bg-white border border-brand-border p-10 text-center rounded-2xl">
            <h2 className="font-serif text-headline-sm font-bold text-brand-ink">We couldn't load the listings</h2>
            <p className="text-brand-nav text-[15px] mt-2">Please check your connection and try again.</p>
            <button
              type="button"
              onClick={retry}
              className="mt-5 inline-flex items-center gap-2 bg-brand-red hover:bg-brand-red-hover text-white text-[12px] uppercase font-bold px-6 py-3 rounded-xl"
            >
              Try again
            </button>
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} onViewDetails={(p) => setSelectedProperty(p)} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-brand-border p-12 text-center rounded-2xl">
            <span className="material-symbols-outlined text-4xl text-brand-muted mb-2">search_off</span>
            <h2 className="font-serif text-2xl font-bold text-brand-ink">No exact match for your search criteria</h2>
            <p className="text-brand-nav text-[15px] max-w-md mx-auto mt-2">
              Try adjusting your area or price bracket. Our private acquisition team can also source off-market properties for you.
            </p>
            <button
              type="button"
              onClick={() => setFilters(NO_FILTERS)}
              className="mt-5 inline-flex items-center gap-2 bg-brand-red text-white text-[12px] uppercase font-bold px-6 py-2.5 rounded-xl shadow-xs"
            >
              Clear all filters
            </button>
          </div>
        )}
      </section>

      <PropertyDetailModal property={selectedProperty} onClose={() => setSelectedProperty(null)} />
    </div>
  );
}

export default PropertiesPage;
