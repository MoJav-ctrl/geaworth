export interface SeoEntry {
  title: string;
  description: string;
}

export const SITE_URL = "https://geaworthproperties.com";

export const DEFAULT_SEO: SeoEntry = {
  title: "Geaworth Properties | Prime Lagos Real Estate",
  description:
    "Licensed, title-verified Lagos real estate bureau specializing in sales, lettings, shortlets, and investment advisory across Ikoyi, Lekki, Victoria Island, and Ikeja GRA.",
};

/** One entry per route: unique <title> and meta description. */
export const SEO_BY_PATH: Record<string, SeoEntry> = {
  "/": DEFAULT_SEO,
  "/properties": {
    title: "Explore Properties for Sale, Rent & Shortlet in Lagos | Geaworth Properties",
    description:
      "Browse every title-verified Geaworth listing across Lagos. Filter by area, property type and budget for homes to buy, rent or book as shortlets.",
  },
  "/services": {
    title: "Services built around how Lagos moves | Geaworth Properties",
    description:
      "Property sales and acquisitions, lettings, shortlets, facility management, investment advisory, valuations and diaspora relocation across Lagos, with every title vetted at Alausa.",
  },
  "/sell": {
    title: "Sell a Property | Private Valuation Desk | Geaworth Properties",
    description:
      "Request a confidential valuation for your Lagos property. Discreet off-market or public sales across Ikoyi, Lekki Phase 1, Victoria Island and Ikeja GRA, with a written report within 24 hours.",
  },
  "/about": {
    title: "About Us | We know Lagos, street by street | Geaworth Properties",
    description:
      "Geaworth Properties Limited (RC 1498320) is a licensed Lagos real estate bureau founded in 2014 on integrity, local knowledge and genuine care. Meet the team and our standards.",
  },
  "/contact": {
    title: "Contact Us | Let's talk property | Geaworth Properties",
    description:
      "Book a viewing or send an inquiry to Geaworth's Lekki advisory desk. Call +234 708 142 2110 or chat on WhatsApp; response within 45 minutes.",
  },
  "/privacy": {
    title: "Privacy Policy | Geaworth Properties",
    description: "How Geaworth Properties Limited collects, uses and protects your personal data under the Nigeria Data Protection Act.",
  },
  "/terms": {
    title: "Terms of Service | Geaworth Properties",
    description: "The terms that apply when you use the Geaworth Properties website and services.",
  },
  "/title-due-diligence": {
    title: "Title Due Diligence Policy | Geaworth Properties",
    description:
      "How every Geaworth listing is verified at the Lagos State Lands Bureau, Alausa (Governor's Consent / Certificate of Occupancy) before it is shown.",
  },
};
