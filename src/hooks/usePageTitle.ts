import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Syncs the browser tab title with the current page route.
 */
export function usePageTitle(defaultTitle = "NiranX StudyVerse") {
  const location = useLocation();

  useEffect(() => {
    const segments = location.pathname.split("/").filter(Boolean);
    const lastSegment = segments[segments.length - 1];

    if (!lastSegment || lastSegment === "dashboard") {
      document.title = defaultTitle;
      return;
    }

    const formatted = lastSegment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    document.title = `${formatted} — ${defaultTitle}`;

    return () => {
      document.title = defaultTitle;
    };
  }, [location.pathname, defaultTitle]);
}
