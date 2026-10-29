import { Suspense, useRef } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header.tsx";
import { Footer } from "./Footer.tsx";
import { FloatingWhatsApp } from "./FloatingWhatsApp.tsx";
import { ScrollToTop } from "./ScrollToTop.tsx";
import { ClosingCtaBand } from "./ClosingCtaBand.tsx";
import { useScrollReveal } from "../../hooks/useScrollReveal.ts";

function PageLoader() {
  return (
    <div role="status" aria-live="polite" className="min-h-[60vh] flex items-center justify-center">
      <span className="sr-only">Loading page…</span>
      <div className="w-10 h-10 rounded-full border-2 border-brand-border border-t-brand-red animate-spin" aria-hidden="true" />
    </div>
  );
}

/** The one shared shell: header, main (page + shared closing CTA), footer, WhatsApp float. */
export function Layout() {
  const mainRef = useRef<HTMLElement>(null);
  useScrollReveal(mainRef);

  return (
    <div className="flex flex-col min-h-dvh bg-brand-canvas text-brand-ink">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:bg-brand-navy focus:text-white focus:px-4 focus:py-3 focus:rounded-lg"
      >
        Skip to main content
      </a>
      <ScrollToTop />
      <Header />
      <main id="main-content" ref={mainRef} tabIndex={-1} className="flex-1 w-full pt-20 bg-brand-canvas outline-none">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
          <ClosingCtaBand />
        </Suspense>
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
