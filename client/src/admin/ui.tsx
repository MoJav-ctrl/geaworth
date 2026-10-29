import type { ReactNode } from "react";
import { FieldError } from "../components/ui/FieldError.tsx";

export const inputCls =
  "w-full bg-white px-3.5 py-2.5 rounded-xl text-[14px] text-brand-ink border border-brand-border focus:border-brand-navy focus:outline-none transition-colors aria-invalid:border-brand-error disabled:bg-brand-tint1";
export const labelCls = "block text-[12px] font-bold uppercase tracking-wider text-brand-muted mb-1.5";
const btnBase =
  "inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-[14px] font-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy";
export const btnPrimary = `${btnBase} bg-brand-red text-white hover:bg-brand-red-hover active:bg-brand-red-active`;
export const btnSecondary = `${btnBase} bg-white text-brand-ink border border-brand-border hover:border-brand-navy/50`;
export const btnDanger = `${btnBase} bg-white text-brand-error-deep border border-brand-error-bg hover:bg-brand-error-bg`;
export const cardCls = "bg-white border border-brand-border rounded-2xl shadow-card";

/** Props that wire an input to its <FieldError> for screen readers. */
export const a11y = (id: string, error?: string) => ({
  id,
  "aria-invalid": error ? (true as const) : undefined,
  "aria-describedby": error ? `${id}-error` : undefined,
});

export function Field({
  id,
  label,
  error,
  hint,
  className,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className={labelCls}>
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-[12px] text-brand-muted mt-1">{hint}</p>}
      <FieldError id={id} message={error} />
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
      <div>
        <h1 className="font-serif text-headline-md font-bold text-brand-ink">{title}</h1>
        {subtitle && <p className="text-[14px] text-brand-nav mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Notice({ kind, children }: { kind: "success" | "error"; children: ReactNode }) {
  const tone =
    kind === "success"
      ? "bg-brand-navy-tint text-brand-navy border-brand-navy/20"
      : "bg-brand-error-bg text-brand-error-deep border-brand-error/30";
  return (
    <div role={kind === "error" ? "alert" : "status"} className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-[14px] font-semibold mb-5 ${tone}`}>
      <span className="material-symbols-outlined text-[20px]" aria-hidden="true">{kind === "success" ? "check_circle" : "error"}</span>
      <span>{children}</span>
    </div>
  );
}
