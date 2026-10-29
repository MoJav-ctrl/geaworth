import { useEffect, type RefObject } from "react";

/**
 * Subtle fade/slide-in as sections scroll into view. Sections already on screen are
 * left alone (no flash), and nothing is hidden at all when the visitor prefers reduced motion.
 */
export function useScrollReveal(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const seen = new WeakSet<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );

    const scan = () => {
      el.querySelectorAll("section").forEach((section) => {
        if (seen.has(section)) return;
        seen.add(section);
        if (section.getBoundingClientRect().top < window.innerHeight) return; // already visible
        section.classList.add("reveal");
        io.observe(section);
      });
    };

    scan();
    let frame = 0;
    const mo = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(scan);
    });
    mo.observe(el, { childList: true, subtree: true });
    return () => {
      cancelAnimationFrame(frame);
      mo.disconnect();
      io.disconnect();
    };
  }, [root]);
}
