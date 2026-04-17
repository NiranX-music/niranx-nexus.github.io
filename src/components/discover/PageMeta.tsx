import { useEffect } from "react";

interface Props {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  jsonLd?: object;
}

export function PageMeta({ title, description, keywords, canonical, ogImage, ogType = "website", jsonLd }: Props) {
  useEffect(() => {
    const prev = document.title;
    if (title) document.title = title;

    const setMeta = (selector: string, attr: string, value: string, content: string) => {
      let el = document.head.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, value);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
      return el;
    };

    const created: HTMLElement[] = [];
    if (description) setMeta(`meta[name="description"]`, "name", "description", description);
    if (keywords) setMeta(`meta[name="keywords"]`, "name", "keywords", keywords);
    if (title) setMeta(`meta[property="og:title"]`, "property", "og:title", title);
    if (description) setMeta(`meta[property="og:description"]`, "property", "og:description", description);
    setMeta(`meta[property="og:type"]`, "property", "og:type", ogType);
    if (ogImage) setMeta(`meta[property="og:image"]`, "property", "og:image", ogImage);

    let canonicalEl: HTMLLinkElement | null = null;
    if (canonical) {
      canonicalEl = document.head.querySelector(`link[rel="canonical"]`) as HTMLLinkElement;
      if (!canonicalEl) {
        canonicalEl = document.createElement("link");
        canonicalEl.rel = "canonical";
        document.head.appendChild(canonicalEl);
        created.push(canonicalEl);
      }
      canonicalEl.href = canonical;
    }

    let jsonLdEl: HTMLScriptElement | null = null;
    if (jsonLd) {
      jsonLdEl = document.createElement("script");
      jsonLdEl.type = "application/ld+json";
      jsonLdEl.text = JSON.stringify(jsonLd);
      jsonLdEl.dataset.discover = "1";
      document.head.appendChild(jsonLdEl);
    }

    return () => {
      document.title = prev;
      if (jsonLdEl) jsonLdEl.remove();
      created.forEach((e) => e.remove());
    };
  }, [title, description, keywords, canonical, ogImage, ogType, JSON.stringify(jsonLd)]);

  return null;
}
