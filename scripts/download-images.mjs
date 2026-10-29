#!/usr/bin/env node
/**
 * Downloads every photo in client/src/data/images.json once, resizes it, and writes
 * AVIF + WebP files to client/public/images/<key>-<width>.<ext>.
 *
 *   npm install            (needs the `sharp` dev dependency)
 *   npm run images:download
 *   set VITE_LOCAL_IMAGES=true in .env, then npm run build
 *
 * After that the site no longer depends on any external image host. To use your own
 * photography instead, drop files with the same names into client/public/images/.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const WIDTHS = [480, 800, 1200, 1600];
const registry = JSON.parse(fs.readFileSync("client/src/data/images.json", "utf8"));
const outDir = path.resolve("client/public/images");
fs.mkdirSync(outDir, { recursive: true });

let done = 0;
let skipped = 0;
for (const [key, { id }] of Object.entries(registry)) {
  const missing = WIDTHS.flatMap((w) => ["webp", "avif"].map((ext) => ({ w, ext, file: path.join(outDir, `${key}-${w}.${ext}`) })))
    .filter((t) => !fs.existsSync(t.file));
  if (!missing.length) {
    skipped++;
    continue;
  }
  const res = await fetch(`https://images.unsplash.com/${id}?auto=format&fit=crop&w=2000&q=85`);
  if (!res.ok) {
    console.error(`✗ ${key}: HTTP ${res.status}`);
    process.exitCode = 1;
    continue;
  }
  const source = Buffer.from(await res.arrayBuffer());
  for (const { w, ext, file } of missing) {
    const img = sharp(source).resize({ width: w, withoutEnlargement: true });
    await (ext === "avif" ? img.avif({ quality: 50 }) : img.webp({ quality: 78 })).toFile(file);
  }
  done++;
  console.log(`✓ ${key}`);
}
console.log(`Done: ${done} downloaded, ${skipped} already present.`);
