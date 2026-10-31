import { Link } from "react-router-dom";
import { SITE_CONFIG } from "../config/site.ts";
import { Photo } from "../components/ui/Photo.tsx";
import { CountUp } from "../components/ui/CountUp.tsx";

export function AboutPage() {
  const stats = [
    {
      to: 2, prefix: "₦", suffix: "B+",
      label: "Facilitated Value",
      desc: "Closed Lagos acquisitions",
      color: "text-brand-red",
    },
    {
      to: 100, suffix: "+",
      label: "Clients Housed",
      desc: "Families & corporates",
      color: "text-brand-navy",
    },
    {
      to: 28,
      label: "Lagos Enclaves",
      desc: "Active street reconnaissance",
      color: "text-brand-ochre-text",
    },
    {
      to: 98.4, decimals: 1, suffix: "%",
      label: "Asset Retention",
      desc: "Across managed portfolios",
      color: "text-brand-ink",
    },
    {
      to: 12, suffix: " Years",
      label: "Leadership Tenure",
      desc: "Urban planning expertise",
      color: "text-brand-navy",
    },
    {
      to: 0, suffix: "%",
      label: "Phantom Tolerance",
      desc: "Strict Alausa verification",
      color: "text-brand-red",
    },
  ];

  const pillars = [
    {
      num: "Pillar 01",
      title: "Unrivaled Local Knowledge",
      desc: "Understanding Lagos requires living it. We know which streets remain dry in July, which estates have true 24-hour power, and where infrastructure projects will deliver capital gains.",
      tag: "Granular Ground Audits",
      color: "text-brand-red",
      bg: "bg-brand-red/10",
      icon: "explore",
    },
    {
      num: "Pillar 02",
      title: "Radical Transparency",
      desc: "No hidden developer fees, no bloated legal cuts, no phantom listings. If a property has a red flag during our Alausa search, we tell you immediately.",
      tag: "Zero Opaque Markups",
      color: "text-brand-navy",
      bg: "bg-brand-navy-tint",
      icon: "visibility",
    },
    {
      num: "Pillar 03",
      title: "Speed & Execution",
      desc: "Lagos moves at breakneck speed. We cut administrative red tape with digitized title checks, vetted deeds of assignment, and rapid turnaround responses.",
      tag: "Fast-Tracked Closing",
      color: "text-brand-ochre-text",
      bg: "bg-brand-ochre-tint",
      icon: "bolt",
    },
    {
      num: "Pillar 04",
      title: "Human Care",
      desc: "A house is not merely a concrete asset; it is your family's sanctuary or your retirement security. We treat your transaction with personal stewardship.",
      tag: "Generational Stewardship",
      color: "text-brand-red",
      bg: "bg-brand-red/10",
      icon: "favorite",
    },
  ];

  const milestones = [
    {
      year: "2021",
      title: "Lekki Foundations",
      dot: "bg-brand-red",
      text: "Geaworth founded in Lekki with a focus on thoroughly vetted residential lettings and investor leaseholds.",
    },
    {
      year: "2022",
      title: "Island Expansion",
      dot: "bg-brand-navy",
      text: "Expanded footprint into Old Ikoyi and Victoria Island commercial sales and bespoke institutional facility management.",
    },
    {
      year: "2023",
      title: "Diaspora Safe-Buy",
      dot: "bg-brand-ochre",
      text: "Launched the Diaspora Safe-Buy Guarantee featuring Alausa digital search streams and verifiable escrow protection.",
    },
    {
      year: "2024",
      title: "The Mainland Hub",
      dot: "bg-brand-ink",
      text: "Surpassed 1,000 successful client transactions and opened our Ikeja GRA office to serve the Mainland market.",
    },
    {
      year: "2025",
      title: "Green Future",
      dot: "bg-brand-red",
      text: "Pioneering energy audits and turnkey hybrid solar retrofits across our managed residential clusters.",
    },
  ];

  return (
    <div className="w-full flex flex-col">
      {/* 1. HERO SECTION (7/5 split) */}
      <section className="relative w-full bg-white overflow-hidden py-16 md:py-24 border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left text */}
            <div className="lg:col-span-7 flex flex-col gap-5 z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-tint2 border border-brand-border rounded-full w-fit">
                <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-brand-nav">
                  The Geaworth Philosophy
                </span>
              </div>

              <h1 className="font-serif text-[38px] sm:text-[48px] lg:text-[56px] font-bold text-brand-ink tracking-tight leading-[1.12]">
                We’re Geaworth. <br />
                <span className="italic font-normal text-brand-navy">We know Lagos,</span> <br />
                street by street.
              </h1>

              <p className="text-[16px] md:text-[18px] text-brand-nav max-w-xl leading-relaxed">
                Founded on the belief that securing property in Nigeria’s commercial capital should be grounded in unassailable integrity, intimate local knowledge, and genuine human care.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <a
                  href="#story"
                  className="inline-flex items-center gap-2 bg-brand-red hover:bg-brand-red-hover text-white text-[13px] uppercase tracking-wider font-bold px-6 py-3.5 rounded-[10px] shadow-sm transition-all"
                >
                  <span>Read Our Story</span>
                  <span className="material-symbols-outlined text-base">arrow_downward</span>
                </a>
                <div className="flex items-center gap-2 text-brand-nav text-[13px] font-bold">
                  <span className="material-symbols-outlined text-brand-ochre">verified_user</span>
                  <span>{SITE_CONFIG.rcNumber} • Lagos Licensed Brokerage</span>
                </div>
              </div>
            </div>

            {/* Right Photo Column */}
            <div className="lg:col-span-5 relative mt-4 lg:mt-0">
              <div className="relative bg-brand-tint2 p-3 rounded-2xl border border-brand-border shadow-md">
                <div className="relative w-full h-[400px] sm:h-[460px] overflow-hidden rounded-xl bg-brand-sand">
                  <Photo name="lekki-residence-exterior" alt="Lekki Phase 1 streetscape" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" width={1200} height={800} priority />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/85 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 p-3 bg-white/95 backdrop-blur-md rounded-xl border border-brand-border shadow-sm">
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-brand-red text-base mt-0.5">
                        location_pin
                      </span>
                      <div>
                        <p className="text-[12px] font-bold uppercase tracking-wide text-brand-ink">
                          Ikota, Lekki
                        </p>
                        <p className="text-[12px] text-brand-muted">
                          Where our Lagos story began in 2021
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute -top-3 -right-3 bg-brand-navy text-white px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm">
                  Est. 2021 • Island &amp; Mainland
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS BAR (Row of 6 on Desktop, 2x3 on Mobile) */}
      <section className="w-full bg-brand-card py-12 border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8">
            {stats.map((st, i) => (
              <div key={i} className="flex flex-col gap-1">
                <CountUp
                  to={st.to}
                  prefix={st.prefix}
                  suffix={st.suffix}
                  decimals={st.decimals}
                  className={`font-serif text-3xl font-bold ${st.color}`}
                />
                <span className="text-[12px] uppercase font-bold tracking-wider text-brand-ink">
                  {st.label}
                </span>
                <span className="text-[12px] text-brand-muted">
                  {st.desc}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. STORY SECTION: WHY WE STARTED */}
      <section id="story" className="w-full bg-brand-canvas py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Story Image Mosaic (5 Cols) */}
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="bg-white border border-brand-border rounded-2xl p-5 shadow-sm">
                <div className="w-full h-80 overflow-hidden rounded-xl mb-4 bg-brand-sand">
                  <Photo name="luxury-villa-architecture" alt="Luxury architectural villa in Lagos" className="w-full h-full object-cover" width={1200} height={800} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-32 overflow-hidden rounded-xl bg-brand-sand">
                    <Photo name="luxury-interior-victoria-island" alt="Cadastral planning & layout" className="w-full h-full object-cover" width={1200} height={800} />
                  </div>
                  <div className="p-4 bg-brand-tint2 rounded-xl flex flex-col justify-center text-center">
                    <span className="font-serif text-3xl font-bold text-brand-red">0%</span>
                    <span className="text-[11px] uppercase tracking-wider text-brand-muted font-bold mt-1">
                      Phantom Listing Tolerance
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Narrative Content (7 Cols) */}
            <div className="lg:col-span-7 order-1 lg:order-2 flex flex-col gap-5 lg:pl-6">
              <div className="flex items-center gap-2">
                <span className="h-0.5 w-8 bg-brand-red" />
                <span className="text-[12px] uppercase font-bold tracking-[0.08em] text-brand-red-deep">
                  Our Origin
                </span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-ink tracking-tight">
                Why We Started: Dismantling the Notorious Lagos Property Chaos.
              </h2>

              <div className="space-y-4 text-[16px] text-brand-nav leading-relaxed">
                <p>
                  Anyone who has attempted to purchase or lease real estate in Lagos knows the playbook of frustration: multiple unscrupulous agents marketing the identical parcel, surprise developer escalation clauses, disputed titles obscured behind vague promises, and post-purchase silence.
                </p>

                <div className="p-5 bg-white border-l-4 border-brand-red rounded-r-xl shadow-2xs">
                  <p className="font-serif italic text-[16px] sm:text-[17px] text-brand-ink leading-relaxed">
                    “We built Geaworth to be the real estate partner we wished we had: meticulous about legal titles, completely transparent about pricing in Naira, and obsessed with the lived realities of each neighborhood—from water drainage to peak-hour commute times.”
                  </p>
                </div>

                <p>
                  Lagos is dynamic, profitable, and culturally peerless. It is Africa’s economic engine. We decided that acquiring property here should evoke pride and total peace of mind—never panic or litigation.
                </p>
              </div>

              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-brand-border">
                  <span className="material-symbols-outlined text-brand-navy text-2xl mt-0.5">gavel</span>
                  <div>
                    <h4 className="text-[14px] font-bold text-brand-ink">Alausa Ground-Truth</h4>
                    <p className="text-[12px] text-brand-muted">
                      Direct official searches at Lagos State Lands Bureau before listing.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-brand-border">
                  <span className="material-symbols-outlined text-brand-navy text-2xl mt-0.5">water_drop</span>
                  <div>
                    <h4 className="text-[14px] font-bold text-brand-ink">Rainfall Topography</h4>
                    <p className="text-[12px] text-brand-muted">
                      Detailed elevation and seasonal drainage checks for every street.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. OPERATING PILLARS: THE GEAWORTH STANDARDS */}
      <section className="w-full bg-brand-tint2 py-16 md:py-24 border-y border-brand-border">
        <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-12 flex flex-col gap-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-xl">
              <span className="text-[12px] uppercase tracking-[0.08em] text-brand-red-deep font-bold block mb-1">
                Our Operating Pillars
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-ink">
                The Geaworth Standards
              </h2>
            </div>
            <p className="text-[15px] text-brand-nav max-w-md">
              Four unbending codes governing how we inspect parcels, scrutinize documentation, and represent families and investors across the Federation and Diaspora.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((p, idx) => (
              <div
                key={idx}
                className="bg-white border border-brand-border p-6 rounded-2xl shadow-sm hover:border-brand-navy/30 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="flex flex-col gap-4">
                  <div className={`w-12 h-12 rounded-xl ${p.bg} ${p.color} flex items-center justify-center`}>
                    <span className="material-symbols-outlined text-2xl">{p.icon}</span>
                  </div>
                  <span className="text-[11px] uppercase tracking-[0.08em] text-brand-muted font-bold">
                    {p.num}
                  </span>
                  <h3 className="font-serif text-[19px] font-bold text-brand-ink">
                    {p.title}
                  </h3>
                  <p className="text-[14px] text-brand-nav leading-relaxed">
                    {p.desc}
                  </p>
                </div>
                <div className={`pt-5 mt-4 border-t border-brand-border flex items-center justify-between text-[12px] font-bold uppercase ${p.color}`}>
                  <span>{p.tag}</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. MILESTONES TIMELINE */}
      <section className="w-full bg-brand-tint2 py-16 md:py-24 border-t border-brand-border">
        <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-12 flex flex-col gap-10">
          <div className="max-w-xl">
            <span className="text-[12px] uppercase tracking-[0.08em] text-brand-red-deep font-bold block mb-1">
              Our Journey
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-ink">
              A Decade of Defending Property Integrity
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {milestones.map((m, i) => (
              <div
                key={i}
                className="flex flex-col bg-white border border-brand-border p-5 rounded-2xl shadow-sm hover:border-brand-navy/30 transition-colors"
              >
                <div className="flex items-center justify-between pb-3">
                  <span className="font-serif text-2xl font-bold text-brand-ink">
                    {m.year}
                  </span>
                  <span className={`w-3 h-3 rounded-full ${m.dot}`} />
                </div>
                <h4 className="font-serif text-[17px] font-bold text-brand-ink mb-1">
                  {m.title}
                </h4>
                <p className="text-[13px] text-brand-nav leading-relaxed">
                  {m.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
