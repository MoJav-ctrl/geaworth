import { useEffect, useMemo, useState, type ChangeEvent, type DragEvent, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Accordion, AccordionItem } from "../components/ui/Accordion.tsx";
import { getWhatsAppUrl } from "../config/site.ts";
import { WhatsAppIcon } from "../components/ui/WhatsAppIcon.tsx";
import { Photo } from "../components/ui/Photo.tsx";
import { FieldError } from "../components/ui/FieldError.tsx";
import { valuationSchema, normalizePhone, fieldErrors } from "../utils/validation.ts";

const MAX_FILE_BYTES = 25 * 1024 * 1024;
const MAX_FILES = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

/** One uploaded file with an image thumbnail (or PDF tile) and a 44px remove button. */
function FileRow({ file, onRemove }: { file: File; onRemove: () => void }) {
  const url = useMemo(() => (file.type.startsWith("image/") ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => {
    if (url) URL.revokeObjectURL(url);
  }, [url]);

  return (
    <li className="flex items-center gap-3 p-2 bg-brand-tint2 rounded-lg text-[12px] text-brand-ink">
      {url ? (
        <img src={url} alt={`Preview of ${file.name}`} width={44} height={44} className="w-11 h-11 rounded-md object-cover shrink-0 border border-brand-border" />
      ) : (
        <span className="w-11 h-11 rounded-md bg-white border border-brand-border flex items-center justify-center shrink-0 text-brand-red" aria-hidden="true">
          <span className="material-symbols-outlined text-2xl">description</span>
        </span>
      )}
      <span className="flex-1 min-w-0">
        <span className="block truncate font-semibold">{file.name}</span>
        <span className="text-brand-muted">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
      </span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${file.name}`}
        className="w-11 h-11 shrink-0 flex items-center justify-center rounded-lg text-brand-error hover:bg-white"
      >
        <span className="material-symbols-outlined text-xl" aria-hidden="true">close</span>
      </button>
    </li>
  );
}

export function SellPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [location, setLocation] = useState("");
  const [expectedPrice, setExpectedPrice] = useState("");
  const [saleStrategy, setSaleStrategy] = useState<"discreet" | "public">("discreet");
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fileErrors, setFileErrors] = useState<string[]>([]);

  const handlePriceChange = (val: string) => {
    // Keep numbers and commas clean
    const numeric = val.replace(/[^0-9]/g, "");
    if (!numeric) {
      setExpectedPrice("");
      return;
    }
    const formatted = new Intl.NumberFormat("en-NG").format(parseInt(numeric, 10));
    setExpectedPrice(formatted);
  };

  const handleFileDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) addFiles(Array.from(e.dataTransfer.files));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) addFiles(Array.from(e.target.files));
    e.target.value = ""; // allow re-selecting the same file after removing it
  };

  const addFiles = (incoming: File[]) => {
    const problems: string[] = [];
    const accepted: File[] = [];
    for (const f of incoming) {
      if (!ALLOWED_TYPES.includes(f.type)) problems.push(`${f.name}: only PNG, JPG, WEBP or PDF files are accepted.`);
      else if (f.size > MAX_FILE_BYTES) problems.push(`${f.name}: larger than 25MB.`);
      else if (files.some((x) => x.name === f.name && x.size === f.size)) problems.push(`${f.name}: already added.`);
      else accepted.push(f);
    }
    const room = MAX_FILES - files.length;
    if (accepted.length > room) problems.push(`You can upload up to ${MAX_FILES} files; extra files were skipped.`);
    setFiles((prev) => [...prev, ...accepted.slice(0, Math.max(room, 0))]);
    setFileErrors(problems);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setFileErrors([]);
  };

  const FIELD_IDS: Record<string, string> = {
    fullName: "owner-name",
    email: "owner-email",
    phone: "owner-phone",
    propertyType: "sell-proptype",
    location: "sell-location",
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
      propertyType,
      location,
      expectedPrice,
      saleStrategy,
    };
    const parsed = valuationSchema.safeParse(payload);
    if (!parsed.success) {
      const errs = fieldErrors(parsed.error.issues);
      setErrors(errs);
      setErrorMessage("Please complete the highlighted fields marked with *.");
      focusFirstError(errs);
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      Object.entries(parsed.data).forEach(([k, v]) => formData.append(k, String(v ?? "")));
      files.forEach((file) => formData.append("files", file));

      const res = await fetch("/api/valuations", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.ok) {
        setIsSuccess(true);
      } else {
        if (data.fields) {
          setErrors(data.fields);
          if (data.fields.files) setFileErrors([data.fields.files]);
          focusFirstError(data.fields);
        }
        setErrorMessage(data.error || "Failed to submit valuation request. Please try again.");
      }
    } catch {
      setErrorMessage("Network error occurred. Please check your connection and retry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const sellFaqs: AccordionItem[] = [
    {
      id: "sell-faq-1",
      number: "01",
      question: "How is my property’s market value determined?",
      answer:
        "We analyze empirical land registry data from Alausa, recent closed transactions in your specific estate (e.g., Banana Island, Ikoyi Crescent, or Lekki Phase 1 Right Side), current replacement construction costs, and localized infrastructure developments.",
    },
    {
      id: "sell-faq-2",
      number: "02",
      question: "Do I have to pay upfront advisory or listing fees?",
      answer:
        "No. Our initial property audit, photography production, and valuation dossier are entirely complimentary. Geaworth operates on a success-fee agency model upon successful deed execution and fund settlement.",
    },
    {
      id: "sell-faq-3",
      number: "03",
      question: "Can I sell while residing overseas in the UK, US, or Canada?",
      answer:
        "Yes, over 40% of our sellers are diaspora owners. We facilitate virtual inspections, coordinate with your appointed Power of Attorney, provide secure digital contract signing, and facilitate bank-grade FX settlement protocols.",
    },
    {
      id: "sell-faq-4",
      number: "04",
      question: "What documents are required to initiate an off-market sale?",
      answer:
        "A copy of your title document (Governor's Consent, Certificate of Occupancy, or Registered Deed of Assignment), approved survey plan, and a valid national ID. Our legal team validates all paperwork before matching with prospective purchasers.",
    },
  ];

  return (
    <div className="w-full flex flex-col">
      {/* Context & Breadcrumb Bar */}
      <section className="w-full bg-brand-tint2 border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-12 py-3 flex flex-wrap items-center justify-between gap-3 text-[12px] uppercase font-bold tracking-wider">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-brand-muted">
            <Link to="/" className="hover:text-brand-red transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-brand-ink">Sell a Property</span>
          </nav>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-brand-border text-brand-ink shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
            <span>Private Valuation Desk • 100% Confidential</span>
          </div>
        </div>
      </section>

      {/* Two-Column Valuation Hero (Form First on Mobile) */}
      <section className="w-full max-w-7xl mx-auto px-5 md:px-8 lg:px-12 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Storytelling, Proof & Testimonial (Desktop 7 cols, Mobile order 2) */}
          <div className="lg:col-span-7 flex flex-col gap-8 order-2 lg:order-1">
            {/* Large Photo with Overlay */}
            <div className="relative w-full rounded-2xl overflow-hidden shadow-xl border border-brand-border bg-brand-sand">
              <Photo name="contemporary-detached-home" alt="Contemporary Lagos property" className="w-full h-[400px] sm:h-[480px] object-cover" width={1200} height={800} priority />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/90 via-brand-ink/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white">
                <span className="text-[11px] uppercase tracking-wider bg-brand-red text-white px-3 py-1 font-bold rounded-lg inline-block mb-2">
                  Private Advisory
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white max-w-xl leading-tight">
                  Let us tell your property's story.
                </h1>
                <p className="text-[15px] sm:text-[16px] text-white/90 mt-2 max-w-lg leading-relaxed">
                  Curating discreet disposals and record-yield sales across Ikoyi, Lekki Phase 1, Victoria Island, and Ikeja GRA for discerning owners and diaspora families.
                </p>
              </div>
            </div>

            {/* Discreet Marketing to Vetted Wealth Panel */}
            <div className="bg-white border border-brand-border p-6 sm:p-8 rounded-2xl shadow-sm flex flex-col gap-5">
              <h2 className="font-serif text-2xl font-bold text-brand-ink">
                Discreet Marketing to Vetted Wealth
              </h2>
              <p className="text-[15px] text-brand-nav leading-relaxed">
                Selling a high-value asset in Lagos requires precision, local intelligence, and complete discretion. At Geaworth Properties, we bypass tire-kickers and market whispers. Whether structuring a private off-market transaction or deploying targeted high-impact media to institutional and diaspora buyers in London, North America, and Dubai, our focus is absolute capital optimization and legal certainty.
              </p>

              {/* 4 Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="bg-brand-canvas p-3.5 rounded-xl text-center">
                  <span className="font-serif text-2xl font-bold text-brand-red block">
                    ₦2B+
                  </span>
                  <span className="text-[11px] uppercase text-brand-muted font-bold mt-1 block">
                    Facilitated Volume
                  </span>
                </div>
                <div className="bg-brand-canvas p-3.5 rounded-xl text-center">
                  <span className="font-serif text-2xl font-bold text-brand-red block">
                    18 Days
                  </span>
                  <span className="text-[11px] uppercase text-brand-muted font-bold mt-1 block">
                    Average To Offer
                  </span>
                </div>
                <div className="bg-brand-canvas p-3.5 rounded-xl text-center">
                  <span className="font-serif text-2xl font-bold text-brand-red block">
                    100%
                  </span>
                  <span className="text-[11px] uppercase text-brand-muted font-bold mt-1 block">
                    Alausa Verified
                  </span>
                </div>
                <div className="bg-brand-canvas p-3.5 rounded-xl text-center">
                  <span className="font-serif text-2xl font-bold text-brand-red block">
                    8,400+
                  </span>
                  <span className="text-[11px] uppercase text-brand-muted font-bold mt-1 block">
                    Diaspora Network
                  </span>
                </div>
              </div>
            </div>

            {/* Quoted Testimonial */}
            <div className="bg-brand-tint2 border border-brand-border p-6 sm:p-7 rounded-2xl flex items-start gap-4 shadow-sm">
              <span className="material-symbols-outlined text-brand-red text-4xl shrink-0 fill-1">
                format_quote
              </span>
              <div className="flex flex-col gap-2">
                <p className="font-serif text-[16px] text-brand-ink italic leading-relaxed">
                  “Geaworth secured a serious diaspora buyer for our Ikoyi duplex within 3 weeks without endless tire-kickers marching through our home. The legal title diligence was executed cleanly with Alausa before signing.”
                </p>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[14px] font-bold text-brand-ink">
                    — Chief &amp; Mrs. O. Adeleke
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-white border border-brand-border px-2.5 py-1 rounded-md text-brand-nav">
                    Verified Seller · Old Ikoyi
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Confidential Valuation Form (Desktop 5 cols, Mobile order 1) */}
          <div className="lg:col-span-5 order-1 lg:order-2 sticky top-24">
            <div className="bg-white border border-brand-border p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-brand-red-deep flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">shield</span>
                  Direct Partner Advisory
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-ink">
                  Request a Confidential Valuation
                </h2>
                <p className="text-[13px] text-brand-nav">
                  Tell us about your property. Our senior valuation directors will review local comparable sales and furnish an empirical advisory report within 24 hours.
                </p>
              </div>

              {isSuccess ? (
                <div className="p-6 bg-brand-navy-tint/60 border border-brand-navy/30 rounded-2xl text-brand-ink flex flex-col gap-3 animate-fade-in">
                  <div className="flex items-center gap-2 text-brand-navy">
                    <span className="material-symbols-outlined text-3xl">check_circle</span>
                    <h3 className="font-serif text-xl font-bold">Valuation Request Received</h3>
                  </div>
                  <p className="text-[14px] text-brand-ink leading-relaxed">
                    Our valuation desk has assigned a Director to your file. We will connect via WhatsApp or phone within 24 hours with comparable transactions and a written advisory report.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSuccess(false);
                      setFullName("");
                      setEmail("");
                      setPhone("");
                      setExpectedPrice("");
                      setFiles([]);
                    }}
                    className="mt-2 text-[12px] uppercase font-bold text-brand-navy underline hover:text-brand-red text-left"
                  >
                    Submit another property
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                  {errorMessage && (
                    <div role="alert" className="p-3 bg-brand-error-bg border border-brand-error/30 text-brand-error-deep text-[13px] rounded-lg">
                      {errorMessage}
                    </div>
                  )}

                  {/* Full Name */}
                  <div className="flex flex-col gap-1">
                    <label htmlFor="owner-name" className="text-[11px] uppercase font-bold tracking-wider text-brand-muted">
                      Full Name <span className="text-brand-red">*</span>
                    </label>
                    <input
                      id="owner-name"
                      name="fullName"
                      autoComplete="name"
                      autoCapitalize="words"
                      aria-invalid={!!errors.fullName}
                      aria-describedby={errors.fullName ? "owner-name-error" : undefined}
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g., Otunba Babatunde Alabi"
                      className="w-full bg-brand-canvas border border-brand-border px-4 py-2.5 rounded-lg text-[14px] text-brand-ink focus:bg-white focus:border-brand-navy"
                    />
                    <FieldError id="owner-name" message={errors.fullName} />
                  </div>

                  {/* Email Address */}
                  <div className="flex flex-col gap-1">
                    <label htmlFor="owner-email" className="text-[11px] uppercase font-bold tracking-wider text-brand-muted">
                      Email Address <span className="text-brand-red">*</span>
                    </label>
                    <input
                      id="owner-email"
                      name="email"
                      inputMode="email"
                      autoComplete="email"
                      autoCapitalize="none"
                      spellCheck={false}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "owner-email-error" : undefined}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="b.alabi@firm.ng"
                      className="w-full bg-brand-canvas border border-brand-border px-4 py-2.5 rounded-lg text-[14px] text-brand-ink focus:bg-white focus:border-brand-navy"
                    />
                    <FieldError id="owner-email" message={errors.email} />
                  </div>

                  {/* Phone with WhatsApp & +234 */}
                  <div className="flex flex-col gap-1">
                    <label htmlFor="owner-phone" className="text-[11px] uppercase font-bold tracking-wider text-brand-muted">
                      Phone Number (WhatsApp Enabled) <span className="text-brand-red">*</span>
                    </label>
                    <div className="flex rounded-lg overflow-hidden border border-brand-border bg-brand-canvas">
                      <span className="px-3 py-2.5 bg-brand-sand text-brand-ink text-[13px] font-bold select-none flex items-center gap-1">
                        🇳🇬 +234
                      </span>
                      <input
                        id="owner-phone"
                        name="phone"
                        inputMode="tel"
                        autoComplete="tel"
                        aria-invalid={!!errors.phone}
                        aria-describedby={errors.phone ? "owner-phone-error" : undefined}
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="803 123 4567"
                        className="w-full bg-transparent px-3 py-2.5 text-[14px] text-brand-ink focus:bg-white focus:outline-none"
                      />
                    </div>
                    <FieldError id="owner-phone" message={errors.phone} />
                  </div>

                  {/* Property Type & Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label htmlFor="sell-proptype" className="text-[11px] uppercase font-bold tracking-wider text-brand-muted">
                        Property Type <span className="text-brand-red">*</span>
                      </label>
                      <select
                        id="sell-proptype"
                        name="propertyType"
                        aria-invalid={!!errors.propertyType}
                        aria-describedby={errors.propertyType ? "sell-proptype-error" : undefined}
                        value={propertyType}
                        onChange={(e) => setPropertyType(e.target.value)}
                        className="w-full bg-brand-canvas border border-brand-border px-3 py-2.5 rounded-lg text-[13px] text-brand-ink focus:bg-white focus:border-brand-navy cursor-pointer"
                      >
                        <option value="">Select Type</option>
                        <option value="Contemporary Detached Duplex">Contemporary Detached Duplex</option>
                        <option value="Semi-Detached Terrace">Semi-Detached Terrace</option>
                        <option value="Luxury Penthouse / Apartment">Luxury Penthouse / Apartment</option>
                        <option value="Fully Serviced Shortlet Unit">Fully Serviced Shortlet Unit</option>
                        <option value="Commercial Office / Land Parcel">Commercial Office / Land Parcel</option>
                        <option value="Waterfront Estate">Waterfront Estate</option>
                      </select>
                      <FieldError id="sell-proptype" message={errors.propertyType} />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label htmlFor="sell-location" className="text-[11px] uppercase font-bold tracking-wider text-brand-muted">
                        Location <span className="text-brand-red">*</span>
                      </label>
                      <select
                        id="sell-location"
                        name="location"
                        aria-invalid={!!errors.location}
                        aria-describedby={errors.location ? "sell-location-error" : undefined}
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full bg-brand-canvas border border-brand-border px-3 py-2.5 rounded-lg text-[13px] text-brand-ink focus:bg-white focus:border-brand-navy cursor-pointer"
                      >
                        <option value="">Select Neighborhood</option>
                        <option value="Ikoyi (Old Ikoyi &amp; Banana Island)">Ikoyi (Old &amp; Banana Island)</option>
                        <option value="Lekki Phase 1">Lekki Phase 1</option>
                        <option value="Victoria Island">Victoria Island</option>
                        <option value="Ikeja GRA">Ikeja GRA</option>
                        <option value="Magodo Phase 2">Magodo Phase 2</option>
                        <option value="Ikate Elegushi">Ikate Elegushi</option>
                        <option value="Oniru Private Estate">Oniru Private Estate</option>
                        <option value="Chevron / Osapa London">Chevron / Osapa London</option>
                        <option value="Epe Expressway Corridor">Epe Expressway Corridor</option>
                        <option value="Other Prime Enclaves">Other Prime Enclaves</option>
                      </select>
                      <FieldError id="sell-location" message={errors.location} />
                    </div>
                  </div>

                  {/* Expected Asking Price in Naira with live format and quick fill chips */}
                  <div className="flex flex-col gap-1">
                    <label htmlFor="sell-price" className="text-[11px] uppercase font-bold tracking-wider text-brand-muted">
                      Expected Asking Price (NGN)
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-brand-ink font-serif font-bold text-base">
                        ₦
                      </span>
                      <input
                        id="sell-price"
                        name="expectedPrice"
                        inputMode="numeric"
                        autoComplete="off"
                        type="text"
                        value={expectedPrice}
                        onChange={(e) => handlePriceChange(e.target.value)}
                        placeholder="350,000,000"
                        className="w-full bg-brand-canvas border border-brand-border pl-8 pr-4 py-2.5 rounded-lg text-[14px] font-bold text-brand-ink focus:bg-white focus:border-brand-navy"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-brand-muted px-1 pt-1">
                      <span>Quick benchmark:</span>
                      <div className="flex items-center gap-1.5 font-bold">
                        <button
                          type="button"
                          onClick={() => setExpectedPrice("180,000,000")}
                          className="min-h-11 px-2 hover:text-brand-red transition-colors"
                        >
                          ₦180M
                        </button>
                        <span>·</span>
                        <button
                          type="button"
                          onClick={() => setExpectedPrice("350,000,000")}
                          className="min-h-11 px-2 hover:text-brand-red transition-colors"
                        >
                          ₦350M
                        </button>
                        <span>·</span>
                        <button
                          type="button"
                          onClick={() => setExpectedPrice("750,000,000")}
                          className="min-h-11 px-2 hover:text-brand-red transition-colors"
                        >
                          ₦750M+
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Photos & Document Upload Dropzone */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] uppercase font-bold tracking-wider text-brand-muted">
                      Photos &amp; Title Deeds (Max 25MB each)
                    </span>
                    <label
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleFileDrop}
                      className="group relative flex flex-col items-center justify-center p-4 min-h-28 rounded-xl border border-dashed has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-navy border-brand-border bg-brand-canvas hover:bg-brand-sand/50 transition-all cursor-pointer text-center"
                    >
                      <input
                        type="file"
                        multiple
                        accept=".png,.jpg,.jpeg,.webp,.pdf,image/png,image/jpeg,image/webp,application/pdf"
                        onChange={handleFileChange}
                        aria-label="Upload photos, floor plans or title deeds"
                        className="sr-only"
                      />
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-brand-red shadow-xs mb-1 group-hover:scale-105 transition-transform">
                        <span className="material-symbols-outlined text-2xl">cloud_upload</span>
                      </div>
                      <span className="text-[13px] font-bold text-brand-ink">
                        Upload Photos, Plans or Survey Deeds
                      </span>
                      <span className="text-[11px] text-brand-muted mt-0.5">
                        Drag &amp; drop or tap to browse (PNG, JPG, PDF up to 25MB each)
                      </span>
                    </label>

                    <div role="status" aria-live="polite">
                      {fileErrors.map((m) => (
                        <p key={m} className="flex items-start gap-1 text-[12px] font-semibold text-brand-error mt-1">
                          <span className="material-symbols-outlined text-sm mt-px" aria-hidden="true">error</span>
                          <span>{m}</span>
                        </p>
                      ))}
                    </div>

                    {files.length > 0 && (
                      <ul className="flex flex-col gap-1.5 pt-1" aria-label="Selected files">
                        {files.map((file, i) => (
                          <FileRow key={`${file.name}-${file.size}`} file={file} onRemove={() => removeFile(i)} />
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Radio Choice: Discreet Off-Market vs Public Showcase */}
                  <div className="flex flex-col gap-1.5 pt-1">
                    <span className="text-[11px] uppercase font-bold tracking-wider text-brand-muted">
                      Preferred Disposal Approach
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <label
                        className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                          saleStrategy === "discreet"
                            ? "border-brand-navy bg-brand-navy-tint/30"
                            : "border-brand-border bg-brand-canvas"
                        }`}
                      >
                        <input
                          type="radio"
                          name="saleStrategy"
                          value="discreet"
                          checked={saleStrategy === "discreet"}
                          onChange={() => setSaleStrategy("discreet")}
                          className="accent-brand-navy"
                        />
                        <div className="flex flex-col">
                          <span className="text-[12px] font-bold text-brand-ink">Discreet Off-Market</span>
                          <span className="text-[10px] text-brand-muted">Private Vetted Rolodex</span>
                        </div>
                      </label>

                      <label
                        className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                          saleStrategy === "public"
                            ? "border-brand-navy bg-brand-navy-tint/30"
                            : "border-brand-border bg-brand-canvas"
                        }`}
                      >
                        <input
                          type="radio"
                          name="saleStrategy"
                          value="public"
                          checked={saleStrategy === "public"}
                          onChange={() => setSaleStrategy("public")}
                          className="accent-brand-navy"
                        />
                        <div className="flex flex-col">
                          <span className="text-[12px] font-bold text-brand-ink">Public Showcase</span>
                          <span className="text-[10px] text-brand-muted">Diaspora &amp; Web Portals</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Red Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-brand-red hover:bg-brand-red-hover active:bg-brand-red-active text-white text-[13px] uppercase tracking-wider font-bold py-3.5 px-6 rounded-[10px] shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-70"
                  >
                    <span>{isSubmitting ? "Processing..." : "Get a Valuation"}</span>
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </button>

                  <p className="text-[11px] text-center text-brand-muted leading-tight">
                    No obligation. 100% confidential. All seller communications are protected under the Nigeria Data Protection Act (NDPA).
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Why Lagos Landlords Choose Geaworth Advisory (3 Cards) */}
      <section className="w-full bg-brand-tint2 py-16 border-t border-brand-border">
        <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div className="max-w-xl">
              <span className="text-[12px] uppercase tracking-[0.08em] text-brand-red-deep font-bold block mb-1">
                The Geaworth Advantage
              </span>
              <h2 className="font-serif text-3xl font-bold text-brand-ink">
                Why Lagos Landlords Choose Geaworth Advisory
              </h2>
            </div>
            <p className="text-[14px] text-brand-nav max-w-md">
              Unlike unverified street agents, our institutional background guarantees qualified liquidity, legal title security, and seamless closing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-brand-border p-7 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-brand-red/10 text-brand-red flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-2xl">public</span>
                </div>
                <h3 className="font-serif text-[19px] font-bold text-brand-ink mb-2">
                  Targeted Diaspora &amp; Institutional Reach
                </h3>
                <p className="text-[14px] text-brand-nav leading-relaxed">
                  Immediate presentation to vetted buyers across the UK, United States, Canada, and European corporate executives actively seeking high-yield Lagos residential holdings.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-brand-border text-[11px] font-bold uppercase text-brand-red-deep">
                Direct FX Settlement Support →
              </div>
            </div>

            <div className="bg-white border border-brand-border p-7 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-brand-navy-tint text-brand-navy flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-2xl">verified_user</span>
                </div>
                <h3 className="font-serif text-[19px] font-bold text-brand-ink mb-2">
                  Rigorous Due Diligence Before Showing
                </h3>
                <p className="text-[14px] text-brand-nav leading-relaxed">
                  Zero phantom buyers or casual lookers. Every private walk-through is preceded by identity validation and proof-of-funds verification to respect your privacy and security.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-brand-border text-[11px] font-bold uppercase text-brand-navy">
                Confidential Walk-Through Protocol →
              </div>
            </div>

            <div className="bg-white border border-brand-border p-7 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-brand-ochre-tint text-brand-ochre-text flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-2xl">account_balance</span>
                </div>
                <h3 className="font-serif text-[19px] font-bold text-brand-ink mb-2">
                  Seamless Legal Closing &amp; Alausa Escrow
                </h3>
                <p className="text-[14px] text-brand-nav leading-relaxed">
                  In-house property attorneys manage the entire title deed conveyance, Governor’s Consent transfer, and secure escrow settlement without administrative friction.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-brand-border text-[11px] font-bold uppercase text-brand-ochre-text">
                Verified Title Protection →
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Stage Selling Roadmap */}
      <section className="w-full max-w-7xl mx-auto px-5 md:px-8 lg:px-12 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[12px] uppercase tracking-[0.08em] text-brand-red-deep font-bold block mb-1">
            From Inquiry to Handover
          </span>
          <h2 className="font-serif text-3xl font-bold text-brand-ink">
            Our 4-Stage Selling Roadmap
          </h2>
          <p className="text-[14px] text-brand-nav mt-1.5">
            A transparent, legally watertight workflow tailored specifically to the Lagos luxury real estate ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white border border-brand-border p-6 rounded-2xl shadow-sm flex flex-col gap-2">
            <span className="font-serif text-2xl font-bold text-brand-red">01</span>
            <h4 className="font-serif text-[18px] font-bold text-brand-ink">
              Desk Valuation &amp; Site Audit
            </h4>
            <p className="text-[13px] text-brand-nav leading-relaxed">
              Empirical comparative market analysis (CMA) based on recent registry deeds and physical structural appraisal.
            </p>
          </div>

          <div className="bg-white border border-brand-border p-6 rounded-2xl shadow-sm flex flex-col gap-2">
            <span className="font-serif text-2xl font-bold text-brand-red">02</span>
            <h4 className="font-serif text-[18px] font-bold text-brand-ink">
              Editorial Production
            </h4>
            <p className="text-[13px] text-brand-nav leading-relaxed">
              Architectural photography, 4K walkthrough video, drone mapping, and private offering memorandum creation.
            </p>
          </div>

          <div className="bg-white border border-brand-border p-6 rounded-2xl shadow-sm flex flex-col gap-2">
            <span className="font-serif text-2xl font-bold text-brand-red">03</span>
            <h4 className="font-serif text-[18px] font-bold text-brand-ink">
              Discreet Matching
            </h4>
            <p className="text-[13px] text-brand-nav leading-relaxed">
              Direct presentation to high-net-worth clients, institutional funds, and vetted diaspora investors.
            </p>
          </div>

          <div className="bg-white border border-brand-border p-6 rounded-2xl shadow-sm flex flex-col gap-2">
            <span className="font-serif text-2xl font-bold text-brand-red">04</span>
            <h4 className="font-serif text-[18px] font-bold text-brand-ink">
              Closing &amp; Funds Escrow
            </h4>
            <p className="text-[13px] text-brand-nav leading-relaxed">
              Contract of sale signing, Governor's consent facilitation, and clean disbursement of proceeds.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ & WhatsApp Director Strip */}
      <section className="w-full bg-brand-tint2 py-16 border-t border-brand-border">
        <div className="max-w-4xl mx-auto px-5 md:px-8 lg:px-12 flex flex-col gap-10">
          <div className="text-center">
            <span className="text-[12px] uppercase tracking-[0.08em] text-brand-red-deep font-bold block mb-1">
              Clarity &amp; Assurance
            </span>
            <h2 className="font-serif text-3xl font-bold text-brand-ink">
              Frequently Asked Questions
            </h2>
            <p className="text-[14px] text-brand-nav mt-1">
              Essential answers for prime residential and commercial property owners in Lagos.
            </p>
          </div>

          <Accordion items={sellFaqs} />

          {/* Prefer direct conversation strip */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-brand-border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-[18px] font-bold text-brand-ink">
                Prefer a direct conversation with our Managing Director?
              </h3>
              <p className="text-[13px] text-brand-nav mt-0.5">
                Available for private consultations at our Ikota office or via WhatsApp.
              </p>
            </div>
            <a
              href={getWhatsAppUrl("Hello Babatunde Adeleke, I would like to discuss selling my Lagos property confidentially.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-brand-whatsapp hover:bg-brand-whatsapp-hover text-brand-ink text-[13px] uppercase tracking-wider font-bold px-5 py-3 rounded-[10px] shadow-sm transition-all shrink-0"
            >
              <WhatsAppIcon className="w-[18px] h-[18px]"/>
              <span>WhatsApp Director</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
