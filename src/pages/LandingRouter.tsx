import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Landing from "./Landing";
import VelorahLanding from "./landings/VelorahLanding";
import JackLanding from "./landings/JackLanding";

const KEY = "active_landing_variant"; // 'default' | 'velorah' | 'jack'

export default function LandingRouter() {
  const [variant, setVariant] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      // Fast local hint
      const local = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
      if (local) setVariant(local);

      const { data } = await supabase
        .from("admin_settings")
        .select("setting_value")
        .eq("setting_key", KEY)
        .maybeSingle();
      if (cancel) return;
      const v = (data?.setting_value as any)?.variant ?? "default";
      setVariant(v);
      try { localStorage.setItem(KEY, v); } catch {}
    })();
    return () => { cancel = true; };
  }, []);

  if (variant === null) return null;
  if (variant === "velorah") return <VelorahLanding />;
  if (variant === "jack") return <JackLanding />;
  return <Landing />;
}
