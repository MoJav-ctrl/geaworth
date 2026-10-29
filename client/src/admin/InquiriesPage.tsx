import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ApiError, formatDate, get, type Submissions } from "./api.ts";
import { Notice, PageHeader, cardCls } from "./ui.tsx";

type Tab = "inquiries" | "valuations" | "subscribers";
const str = (v: unknown) => (v === undefined || v === null || v === "" ? "–" : String(v));
const telHref = (phone: unknown) => `tel:${String(phone ?? "").replace(/[^\d+]/g, "")}`;

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">{label}</dt>
      <dd className="text-[14px] text-brand-ink break-words">{children}</dd>
    </div>
  );
}

export function InquiriesPage() {
  const [data, setData] = useState<Submissions | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("inquiries");

  useEffect(() => {
    get<Submissions>("/admin/submissions")
      .then(setData)
      .catch((err: unknown) => setError(err instanceof ApiError ? err.message : "Could not load submissions."));
  }, []);

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "inquiries", label: "Inquiries", count: data?.inquiries.length ?? 0 },
    { id: "valuations", label: "Valuation requests", count: data?.valuations.length ?? 0 },
    { id: "subscribers", label: "Subscribers", count: data?.subscribers.length ?? 0 },
  ];

  return (
    <>
      <PageHeader title="Inquiries" subtitle="Everything visitors have sent through the website, newest first." />
      {error && <Notice kind="error">{error}</Notice>}
      {!data && !error && <p className="text-brand-muted" role="status">Loading…</p>}
      {data && (
        <>
          <div role="tablist" aria-label="Submission type" className="flex flex-wrap gap-2 mb-5">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2 rounded-xl text-[14px] font-bold transition-colors ${tab === t.id ? "bg-brand-navy text-white" : "bg-white border border-brand-border text-brand-nav hover:border-brand-navy/50"}`}
              >
                {t.label} ({t.count})
              </button>
            ))}
          </div>

          {tab === "inquiries" && (
            <ul className="space-y-3">
              {data.inquiries.length === 0 && <li className="text-brand-muted">No inquiries yet.</li>}
              {data.inquiries.map((q, i) => (
                <li key={str(q.id) + i} className={`${cardCls} p-4`}>
                  <p className="font-bold text-brand-ink">{str(q.fullName)} <span className="font-normal text-[13px] text-brand-muted">· {formatDate(q.receivedAt)}</span></p>
                  <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mt-3">
                    <Row label="Email"><a className="text-brand-navy hover:underline" href={`mailto:${str(q.email)}`}>{str(q.email)}</a></Row>
                    <Row label="Phone"><a className="text-brand-navy hover:underline" href={telHref(q.phone)}>{str(q.phone)}</a></Row>
                    <Row label="Interest">{str(q.primaryInterest)}</Row>
                    <Row label="Location · Budget">{str(q.preferredLocation)} · {str(q.estimatedBudget)}</Row>
                  </dl>
                  {q.messageDetails ? <p className="text-[14px] text-brand-nav mt-3 whitespace-pre-wrap">{String(q.messageDetails)}</p> : null}
                </li>
              ))}
            </ul>
          )}

          {tab === "valuations" && (
            <ul className="space-y-3">
              {data.valuations.length === 0 && <li className="text-brand-muted">No valuation requests yet.</li>}
              {data.valuations.map((v, i) => {
                const files = Array.isArray(v.files) ? (v.files as { name?: string }[]) : [];
                return (
                  <li key={str(v.id) + i} className={`${cardCls} p-4`}>
                    <p className="font-bold text-brand-ink">{str(v.fullName)} <span className="font-normal text-[13px] text-brand-muted">· {formatDate(v.receivedAt)}</span></p>
                    <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mt-3">
                      <Row label="Email"><a className="text-brand-navy hover:underline" href={`mailto:${str(v.email)}`}>{str(v.email)}</a></Row>
                      <Row label="Phone"><a className="text-brand-navy hover:underline" href={telHref(v.phone)}>{str(v.phone)}</a></Row>
                      <Row label="Property">{str(v.propertyType)} · {str(v.location)}</Row>
                      <Row label="Expected price">{str(v.expectedPrice)}</Row>
                    </dl>
                    {files.length > 0 && <p className="text-[12px] text-brand-muted mt-3">{files.length} file(s) attached: {files.map((f) => f.name).join(", ")} (stored on the server)</p>}
                  </li>
                );
              })}
            </ul>
          )}

          {tab === "subscribers" && (
            <ul className={`${cardCls} divide-y divide-brand-border`}>
              {data.subscribers.length === 0 && <li className="p-4 text-brand-muted">No subscribers yet.</li>}
              {data.subscribers.map((s) => (
                <li key={s.email} className="p-3 flex justify-between gap-3 text-[14px]">
                  <span className="text-brand-ink">{s.email}</span>
                  <span className="text-brand-muted">{formatDate(s.subscribedAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </>
  );
}
