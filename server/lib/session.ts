import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { Request, Response } from "express";
import { SESSION_SECRET_FILE } from "./paths.ts";

export const SESSION_COOKIE = "gw_session";
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

let secret: string | null = null;

/** SESSION_SECRET from the environment, else a random secret generated once and kept in STORAGE_DIR. */
function getSecret(): string {
  if (secret) return secret;
  const fromEnv = process.env.SESSION_SECRET;
  if (fromEnv && fromEnv.length >= 32) return (secret = fromEnv);
  try {
    secret = fs.readFileSync(SESSION_SECRET_FILE, "utf-8").trim();
    if (secret.length >= 32) return secret;
  } catch {
    /* generate below */
  }
  secret = crypto.randomBytes(48).toString("hex");
  fs.mkdirSync(path.dirname(SESSION_SECRET_FILE), { recursive: true });
  fs.writeFileSync(SESSION_SECRET_FILE, secret, { mode: 0o600 });
  return secret;
}

const mac = (data: string) => crypto.createHmac("sha256", getSecret()).update(data).digest("base64url");

/**
 * Binds a session to the current password hash, so changing or resetting a password
 * signs that user out everywhere. Only an HMAC of the hash is ever placed in the token.
 */
export function passwordStamp(passwordHash: string): string {
  return mac(`pw:${passwordHash}`).slice(0, 16);
}

export interface SessionPayload {
  uid: string;
  pv: string;
  exp: number;
}

export function signToken(payload: SessionPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${mac(body)}`;
}

export function verifyToken(token: string, now = Date.now()): SessionPayload | null {
  const [body, sig, extra] = token.split(".");
  if (!body || !sig || extra !== undefined) return null;
  const expected = Buffer.from(mac(body));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf-8")) as SessionPayload;
    if (typeof payload.uid !== "string" || typeof payload.pv !== "string" || typeof payload.exp !== "number") return null;
    return payload.exp > now ? payload : null;
  } catch {
    return null;
  }
}

function readCookie(req: Request, name: string): string | null {
  for (const part of (req.headers.cookie ?? "").split(";")) {
    const i = part.indexOf("=");
    if (i > 0 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return null;
}

export function readSession(req: Request): SessionPayload | null {
  const token = readCookie(req, SESSION_COOKIE);
  return token ? verifyToken(token) : null;
}

const isHttps = (req: Request) => req.secure || (process.env.SITE_URL ?? "").startsWith("https://");

export function issueSession(req: Request, res: Response, user: { id: string; passwordHash: string }): void {
  const token = signToken({ uid: user.id, pv: passwordStamp(user.passwordHash), exp: Date.now() + TTL_MS });
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: isHttps(req),
    path: "/",
    maxAge: TTL_MS,
  });
}

export function clearSession(req: Request, res: Response): void {
  res.clearCookie(SESSION_COOKIE, { httpOnly: true, sameSite: "strict", secure: isHttps(req), path: "/" });
}
