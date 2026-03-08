import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const scrollPositions = new Map<string, number>();

/**
 * Restores scroll position when navigating back to a previously visited page.
 */
export function useScrollRestoration() {
  const location = useLocation();

  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;

    // Restore saved scroll position for this path
    const saved = scrollPositions.get(location.pathname);
    if (saved !== undefined) {
      requestAnimationFrame(() => main.scrollTo(0, saved));
    } else {
      main.scrollTo(0, 0);
    }

    // Save scroll position when leaving
    const handler = () => {
      scrollPositions.set(location.pathname, main.scrollTop);
    };

    main.addEventListener("scroll", handler, { passive: true });
    return () => {
      handler(); // save on unmount
      main.removeEventListener("scroll", handler);
    };
  }, [location.pathname]);
}
