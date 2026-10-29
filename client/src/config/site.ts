export interface SiteConfig {
  name: string;
  wordmark: string;
  tagline: string;
  rcNumber: string;
  foundedYear: number;
  headquarters: {
    address: string;
    street: string;
    enclave: string;
    city: string;
    state: string;
    country: string;
    landmark: string;
    mapsUrl: string;
    /** Approximate pin for Plot 14, Admiralty Way, Lekki Phase 1 – verify on site before launch */
    coordinates: { lat: number; lon: number };
  };
  phones: {
    desk: string;
    deskDisplay: string;
    whatsapp: string;
    whatsappDisplay: string;
  };
  emails: {
    info: string;
  };
  workingHours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  socials: {
    whatsappLink: string;
  };
}

export const SITE_CONFIG: SiteConfig = {
  name: "Geaworth Properties",
  wordmark: "Geaworth.",
  tagline: "Curating verified residential and commercial assets across Lagos. Rooted in structural integrity, verifiable land documentation, and seamless property acquisitions.",
  rcNumber: "RC 1498320",
  foundedYear: 2014,
  headquarters: {
    address: "Plot 14 Admiralty Way, Lekki Phase 1, Lagos, Nigeria",
    street: "Plot 14, Admiralty Way",
    enclave: "Lekki Phase 1",
    city: "Lekki",
    state: "Lagos State",
    country: "Nigeria",
    landmark: "Directly opposite The Palms Shopping corridor, adjacent to Ocean Basket.",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Plot+14+Admiralty+Way+Lekki+Phase+1+Lagos",
    coordinates: { lat: 6.4478, lon: 3.4723 },
  },
  phones: {
    desk: "+23418924400",
    deskDisplay: "+234 1 892 4400",
    whatsapp: "+2348030007890",
    whatsappDisplay: "+234 803 000 7890"
  },
  emails: {
    /** The one public address. Website form notifications are sent here too (see NOTIFICATION_EMAIL). */
    info: "info@geaworthproperties.com"
  },
  workingHours: {
    weekdays: "8:00 AM – 6:00 PM",
    saturday: "9:00 AM – 4:00 PM (By Appt)",
    sunday: "Emergency Tenant Support Only"
  },
  socials: {
    whatsappLink: "https://wa.me/2348030007890"
  }
};

export function getWhatsAppUrl(prefilledText?: string): string {
  const base = "https://wa.me/2348030007890";
  if (!prefilledText) {
    return `${base}?text=Hello%20Geaworth%20Properties,%20I%20would%20like%20to%20inquire%20about%20a%20property%20listing.`;
  }
  return `${base}?text=${encodeURIComponent(prefilledText)}`;
}
