# Geaworth Properties

Full-stack site for **Geaworth Properties Limited** (RC 1498320), a licensed, title-verified Lagos real-estate bureau.
React + Vite + Tailwind v4 client, Express API, file-based JSON persistence. No paid services required.

## Requirements
- Node.js **24 LTS** or newer (`.nvmrc` pins 24; `engines` enforces `>=24`). Use `nvm use`.

## Quick start
```bash
npm install               # first time only: commit the generated package-lock.json
cp .env.example .env      # then set ADMIN_EMAIL + ADMIN_PASSWORD to create your admin login
npm run dev               # http://localhost:3000  (API + Vite HMR together)  ·  admin: /admin
```

| Script | What it does |
|---|---|
| `npm run dev` | Express + Vite middleware with hot reload |
| `npm run build` | Production client build into `dist/` |
| `npm start` | Production server (sets `NODE_ENV=production`, serves `dist/` with SPA fallback, strict CSP) |
| `npm run lint` | Type-check client + server, then `scripts/check-tokens.mjs` (no hard-coded hex colours, all icons registered, every `<img>` has alt/width/height) |
| `npm test` | Node's built-in test runner (client utils + server validators) |
| `npm run admin:password -- <email> "<new password>"` | Account recovery: resets a password, or creates an admin if the email is new |
| `npm run icons:sync` | Regenerates `client/src/config/icons.ts` from the icons used in the source |
| `npm run images:download` | Downloads + resizes every photo locally (see *Images*) |

## Project layout
```
client/            React app
  src/components/  layout/ (Header, Footer, Layout, CTA band, WhatsApp float) · ui/ (cards, accordion, forms…)
  src/pages/       Home, Services, Sell, About, Contact, ListingDetail, Legal, NotFound (route-level code-split)
  src/admin/       /admin area: sign-in, listings, listing form, users, inquiries, account (lazy-loaded)
  src/hooks/       useSeo, useFocusTrap, useScrollReveal, useListings
  src/config/      site.ts (ALL contact data), seo.ts, icons.ts
  src/data/        images.json (photo registry), images.ts, listings.ts (types)
  public/          logo, robots.txt, (optional) images/
server/
  routes/ controllers/ validators/ lib/   Express API (zod on every POST, JSON envelope)
  seed/listings.json                      Starter listings, copied into STORAGE_DIR on first run
  data/ (or STORAGE_DIR)                  Runtime, git-ignored: listings.json, users.json, submissions.json,
                                          .session-secret, media/listings/ (uploaded photos), uploads/ (valuation files)
  assets/lagos-q3-report.pdf              Placeholder report served at /api/reports/lagos-q3
scripts/           check-tokens, sync-icons, download-images
```

## API
All responses: `{ ok: true, data, message? }` or `{ ok: false, error, fields? }` (`fields` = per-input messages).

- `GET /api/health`
- `GET /api/listings?category=&type=&area=&minPrice=&maxPrice=&q=` · `GET /api/listings/:id` (id or slug)
- `POST /api/inquiries` · `POST /api/subscribe` · `POST /api/valuations` (multipart, up to 5 files, 25 MB each; PNG/JPG/WEBP/PDF, checked by extension, MIME **and** file signature)
- `GET /api/reports/lagos-q3`

### Admin API (cookie session, JSON envelope)
- `POST /api/auth/login` · `POST /api/auth/logout` · `GET /api/auth/me` · `POST /api/auth/password`
- `GET|POST /api/admin/listings` · `GET|PUT|DELETE /api/admin/listings/:id` – multipart: `data` (JSON) + `images` (JPG/PNG/WEBP, up to 12, 10 MB each)
- `GET|POST /api/admin/users` · `DELETE /api/admin/users/:id` · `PUT /api/admin/users/:id/password` – admin only
- `GET /api/admin/submissions` – admin only (inquiries, valuation requests, subscribers)

| Role | Can do |
|---|---|
| `admin` | Everything: all listings, create/delete uploader users, reset their passwords, read inquiries |
| `uploader` | Publish listings (live immediately) and edit/delete **only the listings they created** |

Security: scrypt-hashed passwords, signed httpOnly `SameSite=Strict` session cookie (changing a password signs that user out everywhere),
sign-in limited to 10 failed attempts / 15 min / IP, Origin check on every write, photos re-encoded to WebP (strips EXIF, rejects non-images).

POST routes are rate-limited (20 / 15 min / IP), inputs are sanitised (HTML stripped), writes are atomic.

## Environment variables
See `.env.example`. `PORT`, `NODE_ENV`, `SITE_URL`, `CORS_ORIGINS`, `TRUST_PROXY` (set to `1` behind a reverse proxy),
`STORAGE_DIR` (where listings, users, photos, submissions and uploads are written; defaults to `server/data`), `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` (first admin, created only while no users exist), `SESSION_SECRET` (optional), `VITE_LOCAL_IMAGES`, and optional `SMTP_*` + `NOTIFICATION_EMAIL` (defaults to `info@geaworthproperties.com`; every form submission is emailed there) (nodemailer; silently skipped if `SMTP_HOST` is empty).

## Design tokens
Brand colours, fonts, type scale (fluid `clamp()` for hero/h2) and shadows live **only** in `client/src/index.css` (`@theme`).
Components use `bg-brand-red`, `text-brand-navy`, `border-brand-border`, … `npm run lint` fails on raw hex values.
`--color-brand-muted` is `#5B6270` (slightly darker than the brief's `#6B7280`) so secondary text meets WCAG AA on canvas/sand surfaces.

## Images
Every photo is referenced by key from `client/src/data/images.json`. By default they load from the Unsplash CDN with `srcset`/`sizes`
and `auto=format` (AVIF/WebP). To remove the external dependency: `npm run images:download`, set `VITE_LOCAL_IMAGES=true`, rebuild, and commit `client/public/images/`.
To swap a photo, change its entry in `images.json` or drop your own `<key>-<width>.webp/.avif` files in `client/public/images/`.

## Run with Docker (Windows / PowerShell)
```powershell
.\setup.ps1                 # checks Docker, creates .env, runs npm install + lint + tests (needs Node 24), builds, starts, waits until healthy
.\setup.ps1 -Port 8080 -Open
.\setup.ps1 -LocalImages    # bake photos into the image (no external image host)
.\setup.ps1 -SkipChecks     # skip the npm install + lint + tests step
.\setup.ps1 -Logs           # follow logs
.\setup.ps1 -Down           # stop (data kept)   |   -Down -Purge also deletes ALL saved data (listings, users, photos, inquiries)
```
Without PowerShell: `docker compose up -d --build`. `setup.ps1` asks for the admin email and generates a password for you. Listings, users, photos and submissions live in the `geaworth-data` volume (mounted at `/app/storage`, set by `STORAGE_DIR`) and survive rebuilds.

## Deploy
```bash
npm ci && npm run build        # needs package-lock.json: run `npm install` once and commit it
NODE_ENV=production PORT=3000 npm start      # or run under pm2 / systemd / a Docker node:24 image
```
Put it behind HTTPS (Nginx, Caddy, Render, Railway, Fly…) and set `SITE_URL=https://…` and `TRUST_PROXY=1`.
Persist `STORAGE_DIR` (default `server/data/`: listings, users, uploaded photos, submissions) on a volume – back it up.

## Before launch – content to confirm
- Map pin coordinates in `client/src/config/site.ts` are approximate.
- Replace the placeholder PDF, legal page copy, and update `SITE_URL` in `client/src/config/seo.ts`.
