#!/usr/bin/env node
/** Rebuilds client/src/config/icons.ts from the icons actually used in the source. */
import fs from "node:fs";
import path from "node:path";

const SRC = path.resolve("client/src");
const names = new Set();
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.tsx?$/.test(e.name) && !p.endsWith("config/icons.ts")) {
      const text = fs.readFileSync(p, "utf8");
      for (const m of text.matchAll(/material-symbols-outlined[^>]*>\s*([a-z_0-9]+)\s*<\/span>/gs)) names.add(m[1]);
      for (const m of text.matchAll(/[iI]con:\s*"([a-z_0-9]+)"/g)) names.add(m[1]);
    }
  }
})(SRC);

const body = [...names].sort().map((n) => `  "${n}",`).join("\n");
fs.writeFileSync(
  path.join(SRC, "config/icons.ts"),
  `/**
 * Single source of truth for Material Symbols Outlined icons used on the site.
 * Only these glyphs are requested from Google Fonts (icon_names subset), which keeps
 * the icon font to a few KB instead of ~1 MB. Regenerate with \`npm run icons:sync\`;
 * \`npm run lint\` fails if a page uses an icon that is missing from this list.
 */
export const ICON_NAMES = [
${body}
] as const;

export type IconName = (typeof ICON_NAMES)[number];
`,
);
console.log(`Registered ${names.size} icons.`);
