import { useEffect } from "react";

/**
 * Redirects /ai/u/<endpoint> (non-portal) to the niranx-core-ai edge function.
 * Used as a fallback so users / scripts hitting the friendly URL get routed.
 */
export default function AiGatewayRedirect() {
  useEffect(() => {
    const path = window.location.pathname.replace(/^\/ai\/u\/?/, "");
    const projectId = (import.meta as any).env?.VITE_SUPABASE_PROJECT_ID || "tophenwypevlfbznlwil";
    const target = `https://${projectId}.supabase.co/functions/v1/niranx-core-ai/${path}${window.location.search}`;
    window.location.replace(target);
  }, []);
  return (
    <div className="min-h-screen flex items-center justify-center text-muted-foreground">
      Redirecting to NiranX Core AI gateway…
    </div>
  );
}
