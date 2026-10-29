#!/usr/bin/env node
/**
 * `npm run lint` guard:
 *  1. No hard-coded hex colours outside client/src/index.css (the token file).
 *  2. Every Material Symbols icon used in the source is registered in config/icons.ts.
 *  3. Every <img> outside Photo.tsx has width/height and alt.
 */
import fs from "node:fs";
import path from "node:path";

const SRC = path.resolve("client/src");
const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(tsx?|css)$/.test(e.name)) files.push(p);
  }
})(SRC);

let failures = 0;
const fail = (msg) => {
  failures++;
  console.error("✗ " + msg);
};

// 1. hex colours
for (const f of files) {
  if (f.endsWith("index.css")) continue;
  const text = fs.readFileSync(f, "utf8");
  text.split("\n").forEach((line, i) => {
    if (/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b(?![0-9a-fA-F])/.test(line) && !/href=|&#|\/\/ eslint/.test(line)) {
      fail(`${path.relative(".", f)}:${i + 1} hard-coded colour – use a brand token (bg-brand-*, text-brand-*)`);
    }
  });
}

// 2. icon registry
const registry = fs.readFileSync(path.join(SRC, "config/icons.ts"), "utf8");
const registered = new Set([...registry.matchAll(/"([a-z_0-9]+)"/g)].map((m) => m[1]));
const used = new Set();
for (const f of files.filter((f) => /\.tsx?$/.test(f))) {
  const text = fs.readFileSync(f, "utf8");
  for (const m of text.matchAll(/material-symbols-outlined[^>]*>\s*([a-z_0-9]+)\s*<\/span>/gs)) used.add([m[1], f]);
  for (const m of text.matchAll(/[iI]con:\s*"([a-z_0-9]+)"/g)) used.add([m[1], f]);
}
for (const [name, f] of used) {
  if (!registered.has(name)) fail(`${path.relative(".", f)} uses icon "${name}" missing from client/src/config/icons.ts`);
}

// 3. raw <img> tags
for (const f of files.filter((f) => f.endsWith(".tsx") && !f.endsWith("Photo.tsx"))) {
  const text = fs.readFileSync(f, "utf8");
  for (const m of text.matchAll(/<img\b[\s\S]*?\/>/g)) {
    if (!/\bwidth=/.test(m[0]) || !/\bheight=/.test(m[0]) || !/\balt=/.test(m[0])) {
      fail(`${path.relative(".", f)} <img> needs alt, width and height (or use <Photo>)`);
    }
  }
}

if (failures) {
  console.error(`\n${failures} problem(s) found.`);
  process.exit(1);
}
console.log("✓ tokens, icons and images look good");
