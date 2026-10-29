import { useEffect, useRef } from "react";
import { useFocusTrap } from "../../hooks/useFocusTrap.ts";
import type { PropertyListing } from "../../data/listings.ts";
import { formatNaira } from "../../utils/pricing.ts";
import { getWhatsAppUrl, SITE_CONFIG } from "../../config/site.ts";
import { WhatsAppIcon } from "./WhatsAppIcon.tsx";
import { Photo } from "./Photo.tsx";

interface PropertyDetailModalProps {
  property: PropertyListing | null;
  onClose: () => void;
}

export function PropertyDetailModal({ property, onClose }: PropertyDetailModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, !!property);
  useEffect(() => {
    if (property) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [property, onClose]);

  if (!property) return null;

  const whatsappInspectionUrl = getWhatsAppUrl(
    `Hello Geaworth Properties, I would like to schedule an inspection for: ${property.title} in ${property.areaName} (${formatNaira(property.price, property.period)}). Please confirm director availability.`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Flat Scrim */}
      <div
        className="fixed inset-0 bg-brand-ink/60 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-property-title"
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-brand-border overflow-hidden z-10 max-h-[90dvh] flex flex-col my-auto"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-brand-border bg-brand-canvas">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-brand-navy text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              {property.titleBadge || "Verified Title"}
            </span>
            <span className="text-[12px] uppercase font-bold text-brand-muted">
              {property.areaName}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-brand-muted hover:text-brand-ink hover:bg-brand-sand transition-colors focus:outline-none"
            aria-label="Close property detail modal"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {/* Main Photo Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-xl overflow-hidden bg-brand-sand">
            <div className="md:col-span-2 h-72 sm:h-96">
              <Photo name={property.image} alt={property.title} className="w-full h-full object-cover" sizes="(min-width: 768px) 50vw, 100vw" width={1200} height={800} />
            </div>
            <div className="hidden md:flex flex-col gap-3">
              {(property.images.length > 1 ? property.images.slice(1, 3) : [property.image, property.image]).map((img, i) => (
                <div key={i} className="h-44 sm:h-[186px] overflow-hidden">
                  <Photo name={img} alt={`${property.title} - View ${i + 2}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" sizes="200px" width={400} height={300} />
                </div>
              ))}
            </div>
          </div>

          {/* Title, Address & Price */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-1 text-brand-muted text-[13px] mb-1">
                <span className="material-symbols-outlined text-brand-navy text-[16px]">location_on</span>
                <span>{property.address}</span>
              </div>
              <h2
                id="modal-property-title"
                className="font-serif text-2xl sm:text-3xl font-bold text-brand-ink"
              >
                {property.title}
              </h2>
            </div>
            <div className="sm:text-right">
              <span className="text-[11px] uppercase tracking-wider text-brand-muted block font-bold">
                {property.category === "rent" ? "Annual Rent" : property.category === "shortlet" ? "Per Night" : "Asking Price"}
              </span>
              <span className="font-serif text-3xl sm:text-4xl font-bold text-brand-red">
                {formatNaira(property.price, property.period)}
              </span>
            </div>
          </div>

          {/* Key Specs Bar */}
          <div className="grid grid-cols-3 gap-2 p-4 bg-brand-canvas rounded-xl border border-brand-border text-center">
            <div>
              <span className="font-serif text-2xl font-bold text-brand-ink block">
                {property.beds > 0 ? property.beds : "—"}
              </span>
              <span className="text-[12px] uppercase text-brand-muted font-semibold">Bedrooms</span>
            </div>
            <div className="border-x border-brand-border">
              <span className="font-serif text-2xl font-bold text-brand-ink block">
                {property.baths > 0 ? property.baths : "—"}
              </span>
              <span className="text-[12px] uppercase text-brand-muted font-semibold">Bathrooms</span>
            </div>
            <div>
              <span className="font-serif text-2xl font-bold text-brand-ink block">
                {property.sqm}
              </span>
              <span className="text-[12px] uppercase text-brand-muted font-semibold">Square Meters</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-[12px] uppercase tracking-wider font-bold text-brand-ink mb-2">
              Property Narrative & Architecture
            </h3>
            <p className="text-[15px] leading-relaxed text-brand-nav">
              {property.description}
            </p>
          </div>

          {/* Features Grid */}
          <div>
            <h3 className="text-[12px] uppercase tracking-wider font-bold text-brand-ink mb-3">
              Included Amenities & Specifications
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {property.features.map((feat, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2.5 rounded-lg bg-brand-tint2 text-[13px] text-brand-ink font-semibold"
                >
                  <span className="material-symbols-outlined text-brand-navy text-[18px]">
                    check_circle
                  </span>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Alausa Title Verification Proof Card */}
          <div className="p-4 rounded-xl bg-brand-navy-tint/40 border border-brand-navy/20 flex items-start gap-3">
            <span className="material-symbols-outlined text-brand-navy text-2xl mt-0.5">
              gavel
            </span>
            <div className="text-[13px] text-brand-ink">
              <strong className="block font-bold text-brand-navy text-[14px]">
                Alausa Lands Registry Legal Audit
              </strong>
              <span>
                File searched and verified at Lagos State Lands Bureau, Alausa. Cadastral coordinates charted to confirm zero committed state acquisition and clear, unencumbered ownership title.
              </span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions Bar */}
        <div className="p-5 sm:p-6 border-t border-brand-border bg-brand-canvas flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[12px] text-brand-muted">
            <span>Direct Desk: </span>
            <a href={`tel:${SITE_CONFIG.phones.desk}`} className="font-bold text-brand-ink hover:text-brand-red">
              {SITE_CONFIG.phones.deskDisplay}
            </a>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <a
              href={whatsappInspectionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-brand-whatsapp hover:bg-brand-whatsapp-hover text-brand-ink text-[12px] uppercase tracking-wider font-bold px-5 py-3 rounded-[10px] shadow-sm transition-all"
            >
              <WhatsAppIcon className="w-[18px] h-[18px]"/>
              <span>Inquire via WhatsApp</span>
            </a>
            <a
              href={`/contact?interest=inspection&property=${encodeURIComponent(property.title)}`}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-brand-red hover:bg-brand-red-hover text-white text-[12px] uppercase tracking-wider font-bold px-5 py-3 rounded-[10px] shadow-sm transition-all"
            >
              <span>Schedule Inspection</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
