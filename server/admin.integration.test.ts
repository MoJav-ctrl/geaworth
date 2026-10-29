/**
 * Drives the real controllers + middleware with fake req/res objects (no HTTP server needed):
 * sign-in, sessions, roles, uploader ownership, photo cleanup, session invalidation.
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";

const storage = fs.mkdtempSync(path.join(os.tmpdir(), "gw-int-"));
process.env.STORAGE_DIR = storage;
process.env.SESSION_SECRET = "integration-secret-integration-secret-123456";
process.env.ADMIN_EMAIL = "boss@example.com";
process.env.ADMIN_PASSWORD = "boss-password-123";

const { ensureAdminUser } = await import("./lib/users.ts");
const { login, me, changePassword } = await import("./controllers/auth.ts");
const { createUser, deleteUser, resetUserPassword } = await import("./controllers/adminUsers.ts");
const L = await import("./controllers/adminListings.ts");
const { listListings } = await import("./controllers/listings.ts");
const { requireAuth, requireAdmin, sameOrigin } = await import("./middleware/auth.ts");

/* ---------- fakes ---------- */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;
function res(): Any {
  const r: Any = { statusCode: 200, body: undefined, cookies: {} as Record<string, string> };
  r.status = (c: number) => ((r.statusCode = c), r);
  r.json = (b: unknown) => ((r.body = b), r);
  r.cookie = (n: string, v: string) => void (r.cookies[n] = v);
  r.clearCookie = () => void 0;
  return r;
}
function req(over: Any = {}): Any {
  const headers: Record<string, string> = over.headers ?? {};
  return { method: "GET", params: {}, body: {}, secure: false, headers, get: (h: string) => headers[h.toLowerCase()], ...over };
}
/** Runs a middleware; resolves to the response, or "next" if it passed. */
function run(mw: Any, r: Any): { out: "next" | Any; res: Any } {
  const s = res();
  let passed = false;
  mw(r, s, () => (passed = true));
  return { out: passed ? "next" : s, res: s };
}
async function signIn(email: string, password: string) {
  const s = res();
  await login(req({ method: "POST", body: { email, password } }), s);
  return s;
}
const cookieOf = (s: Any) => ({ cookie: `gw_session=${s.cookies.gw_session}` });
async function authed(email: string, password: string): Promise<Any> {
  const s = await signIn(email, password);
  assert.equal(s.statusCode, 200, JSON.stringify(s.body));
  return cookieOf(s);
}
const asUser = (headers: Any, extra: Any = {}) => {
  const r = req({ headers, ...extra });
  const gate = run(requireAuth, r);
  assert.equal(gate.out, "next", `requireAuth rejected: ${JSON.stringify(gate.res.body)}`);
  return r;
};

const photo = async () => sharp({ create: { width: 800, height: 600, channels: 3, background: "#336699" } }).png().toBuffer();
const listingData = (over: Any = {}, order = ["new:0"]) =>
  JSON.stringify({
    title: "Test Duplex in Ikoyi", category: "sale", type: "duplex", typeName: "Detached Duplex", area: "ikoyi", areaName: "Ikoyi",
    subMarket: "Island Corridors", address: "1 Test Road, Ikoyi", price: 500000000, period: null, beds: 4, baths: 4, sqm: 300,
    titleBadge: "", featured: false, features: ["Pool"], description: "A lovely test home with plenty of room.", imageOrder: order, ...over,
  });
const mediaFiles = () => (fs.existsSync(path.join(storage, "media/listings")) ? fs.readdirSync(path.join(storage, "media/listings")) : []);

/* ---------- tests ---------- */
await ensureAdminUser();
let admin: Any, ada: Any, bob: Any;
let adaListingId = "";

test("sign-in: wrong password and unknown email get the same 401; right one sets a session", async () => {
  const bad = await signIn("boss@example.com", "nope-nope-nope");
  const unknown = await signIn("nobody@example.com", "nope-nope-nope");
  assert.equal(bad.statusCode, 401);
  assert.equal(unknown.statusCode, 401);
  assert.equal(bad.body.error, unknown.body.error);
  admin = await authed("boss@example.com", "boss-password-123");
  const r = asUser(admin);
  const out = res();
  me(r, out);
  assert.equal(out.body.data.role, "admin");
  assert.equal(out.body.data.passwordHash, undefined, "never expose the hash");
});

