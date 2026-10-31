import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Layout } from "./components/layout/Layout.tsx";
import { DEFAULT_SEO, SEO_BY_PATH } from "./config/seo.ts";
import { useSeo } from "./hooks/useSeo.ts";

// Code-split: each page is its own chunk, loaded on demand.
const HomePage = lazy(() => import("./pages/HomePage.tsx").then((m) => ({ default: m.HomePage })));
const PropertiesPage = lazy(() => import("./pages/PropertiesPage.tsx").then((m) => ({ default: m.PropertiesPage })));
const ServicesPage = lazy(() => import("./pages/ServicesPage.tsx").then((m) => ({ default: m.ServicesPage })));
const SellPage = lazy(() => import("./pages/SellPage.tsx").then((m) => ({ default: m.SellPage })));
const AboutPage = lazy(() => import("./pages/AboutPage.tsx").then((m) => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import("./pages/ContactPage.tsx").then((m) => ({ default: m.ContactPage })));
const ListingDetailPage = lazy(() =>
  import("./pages/ListingDetailPage.tsx").then((m) => ({ default: m.ListingDetailPage })),
);
const LegalPage = lazy(() => import("./pages/LegalPage.tsx").then((m) => ({ default: m.LegalPage })));
const AdminApp = lazy(() => import("./admin/AdminApp.tsx"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage.tsx").then((m) => ({ default: m.NotFoundPage })));

/** Unique <title> + meta description + canonical for every static route. */
function RouteSeo() {
  const { pathname } = useLocation();
  const known = SEO_BY_PATH[pathname];
  const isListing = pathname.startsWith("/listings/");
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  // Listing pages set their own SEO from the listing data; unknown paths are 404s.
  useSeo(
    known ??
      (isAdmin
        ? { title: "Admin | Geaworth Properties", description: DEFAULT_SEO.description }
        : isListing
        ? { title: "Verified Property Listing | Geaworth Properties", description: DEFAULT_SEO.description }
        : { title: "Page not found | Geaworth Properties", description: DEFAULT_SEO.description }),
    pathname,
  );
  return null;
}

export function App() {
  return (
    <BrowserRouter>
      <RouteSeo />
      <Routes>
        {/* Admin area: its own shell (no public header/footer), loaded only when visited */}
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<div className="min-h-screen bg-brand-canvas" aria-busy="true" />}>
              <AdminApp />
            </Suspense>
          }
        />
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/sell" element={<SellPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/listings/:id" element={<ListingDetailPage />} />
          <Route path="/privacy" element={<LegalPage type="privacy" />} />
          <Route path="/terms" element={<LegalPage type="terms" />} />
          <Route path="/title-due-diligence" element={<LegalPage type="title-due-diligence" />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
