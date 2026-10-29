import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Scroll to top on navigation, or to the #anchor if there is one (pages load lazily, so retry briefly). */
export function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
      return;
    }
    let tries = 0;
    const timer = window.setInterval(() => {
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (target || ++tries > 15) {
        window.clearInterval(timer);
        target?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 80);
    return () => window.clearInterval(timer);
  }, [pathname, search, hash]);

  return null;
}
