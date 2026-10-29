import { useParams, Link } from "react-router-dom";
import { useListing } from "../hooks/useListings.ts";
import { useSeo } from "../hooks/useSeo.ts";
import { DEFAULT_SEO } from "../config/seo.ts";
import { formatNaira } from "../utils/pricing.ts";
import { getWhatsAppUrl, SITE_CONFIG } from "../config/site.ts";
import { WhatsAppIcon } from "../components/ui/WhatsAppIcon.tsx";
import { Photo } from "../components/ui/Photo.tsx";

export function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { listing: property, status } = useListing(id);

  useSeo(
    property
      ? {
          title: `${property.title} | ${property.areaName} | Geaworth Properties`,
          description: `${property.beds} bed, ${property.baths} bath, ${property.sqm} sqm in ${property.areaName}, Lagos. ${property.titleBadge}. ${property.description}`.slice(0, 300),
        }
      : { title: "Property listing | Geaworth Properties", description: DEFAULT_SEO.description },
    `/listings/${id ?? ""}`,
  );

  if (status === "loading") {
    return (
      <div role="status" aria-busy="true" className="max-w-6xl mx-auto px-5 py-16">
        <span className="sr-only">Loading listing…</span>
        <div className="h-[380px] sm:h-[480px] bg-brand-sand rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div role="alert" className="max-w-4xl mx-auto px-5 py-24 text-center">
        <h1 className="font-serif text-headline-lg font-bold text-brand-ink mb-2">We couldn't load this listing</h1>
        <p className="text-brand-nav mb-6">Please check your connection and refresh the page.</p>
        <Link to="/" className="inline-flex items-center gap-2 bg-brand-red text-white text-[13px] uppercase font-bold px-6 py-3 rounded-xl">
          Return to Verified Listings
        </Link>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-4xl mx-auto px-5 py-24 text-center">
        <span className="material-symbols-outlined text-5xl text-brand-red mb-4">
          holiday_village
        </span>
        <h1 className="font-serif text-3xl font-bold text-brand-ink mb-2">
          Listing Not Found
        </h1>
        <p className="text-brand-nav mb-6">
          The requested property listing could not be found or may have been securely transacted.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-brand-red text-white text-[13px] uppercase font-bold px-6 py-3 rounded-xl shadow-xs"
        >
          <span>Return to Verified Listings</span>
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </Link>
      </div>
    );
  }

  const whatsappInspectionUrl = getWhatsAppUrl(
    `Hello Geaworth Properties, I would like to schedule a viewing for: ${property.title} in ${property.areaName} (${formatNaira(property.price, property.period)}).`
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-5 md:px-8 lg:px-12 py-12 md:py-16">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[12px] uppercase font-bold tracking-wider text-brand-muted mb-8">
        <Link to="/" className="hover:text-brand-red transition-colors">Home</Link>
        <span>/</span>
        <Link to={`/?area=${property.area}`} className="hover:text-brand-red transition-colors">
          {property.areaName}
        </Link>
        <span>/</span>
        <span className="text-brand-ink truncate">{property.title}</span>
      </nav>

      {/* Main Grid: Gallery & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Photos & Details (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* Main Hero Photo Gallery */}
          <div className="rounded-2xl overflow-hidden border border-brand-border bg-brand-sand shadow-sm">
            <Photo name={property.image} alt={property.title} className="w-full h-[380px] sm:h-[480px] object-cover" sizes="(min-width: 1024px) 60vw, 100vw" width={1200} height={800} />
            {property.images && property.images.length > 1 && (
              <div className="grid grid-cols-3 gap-2 p-3 bg-white border-t border-brand-border">
                {property.images.map((img, i) => (
                  <div key={i} className="h-24 sm:h-32 rounded-lg overflow-hidden bg-brand-sand">
                    <Photo name={img} alt={`${property.title} thumb ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform" sizes="200px" width={400} height={300} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Title, Address & Badges */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="bg-brand-navy text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                {property.titleBadge || "Verified Title"}
              </span>
              <span className="bg-brand-tint2 text-brand-ink text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                {property.category === "rent" ? "For Rent" : property.category === "shortlet" ? "Serviced Shortlet" : "For Sale"}
              </span>
              <span className="bg-brand-sand text-brand-nav text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                {property.areaName}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-ink">
              {property.title}
            </h1>
            <p className="text-[15px] text-brand-nav mt-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-brand-navy text-lg">location_on</span>
              {property.address}
            </p>
          </div>

          {/* Specs Bar */}
          <div className="grid grid-cols-3 gap-3 p-5 bg-white border border-brand-border rounded-2xl shadow-2xs text-center">
            <div>
              <span className="font-serif text-3xl font-bold text-brand-ink block">
                {property.beds > 0 ? property.beds : "—"}
              </span>
              <span className="text-[12px] uppercase text-brand-muted font-bold">Bedrooms</span>
            </div>
            <div className="border-x border-brand-border">
              <span className="font-serif text-3xl font-bold text-brand-ink block">
                {property.baths > 0 ? property.baths : "—"}
              </span>
              <span className="text-[12px] uppercase text-brand-muted font-bold">Bathrooms</span>
            </div>
            <div>
              <span className="font-serif text-3xl font-bold text-brand-ink block">
                {property.sqm}
              </span>
              <span className="text-[12px] uppercase text-brand-muted font-bold">Square Meters</span>
            </div>
          </div>

          {/* Narrative */}
          <div className="bg-white border border-brand-border p-6 sm:p-8 rounded-2xl shadow-sm">
            <h2 className="font-serif text-2xl font-bold text-brand-ink mb-3">
              Property Narrative
            </h2>
            <p className="text-[16px] text-brand-nav leading-relaxed">
              {property.description}
            </p>
          </div>

          {/* Included Features */}
          <div className="bg-white border border-brand-border p-6 sm:p-8 rounded-2xl shadow-sm">
            <h2 className="font-serif text-2xl font-bold text-brand-ink mb-4">
              Infrastructure &amp; Amenities
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {property.features.map((feat, i) => (
                <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl bg-brand-canvas text-[14px] text-brand-ink font-semibold">
                  <span className="material-symbols-outlined text-brand-navy text-xl">
                    check_circle
                  </span>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Alausa Verification Guarantee */}
          <div className="p-6 bg-brand-navy-tint/50 border border-brand-navy/30 rounded-2xl flex items-start gap-4">
            <span className="material-symbols-outlined text-brand-navy text-3xl mt-0.5">
              gavel
            </span>
            <div>
              <h3 className="font-serif text-[18px] font-bold text-brand-navy">
                Official Lagos State Lands Bureau Audit
              </h3>
              <p className="text-[14px] text-brand-ink mt-1 leading-relaxed">
                This asset has been fully chartered at Alausa, Ikeja. Certificate of Occupancy or Governor’s Consent is verified with zero boundary contentions or encumbrances.
              </p>
            </div>
          </div>
        </div>

        {/* Right Sticky Column: Price & Direct Booking (4 Cols) */}
        <div className="lg:col-span-4 sticky top-24 flex flex-col gap-6">
          <div className="bg-white border border-brand-border p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col gap-6">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-brand-muted font-bold block mb-1">
                {property.category === "rent" ? "Annual Rent" : property.category === "shortlet" ? "Nightly Rate" : "Asking Price"}
              </span>
              <span className="font-serif text-3xl sm:text-4xl font-bold text-brand-red block">
                {formatNaira(property.price, property.period)}
              </span>
              <span className="text-[12px] text-brand-muted mt-1 block">
                Strict Escrow &amp; Bank Settlement
              </span>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <a
                href={whatsappInspectionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-12 flex items-center justify-center gap-2 bg-brand-whatsapp hover:bg-brand-whatsapp-hover text-brand-ink text-[13px] uppercase tracking-wider font-bold rounded-[10px] shadow-sm transition-all"
              >
                <WhatsAppIcon className="w-5 h-5"/>
                Inquire via WhatsApp
              </a>

              <Link
                to={`/contact?interest=inspection&property=${encodeURIComponent(property.title)}`}
                className="w-full h-12 flex items-center justify-center gap-2 bg-brand-red hover:bg-brand-red-hover text-white text-[13px] uppercase tracking-wider font-bold rounded-[10px] shadow-sm transition-all"
              >
                Schedule Physical Viewing
              </Link>
            </div>

            <div className="pt-4 border-t border-brand-border text-[13px] text-brand-nav flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span>Direct Lagos Desk</span>
                <a href={`tel:${SITE_CONFIG.phones.desk}`} className="font-bold text-brand-ink hover:text-brand-red">
                  {SITE_CONFIG.phones.deskDisplay}
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span>Registration</span>
                <span className="font-bold text-brand-ink">{SITE_CONFIG.rcNumber}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