test("requireAuth rejects missing and tampered cookies", () => {
  assert.equal(run(requireAuth, req()).res.statusCode, 401);
  const tampered = { cookie: admin.cookie.slice(0, -3) + "abc" };
  assert.equal(run(requireAuth, req({ headers: tampered })).res.statusCode, 401);
});

test("sameOrigin blocks cross-site writes but allows same-site, no-Origin and GET", () => {
  const post = (origin?: string) => run(sameOrigin, req({ method: "POST", headers: { host: "site.test", ...(origin ? { origin } : {}) } }));
  assert.equal(post("https://evil.example").res.statusCode, 403);
  assert.equal(post("http://site.test").out, "next");
  assert.equal(post().out, "next");
  assert.equal(run(sameOrigin, req({ method: "GET", headers: { host: "site.test", origin: "https://evil.example" } })).out, "next");
});

test("admin creates uploaders; duplicates rejected; uploaders cannot reach admin routes", async () => {
  for (const [name, email] of [["Ada", "ada@example.com"], ["Bob", "bob@example.com"]]) {
    const s = res();
    await createUser(asUser(admin, { method: "POST", body: { name, email, password: "uploader-pass-1" } }), s);
    assert.equal(s.statusCode, 201, JSON.stringify(s.body));
    assert.equal(s.body.data.role, "uploader");
  }
  const dup = res();
  await createUser(asUser(admin, { method: "POST", body: { name: "Ada 2", email: "ADA@example.com", password: "uploader-pass-1" } }), dup);
  assert.equal(dup.statusCode, 409);

  ada = await authed("ada@example.com", "uploader-pass-1");
  bob = await authed("bob@example.com", "uploader-pass-1");
  assert.equal(run(requireAdmin, asUser(ada)).res.statusCode, 403);
  assert.equal(run(requireAdmin, asUser(admin)).out, "next");
});

test("uploader publishes a listing: live immediately, first on the public list, owner hidden", async () => {
  const s = res();
  await L.createListing(asUser(ada, { method: "POST", body: { data: listingData() }, files: [{ buffer: await photo() }] }), s);
  assert.equal(s.statusCode, 201, JSON.stringify(s.body));
  adaListingId = s.body.data.id;
  assert.equal(mediaFiles().length, 1);

  const pub = res();
  listListings(req({ query: {} }), pub);
  assert.equal(pub.body.data[0].id, adaListingId, "newest listing first");
  assert.equal(pub.body.data[0].createdBy, undefined);
  assert.equal(pub.body.data[0].titleBadge, "Verified Title", "empty badge falls back to default");
  assert.ok(pub.body.data[0].images[0].startsWith("/media/listings/"));
  assert.equal(pub.body.count, 10);
});

test("publishing needs a photo and a valid image", async () => {
  const none = res();
  await L.createListing(asUser(ada, { method: "POST", body: { data: listingData() }, files: [] }), none);
  assert.equal(none.statusCode, 400);
  const junk = res();
  await L.createListing(asUser(ada, { method: "POST", body: { data: listingData() }, files: [{ buffer: Buffer.from("<script>alert(1)</script>") }] }), junk);
  assert.equal(junk.statusCode, 400);
  const bad = res();
  await L.createListing(asUser(ada, { method: "POST", body: { data: listingData({ price: 0 }) }, files: [{ buffer: await photo() }] }), bad);
  assert.equal(bad.statusCode, 400);
  assert.ok(bad.body.fields.price);
  assert.equal(mediaFiles().length, 1, "failed uploads leave no orphan files");
});

test("uploaders can only edit/delete their own listings; seed listings are admin-only", async () => {
  const forB = res();
  await L.updateListing(asUser(bob, { method: "PUT", params: { id: adaListingId }, body: { data: listingData({}, []) }, files: [] }), forB);
  assert.equal(forB.statusCode, 403);
  const delB = res();
  L.deleteListing(asUser(bob, { method: "DELETE", params: { id: adaListingId } }), delB);
  assert.equal(delB.statusCode, 403);
  const seedEdit = res();
  L.deleteListing(asUser(ada, { method: "DELETE", params: { id: "gw-01" } }), seedEdit);
  assert.equal(seedEdit.statusCode, 403);

  // Bob only sees his own (none); Ada sees hers; admin sees everything
  const list = (u: Any) => { const s = res(); L.listAdminListings(asUser(u), s); return s.body.data as Any[]; };
  assert.equal(list(bob).length, 0);
  assert.equal(list(ada).length, 1);
  assert.equal(list(admin).length, 10);
});

