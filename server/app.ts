import express, { type ErrorRequestHandler } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { api } from "./routes/index.ts";
import { MEDIA_ROOT } from "./lib/paths.ts";

export function createApp() {
  const app = express();
  const isProduction = process.env.NODE_ENV === "production";
  const httpsSite = (process.env.SITE_URL ?? "").startsWith("https://");

  if (process.env.TRUST_PROXY) app.set("trust proxy", Number(process.env.TRUST_PROXY) || 1);

  app.use(
    helmet({
      // Strict CSP in production. In dev, Vite injects inline HMR scripts, so CSP is off.
      contentSecurityPolicy: isProduction
        ? {
            useDefaults: false,
            directives: {
              "default-src": ["'self'"],
              "script-src": ["'self'"],
              "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
              "font-src": ["'self'", "https://fonts.gstatic.com", "data:"],
              "img-src": ["'self'", "data:", "blob:", "https://images.unsplash.com"],
              "frame-src": ["https://www.google.com", "https://maps.google.com"],
              "connect-src": ["'self'"],
              "object-src": ["'none'"],
              "base-uri": ["'self'"],
              "form-action": ["'self'"],
              "frame-ancestors": ["'self'"],
              ...(httpsSite ? { "upgrade-insecure-requests": [] } : {}),
            },
          }
        : false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  const extraOrigins = (process.env.CORS_ORIGINS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  app.use(
    cors({
      origin: (origin, cb) => cb(null, !origin || extraOrigins.includes(origin) || !isProduction),
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: "100kb" }));
  app.use(express.urlencoded({ extended: true, limit: "100kb" }));

  // Resized listing photos uploaded through the admin area. File names are random, so they cache forever.
  app.use("/media", express.static(MEDIA_ROOT, { index: false, fallthrough: false, maxAge: "365d", immutable: true }));

  app.use("/api/auth", (_req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    next();
  });
  app.use("/api/admin", (_req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    next();
  });

  app.use(
    "/api",
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 300,
      standardHeaders: true,
      legacyHeaders: false,
      message: { ok: false, error: "Too many requests. Please try again in a few minutes." },
    }),
  );
  app.use("/api", api);

  // Last-resort JSON error handler (bad JSON bodies, etc.)
  const onError: ErrorRequestHandler = (err, _req, res, _next) => {
    const status = typeof err?.status === "number" ? err.status : 500;
    if (status >= 500) console.error(err);
    res.status(status).json({ ok: false, error: status >= 500 ? "Something went wrong on our side." : "Bad request." });
  };
  app.use(onError);

  return app;
}
