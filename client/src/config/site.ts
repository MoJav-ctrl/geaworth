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
    instagramLink: string;
  };
}

export const SITE_CONFIG: SiteConfig = {
  name: "Geaworth Properties",
  wordmark: "Geaworth.",
  tagline: "Curating verified residential and commercial assets across Lagos. Rooted in structural integrity, verifiable land documentation, and seamless property acquisitions.",
  rcNumber: "RC 1586052",
  foundedYear: 2014,
  headquarters: {
    address: "21B, Road 3B, Ikota Villa Estate, Ikota, Lekki, Lagos, Nigeria",
    street: "21B, Road 3B, Ikota Villa Estate",
    enclave: "Ikota",
    city: "Lekki",
    state: "Lagos State",
    country: "Nigeria",
    landmark: "Ikota Villa Estate",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=21B+Road+3B+Ikota+Villa+Estate+Ikota+Lekki+Lagos",
    coordinates: { lat: 6.4456744, lon: 3.5593169 },
  },
  phones: {
    desk: "+2347081422110",
    deskDisplay: "+2347081422110",
    whatsapp: "+2347081422110",
    whatsappDisplay: "+2347081422110"
  },
  emails: {
    info: "info@geaworthproperties.com"
  },
  workingHours: {
    weekdays: "8:00 AM – 6:00 PM",
    saturday: "9:00 AM – 4:00 PM (By Appt)",
    sunday: "Emergency Tenant Support Only"
  },
  socials: {
    whatsappLink: "https://wa.me/2347081422110",
    instagramLink: "https://www.instagram.com/geaworth_properties/"
  }
};

export function getWhatsAppUrl(prefilledText?: string): string {
  const base = "https://wa.me/2347081422110";
  if (!prefilledText) {
    return `${base}?text=Hello%20Geaworth%20Properties,%20I%20would%20like%20to%20inquire%20about%20a%20property%20listing.`;
  }
  return `${base}?text=${encodeURIComponent(prefilledText)}`;
}