test("owner edits: new photo becomes cover, removed photo file is deleted", async () => {
  const before = mediaFiles();
  const s = res();
  await L.updateListing(
    asUser(ada, { method: "PUT", params: { id: adaListingId }, body: { data: listingData({ title: "Renamed Duplex", price: 600000000 }, ["new:0"]) }, files: [{ buffer: await photo() }] }),
    s,
  );
  assert.equal(s.statusCode, 200, JSON.stringify(s.body));
  assert.equal(s.body.data.title, "Renamed Duplex");
  assert.equal(s.body.data.images.length, 1);
  const after = mediaFiles();
  assert.equal(after.length, 1);
  assert.notDeepEqual(after, before, "old photo replaced");

  const none = res();
  await L.updateListing(asUser(ada, { method: "PUT", params: { id: adaListingId }, body: { data: listingData({}, []) }, files: [] }), none);
  assert.equal(none.statusCode, 400, "cannot remove every photo");
});

test("admin can edit any listing, including a seed one, keeping its existing photos", async () => {
  const seed = (() => { const s = res(); L.getAdminListing(asUser(admin, { params: { id: "gw-01" } }), s); return s.body.data; })();
  const s = res();
  await L.updateListing(asUser(admin, { method: "PUT", params: { id: "gw-01" }, body: { data: listingData({ title: "Seed edited by admin", area: seed.area, areaName: seed.areaName }, seed.images) }, files: [] }), s);
  assert.equal(s.statusCode, 200, JSON.stringify(s.body));
  assert.deepEqual(s.body.data.images, seed.images);
});

test("deleting a listing removes its uploaded photos", () => {
  const s = res();
  L.deleteListing(asUser(ada, { method: "DELETE", params: { id: adaListingId } }), s);
  assert.equal(s.statusCode, 200);
  assert.equal(mediaFiles().length, 0);
  const pub = res();
  listListings(req({ query: {} }), pub);
  assert.equal(pub.body.count, 9);
});

test("changing or resetting a password signs that user out; deleting a user does too", async () => {
  // admin resets Bob's password -> Bob's old cookie dies
  const users = res();
  const bobId = (await import("./lib/users.ts")).findUserByEmail("bob@example.com")!.id;
  const adaId = (await import("./lib/users.ts")).findUserByEmail("ada@example.com")!.id;
  await resetUserPassword(asUser(admin, { method: "PUT", params: { id: bobId }, body: { newPassword: "brand-new-password" } }), users);
  assert.equal(users.statusCode, 200);
  assert.equal(run(requireAuth, req({ headers: bob })).res.statusCode, 401);
  assert.equal((await signIn("bob@example.com", "brand-new-password")).statusCode, 200);

  // Ada changes her own password: old cookie dies, response issues a fresh one
  const c = res();
  await changePassword(asUser(ada, { method: "POST", body: { currentPassword: "uploader-pass-1", newPassword: "ada-new-password-9" } }), c);
  assert.equal(c.statusCode, 200);
  assert.equal(run(requireAuth, req({ headers: ada })).res.statusCode, 401);
  assert.equal(run(requireAuth, req({ headers: cookieOf(c) })).out, "next");

  // wrong current password is refused
  const w = res();
  await changePassword(asUser(cookieOf(c), { method: "POST", body: { currentPassword: "wrong-password-x", newPassword: "ada-new-password-10" } }), w);
  assert.equal(w.statusCode, 400);

  // admin deletes Ada -> her fresh cookie dies; admin cannot delete self
  const d = res();
  deleteUser(asUser(admin, { method: "DELETE", params: { id: adaId } }), d);
  assert.equal(d.statusCode, 200);
  assert.equal(run(requireAuth, req({ headers: cookieOf(c) })).res.statusCode, 401);
  const self = res();
  deleteUser(asUser(admin, { method: "DELETE", params: { id: (await import("./lib/users.ts")).findUserByEmail("boss@example.com")!.id } }), self);
  assert.equal(self.statusCode, 400);
});
