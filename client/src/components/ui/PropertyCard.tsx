import React, { useState } from "react";
import type { PropertyListing } from "../../data/listings.ts";
import { formatNaira } from "../../utils/pricing.ts";
import { getWhatsAppUrl } from "../../config/site.ts";
import { WhatsAppIcon } from "./WhatsAppIcon.tsx";
import { Photo } from "./Photo.tsx";

interface PropertyCardProps {
  property: PropertyListing;
  onViewDetails?: (property: PropertyListing) => void;
}

export function PropertyCard({ property, onViewDetails }: PropertyCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);

  const categoryLabel = {
    sale: "For Sale",
    rent: "For Rent",
    shortlet: "Shortlet",
    commercial: "Commercial"
  }[property.category] || "For Sale";

  const categoryBadgeColor = {
    sale: "bg-brand-red text-white",
    rent: "bg-brand-navy text-white",
    shortlet: "bg-brand-ochre text-white",
    commercial: "bg-brand-ink text-white"
  }[property.category] || "bg-brand-red text-white";

  const whatsappInquiryUrl = getWhatsAppUrl(
    `Hello Geaworth Properties, I would like to inquire and schedule an inspection for: ${property.title} (${property.address}) listed at ${formatNaira(property.price, property.period)}.`
  );

  return (
    <article className="group bg-white rounded-2xl overflow-hidden border border-brand-border shadow-[0_2px_8px_-2px_rgba(23,23,23,0.05)] hover:border-brand-navy/30 hover:shadow-[0_12px_24px_-6px_rgba(18,59,122,0.1)] transition-all duration-300 flex flex-col justify-between">
      {/* Image Container with 16:10 aspect ratio */}
      <div className="relative aspect-[16/10] overflow-hidden bg-brand-sand">
        <Photo name={property.image} alt={property.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" width={600} height={375} />

        {/* Floating Top-Left Verification Pill */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          <span className="inline-flex items-center gap-1 bg-brand-navy text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
            <span className="material-symbols-outlined text-[14px]">verified</span>
            {property.titleBadge || "Verified Title"}
          </span>
        </div>

        {/* Floating Top-Right Category Label & Favorite Heart */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm ${categoryBadgeColor}`}>
            {categoryLabel}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsFavorited(!isFavorited);
            }}
            className="w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-brand-ink hover:text-brand-red transition-colors shadow-sm focus:outline-none"
            aria-label={isFavorited ? "Remove from saved properties" : "Save property to favorites"}
          >
            <span
              className={`material-symbols-outlined text-[18px] transition-colors ${
                isFavorited ? "text-brand-red fill-1" : "text-brand-muted"
              }`}
            >
              favorite
            </span>
          </button>
        </div>

        {/* Hover Inspection Overlay */}
        <div className="absolute inset-0 bg-brand-ink/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => onViewDetails && onViewDetails(property)}
            className="bg-white text-brand-ink hover:bg-brand-red hover:text-white font-bold text-[12px] uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-lg transition-all"
          >
            Schedule Physical Inspection
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Location Line */}
          <div className="flex items-center gap-1 text-brand-muted text-[13px] mb-1.5">
            <span className="material-symbols-outlined text-brand-navy text-[16px]">
              location_on
            </span>
            <span className="truncate">{property.address}</span>
          </div>

          {/* Title clamped to 2 lines */}
          <h3
            onClick={() => onViewDetails && onViewDetails(property)}
            className="font-serif text-[18px] font-bold text-brand-ink leading-snug line-clamp-2 cursor-pointer hover:text-brand-red transition-colors"
            title={property.title}
          >
            {property.title}
          </h3>

          {/* Price display in Playfair bold */}
          <div className="mt-3">
            <span className="font-serif text-[24px] font-bold text-brand-red tracking-tight">
              {formatNaira(property.price, property.period)}
            </span>
          </div>
        </div>

        <div>
          {/* 3-Column Spec Bar separated by thin vertical rules */}
          <div className="mt-4 pt-3 border-t border-brand-border grid grid-cols-3 text-center text-[13px] text-brand-muted">
            <div>
              <strong className="text-brand-ink font-bold text-[15px] block font-serif">
                {property.beds > 0 ? property.beds : "—"}
              </strong>
              <span>Beds</span>
            </div>
            <div className="border-x border-brand-border">
              <strong className="text-brand-ink font-bold text-[15px] block font-serif">
                {property.baths > 0 ? property.baths : "—"}
              </strong>
              <span>Baths</span>
            </div>
            <div>
              <strong className="text-brand-ink font-bold text-[15px] block font-serif">
                {property.sqm}
              </strong>
              <span>sqm</span>
            </div>
          </div>

          {/* Feature Chips */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {property.features.slice(0, 2).map((feature, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-navy bg-brand-navy-tint/40 px-2 py-0.5 rounded-full"
              >
                <span className="material-symbols-outlined text-[12px]">check</span>
                {feature}
              </span>
            ))}
          </div>

          {/* Footer Actions */}
          <div className="mt-4 pt-3 border-t border-brand-border flex items-center justify-between text-[13px]">
            <button
              type="button"
              onClick={() => onViewDetails && onViewDetails(property)}
              className="text-brand-navy font-bold hover:text-brand-red transition-colors inline-flex items-center gap-1"
            >
              <span>View Details</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>

            <a
              href={whatsappInquiryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-whatsapp hover:text-brand-whatsapp-hover font-bold inline-flex items-center gap-1"
              aria-label={`Inquire via WhatsApp about ${property.title}`}
            >
              <WhatsAppIcon className="w-4 h-4"/>
              <span>Inquire</span>
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
