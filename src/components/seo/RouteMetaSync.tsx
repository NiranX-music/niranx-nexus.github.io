import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const BASE = "https://niranx-nexus.lovable.app";

/**
 * Keeps <link rel="canonical"> and og:url in sync with the current route.
 * Avoids the static-homepage canonical that the SEO scanner flags.
 */
export function RouteMetaSync() {
  const location = useLocation();

  useEffect(() => {
    const url = `${BASE}${location.pathname}`;

    let canonical = document.head.querySelector(
      'link[rel="canonical"]'
    ) as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    const ogUrl = document.head.querySelector(
      'meta[property="og:url"]'
    ) as HTMLMetaElement | null;
    if (ogUrl) ogUrl.setAttribute("content", url);
  }, [location.pathname]);

  return null;
}
