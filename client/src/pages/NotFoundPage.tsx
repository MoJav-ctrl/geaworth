import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-5 py-24 text-center flex flex-col items-center gap-4">
      <span className="font-serif text-7xl font-bold text-brand-red">404</span>
      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-ink">
        Address Not Found on the Lagos Grid
      </h1>
      <p className="text-[16px] text-brand-nav max-w-md">
        The street, parcel, or page you are looking for does not exist or has been relocated within our registry.
      </p>
      <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-brand-red hover:bg-brand-red-hover text-white text-[13px] uppercase tracking-wider font-bold px-6 py-3.5 rounded-[10px] shadow-sm transition-all"
        >
          <span>Return Home</span>
          <span className="material-symbols-outlined text-base">home</span>
        </Link>
        <Link
          to="/contact"
          className="inline-flex items-center gap-2 bg-white hover:bg-brand-sand text-brand-ink border border-brand-border text-[13px] uppercase tracking-wider font-bold px-6 py-3.5 rounded-[10px] shadow-2xs transition-all"
        >
          <span>Contact Lagos Desk</span>
          <span className="material-symbols-outlined text-base">call</span>
        </Link>
      </div>
    </div>
  );
}
