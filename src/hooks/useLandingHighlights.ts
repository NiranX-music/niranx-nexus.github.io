import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface LandingHighlight {
  id: string;
  title: string;
  description: string | null;
  url: string;
  icon: string | null;
  badge: string | null;
  is_external: boolean;
  is_active: boolean;
  order_index: number;
  gradient_from: string | null;
  gradient_to: string | null;
}

export function useLandingHighlights(activeOnly = true) {
  const [highlights, setHighlights] = useState<LandingHighlight[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    let q = supabase.from("landing_highlights").select("*").order("order_index");
    if (activeOnly) q = q.eq("is_active", true);
    const { data, error } = await q;
    if (!error && data) setHighlights(data as LandingHighlight[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [activeOnly]);

  return { highlights, loading, reload: load };
}
