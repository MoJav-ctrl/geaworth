import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext.tsx";
import { ApiError } from "./api.ts";
import { Field, Notice, a11y, btnPrimary, cardCls, inputCls } from "./ui.tsx";

export function LoginPage() {
  const { user, ready, login } = useAuth();
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  if (ready && user) return <Navigate to={from && from.startsWith("/admin") ? from : "/admin"} replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setFields({});
    try {
      await login(email, password);
      navigate(from && from.startsWith("/admin") ? from : "/admin", { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setFields(err.fields ?? {});
      } else setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-brand-canvas flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <p className="font-serif text-3xl font-bold text-brand-ink text-center mb-1">
          Geaworth<span className="text-brand-red">.</span>
        </p>
        <p className="text-center text-[14px] text-brand-nav mb-6">Admin sign-in</p>
        <form onSubmit={submit} noValidate className={`${cardCls} p-6 space-y-4`}>
          {error && <Notice kind="error">{error}</Notice>}
          <Field id="login-email" label="Email" error={fields.email}>
            <input {...a11y("login-email", fields.email)} type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
          </Field>
          <Field id="login-password" label="Password" error={fields.password}>
            <input {...a11y("login-password", fields.password)} type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
          </Field>
          <button type="submit" disabled={busy} className={`${btnPrimary} w-full`}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
