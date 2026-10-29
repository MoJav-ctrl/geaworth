import type { Request, Response } from "express";
import { failure, success, validationFailure } from "../lib/respond.ts";
import { hashPassword, verifyPassword } from "../lib/passwords.ts";
import { clearSession, issueSession } from "../lib/session.ts";
import { findUserByEmail, publicUser, readUsers, writeUsers } from "../lib/users.ts";
import { changePasswordSchema, loginSchema } from "../validators/index.ts";

// Verified against when the email is unknown, so response time does not reveal which emails exist.
let dummyHash: Promise<string> | null = null;

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return validationFailure(res, parsed.error.issues, "Invalid sign-in details");
  const { email, password } = parsed.data;

  const user = findUserByEmail(email);
  let ok = false;
  if (user) {
    ok = await verifyPassword(password, user.passwordHash);
  } else {
    dummyHash ??= hashPassword("not-a-real-password");
    await verifyPassword(password, await dummyHash);
  }
  if (!user || !ok) return failure(res, 401, "Incorrect email or password.");

  issueSession(req, res, user);
  return success(res, publicUser(user));
}

export function logout(req: Request, res: Response) {
  clearSession(req, res);
  return success(res, null);
}

export function me(req: Request, res: Response) {
  return success(res, publicUser(req.user!));
}

export async function changePassword(req: Request, res: Response) {
  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success) return validationFailure(res, parsed.error.issues, "Invalid password details");
  const user = req.user!;
  if (!(await verifyPassword(parsed.data.currentPassword, user.passwordHash))) {
    return failure(res, 400, "Your current password is incorrect.", { currentPassword: "Your current password is incorrect." });
  }
  const passwordHash = await hashPassword(parsed.data.newPassword);
  writeUsers(readUsers().map((u) => (u.id === user.id ? { ...u, passwordHash } : u)));
  // The password stamp changed, so every older session is now invalid. Keep this one signed in.
  issueSession(req, res, { id: user.id, passwordHash });
  return success(res, null, "Password updated.");
}
