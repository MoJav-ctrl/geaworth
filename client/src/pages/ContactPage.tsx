import { useState, useEffect, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { SITE_CONFIG, getWhatsAppUrl } from "../config/site.ts";
import { Accordion, AccordionItem } from "../components/ui/Accordion.tsx";
import { WhatsAppIcon } from "../components/ui/WhatsAppIcon.tsx";
import { Photo } from "../components/ui/Photo.tsx";
import { FieldError } from "../components/ui/FieldError.tsx";
import { inquirySchema, normalizePhone, fieldErrors } from "../utils/validation.ts";

export function ContactPage() {
  const { lat, lon } = SITE_CONFIG.headquarters.coordinates;
  const [searchParams] = useSearchParams();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [primaryInterest, setPrimaryInterest] = useState<string>("buy");
  const [preferredLocation, setPreferredLocation] = useState("Lekki Phase 1");
  const [budget, setBudget] = useState("150-500m");
  const [messageDetails, setMessageDetails] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const interestParam = searchParams.get("interest");
    const propertyParam = searchParams.get("property");

    if (interestParam) {
      if (["buy", "rent", "shortlet", "management", "diaspora", "valuation"].includes(interestParam)) {
        setPrimaryInterest(interestParam);
      }
    }
    if (propertyParam) {
      setMessageDetails(`I would like to schedule an inspection for: ${propertyParam}`);
    }
  }, [searchParams]);

  const BUDGET_LABELS: Record<string, string> = {
    "10-50m": "₦10M - ₦50M",
    "50-150m": "₦50M - ₦150M",
    "150-500m": "₦150M - ₦500M",
    "500m+": "₦500M+",
  };

  const FIELD_IDS: Record<string, string> = {
    fullName: "contact-fullname",
    email: "contact-email",
    phone: "contact-phone",
    primaryInterest: "contact-interest",
    preferredLocation: "contact-location",
    consent: "contact-consent",
  };

  const focusFirstError = (errs: Record<string, string>) => {
    const first = Object.keys(FIELD_IDS).find((k) => errs[k]);
    if (first) document.getElementById(FIELD_IDS[first])?.focus();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const payload = {
      fullName,
      email,
      phone: normalizePhone(phone),
      primaryInterest,
      preferredLocation,
      estimatedBudget: BUDGET_LABELS[budget],
      messageDetails,
      consent,
    };

    const parsed = inquirySchema.safeParse(payload);
    if (!parsed.success) {
      const errs = fieldErrors(parsed.error.issues);
      setErrors(errs);
      setErrorMessage("Please correct the highlighted fields and try again.");
      focusFirstError(errs);
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        setIsSuccess(true);
      } else {
        if (data.fields) {
          setErrors(data.fields);
          focusFirstError(data.fields);
        }
        setErrorMessage(data.error || "Unable to submit your inquiry. Please try again.");
      }
    } catch {
      setErrorMessage("Network error occurred. Please verify your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inspectionFaqs: AccordionItem[] = [
    {
      id: "inq-faq-1",
      number: "01",
      question: "How quickly can I inspect a listed property?",
      answer:
        "We provide same-day or next-day private viewing appointments for vetted buyers across Ikoyi, Lekki Phase 1, and Victoria Island. Private chauffeured site inspections from our Ikota headquarters are also available for multi-property itineraries upon request.",
    },
    {
      id: "inq-faq-2",
      number: "02",
      question: "Do you charge inspection fees?",
      answer: (
        <span>
          Geaworth Properties charges <strong>zero inspection fees</strong> for prospective sales buyers and corporate acquisition mandates. For residential tenancy tours across select high-density locations, transparent standardized logistics fees are disclosed upfront and fully credited back should you execute the lease through us.
        </span>
      ),
    },
    {
      id: "inq-faq-3",
      number: "03",
      question: "Can I schedule a weekend inspection?",
      answer:
        "Yes, Saturday slots between 9:00 AM and 4:00 PM are highly popular and recommended for experiencing island neighborhoods under optimal, calmer traffic conditions. Because access permits must be issued by estate associations, please schedule by Friday noon.",
    },
    {
      id: "inq-faq-4",
      number: "04",
      question: "How do you handle Governor’s Consent and C of O verification?",
      answer:
        "Every property listed on our verified register includes documented confirmation at the Lagos State Lands Registry (Alausa, Ikeja). Before exchanging earnest deposits, buyers receive a certified title summary including cadastral plan coordinates and verification status.",
    },
  ];

  return (
    <div className="w-full flex flex-col">
      {/* 1. EDITORIAL TOP HERO HEADER */}
      <section className="relative w-full bg-white py-14 sm:py-20 border-b border-brand-border overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-12 relative z-10">
          <div className="max-w-3xl flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 self-start bg-brand-navy-tint text-brand-navy px-3.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
              Direct Private Advisory Desk
            </div>

            <h1 className="font-serif text-[40px] sm:text-[50px] lg:text-[58px] font-bold text-brand-ink tracking-tight leading-[1.12]">
              Let’s talk property<span className="text-brand-red">.</span>
            </h1>

            <p className="text-[17px] sm:text-[18px] text-brand-nav leading-relaxed max-w-2xl">
              Whether you're looking for your dream residence in Ikoyi, listing your Lekki duplex for high-caliber tenants, or exploring high-yield Lagos investments, we're here to help.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-[13px] text-brand-ink font-semibold">
              <div className="flex items-center gap-1.5 bg-brand-tint2 px-3 py-1.5 rounded-xl border border-brand-border">
                <span className="material-symbols-outlined text-brand-red text-base">verified</span>
                <span>Headquarters</span>
              </div>
              <div className="flex items-center gap-1.5 bg-brand-tint2 px-3 py-1.5 rounded-xl border border-brand-border">
                <span className="material-symbols-outlined text-brand-navy text-base">schedule</span>
                <span>Response within 45 mins</span>
              </div>
              <div className="flex items-center gap-1.5 bg-brand-tint2 px-3 py-1.5 rounded-xl border border-brand-border">
                <span className="material-symbols-outlined text-brand-red text-base">public</span>
                <span>UK &amp; US Remote Desks Active</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TWO-COLUMN FORM & DIRECT DETAILS (Sand-tinted Band) */}
      <section className="w-full bg-brand-tint2 py-16 sm:py-24 border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Inquiry & Booking Form (7 Cols) */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 md:p-10 rounded-2xl border border-brand-border shadow-[0_2px_8px_-2px_rgba(23,23,23,0.05)] flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase font-bold tracking-wider text-brand-red-deep">
                    Consultation Portal
                  </span>
                  <span className="text-[11px] text-brand-muted">Step 1 of 1</span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-ink">
                  Send us a message or schedule a private viewing
                </h2>
                <p className="text-[14px] text-brand-nav">
                  Complete your criteria below. Our senior transaction managers will verify documentation status and assemble off-market dossiers prior to contact.
                </p>
              </div>

              {isSuccess ? (
                <div className="bg-brand-navy-tint/70 border border-brand-navy/30 text-brand-ink p-6 rounded-2xl flex items-start gap-4 animate-fade-in">
                  <span className="material-symbols-outlined text-brand-navy text-3xl mt-0.5">
                    check_circle
                  </span>
                  <div className="flex flex-col gap-2">
                    <span className="font-serif text-xl font-bold text-brand-navy">
                      Inquiry Received
                    </span>
                    <p className="text-[14px] leading-relaxed">
                      A dedicated Geaworth property director will reach out via WhatsApp and email within 45 minutes with verified matching dossiers.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSuccess(false);
                        setMessageDetails("");
                      }}
                      className="mt-2 text-[12px] uppercase font-bold text-brand-navy underline hover:text-brand-red text-left"
                    >
                      Submit another inquiry
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
                  {errorMessage && (
                    <div role="alert" className="p-3.5 bg-brand-error-bg border border-brand-error/30 text-brand-error-deep text-[13px] rounded-lg">
                      {errorMessage}
                    </div>
                  )}

                  {/* Full Name & Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label htmlFor="contact-fullname" className="text-[11px] uppercase font-bold tracking-wider text-brand-muted">
                        Full Name <span className="text-brand-red">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <span className="material-symbols-outlined absolute left-3.5 text-brand-muted text-lg">
                          person
                        </span>
                        <input
                          id="contact-fullname"
                          name="fullName"
                          autoComplete="name"
                          autoCapitalize="words"
                          aria-invalid={!!errors.fullName}
                          aria-describedby={errors.fullName ? "contact-fullname-error" : undefined}
                          type="text"
                          aria-required="true"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Engr. Kunle Ogundipe"
                          className="w-full bg-brand-canvas border border-brand-border pl-10 pr-4 py-2.5 rounded-xl text-[14px] text-brand-ink focus:bg-white focus:border-brand-navy"
                        />
                      </div>
                      <FieldError id="contact-fullname" message={errors.fullName} />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label htmlFor="contact-email" className="text-[11px] uppercase font-bold tracking-wider text-brand-muted">
                        Email Address <span className="text-brand-red">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <span className="material-symbols-outlined absolute left-3.5 text-brand-muted text-lg">
                          mail
                        </span>
                        <input
                          id="contact-email"
                          name="email"
                          inputMode="email"
                          autoComplete="email"
                          autoCapitalize="none"
                          spellCheck={false}
                          aria-invalid={!!errors.email}
                          aria-describedby={errors.email ? "contact-email-error" : undefined}
                          type="email"
                          aria-required="true"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="kunle.o@example.com"
                          className="w-full bg-brand-canvas border border-brand-border pl-10 pr-4 py-2.5 rounded-xl text-[14px] text-brand-ink focus:bg-white focus:border-brand-navy"
                        />
                      </div>
                      <FieldError id="contact-email" message={errors.email} />
                    </div>
                  </div>

                  {/* Phone Number with Nigerian Flag & +234 lock */}
                  <div className="flex flex-col gap-1">
                    <label htmlFor="contact-phone" className="text-[11px] uppercase font-bold tracking-wider text-brand-muted">
                      Phone Number (WhatsApp Active) <span className="text-brand-red">*</span>
                    </label>
                    <div className="flex rounded-xl overflow-hidden border border-brand-border bg-brand-canvas">
                      <div className="flex items-center gap-1.5 px-3.5 bg-brand-sand text-brand-ink text-[13px] font-bold select-none">
                        <span>🇳🇬</span>
                        <span>+234</span>
                      </div>
                      <input
                        id="contact-phone"
                        name="phone"
                        inputMode="tel"
                        autoComplete="tel"
                        aria-invalid={!!errors.phone}
                        aria-describedby={errors.phone ? "contact-phone-error" : undefined}
                        type="tel"
                        aria-required="true"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="803 000 7890"
                        className="w-full bg-transparent px-4 py-2.5 text-[14px] text-brand-ink focus:bg-white focus:outline-none"
                      />
                    </div>
                    <FieldError id="contact-phone" message={errors.phone} />
                    <span className="text-[11px] text-brand-muted">
                      For diaspora clients, please include your full country code in the input if other than +234.
                    </span>
                  </div>

                  {/* Primary Interest & Preferred Location */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label htmlFor="contact-interest" className="text-[11px] uppercase font-bold tracking-wider text-brand-muted">
                        Primary Interest <span className="text-brand-red">*</span>
                      </label>
                      <div className="relative">
                        <select
                          id="contact-interest"
                          name="primaryInterest"
                          aria-invalid={!!errors.primaryInterest}
                          aria-describedby={errors.primaryInterest ? "contact-interest-error" : undefined}
                          value={primaryInterest}
                          onChange={(e) => setPrimaryInterest(e.target.value)}
                          className="w-full bg-brand-canvas border border-brand-border px-4 py-2.5 rounded-xl text-[14px] text-brand-ink appearance-none focus:bg-white focus:border-brand-navy cursor-pointer"
                        >
                          <option value="buy">I want to Buy a Property</option>
                          <option value="rent">I want to Rent a Home</option>
                          <option value="shortlet">I need a Shortlet / Serviced Apartment</option>
                          <option value="management">I want Geaworth to Manage my Property</option>
                          <option value="diaspora">Diaspora Real Estate Investment Advisory</option>
                          <option value="valuation">Property Valuation Request</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-3 text-brand-muted pointer-events-none text-base">
                          expand_more
                        </span>
                      </div>
                      <FieldError id="contact-interest" message={errors.primaryInterest} />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label htmlFor="contact-location" className="text-[11px] uppercase font-bold tracking-wider text-brand-muted">
                        Preferred Lagos Location <span className="text-brand-red">*</span>
                      </label>
                      <div className="relative">
                        <select
                          id="contact-location"
                          name="preferredLocation"
                          aria-invalid={!!errors.preferredLocation}
                          aria-describedby={errors.preferredLocation ? "contact-location-error" : undefined}
                          value={preferredLocation}
                          onChange={(e) => setPreferredLocation(e.target.value)}
                          className="w-full bg-brand-canvas border border-brand-border px-4 py-2.5 rounded-xl text-[14px] text-brand-ink appearance-none focus:bg-white focus:border-brand-navy cursor-pointer"
                        >
                          <optgroup label="Island Corridors">
                            <option value="Ikoyi (Old Ikoyi / Banana Island)">Ikoyi (Old &amp; Banana Island)</option>
                            <option value="Lekki Phase 1">Lekki Phase 1</option>
                            <option value="Victoria Island / Oniru">Victoria Island / Oniru</option>
                            <option value="Chevron / Ikate / Osapa">Chevron / Ikate / Osapa</option>
                            <option value="Epe Rapid Corridor">Epe Rapid Corridor</option>
                          </optgroup>
                          <optgroup label="Mainland Enclaves">
                            <option value="Ikeja GRA">Ikeja GRA</option>
                            <option value="Magodo Phase 2">Magodo Phase 2</option>
                            <option value="Yaba Central">Yaba Central</option>
                            <option value="Surulere">Surulere</option>
                          </optgroup>
                          <option value="Other / Nationwide Portfolio">Other / Nationwide Portfolio</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-3 text-brand-muted pointer-events-none text-base">
                          expand_more
                        </span>
                      </div>
                      <FieldError id="contact-location" message={errors.preferredLocation} />
                    </div>
                  </div>

                  {/* Estimated Budget Range as Selectable Tiles */}
                  <fieldset className="flex flex-col gap-1.5 min-w-0">
                    <legend className="text-[11px] uppercase font-bold tracking-wider text-brand-muted mb-1.5">
                      Estimated Budget Range (₦ Naira)
                    </legend>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <label
                        className={`p-3 rounded-xl border text-center cursor-pointer transition-all has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-navy ${
                          budget === "10-50m"
                            ? "bg-brand-navy text-white border-brand-navy"
                            : "bg-brand-canvas text-brand-ink border-brand-border hover:bg-brand-sand"
                        }`}
                      >
                        <input
                          type="radio"
                          name="budget"
                          value="10-50m"
                          checked={budget === "10-50m"}
                          onChange={() => setBudget("10-50m")}
                          className="sr-only"
                        />
                        <span className="block font-serif font-bold text-[15px]">₦10M - ₦50M</span>
                        <span className="block text-[10px] uppercase opacity-80 mt-0.5">Starter &amp; Rent</span>
                      </label>

                      <label
                        className={`p-3 rounded-xl border text-center cursor-pointer transition-all has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-navy ${
                          budget === "50-150m"
                            ? "bg-brand-navy text-white border-brand-navy"
                            : "bg-brand-canvas text-brand-ink border-brand-border hover:bg-brand-sand"
                        }`}
                      >
                        <input
                          type="radio"
                          name="budget"
                          value="50-150m"
                          checked={budget === "50-150m"}
                          onChange={() => setBudget("50-150m")}
                          className="sr-only"
                        />
                        <span className="block font-serif font-bold text-[15px]">₦50M - ₦150M</span>
                        <span className="block text-[10px] uppercase opacity-80 mt-0.5">Terraces &amp; Flats</span>
                      </label>

                      <label
                        className={`p-3 rounded-xl border text-center cursor-pointer transition-all has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-navy ${
                          budget === "150-500m"
                            ? "bg-brand-navy text-white border-brand-navy"
                            : "bg-brand-canvas text-brand-ink border-brand-border hover:bg-brand-sand"
                        }`}
                      >
                        <input
                          type="radio"
                          name="budget"
                          value="150-500m"
                          checked={budget === "150-500m"}
                          onChange={() => setBudget("150-500m")}
                          className="sr-only"
                        />
                        <span className="block font-serif font-bold text-[15px]">₦150M - ₦500M</span>
                        <span className="block text-[10px] uppercase opacity-80 mt-0.5">Semi-Detached / VI</span>
                      </label>

                      <label
                        className={`p-3 rounded-xl border text-center cursor-pointer transition-all has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-navy ${
                          budget === "500m+"
                            ? "bg-brand-navy text-white border-brand-navy"
                            : "bg-brand-canvas text-brand-ink border-brand-border hover:bg-brand-sand"
                        }`}
                      >
                        <input
                          type="radio"
                          name="budget"
                          value="500m+"
                          checked={budget === "500m+"}
                          onChange={() => setBudget("500m+")}
                          className="sr-only"
                        />
                        <span className="block font-serif font-bold text-[15px]">₦500M+</span>
                        <span className="block text-[10px] uppercase opacity-80 mt-0.5">Trophy Mansions</span>
                      </label>
                    </div>
                  </fieldset>

                  {/* Detailed Message Textarea */}
                  <div className="flex flex-col gap-1">
                    <label htmlFor="contact-timing" className="text-[11px] uppercase font-bold tracking-wider text-brand-muted">
                      Inspection Timing &amp; Detailed Specifications
                    </label>
                    <textarea
                      id="contact-timing"
                      name="messageDetails"
                      maxLength={4000}
                      rows={4}
                      value={messageDetails}
                      onChange={(e) => setMessageDetails(e.target.value)}
                      placeholder="Tell us about your timeline, specific property requirements, number of bedrooms, preferred gated estates, or specific title deed preferences (Governor's Consent, C of O)..."
                      className="w-full bg-brand-canvas border border-brand-border p-4 rounded-xl text-[14px] text-brand-ink focus:bg-white focus:border-brand-navy resize-y"
                    />
                  </div>

                  {/* Consent Checkbox */}
                  <div className="flex items-start gap-3 pt-1">
                    <input
                      id="contact-consent"
                      aria-invalid={!!errors.consent}
                      aria-describedby={errors.consent ? "contact-consent-error" : undefined}
                      type="checkbox"
                      aria-required="true"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-1 w-5 h-5 shrink-0 rounded accent-brand-red cursor-pointer"
                    />
                    <label htmlFor="contact-consent" className="text-[13px] text-brand-nav cursor-pointer leading-snug">
                      I agree to receive verified property listings, physical inspection itineraries, and advisory updates via WhatsApp and email. Unsubscribe at any time.
                    </label>
                  </div>
                  <FieldError id="contact-consent" message={errors.consent} />

                  {/* Red Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    aria-busy={isSubmitting}
                    className="w-full min-h-[52px] bg-brand-red hover:bg-brand-red-hover active:bg-brand-red-active text-white text-[13px] uppercase tracking-wider font-bold py-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-70 group"
                  >
                    <span>{isSubmitting ? "Sending..." : "Send Inquiry & Book Advisory"}</span>
                    <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">
                      arrow_forward
                    </span>
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-brand-muted pt-1">
                    <span className="material-symbols-outlined text-sm text-brand-ochre">lock</span>
                    <span>All communications protected under the NDPR (Nigeria Data Protection Regulation).</span>
                  </div>
                </form>
              )}
            </div>

            {/* Right Column: Info Cards in Strict Order (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* 1. Lekki Headquarters Card */}
              <div className="bg-white border border-brand-border p-6 rounded-2xl shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-red/10 text-brand-red flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl">corporate_fare</span>
                    </div>
                    <div>
                      <h3 className="font-serif text-[18px] font-bold text-brand-ink leading-tight">
                        Headquarters
                      </h3>
                      <span className="text-[11px] uppercase text-brand-muted font-semibold">
                        Advisory &amp; Escrow Services
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-brand-navy-tint text-brand-navy">
                    Walk-ins Welcome
                  </span>
                </div>

                <div className="bg-brand-canvas p-4 rounded-xl flex items-start gap-3">
                  <span className="material-symbols-outlined text-brand-red text-xl mt-0.5 shrink-0">
                    location_on
                  </span>
                  <div className="text-[13px] text-brand-nav">
                    <p className="font-bold text-brand-ink text-[14px]">
                      {SITE_CONFIG.headquarters.street}
                    </p>
                    <p>{SITE_CONFIG.headquarters.enclave}, {SITE_CONFIG.headquarters.state}, Nigeria</p>
                    <p className="text-brand-red font-semibold mt-1">
                      Landmark: {SITE_CONFIG.headquarters.landmark}
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Big Green WhatsApp Card */}
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white hover:bg-brand-canvas border border-brand-border p-5 rounded-2xl flex items-center justify-between shadow-sm transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-brand-whatsapp/15 text-brand-whatsapp flex items-center justify-center shrink-0">
                    <WhatsAppIcon className="w-6 h-6"/>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">
                      Fastest Direct Route
                    </span>
                    <span className="font-serif text-[16px] font-bold text-brand-ink">
                      Chat with Support Desk on WhatsApp
                    </span>
                    <span className="text-[13px] font-bold text-brand-whatsapp">
                      {SITE_CONFIG.phones.whatsappDisplay}
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-brand-muted group-hover:text-brand-red transition-transform group-hover:translate-x-1">
                  north_east
                </span>
              </a>

              {/* 3. Desk Lines & Inquiries Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white border border-brand-border p-4 rounded-xl">
                  <span className="text-[11px] uppercase font-bold tracking-wider text-brand-muted flex items-center gap-1 mb-1">
                    <span className="material-symbols-outlined text-sm text-brand-navy">phone_in_talk</span>
                    Desk Lines
                  </span>
                  <a href={`tel:${SITE_CONFIG.phones.desk}`} className="block text-[13px] font-bold text-brand-ink hover:text-brand-red">
                    {SITE_CONFIG.phones.deskDisplay}
                  </a>
                  <a href={`tel:${SITE_CONFIG.phones.whatsapp}`} className="block text-[13px] font-semibold text-brand-nav hover:text-brand-red">
                    {SITE_CONFIG.phones.whatsappDisplay}
                  </a>
                </div>

                <div className="bg-white border border-brand-border p-4 rounded-xl">
                  <span className="text-[11px] uppercase font-bold tracking-wider text-brand-muted flex items-center gap-1 mb-1">
                    <span className="material-symbols-outlined text-sm text-brand-navy">mail</span>
                    Inquiries Desk
                  </span>
                  <a href={`mailto:${SITE_CONFIG.emails.info}`} className="block text-[12px] font-bold text-brand-ink hover:text-brand-red truncate">
                    {SITE_CONFIG.emails.info}
                  </a>
                </div>
              </div>

              {/* 4. Working Hours Card */}
              <div className="bg-white border border-brand-border p-5 rounded-2xl shadow-sm flex flex-col gap-2.5 text-[13px] text-brand-nav">
                <span className="text-[11px] uppercase font-bold tracking-wider text-brand-ink flex items-center gap-1.5 pb-1 border-b border-brand-border">
                  <span className="material-symbols-outlined text-brand-red text-base">schedule</span>
                  Working Hours (WAT)
                </span>
                <div className="flex justify-between items-center">
                  <span>Monday – Friday</span>
                  <span className="font-bold text-brand-ink">{SITE_CONFIG.workingHours.weekdays}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Saturday Inspections</span>
                  <span className="font-bold text-brand-ink">{SITE_CONFIG.workingHours.saturday}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Sunday</span>
                  <span className="italic text-brand-muted">{SITE_CONFIG.workingHours.sunday}</span>
                </div>
              </div>

              {/* 5. Map Card (OpenStreetMap embed – no API key) */}
              <div className="bg-white border border-brand-border p-3 rounded-2xl shadow-sm flex flex-col gap-3">
                <div className="relative w-full h-56 rounded-xl overflow-hidden bg-brand-sand">
                  <iframe
                    title="Map of Geaworth Properties headquarters"
                    src={`https://www.google.com/maps?q=${lat},${lon}&z=16&output=embed`}
                    width="600"
                    height="224"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full border-0"
                  />
                </div>
                <div className="flex items-center justify-between gap-3 px-1 pb-1">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-red text-white uppercase tracking-wider">
                      Lekki Hub
                    </span>
                    <p className="font-serif text-[16px] text-brand-ink font-bold mt-1">Ikota • Lekki Corridor</p>
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${lat},${lon}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 inline-flex items-center gap-1 min-h-11 bg-brand-tint2 hover:bg-brand-sand border border-brand-border text-brand-ink text-[12px] uppercase font-bold px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <span>Open in Maps</span>
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                  </a>
                </div>
              </div>

              {/* 6. Global Investor Service Strip (Navy) */}
              <div className="bg-brand-navy p-6 sm:p-7 rounded-2xl text-white flex flex-col gap-3 shadow-md relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
                <div className="flex items-center gap-2 text-brand-navy-tint">
                  <span className="material-symbols-outlined text-2xl">flight_takeoff</span>
                  <span className="text-[11px] uppercase tracking-wider font-bold">
                    Global Investor Service
                  </span>
                </div>
                <h4 className="font-serif text-xl sm:text-2xl font-bold">
                  Calling from the UK, US, or Canada?
                </h4>
                <p className="text-[14px] text-white/90 leading-relaxed">
                  We understand time-zone constraints. Our international desk accommodates evening GMT and EST video consultations via Zoom or Google Meet with full title-search walk-throughs.
                </p>
                <div className="pt-2">
                  <a
                    href={`mailto:${SITE_CONFIG.emails.info}?subject=Diaspora%20Investor%20Consultation%20Request`}
                    className="inline-flex items-center gap-2 bg-brand-navy-tint text-brand-navy text-[12px] uppercase font-bold tracking-wider px-4 py-2.5 rounded-lg hover:bg-white transition-colors"
                  >
                    <span>Book a Virtual Evening Briefing</span>
                    <span className="material-symbols-outlined text-base">videocam</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INSPECTION FAQ ACCORDION SECTION */}
      <section className="w-full max-w-5xl mx-auto px-5 md:px-8 lg:px-12 py-16 sm:py-24">
        <div className="max-w-2xl mb-12">
          <span className="text-[12px] uppercase tracking-[0.08em] text-brand-red-deep font-bold block mb-1">
            Transparent Logistics
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-ink tracking-tight">
            Frequently asked inspection questions
          </h2>
          <p className="text-[15px] text-brand-nav mt-2">
            Prioritizing discretion, efficiency, and clarity from initial booking to closing deed execution.
          </p>
        </div>

        <Accordion items={inspectionFaqs} />
      </section>

      {/* 4. UNCOMPROMISING CONFIDENTIALITY GUARANTEE BANNER */}
      <section className="w-full bg-brand-sand/50 py-12 border-t border-brand-border">
        <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white border border-brand-border p-6 sm:p-8 rounded-2xl shadow-xs">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-brand-navy/10 text-brand-navy flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">verified_user</span>
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-[18px] font-bold text-brand-ink">
                  Uncompromising Confidentiality Guarantee
                </span>
                <p className="text-[14px] text-brand-nav max-w-2xl mt-0.5">
                  Your privacy and security are paramount. We never share your contact details or transaction criteria with external canvassers, aggregators, or third-party street brokers.
                </p>
              </div>
            </div>

            <div className="shrink-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-navy bg-brand-navy-tint px-3.5 py-1.5 rounded-full border border-brand-navy/20">
                {SITE_CONFIG.rcNumber} • Lagos Verified
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
