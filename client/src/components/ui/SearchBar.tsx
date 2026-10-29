import React, { useState } from "react";
import { AREA_GROUPS, PROPERTY_TYPES } from "../../config/listingOptions.ts";

export interface SearchFilters {
  category: string;
  keyword: string;
  subMarket: string;
  propertyType: string;
  priceBracket: string;
}

interface SearchBarProps {
  initialFilters?: Partial<SearchFilters>;
  onSearch: (filters: SearchFilters) => void;
}

export function SearchBar({ initialFilters, onSearch }: SearchBarProps) {
  const [category, setCategory] = useState(initialFilters?.category || "all");
  const [keyword, setKeyword] = useState(initialFilters?.keyword || "");
  const [subMarket, setSubMarket] = useState(initialFilters?.subMarket || "");
  const [propertyType, setPropertyType] = useState(initialFilters?.propertyType || "");
  const [priceBracket, setPriceBracket] = useState(initialFilters?.priceBracket || "");

  const categories = [
    { id: "all", label: "All Properties" },
    { id: "sale", label: "For Sale" },
    { id: "rent", label: "For Rent" },
    { id: "shortlet", label: "Shortlets" },
    { id: "commercial", label: "Commercial / Land" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      category,
      keyword,
      subMarket,
      propertyType,
      priceBracket,
    });
  };

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    onSearch({
      category: newCat,
      keyword,
      subMarket,
      propertyType,
      priceBracket,
    });
  };

  return (
    <section aria-label="Property Search & Filters" className="w-full">
      <div className="bg-white p-5 sm:p-6 rounded-[16px] border border-brand-border shadow-[0_12px_32px_-8px_rgba(28,27,27,0.08)]">
        {/* Category Filter Tabs */}
        <div
          role="tablist"
          aria-label="Property category tabs"
          className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 no-scrollbar"
        >
          {categories.map((cat) => {
            const active = category === cat.id;
            return (
              <button
                key={cat.id}
                role="tab"
                aria-selected={active}
                type="button"
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-4 py-2 rounded-xl text-[12px] uppercase tracking-wider font-bold whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? "bg-brand-red text-white shadow-sm"
                    : "bg-brand-tint2 text-brand-nav hover:bg-brand-sand hover:text-brand-ink"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* 4-Field Search Form + Red Search Button */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end"
        >
          {/* 1. Keyword / Estate */}
          <div className="lg:col-span-4 flex flex-col gap-1.5">
            <label htmlFor="search-keyword" className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">
              Keyword / Estate
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-brand-muted text-[20px] pointer-events-none">
                search
              </span>
              <input
                id="search-keyword"
                name="q"
                type="search"
                inputMode="search"
                enterKeyHint="search"
                autoComplete="off"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search Richmond Gate, Ikoyi, duplex..."
                className="w-full bg-brand-canvas pl-11 pr-4 py-2.5 rounded-xl text-[14px] text-brand-ink placeholder:text-brand-muted border border-brand-border focus:bg-white focus:border-brand-navy transition-colors"
              />
            </div>
          </div>

          {/* 2. Lagos Sub-Market */}
          <div className="lg:col-span-3 flex flex-col gap-1.5">
            <label htmlFor="search-submarket" className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">
              Lagos Sub-Market
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-brand-muted text-[20px] pointer-events-none">
                location_on
              </span>
              <select
                id="search-submarket"
                value={subMarket}
                onChange={(e) => setSubMarket(e.target.value)}
                className="w-full bg-brand-canvas pl-11 pr-8 py-2.5 rounded-xl text-[14px] text-brand-ink border border-brand-border appearance-none focus:bg-white focus:border-brand-navy transition-colors cursor-pointer"
              >
                <option value="">All Lagos</option>
                {AREA_GROUPS.map((g) => (
                  <optgroup key={g.group} label={g.group}>
                    {g.areas.map((area) => (
                      <option key={area.id} value={area.id}>{area.label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 text-brand-muted pointer-events-none text-base">
                expand_more
              </span>
            </div>
          </div>

          {/* 3. Property Type */}
          <div className="lg:col-span-2 flex flex-col gap-1.5">
            <label htmlFor="search-proptype" className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">
              Property Type
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-brand-muted text-[20px] pointer-events-none">
                home_work
              </span>
              <select
                id="search-proptype"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full bg-brand-canvas pl-11 pr-8 py-2.5 rounded-xl text-[14px] text-brand-ink border border-brand-border appearance-none focus:bg-white focus:border-brand-navy transition-colors cursor-pointer"
              >
                <option value="">Any Type</option>
                {PROPERTY_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 text-brand-muted pointer-events-none text-base">
                expand_more
              </span>
            </div>
          </div>

          {/* 4. Price Bracket */}
          <div className="lg:col-span-2 flex flex-col gap-1.5">
            <label htmlFor="search-price" className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">
              Price Bracket
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-brand-muted text-[20px] pointer-events-none">
                payments
              </span>
              <select
                id="search-price"
                value={priceBracket}
                onChange={(e) => setPriceBracket(e.target.value)}
                className="w-full bg-brand-canvas pl-11 pr-8 py-2.5 rounded-xl text-[14px] text-brand-ink border border-brand-border appearance-none focus:bg-white focus:border-brand-navy transition-colors cursor-pointer"
              >
                <option value="">Any Budget</option>
                <option value="under-50m">Under ₦50M</option>
                <option value="50m-150m">₦50M – ₦150M</option>
                <option value="150m-500m">₦150M – ₦500M</option>
                <option value="500m-plus">₦500M+</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 text-brand-muted pointer-events-none text-base">
                expand_more
              </span>
            </div>
          </div>

          {/* 5. Search Submit Button */}
          <div className="lg:col-span-1">
            <button
              type="submit"
              className="w-full h-[42px] bg-brand-red hover:bg-brand-red-hover active:bg-brand-red-active text-white rounded-xl font-bold text-[12px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
              title="Search Filtered Properties"
            >
              <span className="material-symbols-outlined text-[20px]">search</span>
              <span className="lg:hidden">Search</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
