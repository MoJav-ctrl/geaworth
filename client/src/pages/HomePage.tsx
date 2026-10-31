import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { PropertyListing } from "../data/listings.ts";
import { useListings, buildListingsQuery } from "../hooks/useListings.ts";
import { PropertyCard } from "../components/ui/PropertyCard.tsx";
import { PropertyDetailModal } from "../components/ui/PropertyDetailModal.tsx";
import { SearchBar, SearchFilters } from "../components/ui/SearchBar.tsx";
import { formatNaira } from "../utils/pricing.ts";
import { getWhatsAppUrl } from "../config/site.ts";
import { WhatsAppIcon } from "../components/ui/WhatsAppIcon.tsx";
import { Photo } from "../components/ui/Photo.tsx";

/** How many listings Home shows before the visitor searches or filters. */
const FEATURED_COUNT = 6;

const ALL_FILTERS: SearchFilters = { category: "all", keyword: "", subMarket: "", propertyType: "", priceBracket: "" };

export function HomePage() {
  const [searchParams] = useSearchParams();
  const [selectedProperty, setSelectedProperty] = useState<PropertyListing | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    category: "all",
    keyword: "",
    subMarket: "",
    propertyType: "",
    priceBracket: "",
  });

  // URL params: ?area=ikoyi&category=rent  |  ?filter=all|verified (clears filters; every listing is title-verified)
  useEffect(() => {
    const areaParam = searchParams.get("area");
    const categoryParam = searchParams.get("category");
    const filterParam = searchParams.get("filter");
    if (areaParam || categoryParam || filterParam) {
      setFilters((prev) => ({
        ...prev,
        subMarket: areaParam ?? (filterParam ? "" : prev.subMarket),
        category: categoryParam ?? (filterParam ? "all" : prev.category),
      }));
    }
  }, [searchParams]);

  const { items: filteredProperties, status: listingsStatus, retry: retryListings } = useListings(filters);

  // With no search or filter active, Home only shows a featured selection; "Explore More" leads to all listings.
  const filtersActive = buildListingsQuery(filters) !== "";
  const visibleProperties = filtersActive ? filteredProperties : filteredProperties.slice(0, FEATURED_COUNT);

  // Real listing counts per neighbourhood (replaces the old hard-coded numbers).
  const { items: allListings, status: allStatus } = useListings(ALL_FILTERS);
  const countLabel = (areaId: string) => {
    if (allStatus !== "ready") return "View listings";
    const n = allListings.filter((i) => i.area === areaId).length;
    return n === 0 ? "New listings soon" : `${n} ${n === 1 ? "Listing" : "Listings"}`;
  };

  // Featured hero card: static showcase copy from the brand brief
  const featuredVilla = {
    id: "gw-01",
    title: "Waterfront Terrace Villa",
    image: "luxury-villa-architecture",
    price: 420_000_000,
  };

  const selectNeighborhood = (id: string) => {
    setFilters((prev) => ({ ...prev, subMarket: id }));
    document.getElementById("curated-residences")?.scrollIntoView({ behavior: "smooth" });
  };

  const neighborhoods = [
    {
      id: "lekki-1",
      name: "Lekki Peninsula",
      tag: "Avg. Yield: 11-14%",
      desc: "Coastal vibrancy, modern estates, dining & tech corridors.",
      image: "lagos-waterfront-skyline",
    },
    {
      id: "ikoyi",
      name: "Old & Parkview Ikoyi",
      tag: "Prime Capital Growth",
      desc: "Colonial grandeur, old-money calm, prime diplomatic addresses.",
      image: "lekki-residence-exterior",
    },
    {
      id: "victoria-island",
      name: "Victoria Island & Oniru",
      tag: "Avg. Yield: 12-16%",
      desc: "The commercial heartbeat, waterfront lounges & high-rises.",
      image: "victoria-island-towers",
    },
    {
      id: "ikeja-gra",
      name: "Ikeja GRA & Opebi",
      tag: "Legacy Family Assets",
      desc: "Leafy Mainland prestige, central connectivity & serene estates.",
      image: "ikeja-gra-duplex",
    },
    {
      id: "surulere",
      name: "Yaba & Surulere",
      tag: "High Rental Turnover",
      desc: "Creative hub, tech clusters & authentic Lagos cultural energy.",
      image: "yaba-surulere-streetscape",
    },
    {
      id: "magodo",
      name: "Gbagada & Magodo",
      tag: "Top Family Demand",
      desc: "Family-first communities with seamless island-mainland access.",
      image: "magodo-family-home",
    },
  ];

  return (
    <div className="w-full flex flex-col">
      {/* 1. HERO SECTION (7/5 Asymmetric) */}
      <section className="relative w-full max-w-7xl mx-auto px-5 md:px-8 lg:px-12 pt-8 md:pt-14 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Text (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-5 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-sand/70 border border-brand-border rounded-full w-fit">
              <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-brand-nav">
                Prime Lagos Real Estate Bureau
              </span>
            </div>

            <h1 className="font-serif text-[38px] sm:text-[48px] lg:text-[56px] font-bold text-brand-ink tracking-tight leading-[1.12]">
              Find a place that feels like home in Lagos<span className="text-brand-red">.</span>
            </h1>

            <p className="text-[16px] md:text-[18px] text-brand-nav leading-relaxed max-w-2xl">
              From quiet cul-de-sacs in Ikoyi and beachfront penthouses in Lekki Phase 1, to family duplexes in Ikeja GRA and high-yield shortlets in Victoria Island. We simplify buying, renting, shortlets, and property management across Lagos without the usual friction.
            </p>

            {/* Three Trust Ticks */}
            <div className="pt-2 flex flex-wrap items-center gap-3 text-[12px] uppercase font-bold tracking-wider text-brand-ink">
              <div className="flex items-center gap-1.5 bg-white border border-brand-border px-3 py-1.5 rounded-xl shadow-xs">
                <span className="material-symbols-outlined text-brand-red text-base">verified</span>
                <span>100% Title-Verified Listings</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white border border-brand-border px-3 py-1.5 rounded-xl shadow-xs">
                <span className="material-symbols-outlined text-brand-navy text-base">gavel</span>
                <span>Direct Governor's Consent / C of O Checks</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white border border-brand-border px-3 py-1.5 rounded-xl shadow-xs">
                <span className="material-symbols-outlined text-brand-red text-base">receipt_long</span>
                <span>Zero Phantom Fees</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-3 flex flex-wrap items-center gap-4">
              <a
                href="#curated-residences"
                className="inline-flex items-center justify-center gap-2 bg-brand-red hover:bg-brand-red-hover text-white text-[13px] uppercase tracking-wider font-bold px-6 py-3.5 rounded-[10px] shadow-sm hover:shadow-md transition-all"
              >
                <span>Explore Verified Listings</span>
                <span className="material-symbols-outlined text-base">arrow_downward</span>
              </a>

              <a
                href={getWhatsAppUrl("Hello Geaworth Properties, I would like to schedule a private property viewing in Lagos.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-brand-sand text-brand-ink border border-brand-border text-[13px] uppercase tracking-wider font-bold px-6 py-3.5 rounded-[10px] shadow-xs transition-all"
              >
                <WhatsAppIcon className="w-5 h-5 text-brand-whatsapp"/>
                <span>Inquire via WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Right Featured Property Showcase (5 Cols) */}
          <div className="lg:col-span-5 relative mt-4 lg:mt-0">
            <div className="relative bg-white p-3 rounded-2xl border border-brand-border shadow-[0_20px_40px_-15px_rgba(18,59,122,0.12)]">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-brand-sand">
                <Photo name={featuredVilla.image} alt={featuredVilla.title} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" width={1200} height={800} priority />
                <div className="absolute top-3 left-3 flex flex-col gap-1">
                  <span className="bg-brand-navy text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-xl shadow-sm">
                    Verified Title
                  </span>
                  <span className="bg-white/95 backdrop-blur text-brand-ink text-[11px] font-bold px-2.5 py-0.5 rounded-xl">
                    Lekki Phase 1
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 p-3.5 bg-white/95 backdrop-blur-md rounded-xl border border-brand-border flex items-center justify-between shadow-sm">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-brand-muted block font-semibold">
                      Off Admiralty Way
                    </span>
                    <h4 className="font-serif text-[17px] font-bold text-brand-ink">
                      {featuredVilla.title}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] uppercase tracking-wider text-brand-red-deep font-bold block">
                      For Sale
                    </span>
                    <span className="font-serif text-[20px] font-bold text-brand-ink">
                      {formatNaira(featuredVilla.price)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mini Spec Ribbon */}
              <div className="grid grid-cols-3 gap-2 pt-3 text-center text-[12px] text-brand-muted">
                <div className="bg-brand-canvas py-2 rounded-xl">
                  <strong className="text-brand-ink font-serif text-[15px] block font-bold">4</strong>
                  Beds
                </div>
                <div className="bg-brand-canvas py-2 rounded-xl">
                  <strong className="text-brand-ink font-serif text-[15px] block font-bold">5</strong>
                  Baths
                </div>
                <div className="bg-brand-canvas py-2 rounded-xl">
                  <strong className="text-brand-ink font-serif text-[15px] block font-bold">450</strong>
                  sqm
                </div>
              </div>
            </div>

            {/* Overlaid Insight Chip */}
            <div className="hidden sm:flex items-center gap-3 absolute -bottom-5 -left-6 bg-white border border-brand-border p-3 rounded-xl shadow-lg z-20 max-w-xs">
              <div className="w-10 h-10 rounded-full bg-brand-red/10 flex items-center justify-center text-brand-red shrink-0">
                <span className="material-symbols-outlined text-xl">insights</span>
              </div>
              <div>
                <p className="text-[13px] font-bold text-brand-ink leading-tight">
                  Ikoyi &amp; Lekki Index
                </p>
                <p className="text-[11px] text-brand-nav">
                  Annual capital yield +18.4% YoY
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SEARCH MODULE DIRECTLY UNDER HERO */}
      <section className="w-full max-w-7xl mx-auto px-5 md:px-8 lg:px-12 -mt-4 mb-16 z-30 relative">
        <SearchBar
          key={JSON.stringify(filters)}
          initialFilters={filters}
          onSearch={(newFilters) => setFilters(newFilters)}
        />
      </section>

      {/* 3. CURATED LAGOS RESIDENCES */}
      <section
        id="curated-residences"
        className="w-full max-w-7xl mx-auto px-5 md:px-8 lg:px-12 py-12"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-[12px] uppercase tracking-[0.08em] text-brand-navy font-bold block mb-1">
              Hand-Vetted Opportunities
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-ink tracking-tight">
              Curated Lagos Residences
            </h2>
            <p className="text-[15px] text-brand-nav mt-1.5 max-w-xl">
              Hand-picked, title-verified homes available for immediate physical and legal inspection.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setFilters({
                  category: "all",
                  keyword: "",
                  subMarket: "",
                  propertyType: "",
                  priceBracket: "",
                })
              }
              className="px-4 py-2 rounded-xl bg-white border border-brand-border text-[12px] uppercase font-bold text-brand-ink hover:bg-brand-tint2 transition-colors"
            >
              Filter All
            </button>
            <Link
              to="/properties"
              className="px-4 py-2 rounded-xl bg-brand-navy text-white text-[12px] uppercase font-bold hover:bg-brand-navy-hover transition-colors flex items-center gap-1.5"
            >
              <span>Explore More</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* Property Grid (3 Columns) */}
        <p className="sr-only" role="status" aria-live="polite">
          {listingsStatus === "ready" ? `${visibleProperties.length} properties found` : ""}
        </p>
        {listingsStatus === "loading" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8" aria-busy="true">
            {[0, 1, 2].map((i) => (
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
        ) : listingsStatus === "error" ? (
          <div role="alert" className="bg-white border border-brand-border p-10 text-center rounded-2xl">
            <h3 className="font-serif text-headline-sm font-bold text-brand-ink">We couldn't load the listings</h3>
            <p className="text-brand-nav text-[15px] mt-2">Please check your connection and try again.</p>
            <button
              type="button"
              onClick={retryListings}
              className="mt-5 inline-flex items-center gap-2 bg-brand-red hover:bg-brand-red-hover text-white text-[12px] uppercase font-bold px-6 py-3 rounded-xl"
            >
              Try again
            </button>
          </div>
        ) : visibleProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {visibleProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onViewDetails={(p) => setSelectedProperty(p)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-brand-border p-12 text-center rounded-2xl">
            <span className="material-symbols-outlined text-4xl text-brand-muted mb-2">
              search_off
            </span>
            <h3 className="font-serif text-2xl font-bold text-brand-ink">
              No exact match for your search criteria
            </h3>
            <p className="text-brand-nav text-[15px] max-w-md mx-auto mt-2">
              Try adjusting your submarket or price bracket. Our private acquisition team can also source off-market properties for you.
            </p>
            <button
              type="button"
              onClick={() =>
                setFilters({
                  category: "all",
                  keyword: "",
                  subMarket: "",
                  propertyType: "",
                  priceBracket: "",
                })
              }
              className="mt-5 inline-flex items-center gap-2 bg-brand-red text-white text-[12px] uppercase font-bold px-6 py-2.5 rounded-xl shadow-xs"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* 4. EXPLORE LAGOS NEIGHBORHOOD BY NEIGHBORHOOD */}
      <section className="w-full bg-brand-tint2 py-16 md:py-24 my-8 border-y border-brand-border">
        <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-12">
          <div className="max-w-2xl mb-12">
            <span className="text-[12px] uppercase tracking-[0.08em] text-brand-red-deep font-bold block mb-1">
              Authentic Lagos Geography
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-ink tracking-tight">
              Explore Lagos Neighborhood by Neighborhood
            </h2>
            <p className="text-[15px] text-brand-nav mt-2 leading-relaxed">
              Every enclave in Lagos carries its own distinct rhythm, traffic flow, infrastructure standard, and investment thesis. Select your target market.
            </p>
          </div>

          <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none -mx-5 px-5 md:mx-0 md:px-0 pb-3 md:pb-0 no-scrollbar">
            {neighborhoods.map((n) => (
              <div
                key={n.id}
                role="button"
                tabIndex={0}
                aria-label={`Explore ${n.name}: ${countLabel(n.id)}`}
                onClick={() => selectNeighborhood(n.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    selectNeighborhood(n.id);
                  }
                }}
                className="shrink-0 w-[82%] sm:w-[58%] md:w-auto snap-start group cursor-pointer rounded-2xl overflow-hidden bg-white border border-brand-border p-4 shadow-sm hover:border-brand-navy/40 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 rounded-xl overflow-hidden mb-3 bg-brand-sand">
                    <Photo name={n.image} alt={n.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" width={1200} height={800} />
                    <span className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur text-[11px] font-bold px-2.5 py-0.5 rounded-xl text-brand-ink shadow-xs">
                      {countLabel(n.id)}
                    </span>
                  </div>
                  <h3 className="font-serif text-[19px] font-bold text-brand-ink group-hover:text-brand-red transition-colors">
                    {n.name}
                  </h3>
                  <p className="text-[13px] text-brand-nav mt-1 line-clamp-2">
                    {n.desc}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-brand-border flex items-center justify-between text-[12px] uppercase">
                  <span className="text-brand-muted font-semibold">{n.tag}</span>
                  <span className="text-brand-red font-bold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                    Explore <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. WHY DISCERNING LAGOSIANS MOVE WITH GEAWORTH */}
      <section className="w-full max-w-7xl mx-auto px-5 md:px-8 lg:px-12 py-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-[12px] uppercase tracking-[0.08em] text-brand-navy font-bold block mb-1">
            Uncompromising Standards
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-ink tracking-tight">
            Why discerning Lagosians move with Geaworth
          </h2>
          <p className="text-[16px] text-brand-nav mt-2">
            Real estate in Lagos requires deep local knowledge, ironclad legal diligence, and absolute candor. Here is how we safeguard your interests.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-white border border-brand-border p-6 rounded-2xl shadow-sm hover:border-brand-navy/30 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-brand-red/10 flex items-center justify-center text-brand-red mb-4">
                <span className="material-symbols-outlined text-2xl">explore</span>
              </div>
              <h3 className="font-serif text-[18px] font-bold text-brand-ink mb-2">
                Deep Local Street Intelligence
              </h3>
              <p className="text-[14px] text-brand-nav leading-relaxed">
                We don't just know neighborhoods from aerial maps. We know the drainage history, dry-season versus rainy-season road access, title authenticity, and power infrastructure on individual streets.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-brand-border text-[11px] font-bold text-brand-red-deep uppercase tracking-wider">
              Hyper-Local Insight
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-brand-border p-6 rounded-2xl shadow-sm hover:border-brand-navy/30 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-brand-navy-tint flex items-center justify-center text-brand-navy mb-4">
                <span className="material-symbols-outlined text-2xl">verified_user</span>
              </div>
              <h3 className="font-serif text-[18px] font-bold text-brand-ink mb-2">
                100% Verified Lagos Titles
              </h3>
              <p className="text-[14px] text-brand-nav leading-relaxed">
                Every property passes through independent legal vetting with the Lagos State Lands Bureau at Alausa before publishing. Zero phantom listings, zero disputes.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-brand-border text-[11px] font-bold text-brand-navy uppercase tracking-wider">
              Alausa Lands Bureau Vetted
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-brand-border p-6 rounded-2xl shadow-sm hover:border-brand-navy/30 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-brand-ochre-tint flex items-center justify-center text-brand-ochre-text mb-4">
                <span className="material-symbols-outlined text-2xl">receipt_long</span>
              </div>
              <h3 className="font-serif text-[18px] font-bold text-brand-ink mb-2">
                Transparent, Predictable Fees
              </h3>
              <p className="text-[14px] text-brand-nav leading-relaxed">
                No surprise legal fees, no unexpected agency markups, and no undisclosed estate dues. Clear settlement schedules from day one.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-brand-border text-[11px] font-bold text-brand-ochre-text uppercase tracking-wider">
              Zero Hidden Agency Charges
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white border border-brand-border p-6 rounded-2xl shadow-sm hover:border-brand-navy/30 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-brand-tint2 flex items-center justify-center text-brand-ink mb-4">
                <span className="material-symbols-outlined text-2xl">speed</span>
              </div>
              <h3 className="font-serif text-[18px] font-bold text-brand-ink mb-2">
                Fast Tenant &amp; Buyer Matching
              </h3>
              <p className="text-[14px] text-brand-nav leading-relaxed">
                Average closing time of 14 days for vetted tenants and 28 days for sales through our verified proprietary buyer network across Nigeria and the Diaspora.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-brand-border text-[11px] font-bold text-brand-ink uppercase tracking-wider">
              14-Day Median Turnover
            </div>
          </div>
        </div>
      </section>

      {/* 6. STORIES FROM CLIENTS WHO FOUND PEACE OF MIND */}
      <section className="w-full bg-brand-tint2 py-16 md:py-24 border-t border-brand-border">
        <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[12px] uppercase tracking-[0.08em] text-brand-navy font-bold block mb-1">
              Client Experiences
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-ink tracking-tight">
              Stories from clients who found peace of mind
            </h2>
          </div>

          <div className="flex md:grid md:grid-cols-3 gap-4 sm:gap-8 overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none -mx-5 px-5 md:mx-0 md:px-0 pb-3 md:pb-0 no-scrollbar">
            {/* Testimonial 1 */}
            <div className="shrink-0 w-[85%] sm:w-[60%] md:w-auto snap-start bg-white border border-brand-border p-7 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-brand-ochre mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-[20px] fill-1">
                      star
                    </span>
                  ))}
                </div>
                <p className="text-[15px] text-brand-nav italic leading-relaxed mb-6 font-serif">
                  “Purchasing a home from London felt daunting until we partnered with Geaworth. Their video walkthroughs documented every corner, and their legal team confirmed Governor's Consent at Alausa within 72 hours.”
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-brand-border">
                <div className="w-11 h-11 rounded-full bg-brand-red/10 text-brand-red font-bold flex items-center justify-center shrink-0">
                  FA
                </div>
                <div>
                  <p className="text-[15px] font-bold text-brand-ink">
                    Dr. Femi &amp; Chioma Adeyemi
                  </p>
                  <p className="text-[13px] text-brand-muted">
                    Diaspora Buyers, UK to Lekki Phase 1
                  </p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="shrink-0 w-[85%] sm:w-[60%] md:w-auto snap-start bg-white border border-brand-border p-7 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-brand-ochre mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-[20px] fill-1">
                      star
                    </span>
                  ))}
                </div>
                <p className="text-[15px] text-brand-nav italic leading-relaxed mb-6 font-serif">
                  “Found our team shortlet and my personal apartment in Oniru through Geaworth. The 24/7 power and security claims were 100% accurate. True professionals in a market where trust is rare.”
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-brand-border">
                <div className="w-11 h-11 rounded-full bg-brand-navy-tint text-brand-navy font-bold flex items-center justify-center shrink-0">
                  TB
                </div>
                <div>
                  <p className="text-[15px] font-bold text-brand-ink">
                    Tunde Balogun
                  </p>
                  <p className="text-[13px] text-brand-muted">
                    Tech Founder, Victoria Island
                  </p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="shrink-0 w-[85%] sm:w-[60%] md:w-auto snap-start bg-white border border-brand-border p-7 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-brand-ochre mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-[20px] fill-1">
                      star
                    </span>
                  ))}
                </div>
                <p className="text-[15px] text-brand-nav italic leading-relaxed mb-6 font-serif">
                  “They screened and placed a reliable corporate tenant in my 4-bedroom duplex within 10 days. Rent collected on schedule, zero landlord headaches. Hands-down the best property team in Ikeja.”
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-brand-border">
                <div className="w-11 h-11 rounded-full bg-brand-ochre-tint text-brand-ochre-text font-bold flex items-center justify-center shrink-0">
                  FO
                </div>
                <div>
                  <p className="text-[15px] font-bold text-brand-ink">
                    Folake Osoba
                  </p>
                  <p className="text-[13px] text-brand-muted">
                    Property Owner, Ikeja GRA
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Property Detail Modal */}
      <PropertyDetailModal
        property={selectedProperty}
        onClose={() => setSelectedProperty(null)}
      />
    </div>
  );
}
