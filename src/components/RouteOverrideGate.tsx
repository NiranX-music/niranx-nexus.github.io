import { useEffect, useState, ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface OverrideRow {
  id: string;
  route_override: string;
  html_content: string;
  css_content: string | null;
  js_content: string | null;
  files: any;
  title: string;
  meta_description: string | null;
}

let cache: Map<string, OverrideRow> | null = null;

async function loadOverrides() {
  if (cache) return cache;
  const { data } = await supabase
    .from("admin_custom_pages")
    .select("id,route_override,html_content,css_content,js_content,files,title,meta_description")
    .eq("is_published", true)
    .not("route_override", "is", null);
  cache = new Map();
  (data || []).forEach((r: any) => {
    if (r.route_override) cache!.set(r.route_override, r);
  });
  return cache;
}

export function invalidateRouteOverrideCache() { cache = null; }

function buildHtml(p: OverrideRow): string {
  let html = p.html_content || "<!doctype html><html><head></head><body></body></html>";
  if (!/<html/i.test(html)) html = `<!doctype html><html><head></head><body>${html}</body></html>`;
  if (p.css_content) html = html.replace(/<\/head>/i, `<style>${p.css_content}</style></head>`);
  if (p.js_content) html = html.replace(/<\/body>/i, `<script>${p.js_content}</script></body>`);
  if (p.meta_description) {
    html = html.replace(/<\/head>/i, `<meta name="description" content="${p.meta_description.replace(/"/g, "&quot;")}"></head>`);
  }
  return html;
}

export function RouteOverrideGate({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [override, setOverride] = useState<OverrideRow | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    loadOverrides().then((m) => {
      if (cancelled) return;
      setOverride(m.get(pathname) || null);
    });
    return () => { cancelled = true; };
  }, [pathname]);

  if (override === undefined) return <>{children}</>;
  if (!override) return <>{children}</>;

  return (
    <iframe
      key={override.id}
      srcDoc={buildHtml(override)}
      title={override.title}
      className="w-full min-h-screen border-0"
      sandbox="allow-scripts allow-forms allow-popups"
    />
  );
}
