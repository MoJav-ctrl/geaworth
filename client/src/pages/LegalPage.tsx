import { Link } from "react-router-dom";
import { SITE_CONFIG } from "../config/site.ts";

interface LegalPageProps {
  type: "privacy" | "terms" | "title-due-diligence";
}

export function LegalPage({ type }: LegalPageProps) {
  const titles = {
    privacy: "Privacy Policy (NDPA Compliant)",
    terms: "Terms of Service & Brokerage Mandates",
    "title-due-diligence": "Title Due Diligence & Alausa Verification Policy",
  };

  const breadcrumbs = {
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    "title-due-diligence": "Title Due Diligence Policy",
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-5 md:px-8 py-12 md:py-16">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[12px] uppercase font-bold tracking-wider text-brand-muted mb-6">
        <Link to="/" className="hover:text-brand-red transition-colors">Home</Link>
        <span>/</span>
        <span className="text-brand-ink">{breadcrumbs[type]}</span>
      </nav>

      <div className="bg-white border border-brand-border rounded-2xl p-8 sm:p-12 shadow-sm space-y-8">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-brand-red-deep font-bold block mb-1">
            {SITE_CONFIG.rcNumber} • Legal Document
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-ink">
            {titles[type]}
          </h1>
          <p className="text-[13px] text-brand-muted mt-1">
            Last Updated: January 2025 • Registered Address: {SITE_CONFIG.headquarters.address}
          </p>
        </div>

        {type === "privacy" && (
          <div className="space-y-6 text-[15px] leading-relaxed text-brand-nav">
            <section className="space-y-2">
              <h2 className="font-serif text-xl font-bold text-brand-ink">
                1. Nigeria Data Protection Act (NDPA) Compliance
              </h2>
              <p>
                Geaworth Properties Limited (RC 1498320) processes personal data in strict compliance with the Nigeria Data Protection Act (NDPA) and applicable regulations. We collect your full name, phone number, email address, and property preferences solely to coordinate private property viewings, advisory consultations, and conveyancing services.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-xl font-bold text-brand-ink">
                2. Zero Third-Party Broker Sharing Guarantee
              </h2>
              <p>
                Unlike informal property aggregators in Lagos, we never sell, share, or syndicate your telephone or transaction budget with unauthorized street canvassers or external marketing syndicates. All files remain in-house under confidentiality agreements.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-xl font-bold text-brand-ink">
                3. Data Security &amp; Retention
              </h2>
              <p>
                Valuation documents, survey plans, and title certificates shared through our platform are transmitted over TLS encryption and stored securely. You retain the right to request deletion or export of your record at any time by contacting{" "}
                <a href={`mailto:${SITE_CONFIG.emails.info}`} className="text-brand-navy underline">
                  {SITE_CONFIG.emails.info}
                </a>.
              </p>
            </section>
          </div>
        )}

        {type === "terms" && (
          <div className="space-y-6 text-[15px] leading-relaxed text-brand-nav">
            <section className="space-y-2">
              <h2 className="font-serif text-xl font-bold text-brand-ink">
                1. Agency Representation &amp; Mandates
              </h2>
              <p>
                Geaworth Properties Limited operates as a licensed property advisory and brokerage bureau in Lagos State. Representation commences upon formal engagement or submission of viewing and valuation directives.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-xl font-bold text-brand-ink">
                2. Transparent Professional Fees
              </h2>
              <p>
                Professional agency fees follow standardized, statutory benchmarks: 5% on purchase or sale transactions, and 10% on annual residential and commercial lettings. Zero hidden logistics or unreceipted fees are assessed.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-xl font-bold text-brand-ink">
                3. Escrow &amp; Funds Settlement
              </h2>
              <p>
                Earnest deposits and consideration monies are processed through designated institutional escrow accounts with licensed Nigerian commercial banks, with release conditional upon verified title assignment and Governor's Consent approvals.
              </p>
            </section>
          </div>
        )}

        {type === "title-due-diligence" && (
          <div className="space-y-6 text-[15px] leading-relaxed text-brand-nav">
            <section className="space-y-2">
              <h2 className="font-serif text-xl font-bold text-brand-ink">
                1. The Alausa Lands Bureau Protocol
              </h2>
              <p>
                Every listing published by Geaworth Properties undergoes an independent verification search at the Lagos State Lands Bureau in Alausa, Ikeja. We examine the root of title, including Certificate of Occupancy (C of O), Governor’s Consent, and Gazetted acquisitions.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-xl font-bold text-brand-ink">
                2. Cadastral Beacon Charting
              </h2>
              <p>
                Before advising a buyer to commit funds, survey coordinates are chartered with the Office of the Surveyor General of Lagos State to verify that the parcel does not fall within committed government infrastructure zones or drainage setbacks.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-xl font-bold text-brand-ink">
                3. Zero Phantom Listing Guarantee
              </h2>
              <p>
                We do not list phantom properties or unverified developer off-plan schemes without structural building approval from the Lagos State Building Control Agency (LASBCA). Our commitment is 100% legal integrity.
              </p>
            </section>
          </div>
        )}

        <div className="pt-6 border-t border-brand-border flex items-center justify-between">
          <Link
            to="/contact"
            className="inline-flex items-center gap-1.5 text-brand-red-deep text-[13px] font-bold uppercase"
          >
            <span>Have questions? Contact Advisory Desk</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
          <Link
            to="/"
            className="text-[13px] font-bold text-brand-navy hover:underline"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
