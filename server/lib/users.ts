import crypto from "node:crypto";
import { USERS_FILE } from "./paths.ts";
import { readJson, writeJsonAtomic } from "./jsonFile.ts";
import { hashPassword } from "./passwords.ts";

export type Role = "admin" | "uploader";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  passwordHash: string;
  createdAt: string;
  createdBy?: string;
}

export type PublicUser = Omit<User, "passwordHash">;

export const publicUser = ({ passwordHash: _hash, ...rest }: User): PublicUser => rest;

export const readUsers = (): User[] => readJson<User[]>(USERS_FILE, () => []);
export const writeUsers = (users: User[]): void => writeJsonAtomic(USERS_FILE, users);

export const findUserByEmail = (email: string) =>
  readUsers().find((u) => u.email.toLowerCase() === email.trim().toLowerCase());

export const findUserById = (id: string) => readUsers().find((u) => u.id === id);

export const newUserId = () => `usr-${crypto.randomBytes(6).toString("hex")}`;

/** First boot: create the admin account from ADMIN_EMAIL / ADMIN_PASSWORD if no users exist yet. */
export async function ensureAdminUser(): Promise<void> {
  if (readUsers().length > 0) return;
  const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.warn(
      "[admin] No users exist yet. Set ADMIN_EMAIL and ADMIN_PASSWORD in .env and restart to create the first admin account.",
    );
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ADMIN_EMAIL) || ADMIN_PASSWORD.length < 10) {
    console.warn("[admin] ADMIN_EMAIL must be a valid email and ADMIN_PASSWORD at least 10 characters. Admin not created.");
    return;
  }
  writeUsers([
    {
      id: newUserId(),
      email: ADMIN_EMAIL.trim().toLowerCase(),
      name: ADMIN_NAME?.trim() || "Administrator",
      role: "admin",
      passwordHash: await hashPassword(ADMIN_PASSWORD),
      createdAt: new Date().toISOString(),
    },
  ]);
  console.log(`[admin] Created admin account for ${ADMIN_EMAIL.trim().toLowerCase()}. You can remove ADMIN_PASSWORD from .env now.`);
}
