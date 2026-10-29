import fs from "node:fs";
import path from "node:path";

/** Atomic write: temp file + rename so a crash never leaves half a JSON file. */
export function writeJsonAtomic(file: string, data: unknown): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, file);
}

/**
 * Reads a JSON file. A missing file returns `fallback()`.
 * A corrupt file is moved aside (never silently overwritten) and `fallback()` is returned.
 */
export function readJson<T>(file: string, fallback: () => T): T {
  if (!fs.existsSync(file)) return fallback();
  try {
    return JSON.parse(fs.readFileSync(file, "utf-8")) as T;
  } catch (err) {
    const aside = `${file}.corrupt-${Date.now()}`;
    console.error(`Could not parse ${path.basename(file)} – moved to ${path.basename(aside)}:`, err);
    try {
      fs.renameSync(file, aside);
    } catch {
      /* best effort */
    }
    return fallback();
  }
}
