import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface LandingSection {
  id: string;
  section_key: string;
  display_name: string;
  description: string | null;
  is_enabled: boolean;
  order_index: number;
  custom_props: Record<string, any>;
}

export function useLandingSections() {
  const [sections, setSections] = useState<LandingSection[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase
      .from("landing_sections")
      .select("*")
      .order("order_index", { ascending: true });
    setSections((data as LandingSection[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return { sections, loading, reload: load };
}
