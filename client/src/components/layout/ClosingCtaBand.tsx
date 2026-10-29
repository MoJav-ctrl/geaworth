import { Link, useLocation } from "react-router-dom";
import { SITE_CONFIG, getWhatsAppUrl } from "../../config/site.ts";
import { WhatsAppIcon } from "../ui/WhatsAppIcon.tsx";

type SecondaryAction =
  | { kind: "whatsapp" }
  | { kind: "link"; label: string; to: string; icon: string }
  | { kind: "download"; label: string; href: string };

interface CtaConfig {
  variant: "navy" | "card";
  eyebrow?: string;
  title: string;
  subtitle: string;
  primary: { label: string; to: string };
  secondary: SecondaryAction;
  ticks?: string[];
}

const DEFAULT_CTA: CtaConfig = {
  variant: "navy",
  eyebrow: "Direct Advisory",
  title: "Ready to make your next move in Lagos?",
  subtitle:
    "Whether you're relocating from abroad, upgrading your family home, or building a high-yield Lagos rental portfolio, our senior property advisors are one WhatsApp or phone call away.",
  primary: { label: "Schedule a Consultation", to: "/contact" },
  secondary: { kind: "whatsapp" },
};

/** Per-route closers: same shared component, different copy. */
const CTA_BY_PATH: Record<string, CtaConfig> = {
  "/services": {
    variant: "navy",
    eyebrow: "Direct Partner Access",
    title: "Need a tailored real estate solution in Lagos?",
    subtitle:
      "Talk with our advisory leads today for an informal, no-obligation conversation about your residential acquisition or property management portfolio.",
    primary: { label: "Speak to an Advisor", to: "/contact" },
    secondary: { kind: "download", label: "Lagos Q3 Market Report (PDF)", href: "/api/reports/lagos-q3" },
  },
  "/about": {
    variant: "card",
    eyebrow: "Direct Advisory",
    title: "Let’s find your next address.",
    subtitle:
      "Stop navigating Lagos real estate alone. Let our advisory team guide you home with complete legal due diligence and honest ground perspective.",
    primary: { label: "Schedule a Consultation", to: "/contact" },
    secondary: { kind: "link", label: "View Open Listings", to: "/?filter=all#curated-residences", icon: "real_estate_agent" },
    ticks: ["Governor's Consent Vetted", "Lagos Island & Mainland", "Escrow Protected"],
  },
};

const btn =
  "inline-flex items-center justify-center gap-2 text-[13px] uppercase tracking-[0.04em] font-bold px-6 py-3.5 min-h-[48px] rounded-[10px] transition-all active:scale-95 w-full sm:w-auto";

function Secondary({ action, onDark }: { action: SecondaryAction; onDark: boolean }) {
  if (action.kind === "whatsapp") {
    return (
      <a
        href={getWhatsAppUrl("Hello Geaworth Properties, I would like to speak directly with an advisor.")}
        target="_blank"
        rel="noopener noreferrer"
        className={`${btn} bg-brand-whatsapp hover:bg-brand-whatsapp-hover text-brand-ink`}
      >
        <WhatsAppIcon className="w-5 h-5" />
        <span>Chat on WhatsApp ({SITE_CONFIG.phones.whatsappDisplay})</span>
      </a>
    );
  }
  const cls = onDark
    ? `${btn} bg-white/10 hover:bg-white/20 text-white border border-white/40`
    : `${btn} bg-brand-tint2 hover:bg-brand-sand text-brand-ink border border-brand-border`;
  if (action.kind === "download") {
    return (
      <a href={action.href} download className={cls}>
        <span className="material-symbols-outlined text-lg">download</span>
        <span>{action.label}</span>
      </a>
    );
  }
  return (
    <Link to={action.to} className={cls}>
      <span>{action.label}</span>
      <span className="material-symbols-outlined text-lg">{action.icon}</span>
    </Link>
  );
}

/** The one closing CTA used at the end of every page (rendered by <Layout>). */
export function ClosingCtaBand() {
  const { pathname } = useLocation();
  const cfg = CTA_BY_PATH[pathname] ?? DEFAULT_CTA;

  if (cfg.variant === "card") {
    return (
      <section aria-labelledby="closing-cta-title" className="w-full py-16 md:py-24 bg-brand-sand">
        <div className="max-w-4xl mx-auto px-5 md:px-8">
          <div className="bg-brand-card border border-brand-border p-8 sm:p-12 rounded-2xl shadow-card text-center flex flex-col items-center gap-4">
            {cfg.eyebrow && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-tint2 rounded-full border border-brand-border">
                <span className="material-symbols-outlined text-brand-red text-sm">home_pin</span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-nav">{cfg.eyebrow}</span>
              </div>
            )}
            <h2 id="closing-cta-title" className="font-serif text-display-hero font-bold text-brand-ink tracking-tight">
              {cfg.title}
            </h2>
            <p className="text-body-lg text-brand-nav max-w-lg">{cfg.subtitle}</p>
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full justify-center">
              <Link to={cfg.primary.to} className={`${btn} bg-brand-red hover:bg-brand-red-hover active:bg-brand-red-active text-white`}>
                <span>{cfg.primary.label}</span>
                <span className="material-symbols-outlined text-lg">calendar_month</span>
              </Link>
              <Secondary action={cfg.secondary} onDark={false} />
            </div>
            {cfg.ticks && (
              <ul className="pt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12px] uppercase font-bold text-brand-muted">
                {cfg.ticks.map((t) => (
                  <li key={t} className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-brand-red">check_circle</span>
                    {t}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="closing-cta-title" className="w-full max-w-7xl mx-auto px-5 md:px-8 lg:px-12 my-16 md:my-24">
      <div className="relative bg-brand-navy text-white rounded-2xl overflow-hidden p-8 sm:p-12 lg:p-16 shadow-card-hover">
        <div className="absolute -right-24 -bottom-24 w-96 h-96 bg-brand-red/20 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="relative z-10 max-w-3xl">
          {cfg.eyebrow && (
            <span className="text-[12px] uppercase tracking-[0.06em] text-brand-navy-tint font-bold block mb-2">{cfg.eyebrow}</span>
          )}
          <h2 id="closing-cta-title" className="font-serif text-headline-lg font-bold text-white tracking-tight">
            {cfg.title}
          </h2>
          <p className="text-body-lg text-brand-navy-tint mt-4 max-w-2xl">{cfg.subtitle}</p>
          <div className="pt-8 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-4">
            <Link to={cfg.primary.to} className={`${btn} bg-brand-red hover:bg-brand-red-hover active:bg-brand-red-active text-white shadow-md`}>
              <span className="material-symbols-outlined text-lg">calendar_month</span>
              <span>{cfg.primary.label}</span>
            </Link>
            <Secondary action={cfg.secondary} onDark />
          </div>
        </div>
      </div>
    </section>
  );
}
