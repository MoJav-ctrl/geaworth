import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ApiError, formatDate, get, send, type ManagedUser } from "./api.ts";
import { Field, Notice, PageHeader, a11y, btnDanger, btnPrimary, btnSecondary, cardCls, inputCls } from "./ui.tsx";

export function UsersPage() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [fields, setFields] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const [resetFor, setResetFor] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetError, setResetError] = useState("");

  const load = useCallback(() => {
    get<ManagedUser[]>("/admin/users")
      .then((data) => {
        setUsers(data);
        setStatus("ready");
      })
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : "Could not load users.");
        setStatus("error");
      });
  }, []);
  useEffect(load, [load]);

  const create = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    setFields({});
    try {
      const user = await send<ManagedUser>("POST", "/admin/users", form);
      setUsers((list) => [...list, { ...user, listingCount: 0 }]);
      setForm({ name: "", email: "", password: "" });
      setNotice(`${user.name} can now sign in at /admin with that email and password. Share the password with them privately.`);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setFields(err.fields ?? {});
      } else setError("Could not create the user.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (u: ManagedUser) => {
    if (!window.confirm(`Delete ${u.name}? They will be signed out and lose access. Their ${u.listingCount} listing(s) stay on the website.`)) return;
    setError("");
    setNotice("");
    try {
      await send("DELETE", `/admin/users/${u.id}`);
      setUsers((list) => list.filter((x) => x.id !== u.id));
      setNotice(`${u.name} was removed.`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete the user.");
    }
  };

  const reset = async (e: FormEvent, u: ManagedUser) => {
    e.preventDefault();
    setResetError("");
    try {
      await send("PUT", `/admin/users/${u.id}/password`, { newPassword });
      setResetFor(null);
      setNewPassword("");
      setNotice(`Password reset for ${u.name}. Share the new password with them privately.`);
    } catch (err) {
      setResetError(err instanceof ApiError ? err.message : "Could not reset the password.");
    }
  };

  return (
    <>
      <PageHeader title="Users" subtitle="Uploaders can publish houses and edit or delete the ones they created. Only you can manage users." />
      {notice && <Notice kind="success">{notice}</Notice>}
      {error && <Notice kind="error">{error}</Notice>}

      <form onSubmit={create} noValidate className={`${cardCls} p-5 md:p-6 mb-8 grid gap-4 md:grid-cols-3`} aria-labelledby="new-user">
        <h2 id="new-user" className="md:col-span-3 font-serif text-xl font-bold text-brand-ink">Create an uploader</h2>
        <Field id="u-name" label="Full name" error={fields.name}>
          <input {...a11y("u-name", fields.name)} type="text" autoComplete="off" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
        </Field>
        <Field id="u-email" label="Email" error={fields.email}>
          <input {...a11y("u-email", fields.email)} type="email" autoComplete="off" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
        </Field>
        <Field id="u-password" label="Temporary password" error={fields.password} hint="At least 10 characters. They can change it on their Account page.">
          <input {...a11y("u-password", fields.password)} type="text" autoComplete="off" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputCls} />
        </Field>
        <div className="md:col-span-3">
          <button type="submit" disabled={busy} className={btnPrimary}>{busy ? "Creating…" : "Create user"}</button>
        </div>
      </form>

      {status === "loading" && <p className="text-brand-muted" role="status">Loading users…</p>}
      {status === "ready" && (
        <ul className="space-y-3">
          {users.map((u) => (
            <li key={u.id} className={`${cardCls} p-4`}>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[200px]">
                  <p className="font-bold text-brand-ink">
                    {u.name}{" "}
                    <span className={`ml-1 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-xl ${u.role === "admin" ? "bg-brand-navy text-white" : "bg-brand-tint2 text-brand-nav"}`}>
                      {u.role === "admin" ? "Admin" : "Uploader"}
                    </span>
                  </p>
                  <p className="text-[13px] text-brand-nav">{u.email}</p>
                  <p className="text-[12px] text-brand-muted">
                    Added {formatDate(u.createdAt)} · {u.listingCount} {u.listingCount === 1 ? "listing" : "listings"}
                  </p>
                </div>
                {u.role !== "admin" && (
                  <div className="flex gap-2">
                    <button type="button" onClick={() => { setResetFor(resetFor === u.id ? null : u.id); setNewPassword(""); setResetError(""); }} className={btnSecondary} aria-expanded={resetFor === u.id}>
                      Reset password
                    </button>
                    <button type="button" onClick={() => void remove(u)} className={btnDanger} aria-label={`Delete ${u.name}`}>
                      <span className="material-symbols-outlined text-[18px]" aria-hidden="true">delete</span>
                      Delete
                    </button>
                  </div>
                )}
              </div>
              {resetFor === u.id && (
                <form onSubmit={(e) => void reset(e, u)} noValidate className="mt-4 flex flex-wrap items-start gap-3">
                  <Field id={`reset-${u.id}`} label="New password" error={resetError} className="flex-1 min-w-[220px]">
                    <input {...a11y(`reset-${u.id}`, resetError)} type="text" autoComplete="off" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputCls} />
                  </Field>
                  <button type="submit" className={`${btnPrimary} mt-[26px]`}>Save password</button>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
