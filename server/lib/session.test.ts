import test from "node:test";
import assert from "node:assert/strict";
import { passwordStamp, signToken, verifyToken } from "./session.ts";

process.env.SESSION_SECRET = "test-secret-test-secret-test-secret-1234";

test("signed tokens round-trip and expire", () => {
  const token = signToken({ uid: "u1", pv: passwordStamp("hash-a"), exp: Date.now() + 60_000 });
  assert.equal(verifyToken(token)?.uid, "u1");
  assert.equal(verifyToken(token, Date.now() + 120_000), null, "expired token must be rejected");
});

test("tampered or malformed tokens are rejected", () => {
  const token = signToken({ uid: "u1", pv: "x", exp: Date.now() + 60_000 });
  const [body, sig] = token.split(".");
  const forged = Buffer.from(JSON.stringify({ uid: "admin", pv: "x", exp: Date.now() + 60_000 })).toString("base64url");
  assert.equal(verifyToken(`${forged}.${sig}`), null);
  assert.equal(verifyToken(`${body}.${sig}x`), null);
  assert.equal(verifyToken(`${body}`), null);
  assert.equal(verifyToken(`${body}.${sig}.extra`), null);
  assert.equal(verifyToken(""), null);
});

test("password stamp changes when the password hash changes", () => {
  assert.notEqual(passwordStamp("hash-a"), passwordStamp("hash-b"));
  assert.equal(passwordStamp("hash-a"), passwordStamp("hash-a"));
});
