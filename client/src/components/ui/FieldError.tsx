/** Inline field error. Pair with aria-invalid + aria-describedby={`${id}-error`} on the input. */
export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={`${id}-error`} role="alert" className="flex items-start gap-1 text-[12px] font-semibold text-brand-error mt-1">
      <span className="material-symbols-outlined text-sm mt-px" aria-hidden="true">error</span>
      <span>{message}</span>
    </p>
  );
}
