import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Photo } from "../components/ui/Photo.tsx";
import { FieldError } from "../components/ui/FieldError.tsx";
import { AREA_GROUPS, LISTING_CATEGORIES, PRICE_PERIODS, PROPERTY_TYPES, findArea } from "../config/listingOptions.ts";
import { formatNaira, parsePrice } from "../utils/pricing.ts";
import { ApiError, get, sendForm, type AdminListing } from "./api.ts";
import { Field, Notice, PageHeader, a11y, btnPrimary, btnSecondary, cardCls, inputCls } from "./ui.tsx";

const MAX_PHOTOS = 12;
const MAX_MB = 10;
const ACCEPT = "image/jpeg,image/png,image/webp";

interface FormValues {
  title: string;
  category: string;
  type: string;
  area: string;
  address: string;
  price: string;
  period: string;
  beds: string;
  baths: string;
  sqm: string;
  titleBadge: string;
  featured: boolean;
  features: string;
  description: string;
}

/** One photo in the form: an existing one (`ref`) or a freshly chosen file. `url` is what we show. */
interface FormPhoto {
  key: string;
  ref?: string;
  file?: File;
  url: string;
}

const EMPTY: FormValues = {
  title: "", category: "sale", type: "", area: "", address: "", price: "", period: "",
  beds: "", baths: "", sqm: "", titleBadge: "Verified Title", featured: false, features: "", description: "",
};

const toInt = (v: string) => (v.trim() === "" ? 0 : Number(v));

