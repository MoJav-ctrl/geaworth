import { useState, type ReactNode } from "react";

export interface AccordionItem {
  id: string;
  number?: string;
  question: string;
  answer: string | ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  defaultOpenId?: string;
}

/** One open at a time, animated height, bottom-border dividers only, fully keyboard operable. */
export function Accordion({ items, defaultOpenId }: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId || null);

  return (
    <div className="w-full flex flex-col divide-y divide-brand-border border-b border-brand-border">
      {items.map((item) => {
        const isOpen = openId === item.id;
        const panelId = `accordion-content-${item.id}`;
        const buttonId = `accordion-button-${item.id}`;
        return (
          <div key={item.id} className="py-5 sm:py-6">
            <h3>
              <button
                id={buttonId}
                type="button"
                onClick={() => setOpenId(isOpen ? null : item.id)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="w-full flex items-start justify-between text-left gap-4 cursor-pointer rounded-lg p-1 group min-h-11"
              >
                <span className="flex items-start gap-3 sm:gap-4">
                  {item.number && (
                    <span className="font-sans font-bold text-[14px] text-brand-red-deep mt-1 shrink-0">{item.number}</span>
                  )}
                  <span className="font-serif text-[18px] sm:text-[20px] md:text-[22px] font-semibold text-brand-ink group-hover:text-brand-red transition-colors leading-snug">
                    {item.question}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className={`material-symbols-outlined text-brand-muted text-2xl transition-transform duration-300 shrink-0 mt-1 ${
                    isOpen ? "rotate-180 text-brand-red" : ""
                  }`}
                >
                  expand_more
                </span>
              </button>
            </h3>

            {/* grid-rows 0fr -> 1fr animates height without measuring; inert keeps closed content out of tab order */}
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              inert={!isOpen}
              className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="pt-4 pl-7 sm:pl-10 text-[15px] sm:text-[16px] leading-relaxed text-brand-nav">
                  {typeof item.answer === "string" ? <p>{item.answer}</p> : item.answer}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
