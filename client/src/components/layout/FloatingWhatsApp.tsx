import { useLocation } from "react-router-dom";
import { getWhatsAppUrl } from "../../config/site.ts";
import { WhatsAppIcon } from "../ui/WhatsAppIcon.tsx";

/** Pages with long forms already carry their own WhatsApp buttons; on phones the float would sit over submit buttons. */
const FORM_PATHS = ["/contact", "/sell"];

export function FloatingWhatsApp() {
  const { pathname } = useLocation();
  const onFormPage = FORM_PATHS.includes(pathname);

  return (
    <aside
      aria-label="Direct WhatsApp assistance"
      className={`fixed z-40 items-center group right-[max(1.25rem,env(safe-area-inset-right))] bottom-[max(1.25rem,env(safe-area-inset-bottom))] ${
        onFormPage ? "hidden md:flex" : "flex"
      }`}
    >
      <span className="hidden md:inline-block mr-2 px-3 py-1.5 bg-brand-ink text-white text-[12px] font-semibold rounded-lg shadow-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        Chat with Lagos Desk
      </span>
      <a
        href={getWhatsAppUrl("Hello Geaworth Properties, I would like to schedule a confidential property consultation.")}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Inquire via WhatsApp with Lagos desk"
        className="w-14 h-14 rounded-full bg-brand-whatsapp hover:bg-brand-whatsapp-hover text-brand-ink flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all focus-visible:outline-brand-navy"
      >
        <WhatsAppIcon className="w-[30px] h-[30px]" />
      </a>
    </aside>
  );
}