export function ListingFormPage() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [areaName, setAreaName] = useState("");
  const [photos, setPhotos] = useState<FormPhoto[]>([]);
  const [loading, setLoading] = useState(editing);
  const [loadError, setLoadError] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const fileInput = useRef<HTMLInputElement>(null);
  const blobUrls = useRef<string[]>([]);

  // Free the temporary preview URLs when leaving the page.
  useEffect(() => () => blobUrls.current.forEach((u) => URL.revokeObjectURL(u)), []);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    get<AdminListing>(`/admin/listings/${id}`)
      .then((l) => {
        if (cancelled) return;
        setValues({
          title: l.title, category: l.category, type: l.type, area: l.area, address: l.address,
          price: String(l.price), period: l.period ?? "", beds: String(l.beds), baths: String(l.baths), sqm: String(l.sqm),
          titleBadge: l.titleBadge, featured: Boolean(l.featured), features: l.features.join("\n"), description: l.description,
        });
        setAreaName(l.areaName);
        setPhotos(l.images.map((ref) => ({ key: ref, ref, url: ref })));
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setLoadError(err instanceof ApiError ? err.message : "Could not load this listing.");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) => setValues((v) => ({ ...v, [key]: value }));
  const text = (key: keyof FormValues) => ({
    value: values[key] as string,
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => set(key, e.target.value as never),
  });

  const onArea = (areaId: string) => {
    set("area", areaId);
    setAreaName(findArea(areaId)?.label ?? "");
  };

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const problems: string[] = [];
    const next: FormPhoto[] = [];
    for (const file of Array.from(list)) {
      if (!ACCEPT.split(",").includes(file.type)) problems.push(`${file.name} is not a JPG, PNG or WEBP image.`);
      else if (file.size > MAX_MB * 1024 * 1024) problems.push(`${file.name} is larger than ${MAX_MB} MB.`);
      else if (photos.length + next.length >= MAX_PHOTOS) problems.push(`Only ${MAX_PHOTOS} photos are allowed.`);
      else {
        const url = URL.createObjectURL(file);
        blobUrls.current.push(url);
        next.push({ key: url, file, url });
      }
    }
    setPhotos((p) => [...p, ...next]);
    setFields((f) => ({ ...f, images: problems[0] ?? "" }));
    if (fileInput.current) fileInput.current.value = "";
  };

  const makeCover = (key: string) =>
    setPhotos((p) => {
      const hit = p.find((x) => x.key === key);
      return hit ? [hit, ...p.filter((x) => x.key !== key)] : p;
    });
  const removePhoto = (key: string) => setPhotos((p) => p.filter((x) => x.key !== key));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const errs: Record<string, string> = {};
    if (photos.length < 1) errs.images = "Please add at least one photo.";
    if (!values.area) errs.area = "Please select an area";
    if (!values.type) errs.type = "Please select a property type";
    if (Object.keys(errs).length) {
      setFields(errs);
      return;
    }
    setFields({});
    setBusy(true);

    let newIndex = 0;
    const imageOrder = photos.map((p) => (p.ref ? p.ref : `new:${newIndex++}`));
    const area = findArea(values.area);
    const type = PROPERTY_TYPES.find((t) => t.id === values.type);
    const payload = {
      title: values.title,
      category: values.category,
      type: values.type,
      typeName: type?.label ?? "",
      area: values.area,
      areaName: areaName || area?.label || "",
      subMarket: area?.group ?? "",
      address: values.address,
      price: parsePrice(values.price),
      period: values.period || null,
      beds: toInt(values.beds),
      baths: toInt(values.baths),
      sqm: toInt(values.sqm),
      titleBadge: values.titleBadge,
      featured: values.featured,
      features: values.features.split("\n"),
      description: values.description,
      imageOrder,
    };
    const form = new FormData();
    form.append("data", JSON.stringify(payload));
    photos.forEach((p) => p.file && form.append("images", p.file));

    try {
      const saved = await sendForm<AdminListing>(editing ? "PUT" : "POST", editing ? `/admin/listings/${id}` : "/admin/listings", form);
      navigate("/admin", { state: { flash: editing ? `“${saved.title}” updated.` : `“${saved.title}” is now live on the website.` } });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setFields(err.fields ?? {});
      } else setError("Something went wrong. Please try again.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <p className="text-brand-muted" role="status">Loading listing…</p>;
  if (loadError) {
    return (
      <>
        <Notice kind="error">{loadError}</Notice>
        <Link to="/admin" className={btnSecondary}>Back to listings</Link>
      </>
    );
  }

  const price = parsePrice(values.price);

  return (
    <form onSubmit={submit} noValidate>
      <PageHeader
        title={editing ? "Edit listing" : "Add a listing"}
        subtitle={editing ? "Changes go live on the website as soon as you save." : "It goes live on the website homepage as soon as you publish."}
      />
      {error && <Notice kind="error">{error}</Notice>}

      <div className="space-y-6">
        <section className={`${cardCls} p-5 md:p-6 grid gap-4 md:grid-cols-2`} aria-labelledby="sec-basics">
          <h2 id="sec-basics" className="md:col-span-2 font-serif text-xl font-bold text-brand-ink">Basics</h2>
          <Field id="f-title" label="Title" error={fields.title} className="md:col-span-2" hint="e.g. 5 Bedroom Detached Duplex with BQ">
            <input {...a11y("f-title", fields.title)} type="text" maxLength={140} {...text("title")} className={inputCls} />
          </Field>
          <Field id="f-category" label="Listing type" error={fields.category}>
            <select {...a11y("f-category", fields.category)} {...text("category")} className={inputCls}>
              {LISTING_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </Field>
          <Field id="f-type" label="Property type" error={fields.type}>
            <select {...a11y("f-type", fields.type)} {...text("type")} className={inputCls}>
              <option value="">Select…</option>
              {PROPERTY_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </Field>
          <Field id="f-price" label="Price (₦)" error={fields.price} hint={price > 0 ? `Shown as ${formatNaira(price, values.period || null)}` : "Type 350000000 or 350M"}>
            <input {...a11y("f-price", fields.price)} type="text" inputMode="numeric" {...text("price")} className={inputCls} />
          </Field>
          <Field id="f-period" label="Price period" error={fields.period}>
            <select {...a11y("f-period", fields.period)} {...text("period")} className={inputCls}>
              {PRICE_PERIODS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </Field>
        </section>

        <section className={`${cardCls} p-5 md:p-6 grid gap-4 md:grid-cols-2`} aria-labelledby="sec-location">
          <h2 id="sec-location" className="md:col-span-2 font-serif text-xl font-bold text-brand-ink">Location</h2>
          <Field id="f-area" label="Area" error={fields.area} hint="Buyers filter the homepage by these areas.">
            <select {...a11y("f-area", fields.area)} value={values.area} onChange={(e) => onArea(e.target.value)} className={inputCls}>
              <option value="">Select…</option>
              {AREA_GROUPS.map((g) => (
                <optgroup key={g.group} label={g.group}>
                  {g.areas.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
                </optgroup>
              ))}
            </select>
          </Field>
          <Field id="f-address" label="Street address" error={fields.address}>
            <input {...a11y("f-address", fields.address)} type="text" maxLength={200} {...text("address")} className={inputCls} />
          </Field>
        </section>

        <section className={`${cardCls} p-5 md:p-6 grid gap-4 md:grid-cols-3`} aria-labelledby="sec-details">
          <h2 id="sec-details" className="md:col-span-3 font-serif text-xl font-bold text-brand-ink">Details</h2>
          <Field id="f-beds" label="Bedrooms" error={fields.beds}>
            <input {...a11y("f-beds", fields.beds)} type="number" min={0} max={50} inputMode="numeric" {...text("beds")} className={inputCls} />
          </Field>
          <Field id="f-baths" label="Bathrooms" error={fields.baths}>
            <input {...a11y("f-baths", fields.baths)} type="number" min={0} max={50} inputMode="numeric" {...text("baths")} className={inputCls} />
          </Field>
          <Field id="f-sqm" label="Size (sqm)" error={fields.sqm}>
            <input {...a11y("f-sqm", fields.sqm)} type="number" min={0} inputMode="numeric" {...text("sqm")} className={inputCls} />
          </Field>
          <Field id="f-badge" label="Title badge" error={fields.titleBadge} hint="e.g. C of O Verified, Governor’s Consent" className="md:col-span-3">
            <input {...a11y("f-badge", fields.titleBadge)} type="text" maxLength={40} {...text("titleBadge")} className={inputCls} />
          </Field>
          <Field id="f-features" label="Features" error={fields.features} hint="One per line, e.g. Swimming pool" className="md:col-span-3">
            <textarea {...a11y("f-features", fields.features)} rows={4} {...text("features")} className={inputCls} />
          </Field>
          <Field id="f-description" label="Description" error={fields.description} className="md:col-span-3">
            <textarea {...a11y("f-description", fields.description)} rows={6} maxLength={4000} {...text("description")} className={inputCls} />
          </Field>
          <label className="md:col-span-3 flex items-center gap-2 text-[14px] font-semibold text-brand-ink">
            <input type="checkbox" checked={values.featured} onChange={(e) => set("featured", e.target.checked)} className="size-4 accent-brand-red" />
            Mark as featured
          </label>
        </section>

        <section className={`${cardCls} p-5 md:p-6`} aria-labelledby="sec-photos">
          <h2 id="sec-photos" className="font-serif text-xl font-bold text-brand-ink mb-1">Photos</h2>
          <p className="text-[13px] text-brand-muted mb-4">
            Up to {MAX_PHOTOS} photos (JPG, PNG or WEBP, {MAX_MB} MB each). The first photo is the cover shown on the homepage.
          </p>
          {photos.length > 0 && (
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
              {photos.map((p, i) => (
                <li key={p.key} className="relative rounded-xl overflow-hidden border border-brand-border bg-brand-sand">
                  <div className="aspect-[4/3]">
                    <Photo name={p.url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" sizes="240px" width={400} height={300} />
                  </div>
                  {i === 0 && <span className="absolute top-2 left-2 bg-brand-navy text-white text-[11px] font-bold px-2 py-0.5 rounded-xl">Cover</span>}
                  <div className="flex items-center justify-between gap-1 p-1.5 bg-white">
                    {i > 0 ? (
                      <button type="button" onClick={() => makeCover(p.key)} className="text-[12px] font-bold text-brand-navy hover:underline px-1">Make cover</button>
                    ) : <span />}
                    <button type="button" onClick={() => removePhoto(p.key)} className="inline-flex items-center gap-0.5 text-[12px] font-bold text-brand-error-deep hover:underline px-1" aria-label={`Remove photo ${i + 1}`}>
                      <span className="material-symbols-outlined text-[16px]" aria-hidden="true">close</span>
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <input ref={fileInput} id="f-images" type="file" accept={ACCEPT} multiple onChange={(e) => addFiles(e.target.files)} className="sr-only" aria-describedby={fields.images ? "f-images-error" : undefined} />
          <label htmlFor="f-images" className={`${btnSecondary} cursor-pointer ${photos.length >= MAX_PHOTOS ? "opacity-60 pointer-events-none" : ""}`}>
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">add_photo_alternate</span>
            Add photos
          </label>
          <FieldError id="f-images" message={fields.images} />
        </section>

        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={busy} className={btnPrimary}>
            {busy ? "Saving…" : editing ? "Save changes" : "Publish listing"}
          </button>
          <Link to="/admin" className={btnSecondary}>Cancel</Link>
        </div>
      </div>
    </form>
  );
}
