import test from "node:test";
import assert from "node:assert/strict";
import { hashPassword, verifyPassword } from "./passwords.ts";

test("hashPassword produces salted hashes that verify only the right password", async () => {
  const a = await hashPassword("correct horse battery");
  const b = await hashPassword("correct horse battery");
  assert.notEqual(a, b, "same password must not give the same hash");
  assert.ok(a.startsWith("scrypt:"));
  assert.equal(await verifyPassword("correct horse battery", a), true);
  assert.equal(await verifyPassword("wrong password!!", a), false);
});

test("verifyPassword rejects malformed stored values", async () => {
  assert.equal(await verifyPassword("x", ""), false);
  assert.equal(await verifyPassword("x", "plain:abc:def"), false);
  assert.equal(await verifyPassword("x", "scrypt:zz"), false);
});
