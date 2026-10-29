import { ICON_NAMES } from "../config/icons.ts";

/**
 * Loads only the Material Symbols Outlined glyphs we use (icon_names subset),
 * after first paint, so it never blocks rendering. If it fails (offline) the
 * icons simply stay hidden – labelled controls keep their aria-labels.
 */
export function loadIconFont(): void {
  const names = [...ICON_NAMES].sort().join(",");
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" +
    `&icon_names=${names}&display=block`;
  link.onload = () => {
    const ready = () => document.documentElement.classList.add("icons-ready");
    document.fonts
      .load('24px "Material Symbols Outlined"', ICON_NAMES[0])
      .then(ready, ready);
  };
  document.head.appendChild(link);
}
