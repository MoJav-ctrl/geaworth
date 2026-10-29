/**
 * Account recovery: sets a user's password, or creates an admin if the email is new.
 *   npm run admin:password -- you@example.com "a-long-new-password"
 * Docker: docker compose exec web node_modules/.bin/tsx server/scripts/set-password.ts you@example.com "new-password"
 */
import "dotenv/config";
import { hashPassword } from "../lib/passwords.ts";
import { findUserByEmail, newUserId, readUsers, writeUsers } from "../lib/users.ts";

const [email, password] = process.argv.slice(2);
if (!email || !password || password.length < 10 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('Usage: set-password <email> <password of at least 10 characters>');
  process.exit(1);
}
const passwordHash = await hashPassword(password);
const existing = findUserByEmail(email);
if (existing) {
  writeUsers(readUsers().map((u) => (u.id === existing.id ? { ...u, passwordHash } : u)));
  console.log(`Password updated for ${existing.email} (${existing.role}).`);
} else {
  writeUsers([
    ...readUsers(),
    { id: newUserId(), email: email.toLowerCase(), name: "Administrator", role: "admin", passwordHash, createdAt: new Date().toISOString() },
  ]);
  console.log(`Created admin account for ${email.toLowerCase()}.`);
}
