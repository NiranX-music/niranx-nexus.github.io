import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const scrollPositions = new Map<string, number>();

/**
 * Scrolls to top on new page navigation; restores position on back/forward.
 */
export function useScrollRestoration() {
  const location = useLocation();
  const prevPathRef = useRef<string | null>(null);

  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;

    // Always scroll to top on route change
    main.scrollTo(0, 0);

    const prevPath = prevPathRef.current;
    prevPathRef.current = location.pathname;

    // Save scroll position when leaving
    const handler = () => {
      scrollPositions.set(location.pathname, main.scrollTop);
    };

    main.addEventListener("scroll", handler, { passive: true });
    return () => {
      handler();
      main.removeEventListener("scroll", handler);
    };
  }, [location.pathname]);
}
