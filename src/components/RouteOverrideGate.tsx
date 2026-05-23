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

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function buildHtml(p: OverrideRow): string {
  let html = p.html_content || "<!doctype html><html><head></head><body></body></html>";
  if (!/<html/i.test(html)) html = `<!doctype html><html><head></head><body>${html}</body></html>`;

  // Hardening: strict CSP, deny referrer, block tracking, no opener,
  // disable powerful features. Prevents the custom page from calling
  // back into the parent app, reading session storage, or geolocation.
  const csp = [
    "default-src 'self' data: blob:",
    "script-src 'unsafe-inline' 'self' blob:",
    "style-src 'unsafe-inline' 'self'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "form-action 'none'",
    "base-uri 'none'",
    "object-src 'none'",
  ].join("; ");

  const securityHead = [
    `<meta http-equiv="Content-Security-Policy" content="${escapeHtml(csp)}">`,
    `<meta name="referrer" content="no-referrer">`,
    `<meta http-equiv="Permissions-Policy" content="geolocation=(), microphone=(), camera=(), payment=(), usb=(), clipboard-read=()">`,
  ].join("");

  html = html.replace(/<head[^>]*>/i, (m) => `${m}${securityHead}`);

  if (p.css_content) html = html.replace(/<\/head>/i, `<style>${p.css_content}</style></head>`);
  if (p.js_content) html = html.replace(/<\/body>/i, `<script>${p.js_content}</script></body>`);
  if (p.meta_description) {
    html = html.replace(/<\/head>/i, `<meta name="description" content="${escapeHtml(p.meta_description)}"></head>`);
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

  // Strict sandbox: no same-origin (cannot read parent storage / cookies /
  // call supabase as authed user), no top navigation, no popups-to-escape,
  // no modals, no pointer lock, no presentation.
  return (
    <iframe
      key={override.id}
      srcDoc={buildHtml(override)}
      title={override.title}
      className="w-full min-h-screen border-0"
      sandbox="allow-scripts allow-forms"
      referrerPolicy="no-referrer"
      allow=""
      loading="lazy"
    />
  );
}
