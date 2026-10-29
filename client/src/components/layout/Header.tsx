import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { SITE_CONFIG, getWhatsAppUrl } from "../../config/site.ts";
import { WhatsAppIcon } from "../ui/WhatsAppIcon.tsx";
import { useFocusTrap } from "../../hooks/useFocusTrap.ts";

export function Header() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const location = useLocation();
  const drawerRef = useRef<HTMLDivElement>(null);
  useFocusTrap(drawerRef, isDrawerOpen);

  // Close drawer on route change
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [location.pathname]);

  // Lock body scroll and listen for Escape key when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setIsDrawerOpen(false);
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isDrawerOpen]);

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Services", path: "/services" },
    { label: "Sell a Property", path: "/sell" },
    { label: "About Us", path: "/about" },
    { label: "Contact Us", path: "/contact" },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 w-full h-20 z-50 pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] bg-white/95 backdrop-blur-md border-b border-brand-border shadow-[0_1px_8px_rgba(23,23,23,0.03)] transition-all">
        <div className="h-full max-w-7xl mx-auto px-5 md:px-8 lg:px-12 flex items-center justify-between gap-6">
          {/* Left: Logo & Wordmark */}
          <Link
            to="/"
            className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy rounded-lg p-1 group"
            aria-label="Geaworth Properties Home"
          >
            <img
              src="/assets/logo-96.webp"
              alt="Geaworth Properties Emblem"
              className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
              width="32"
              height="32"
            />
            <span className="font-bold text-xl tracking-tight text-brand-ink">
              Geaworth<span className="text-brand-red">.</span>
            </span>
          </Link>

          {/* Center Navigation (Desktop >= 1024px) */}
          <nav
            className="hidden lg:flex items-center gap-7"
            aria-label="Main Navigation"
          >
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  aria-current={active ? "page" : undefined}
                  className={`text-[13px] uppercase tracking-[0.05em] whitespace-nowrap transition-colors py-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy rounded ${
                    active
                      ? "text-brand-red font-bold border-b-2 border-brand-red"
                      : "text-brand-nav hover:text-brand-ink font-semibold"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Section: Phone, Book Viewing Button, WhatsApp Icon */}
          <div className="flex items-center gap-4">
            {/* Direct Lagos Desk Telephone (xl screens) */}
            <div className="hidden xl:flex flex-col text-right pr-2">
              <span className="text-[11px] uppercase tracking-[0.08em] text-brand-muted font-semibold">
                Lagos Direct Desk
              </span>
              <a
                href={`tel:${SITE_CONFIG.phones.desk}`}
                className="text-[14px] font-bold text-brand-ink hover:text-brand-red transition-colors leading-tight"
              >
                {SITE_CONFIG.phones.deskDisplay}
              </a>
            </div>

            {/* WhatsApp Quick Icon */}
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex w-10 h-10 items-center justify-center rounded-xl bg-brand-whatsapp/10 text-brand-whatsapp hover:bg-brand-whatsapp hover:text-brand-ink transition-all shadow-sm"
              title="Chat with Lagos Desk on WhatsApp"
              aria-label="Chat with Lagos Desk on WhatsApp"
            >
              <WhatsAppIcon className="w-5 h-5"/>
            </a>

            {/* Red Primary Button */}
            <Link
              to="/contact"
              className="hidden sm:inline-flex items-center justify-center bg-brand-red hover:bg-brand-red-hover active:bg-brand-red-active text-white text-[13px] uppercase tracking-[0.04em] font-bold px-5 py-2.5 rounded-[10px] transition-all shadow-[0_2px_8px_-2px_rgba(23,23,23,0.05)] hover:shadow-md"
            >
              Book a Viewing
            </Link>

            {/* Mobile Hamburger Button (< 1024px) */}
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="lg:hidden w-11 h-11 flex items-center justify-center text-brand-ink hover:bg-brand-sand/50 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy"
              aria-label="Open mobile navigation menu"
              aria-expanded={isDrawerOpen}
              aria-controls="mobile-drawer"
              aria-haspopup="dialog"
            >
              <span className="material-symbols-outlined text-[28px]">menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* Slide-In Mobile Drawer (< 1024px) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          {/* Flat Scrim */}
          <div
            className="fixed inset-0 bg-brand-ink/60 transition-opacity animate-fade-in"
            onClick={() => setIsDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div
            id="mobile-drawer"
            ref={drawerRef}
            className="relative w-full max-w-sm bg-brand-card h-dvh shadow-2xl flex flex-col justify-between p-6 pb-safe z-10 overflow-y-auto overscroll-contain animate-slide-in-right"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
          >
            {/* Top Bar with Logo & Close button */}
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-brand-border">
                <Link
                  to="/"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center gap-2"
                >
                  <img
                    src="/assets/logo-96.webp"
                    alt="Geaworth Properties"
                    width="28"
                    height="28"
                    className="h-7 w-auto object-contain"
                  />
                  <span className="font-bold text-lg text-brand-ink">
                    Geaworth<span className="text-brand-red">.</span>
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-11 h-11 flex items-center justify-center rounded-lg text-brand-muted hover:text-brand-ink hover:bg-brand-canvas"
                  aria-label="Close navigation menu"
                >
                  <span className="material-symbols-outlined text-2xl">close</span>
                </button>
              </div>

              {/* Navigation Items (48px+ tap height) */}
              <nav className="flex flex-col py-6 gap-2" aria-label="Mobile Menu Links">
                {navLinks.map((link) => {
                  const active = isActive(link.path);
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsDrawerOpen(false)}
                      className={`min-h-[50px] flex items-center px-4 rounded-xl text-[15px] uppercase tracking-wider font-semibold transition-colors ${
                        active
                          ? "bg-brand-red/10 text-brand-red font-bold"
                          : "text-brand-ink hover:bg-brand-canvas"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Contact Actions */}
            <div className="pt-6 border-t border-brand-border flex flex-col gap-3">
              <div className="text-center pb-1">
                <span className="text-xs uppercase tracking-wider text-brand-muted block">
                  Lagos Direct Desk
                </span>
                <a
                  href={`tel:${SITE_CONFIG.phones.desk}`}
                  className="text-base font-bold text-brand-ink hover:text-brand-red"
                >
                  {SITE_CONFIG.phones.deskDisplay}
                </a>
              </div>

              <Link
                to="/contact"
                onClick={() => setIsDrawerOpen(false)}
                className="w-full h-12 flex items-center justify-center bg-brand-red hover:bg-brand-red-hover text-white text-[13px] uppercase tracking-wider font-bold rounded-[10px] shadow-sm transition-all"
              >
                Book a Viewing
              </Link>

              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-12 flex items-center justify-center gap-2 bg-brand-whatsapp hover:bg-brand-whatsapp-hover text-brand-ink text-[13px] uppercase tracking-wider font-bold rounded-[10px] shadow-sm transition-all"
              >
                <WhatsAppIcon className="w-5 h-5"/>
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
