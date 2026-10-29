import { useState, type FormEvent } from "react";
import { useAuth } from "./AuthContext.tsx";
import { ApiError, send } from "./api.ts";
import { Field, Notice, PageHeader, a11y, btnPrimary, cardCls, inputCls } from "./ui.tsx";

export function AccountPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "" });
  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setFields({});
    setDone(false);
    try {
      await send("POST", "/auth/password", form);
      setForm({ currentPassword: "", newPassword: "" });
      setDone(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setFields(err.fields ?? {});
      } else setError("Could not change the password.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Account" subtitle={user ? `${user.name} · ${user.email}` : undefined} />
      {done && <Notice kind="success">Password updated. Other devices have been signed out.</Notice>}
      {error && <Notice kind="error">{error}</Notice>}
      <form onSubmit={submit} noValidate className={`${cardCls} p-5 md:p-6 max-w-md space-y-4`} aria-labelledby="pw-title">
        <h2 id="pw-title" className="font-serif text-xl font-bold text-brand-ink">Change password</h2>
        <Field id="pw-current" label="Current password" error={fields.currentPassword}>
          <input {...a11y("pw-current", fields.currentPassword)} type="password" autoComplete="current-password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} className={inputCls} />
        </Field>
        <Field id="pw-new" label="New password" error={fields.newPassword} hint="At least 10 characters.">
          <input {...a11y("pw-new", fields.newPassword)} type="password" autoComplete="new-password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} className={inputCls} />
        </Field>
        <button type="submit" disabled={busy} className={btnPrimary}>{busy ? "Saving…" : "Update password"}</button>
      </form>
    </>
  );
}
