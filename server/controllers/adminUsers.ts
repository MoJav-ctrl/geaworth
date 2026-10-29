import type { Request, Response } from "express";
import { failure, success, validationFailure } from "../lib/respond.ts";
import { hashPassword } from "../lib/passwords.ts";
import { findUserByEmail, newUserId, publicUser, readUsers, writeUsers } from "../lib/users.ts";
import { readListings } from "../lib/store.ts";
import { createUserSchema, resetPasswordSchema } from "../validators/index.ts";

export function listUsers(_req: Request, res: Response) {
  const listings = readListings();
  const users = readUsers().map((u) => ({
    ...publicUser(u),
    listingCount: listings.filter((l) => l.createdBy === u.id).length,
  }));
  return success(res, users);
}

/** Admins can create uploader accounts (upload / edit / delete their own listings). */
export async function createUser(req: Request, res: Response) {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) return validationFailure(res, parsed.error.issues, "Invalid user details");
  const { name, email, password } = parsed.data;

  if (findUserByEmail(email)) {
    return failure(res, 409, "A user with that email already exists.", { email: "A user with that email already exists." });
  }
  const user = {
    id: newUserId(),
    email,
    name,
    role: "uploader" as const,
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString(),
    createdBy: req.user!.id,
  };
  writeUsers([...readUsers(), user]);
  return success(res, publicUser(user), "User created.", 201);
}

export function deleteUser(req: Request, res: Response) {
  const id = String(req.params.id);
  if (id === req.user!.id) return failure(res, 400, "You cannot delete your own account.");
  const users = readUsers();
  const target = users.find((u) => u.id === id);
  if (!target) return failure(res, 404, "User not found.");
  if (target.role === "admin") return failure(res, 400, "Administrator accounts cannot be deleted here.");
  writeUsers(users.filter((u) => u.id !== id));
  return success(res, null, "User deleted. Their listings stay on the site.");
}

export async function resetUserPassword(req: Request, res: Response) {
  const id = String(req.params.id);
  const parsed = resetPasswordSchema.safeParse(req.body);
  if (!parsed.success) return validationFailure(res, parsed.error.issues, "Invalid password");
  const users = readUsers();
  const target = users.find((u) => u.id === id);
  if (!target) return failure(res, 404, "User not found.");
  if (target.role === "admin") return failure(res, 400, "Use the Account page to change an administrator password.");
  const passwordHash = await hashPassword(parsed.data.newPassword);
  writeUsers(users.map((u) => (u.id === id ? { ...u, passwordHash } : u)));
  return success(res, null, "Password reset. They have been signed out everywhere.");
}
