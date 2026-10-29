import { Router } from "express";
import rateLimit from "express-rate-limit";
import { health } from "../controllers/health.ts";
import { getListing, listListings } from "../controllers/listings.ts";
import { createInquiry } from "../controllers/inquiries.ts";
import { createValuation, parseUploads } from "../controllers/valuations.ts";
import { subscribe } from "../controllers/subscribe.ts";
import { downloadLagosQ3 } from "../controllers/reports.ts";
import { changePassword, login, logout, me } from "../controllers/auth.ts";
import {
  createListing,
  deleteListing,
  getAdminListing,
  listAdminListings,
  parseImages,
  updateListing,
} from "../controllers/adminListings.ts";
import { createUser, deleteUser, listUsers, resetUserPassword } from "../controllers/adminUsers.ts";
import { getSubmissions } from "../controllers/adminSubmissions.ts";
import { requireAdmin, requireAuth, sameOrigin } from "../middleware/auth.ts";
import { asyncHandler } from "../lib/asyncHandler.ts";

/** Stricter limiter for anything that writes data. */
const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: "Too many submissions from this connection. Please try again in a few minutes." },
});

/** Brute-force guard for sign-in: 10 failed attempts per 15 minutes per IP. */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: "Too many sign-in attempts. Please try again in 15 minutes." },
});

export const api = Router();

api.get("/health", health);
api.get("/listings", listListings);
api.get("/listings/:id", getListing);
api.get("/reports/lagos-q3", downloadLagosQ3);

api.post("/inquiries", writeLimiter, createInquiry);
api.post("/subscribe", writeLimiter, subscribe);
api.post("/valuations", writeLimiter, parseUploads, createValuation);

// ---- Admin area: sign-in + role-based content management ----
api.post("/auth/login", sameOrigin, loginLimiter, asyncHandler(login));
api.post("/auth/logout", sameOrigin, logout);
api.get("/auth/me", requireAuth, me);
api.post("/auth/password", sameOrigin, requireAuth, asyncHandler(changePassword));

const admin = Router();
admin.use(sameOrigin, requireAuth);
// Admins and uploaders (uploaders are limited to their own listings inside the controllers)
admin.get("/listings", listAdminListings);
admin.get("/listings/:id", getAdminListing);
admin.post("/listings", parseImages, asyncHandler(createListing));
admin.put("/listings/:id", parseImages, asyncHandler(updateListing));
admin.delete("/listings/:id", deleteListing);
// Admin only
admin.get("/users", requireAdmin, listUsers);
admin.post("/users", requireAdmin, asyncHandler(createUser));
admin.delete("/users/:id", requireAdmin, deleteUser);
admin.put("/users/:id/password", requireAdmin, asyncHandler(resetUserPassword));
admin.get("/submissions", requireAdmin, getSubmissions);
api.use("/admin", admin);

// Unknown API routes get JSON, not the SPA shell.
api.use((_req, res) => {
  res.status(404).json({ ok: false, error: "Not found" });
});
