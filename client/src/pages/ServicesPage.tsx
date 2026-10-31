import { Link } from "react-router-dom";
import { Accordion, AccordionItem } from "../components/ui/Accordion.tsx";
import { getWhatsAppUrl } from "../config/site.ts";
import { WhatsAppIcon } from "../components/ui/WhatsAppIcon.tsx";
import { Photo } from "../components/ui/Photo.tsx";

export function ServicesPage() {
  const faqItems: AccordionItem[] = [
    {
      id: "faq-title-verification",
      number: "01",
      question: "How does Geaworth verify property titles in Lagos?",
      answer:
        "Every listing passes through our three-tier legal verification protocol before presentation. First, we conduct a survey charting with the Lagos State Surveyor General’s office to confirm the coordinates are not subject to committed government acquisition. Second, our conveyancing counsel conducts an official file search at the Lands Bureau, Alausa, Ikeja to verify the authenticity of the Certificate of Occupancy (C of O) or Governor's Consent. Lastly, we carry out physical site inspection checks to confirm zero community or family boundary disputes.",
    },
    {
      id: "faq-diaspora",
      number: "02",
      question: "I live in the Diaspora (UK/USA/Canada). Can I buy property safely through Geaworth without traveling down?",
      answer:
        "Yes, more than 40% of our annual acquisitions are executed by clients in the Diaspora. We provide end-to-end digital transactions including live interactive video walkthroughs, independent structural engineer inspection reports, and secure escrow accounts. We also manage the execution of Powers of Attorney and handle courier delivery of original deeds right to your foreign address.",
    },
    {
      id: "faq-fees",
      number: "03",
      question: "What are the standard agency, legal, and caution fees in Lagos?",
      answer:
        "In standard Lagos lettings, Agency fee is typically 10% of the annual rent, Legal Documentation fee is 10%, and a refundable Caution Deposit (usually between 5% and 10%) is held against utility arrears or interior damage. In sales transactions, standard legal and agency fees are 5% each. Geaworth outlines every statutory fee and documentation levy upfront in writing with zero hidden charges.",
    },
    {
      id: "faq-management-default",
      number: "04",
      question: "What happens if a tenant fails to pay rent under your property management?",
      answer:
        "Our rigorous pre-tenancy vetting keeps default rates below 1.6%. When default occurs, our legal desk promptly triggers formal Statutory 7-day and 30-day Quit Notices in compliance with the Lagos State Tenancy Law 2011. Landlords on our Premium Management package also benefit from our Rent Guarantee Shield, ensuring continuous monthly distributions while recovery procedures are carried out.",
    },
    {
      id: "faq-shortlet-power",
      number: "05",
      question: "Do shortlet properties have guaranteed 24/7 power during national grid fluctuations?",
      answer:
        "All serviced shortlets managed or endorsed by Geaworth operate triple-redundancy power solutions: national grid priority feeds, automatic changeover diesel generating plants, and high-capacity pure sine-wave inverter systems. We guarantee seamless continuous electricity with instant automated switchovers.",
    },
  ];

  const steps = [
    {
      step: 1,
      title: "Consult",
      icon: "forum",
      desc: "Deep dive into lifestyle needs, liquidity planning, and preferred Lagos quarters.",
    },
    {
      step: 2,
      title: "Search & Filter",
      icon: "filter_alt",
      desc: "Engineered shortlists from pre-vetted, non-encumbered residential stock.",
    },
    {
      step: 3,
      title: "View",
      icon: "visibility",
      desc: "Private chauffeur-guided tours or live high-res 4K video walkthroughs for overseas buyers.",
    },
    {
      step: 4,
      title: "Verify",
      icon: "verified_user",
      desc: "Alausa Lands Bureau verification, beacon charting, and physical structural audit.",
    },
    {
      step: 5,
      title: "Close",
      icon: "gavel",
      desc: "Escrow-backed transaction release, contract of sale execution, and Governor's Consent filing.",
    },
    {
      step: 6,
      title: "Settle & Manage",
      icon: "key",
      desc: "Handover ceremony, utility calibration, estate clearance, and ongoing facility oversight.",
    },
  ];

  return (
    <div className="w-full flex flex-col">
      {/* 1. SERVICES HERO SECTION (7/5 split) */}
      <section className="relative w-full bg-brand-tint2 overflow-hidden pt-12 md:pt-16 pb-24 md:pb-28 border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column (7 Cols) */}
            <div className="lg:col-span-8 flex flex-col gap-5 z-10">
              <div className="inline-flex items-center gap-2 self-start bg-white border border-brand-border px-3.5 py-1.5 rounded-full shadow-xs">
                <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-brand-nav">
                  Client Advisory &amp; Portfolio Solutions
                </span>
              </div>

              <h1 className="font-serif text-[38px] sm:text-[48px] lg:text-[56px] font-bold text-brand-ink tracking-tight leading-[1.12]">
                Services built around how <span className="italic text-brand-red">Lagos</span> moves.
              </h1>

              <p className="text-[16px] md:text-[18px] text-brand-nav max-w-2xl leading-relaxed">
                Lagos real estate comes with its own rhythms, legal nuances, and infrastructure realities. We provide end-to-end property advisory, leasing, management, and institutional acquisitions designed to eliminate friction.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-3">
                <a
                  href="#services-bento"
                  className="inline-flex items-center gap-2 bg-brand-red hover:bg-brand-red-hover text-white text-[13px] uppercase tracking-wider font-bold px-6 py-3.5 rounded-[10px] shadow-sm hover:shadow-md transition-all"
                >
                  <span>Explore All Capabilities</span>
                  <span className="material-symbols-outlined text-base">arrow_downward</span>
                </a>

                <a
                  href={getWhatsAppUrl("Hello Geaworth Properties, I need direct fast-track advisory assistance.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white hover:bg-brand-sand text-brand-ink border border-brand-border text-[13px] uppercase tracking-wider font-bold px-5 py-3.5 rounded-[10px] shadow-xs transition-all"
                >
                  <WhatsAppIcon className="w-5 h-5 text-brand-whatsapp"/>
                  <span>Fast-Track Desk</span>
                </a>
              </div>
            </div>

            {/* Right Column: Lagos Waterfront Skyline Photo (5 Cols) */}
            <div className="lg:col-span-4 relative">
              <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-xl border border-brand-border bg-brand-sand">
                <Photo name="lagos-waterfront-skyline" alt="Lagos Waterfront Skyline and Ikoyi Bridge" className="w-full h-full object-cover" width={1200} height={800} priority />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/85 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                  <span className="text-[11px] uppercase tracking-[0.08em] text-brand-navy-tint font-bold">
                    Licensed Practice
                  </span>
                  <p className="font-serif text-[18px] font-bold mt-1 text-white leading-snug">
                    Alausa Lands Registry Verified Transactions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS STRIP (Overlapping Hero Bottom, 4 Cols, 2x2 on Mobile) */}
      <section className="w-full max-w-7xl mx-auto px-5 md:px-8 lg:px-12 -mt-12 md:-mt-14 z-20 relative">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 bg-white border border-brand-border p-6 sm:p-8 rounded-2xl shadow-[0_12px_28px_-6px_rgba(23,23,23,0.06)]">
          <div className="flex flex-col gap-1 p-2">
            <span className="text-[11px] uppercase tracking-[0.08em] text-brand-muted font-bold">
              Gross Value Transacted
            </span>
            <span className="font-serif text-3xl sm:text-4xl font-bold text-brand-ink">
              ₦2B+
            </span>
            <p className="text-[13px] text-brand-nav">
              Verified assets across Island &amp; Mainland
            </p>
          </div>

          <div className="flex flex-col gap-1 p-2 bg-brand-canvas/60 rounded-xl">
            <span className="text-[11px] uppercase tracking-[0.08em] text-brand-muted font-bold">
              Tenant Retention
            </span>
            <span className="font-serif text-3xl sm:text-4xl font-bold text-brand-navy">
              98.4%
            </span>
            <p className="text-[13px] text-brand-nav">
              Annual corporate renewal baseline
            </p>
          </div>

          <div className="flex flex-col gap-1 p-2">
            <span className="text-[11px] uppercase tracking-[0.08em] text-brand-muted font-bold">
              Corporate Placement
            </span>
            <span className="font-serif text-3xl sm:text-4xl font-bold text-brand-ochre">
              14 Days
            </span>
            <p className="text-[13px] text-brand-nav">
              Average lease closure cycle
            </p>
          </div>

          <div className="flex flex-col gap-1 p-2 bg-brand-canvas/60 rounded-xl">
            <span className="text-[11px] uppercase tracking-[0.08em] text-brand-muted font-bold">
              Title Record
            </span>
            <span className="font-serif text-3xl sm:text-4xl font-bold text-brand-red">
              0 Encumbrance
            </span>
            <p className="text-[13px] text-brand-nav">
              Litigation-free acquisition audit
            </p>
          </div>
        </div>
      </section>

      {/* 3. SEVEN NUMBERED SERVICES BENTO GRID */}
      <section id="services-bento" className="w-full max-w-7xl mx-auto px-5 md:px-8 lg:px-12 py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-14">
          <div className="max-w-2xl">
            <span className="text-[12px] uppercase tracking-[0.08em] text-brand-red-deep font-bold block mb-1">
              End-To-End Infrastructure
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-ink tracking-tight">
              Disciplined solutions for landlords, investors, and residents.
            </h2>
          </div>
          <p className="text-[15px] text-brand-nav max-w-sm">
            Every offering pairs localized regulatory execution with prime facility engineering standards.
          </p>
        </div>

        {/* Bento Matrix: Row 1 = 7/5, Row 2 = 4/4/4, Row 3 = 6/6 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* Card 01: Property Sales & Acquisition (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-brand-border rounded-2xl p-6 sm:p-8 shadow-sm hover:border-brand-navy/30 transition-all flex flex-col justify-between group">
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-xl bg-brand-red/10 text-brand-red font-bold flex items-center justify-center font-sans text-base">
                  01
                </span>
                <span className="text-[11px] uppercase font-bold tracking-wider px-3 py-1 bg-brand-tint2 text-brand-nav rounded-full">
                  Acquisitions &amp; Disposition
                </span>
              </div>

              <div>
                <h3 className="font-serif text-2xl font-bold text-brand-ink">
                  Property Sales &amp; Acquisition
                </h3>
                <p className="text-[15px] text-brand-nav mt-2 leading-relaxed">
                  Whether buying a prime family residence in Ikoyi or acquiring commercial land along the Lekki-Epe Expressway, our acquisition team conducts rigorous physical surveys, Alausa Lands Bureau title verification, and valuation modeling.
                </p>
              </div>

              <div className="w-full h-56 rounded-xl overflow-hidden bg-brand-sand">
                <Photo name="lekki-residence-exterior" alt="Prime residential property in Lagos" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" width={1200} height={800} />
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2">
                <div className="bg-brand-canvas p-3 rounded-xl text-center">
                  <span className="text-[11px] uppercase text-brand-muted font-semibold block">Verification</span>
                  <span className="text-[13px] font-bold text-brand-ink">C of O &amp; Consent</span>
                </div>
                <div className="bg-brand-canvas p-3 rounded-xl text-center">
                  <span className="text-[11px] uppercase text-brand-muted font-semibold block">Due Diligence</span>
                  <span className="text-[13px] font-bold text-brand-ink">Survey Charting</span>
                </div>
                <div className="bg-brand-canvas p-3 rounded-xl text-center">
                  <span className="text-[11px] uppercase text-brand-muted font-semibold block">Closing</span>
                  <span className="text-[13px] font-bold text-brand-ink">Escrow Secured</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Link
                to="/?category=sale"
                className="inline-flex items-center gap-2 text-brand-red-deep text-[13px] uppercase tracking-wider font-bold hover:gap-3 transition-all"
              >
                <span>Explore Properties for Sale</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* Card 02: Lettings & Tenant Placement (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-brand-border rounded-2xl p-6 sm:p-8 shadow-sm hover:border-brand-navy/30 transition-all flex flex-col justify-between group">
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-xl bg-brand-navy-tint text-brand-navy font-bold flex items-center justify-center font-sans text-base">
                  02
                </span>
                <span className="text-[11px] uppercase font-bold tracking-wider px-3 py-1 bg-brand-tint2 text-brand-nav rounded-full">
                  Tenancy Placement
                </span>
              </div>

              <div>
                <h3 className="font-serif text-2xl font-bold text-brand-ink">
                  Lettings &amp; Tenant Placement
                </h3>
                <p className="text-[15px] text-brand-nav mt-2 leading-relaxed">
                  We match verified landlords with thoroughly vetted corporate executives, expatriates, and high-earning professionals. Rigorous background checks, income verification, and bulletproof tenancy agreements.
                </p>
              </div>

              <div className="w-full h-44 rounded-xl overflow-hidden bg-brand-sand">
                <Photo name="luxury-interior-victoria-island" alt="Luxury rental interior in Victoria Island" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" width={1200} height={800} />
              </div>

              <ul className="flex flex-col gap-2 text-[13px] text-brand-nav">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-brand-navy text-[18px]">verified</span>
                  <span>Corporate lease structuring &amp; expatriate guarantees</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-brand-navy text-[18px]">verified</span>
                  <span>Direct credit &amp; workplace employment checks</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <Link
                to="/?category=rent"
                className="inline-flex items-center gap-2 text-brand-navy text-[13px] uppercase tracking-wider font-bold hover:gap-3 transition-all"
              >
                <span>Find a Rental Home</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* Row 2: Card 03, 04, 05 (4 cols each) */}
          {/* Card 03: Shortlets & Serviced Apartments */}
          <div className="lg:col-span-4 bg-white border border-brand-border rounded-2xl p-6 sm:p-7 shadow-sm hover:border-brand-navy/30 transition-all flex flex-col justify-between">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-xl bg-brand-ochre-tint text-brand-ochre-text font-bold flex items-center justify-center font-sans text-base">
                  03
                </span>
                <span className="text-[11px] uppercase font-bold tracking-wider px-2.5 py-1 bg-brand-tint2 text-brand-nav rounded-full">
                  Hospitality Grade
                </span>
              </div>

              <div>
                <h3 className="font-serif text-[20px] font-bold text-brand-ink">
                  Shortlets &amp; Serviced Apartments
                </h3>
                <p className="text-[14px] text-brand-nav mt-2 leading-relaxed">
                  Curated luxury short-stay apartments across Victoria Island, Ikoyi, and Lekki Phase 1. Fully serviced with guaranteed 24/7 electricity, high-speed fiber internet, housekeeping, and dedicated concierge.
                </p>
              </div>

              <div className="bg-brand-canvas p-4 rounded-xl flex flex-col gap-2">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-brand-muted">Power Guarantee</span>
                  <span className="text-brand-ochre-text font-bold">Dual Gen + Inverter Backup</span>
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-brand-muted">Security</span>
                  <span className="text-brand-ink font-semibold">Access Control &amp; CCTV</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Link
                to="/?category=shortlet"
                className="inline-flex items-center gap-2 text-brand-ochre text-[12px] uppercase tracking-wider font-bold hover:gap-3 transition-all"
              >
                <span>Browse Shortlet Escapes</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* Card 04: Complete Facility Management */}
          <div className="lg:col-span-4 bg-white border border-brand-border rounded-2xl p-6 sm:p-7 shadow-sm hover:border-brand-navy/30 transition-all flex flex-col justify-between">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-xl bg-brand-red/10 text-brand-red font-bold flex items-center justify-center font-sans text-base">
                  04
                </span>
                <span className="text-[11px] uppercase font-bold tracking-wider px-2.5 py-1 bg-brand-tint2 text-brand-nav rounded-full">
                  Passive Ownership
                </span>
              </div>

              <div>
                <h3 className="font-serif text-[20px] font-bold text-brand-ink">
                  Complete Facility Management
                </h3>
                <p className="text-[14px] text-brand-nav mt-2 leading-relaxed">
                  Hands-off passive income for local and Diaspora landlords. We oversee rent collection, tenant relations, preventative maintenance (generators, water treatment plants, inverters), and estate dues.
                </p>
              </div>

              <div className="bg-brand-canvas p-4 rounded-xl flex flex-col gap-2">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-brand-muted">Disbursement</span>
                  <span className="text-brand-red font-bold">Direct Naira/FX Remittance</span>
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-brand-muted">Auditing</span>
                  <span className="text-brand-ink font-semibold">Monthly Asset Health Deck</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Link
                to="/contact?interest=management"
                className="inline-flex items-center gap-2 text-brand-red-deep text-[12px] uppercase tracking-wider font-bold hover:gap-3 transition-all"
              >
                <span>Request Management Proposal</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* Card 05: Investment Advisory */}
          <div className="lg:col-span-4 bg-white border border-brand-border rounded-2xl p-6 sm:p-7 shadow-sm hover:border-brand-navy/30 transition-all flex flex-col justify-between">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-xl bg-brand-navy-tint text-brand-navy font-bold flex items-center justify-center font-sans text-base">
                  05
                </span>
                <span className="text-[11px] uppercase font-bold tracking-wider px-2.5 py-1 bg-brand-tint2 text-brand-nav rounded-full">
                  Yield Engineering
                </span>
              </div>

              <div>
                <h3 className="font-serif text-[20px] font-bold text-brand-ink">
                  Investment Advisory
                </h3>
                <p className="text-[14px] text-brand-nav mt-2 leading-relaxed">
                  Data-driven advisory for high-net-worth individuals and Diaspora investors seeking 12–18% net rental yields and capital appreciation across high-growth Lagos corridors (Ikate, Epe, Lekki Free Trade Zone).
                </p>
              </div>

              <div className="bg-brand-canvas p-4 rounded-xl flex flex-col gap-2">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-brand-muted">Target Net Yield</span>
                  <span className="text-brand-navy font-bold">12% – 18% p.a.</span>
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-brand-muted">Strategic Corridors</span>
                  <span className="text-brand-ink font-semibold">Lekki-Epe Expressway &amp; VI</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Link
                to="/contact?interest=diaspora"
                className="inline-flex items-center gap-2 text-brand-navy text-[12px] uppercase tracking-wider font-bold hover:gap-3 transition-all"
              >
                <span>Book Investment Session</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* Row 3: Card 06 & Card 07 (6 cols each) */}
          {/* Card 06: Valuation & Market Research */}
          <div className="lg:col-span-6 bg-white border border-brand-border rounded-2xl p-6 sm:p-8 shadow-sm hover:border-brand-navy/30 transition-all flex flex-col justify-between">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-xl bg-brand-tint2 text-brand-ink font-bold flex items-center justify-center font-sans text-base">
                  06
                </span>
                <span className="text-[11px] uppercase font-bold tracking-wider px-3 py-1 bg-brand-tint2 text-brand-nav rounded-full">
                  Benchmarking
                </span>
              </div>

              <div>
                <h3 className="font-serif text-2xl font-bold text-brand-ink">
                  Valuation &amp; Market Research
                </h3>
                <p className="text-[15px] text-brand-nav mt-2 leading-relaxed">
                  Accurate, current market valuations based on real executed transaction benchmarks across Lagos Mainland and Island, not speculative asking prices. Certified reports for mortgage, estate planning, and tax.
                </p>
              </div>

              <div className="w-full bg-brand-canvas p-4 rounded-xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white border border-brand-border flex items-center justify-center text-brand-navy shrink-0">
                  <span className="material-symbols-outlined text-2xl">analytics</span>
                </div>
                <div>
                  <span className="text-[14px] font-bold text-brand-ink block">
                    Certified NIESV Practice Standards
                  </span>
                  <span className="text-[12px] text-brand-muted">
                    Accepted across all Tier-1 commercial banks in Nigeria
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Link
                to="/sell"
                className="inline-flex items-center gap-2 text-brand-red-deep text-[13px] uppercase tracking-wider font-bold hover:gap-3 transition-all"
              >
                <span>Request Property Valuation</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* Card 07: Relocation & Diaspora Concierge */}
          <div className="lg:col-span-6 bg-white border border-brand-border rounded-2xl p-6 sm:p-8 shadow-sm hover:border-brand-navy/30 transition-all flex flex-col justify-between">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-xl bg-brand-red/10 text-brand-red font-bold flex items-center justify-center font-sans text-base">
                  07
                </span>
                <span className="text-[11px] uppercase font-bold tracking-wider px-3 py-1 bg-brand-tint2 text-brand-nav rounded-full">
                  Diaspora Gateway
                </span>
              </div>

              <div>
                <h3 className="font-serif text-2xl font-bold text-brand-ink">
                  Relocation &amp; Diaspora Concierge
                </h3>
                <p className="text-[15px] text-brand-nav mt-2 leading-relaxed">
                  Specialized relocation packages for Nigerians returning from the UK, US, Canada, and Europe. From neighborhood matchmaking and school proximity mapping to airport pick-up and turnkey furnishing.
                </p>
              </div>

              <div className="w-full bg-brand-canvas p-4 rounded-xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white border border-brand-border flex items-center justify-center text-brand-red shrink-0">
                  <span className="material-symbols-outlined text-2xl">flight_land</span>
                </div>
                <div>
                  <span className="text-[14px] font-bold text-brand-ink block">
                    Seamless Return Experience
                  </span>
                  <span className="text-[12px] text-brand-muted">
                    Turnkey home setup with verified backup infrastructure
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Link
                to="/contact?interest=diaspora"
                className="inline-flex items-center gap-2 text-brand-red-deep text-[13px] uppercase tracking-wider font-bold hover:gap-3 transition-all"
              >
                <span>Speak with Relocation Desk</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW WE WORK: STRUCTURED JOURNEY */}
      <section className="w-full bg-brand-tint2 py-20 border-y border-brand-border">
        <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-12">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-14">
            <span className="text-[12px] uppercase tracking-[0.08em] text-brand-navy font-bold block mb-1">
              Structured Journey
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-ink tracking-tight">
              How we work: From initial chat to keys in hand.
            </h2>
            <p className="text-[15px] text-brand-nav mt-2 max-w-xl">
              A predictable 6-step protocol engineered to safeguard capital and provide transparent progress.
            </p>
          </div>

          {/* Desktop 6-card row / Mobile vertical timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 relative">
            {steps.map((st) => (
              <div
                key={st.step}
                className="bg-white border border-brand-border p-6 rounded-2xl shadow-sm flex flex-col justify-between hover:border-brand-navy/30 transition-all"
              >
                <div className="flex flex-col gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-ochre-tint text-brand-ochre-text font-bold text-sm flex items-center justify-center font-sans">
                    {st.step}
                  </div>
                  <h4 className="font-serif text-[18px] font-bold text-brand-ink">
                    {st.title}
                  </h4>
                  <p className="text-[13px] text-brand-nav leading-relaxed">
                    {st.desc}
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-brand-border text-brand-ochre">
                  <span className="material-symbols-outlined text-2xl">{st.icon}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FAQ ACCORDION SECTION */}
      <section className="w-full max-w-5xl mx-auto px-5 md:px-8 lg:px-12 py-20">
        <div className="flex flex-col items-center text-center mb-12">
          <span className="text-[12px] uppercase tracking-[0.08em] text-brand-red-deep font-bold block mb-1">
            Frequently Addressed Inquiries
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-ink tracking-tight">
            Clarity before capital.
          </h2>
          <p className="text-[15px] text-brand-nav mt-2 max-w-xl">
            Everything you need to know about purchasing, letting, and managing Lagos properties transparently.
          </p>
        </div>

        <Accordion items={faqItems} defaultOpenId="faq-title-verification" />
      </section>

    </div>
  );
}
