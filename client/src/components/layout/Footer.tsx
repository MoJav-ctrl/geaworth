import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { SITE_CONFIG, getWhatsAppUrl } from "../../config/site.ts";
import { WhatsAppIcon } from "../ui/WhatsAppIcon.tsx";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubscribe = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (res.ok && data.ok) {
        setStatus("success");
        setMessage(data.message || "Thank you for subscribing to the Lagos Dispatch.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Unable to subscribe at this moment. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please check your connection and try again.");
    }
  };

  return (
    <footer className="w-full bg-brand-tint2 text-brand-ink pt-16 md:pt-24 pb-12 border-t border-brand-border">
      <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-16 border-b border-brand-border">
          {/* Brand Column (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2.5 w-fit">
              <img
                src="/assets/logo-96.webp"
                alt="Geaworth Properties Emblem"
                className="h-7 w-auto object-contain"
                width="28"
                height="28"
              />
              <span className="font-bold text-xl tracking-tight text-brand-ink">
                Geaworth<span className="text-brand-red">.</span>
              </span>
            </Link>

            <p className="text-[14px] leading-relaxed text-brand-nav max-w-sm">
              {SITE_CONFIG.tagline}
            </p>

            <div className="flex flex-col gap-2 pt-2 text-[13px] text-brand-nav">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-brand-red text-base mt-0.5 shrink-0">
                  location_on
                </span>
                <span>{SITE_CONFIG.headquarters.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-brand-navy text-base shrink-0">
                  phone
                </span>
                <div className="flex flex-wrap gap-x-2">
                  <a
                    href={`tel:${SITE_CONFIG.phones.whatsapp}`}
                    className="inline-flex items-center min-h-11 hover:text-brand-red transition-colors"
                  >
                    {SITE_CONFIG.phones.whatsappDisplay}
                  </a>
                  <span>/</span>
                  <a
                    href={`tel:${SITE_CONFIG.phones.desk}`}
                    className="inline-flex items-center min-h-11 hover:text-brand-red transition-colors"
                  >
                    {SITE_CONFIG.phones.deskDisplay}
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white hover:bg-brand-sand text-brand-ink text-[12px] uppercase tracking-wider font-bold px-4 py-2.5 rounded-[10px] border border-brand-border transition-colors shadow-sm"
              >
                <WhatsAppIcon className="w-[18px] h-[18px] text-brand-whatsapp"/>
                Chat via WhatsApp
              </a>
            </div>
          </div>

          {/* Explore Column (2 Cols) */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <h3 className="text-[12px] font-bold uppercase tracking-[0.06em] text-brand-ink">
              Explore
            </h3>
            <ul className="flex flex-col text-[14px] text-brand-nav">
              <li>
                <Link to="/" className="inline-flex items-center min-h-11 hover:text-brand-red transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/services" className="inline-flex items-center min-h-11 hover:text-brand-red transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/sell" className="inline-flex items-center min-h-11 hover:text-brand-red transition-colors">
                  Sell a Property
                </Link>
              </li>
              <li>
                <Link to="/about" className="inline-flex items-center min-h-11 hover:text-brand-red transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="inline-flex items-center min-h-11 hover:text-brand-red transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/?filter=verified#curated-residences" className="inline-flex items-center min-h-11 hover:text-brand-red transition-colors">
                  Verified Listings
                </Link>
              </li>
              <li>
                <a href="/api/reports/lagos-q3" download className="inline-flex items-center min-h-11 hover:text-brand-red transition-colors">
                  Lagos Market Reports
                </a>
              </li>
            </ul>
          </div>

          {/* Neighborhood Guides Column (3 Cols) */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            <h3 className="text-[12px] font-bold uppercase tracking-[0.06em] text-brand-ink">
              Neighborhood Guides
            </h3>
            <ul className="grid grid-cols-2 gap-x-4 text-[14px] text-brand-nav">
              <li>
                <Link to="/?area=ikoyi#curated-residences" className="inline-flex items-center min-h-11 hover:text-brand-red transition-colors">
                  Ikoyi
                </Link>
              </li>
              <li>
                <Link to="/?area=lekki-1#curated-residences" className="inline-flex items-center min-h-11 hover:text-brand-red transition-colors">
                  Lekki Phase 1
                </Link>
              </li>
              <li>
                <Link to="/?area=victoria-island#curated-residences" className="inline-flex items-center min-h-11 hover:text-brand-red transition-colors">
                  Victoria Island
                </Link>
              </li>
              <li>
                <Link to="/?area=ikeja-gra#curated-residences" className="inline-flex items-center min-h-11 hover:text-brand-red transition-colors">
                  Ikeja GRA
                </Link>
              </li>
              <li>
                <Link to="/?area=surulere#curated-residences" className="inline-flex items-center min-h-11 hover:text-brand-red transition-colors">
                  Surulere
                </Link>
              </li>
              <li>
                <Link to="/?area=epe#curated-residences" className="inline-flex items-center min-h-11 hover:text-brand-red transition-colors">
                  Epe Corridor
                </Link>
              </li>
            </ul>
          </div>

          {/* Dispatch Newsletter Column (3 Cols) */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            <h3 className="text-[12px] font-bold uppercase tracking-[0.06em] text-brand-ink">
              Lagos Property Dispatch
            </h3>
            <p className="text-[13px] leading-relaxed text-brand-nav">
              Receive off-market listings, Governor's Consent verification briefs, and neighborhood yield forecasts.
            </p>

            <form onSubmit={handleSubscribe} noValidate className="flex flex-col gap-2 pt-1">
              <input
                id="footer-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                required
                aria-invalid={status === "error"}
                aria-describedby={message ? "footer-subscribe-msg" : undefined}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="w-full bg-white border border-brand-border text-brand-ink text-[14px] px-3.5 py-2.5 rounded-[8px] focus:outline-none focus:border-brand-navy transition-colors"
                aria-label="Email address for Lagos Property Dispatch"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-brand-red hover:bg-brand-red-hover text-white text-[12px] uppercase tracking-[0.06em] font-bold py-2.5 px-4 rounded-[8px] transition-colors shadow-sm disabled:opacity-70"
              >
                {status === "loading" ? "Subscribing..." : "Subscribe to Dispatch"}
              </button>
            </form>

            {message && (
              <p
                id="footer-subscribe-msg"
                className={`text-[12px] mt-1 p-2 rounded ${
                  status === "success"
                    ? "bg-brand-navy-tint text-brand-navy font-semibold"
                    : "bg-brand-error-bg text-brand-error"
                }`}
                role={status === "error" ? "alert" : "status"}
              >
                {message}
              </p>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-brand-nav">
          <p>© {currentYear} Geaworth Properties Limited. All rights reserved. Registered {SITE_CONFIG.rcNumber}.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-6">
            <Link to="/privacy" className="inline-flex items-center min-h-11 hover:text-brand-ink transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="inline-flex items-center min-h-11 hover:text-brand-ink transition-colors">
              Terms of Service
            </Link>
            <Link to="/title-due-diligence" className="inline-flex items-center min-h-11 hover:text-brand-ink transition-colors">
              Title Due Diligence Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
