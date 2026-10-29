import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Photo } from "../components/ui/Photo.tsx";
import { LISTING_CATEGORIES } from "../config/listingOptions.ts";
import { formatNaira } from "../utils/pricing.ts";
import { useAuth } from "./AuthContext.tsx";
import { ApiError, formatDate, get, send, type AdminListing } from "./api.ts";
import { Notice, PageHeader, btnDanger, btnPrimary, btnSecondary, cardCls } from "./ui.tsx";

const categoryLabel = (id: string) => LISTING_CATEGORIES.find((c) => c.id === id)?.label ?? id;

export function ListingsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [items, setItems] = useState<AdminListing[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");
  const [flash, setFlash] = useState((useLocation().state as { flash?: string } | null)?.flash ?? "");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(() => {
    setStatus("loading");
    get<AdminListing[]>("/admin/listings")
      .then((data) => {
        setItems(data);
        setStatus("ready");
      })
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : "Could not load listings.");
        setStatus("error");
      });
  }, []);

  useEffect(load, [load]);

  const remove = async (item: AdminListing) => {
    if (!window.confirm(`Delete “${item.title}”? This removes it from the website and cannot be undone.`)) return;
    setDeletingId(item.id);
    setError("");
    try {
      await send("DELETE", `/admin/listings/${item.id}`);
      setItems((list) => list.filter((l) => l.id !== item.id));
      setFlash("Listing deleted.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete the listing.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <PageHeader
        title={isAdmin ? "All listings" : "My listings"}
        subtitle={isAdmin ? "Everything shown on the website. New uploads go live immediately." : "Houses you have uploaded. They go live on the website immediately."}
        action={
          <Link to="/admin/listings/new" className={btnPrimary}>
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">add</span>
            Add listing
          </Link>
        }
      />
      {flash && <Notice kind="success">{flash}</Notice>}
      {error && <Notice kind="error">{error}</Notice>}

      {status === "loading" && <p className="text-brand-muted" role="status">Loading listings…</p>}
      {status === "error" && (
        <button type="button" onClick={load} className={btnSecondary}>Try again</button>
      )}
      {status === "ready" && items.length === 0 && (
        <div className={`${cardCls} p-10 text-center`}>
          <p className="font-serif text-xl font-bold text-brand-ink mb-1">No listings yet</p>
          <p className="text-[14px] text-brand-nav mb-4">Upload your first house and it will appear on the homepage straight away.</p>
          <Link to="/admin/listings/new" className={btnPrimary}>Add listing</Link>
        </div>
      )}

      {status === "ready" && items.length > 0 && (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className={`${cardCls} p-3 sm:p-4 flex flex-wrap items-center gap-4`}>
              <div className="w-24 h-[68px] rounded-xl overflow-hidden bg-brand-sand shrink-0">
                <Photo name={item.image} alt="" className="w-full h-full object-cover" sizes="96px" width={400} height={300} />
              </div>
              <div className="flex-1 min-w-[200px]">
                <p className="font-serif text-[17px] font-bold text-brand-ink leading-snug">{item.title}</p>
                <p className="text-[13px] text-brand-nav">
                  {item.areaName} · {item.typeName} · {categoryLabel(item.category)}
                </p>
                <p className="text-[12px] text-brand-muted mt-0.5">
                  {isAdmin && <>By {item.createdByName ?? "Starter listing"} · </>}
                  Updated {formatDate(item.updatedAt ?? item.createdAt)}
                  {item.featured && <> · <span className="font-bold text-brand-ochre-text">Featured</span></>}
                </p>
              </div>
              <p className="font-serif text-[17px] font-bold text-brand-ink whitespace-nowrap">{formatNaira(item.price, item.period)}</p>
              <div className="flex items-center gap-2">
                <a href={`/listings/${item.slug}`} target="_blank" rel="noopener noreferrer" className={btnSecondary} aria-label={`View ${item.title} on the website (opens in a new tab)`}>
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">open_in_new</span>
                  View
                </a>
                {item.canEdit && (
                  <>
                    <Link to={`/admin/listings/${item.id}`} className={btnSecondary} aria-label={`Edit ${item.title}`}>
                      <span className="material-symbols-outlined text-[18px]" aria-hidden="true">edit</span>
                      Edit
                    </Link>
                    <button type="button" onClick={() => void remove(item)} disabled={deletingId === item.id} className={btnDanger} aria-label={`Delete ${item.title}`}>
                      <span className="material-symbols-outlined text-[18px]" aria-hidden="true">delete</span>
                      {deletingId === item.id ? "Deleting…" : "Delete"}
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
