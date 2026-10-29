import type { PropertyListing } from "../data/listings.ts";

export type Role = "admin" | "uploader";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
}

export interface ManagedUser extends AdminUser {
  listingCount: number;
}

export interface AdminListing extends PropertyListing {
  canEdit: boolean;
  createdBy?: string;
  createdByName?: string;
}

export interface Submissions {
  inquiries: Record<string, unknown>[];
  valuations: Record<string, unknown>[];
  subscribers: { email: string; subscribedAt: string }[];
}

export class ApiError extends Error {
  status: number;
  fields?: Record<string, string>;
  constructor(message: string, status: number, fields?: Record<string, string>) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

/** Fired when a request that needs sign-in comes back 401 (e.g. session expired), so the app can show the login page. */
export const UNAUTHORIZED_EVENT = "gw:unauthorized";

async function request<T>(path: string, init: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api${path}`, { credentials: "same-origin", ...init });
  } catch {
    throw new ApiError("Network error. Check your connection and try again.", 0);
  }
  let json: { ok?: boolean; data?: unknown; error?: string; fields?: Record<string, string> } | null = null;
  try {
    json = await res.json();
  } catch {
    /* non-JSON response */
  }
  if (!res.ok || !json?.ok) {
    if (res.status === 401 && !path.startsWith("/auth/")) window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    throw new ApiError(json?.error ?? "Something went wrong. Please try again.", res.status, json?.fields);
  }
  return json.data as T;
}

export const get = <T>(path: string) => request<T>(path, {});

export const send = <T>(method: "POST" | "PUT" | "DELETE", path: string, payload?: unknown) =>
  request<T>(path, {
    method,
    ...(payload === undefined ? {} : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }),
  });

export const sendForm = <T>(method: "POST" | "PUT", path: string, form: FormData) => request<T>(path, { method, body: form });

export const formatDate = (iso?: unknown) => {
  const d = new Date(String(iso ?? ""));
  return Number.isNaN(d.getTime()) ? "–" : d.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
};
