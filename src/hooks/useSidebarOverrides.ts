import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Loads admin overrides from sidebar_pages + sidebar_groups so that the
 * hard-coded frontend navigation can be hidden / re-enabled from the DB.
 *
 * Matching:
 *  - A frontend nav item is hidden if a sidebar_pages row with the same `url`
 *    exists with is_enabled=false (or disabled_until > now).
 *  - A whole nav group is hidden if a sidebar_groups row with name matching
 *    the group title exists and is_enabled=false.
 */
export function useSidebarOverrides() {
  const [hiddenUrls, setHiddenUrls] = useState<Set<string>>(new Set());
  const [hiddenGroupNames, setHiddenGroupNames] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [pagesRes, groupsRes] = await Promise.all([
      supabase.from("sidebar_pages").select("url, is_enabled, disabled_until"),
      supabase.from("sidebar_groups").select("name, is_enabled"),
    ]);

    const now = new Date();
    const urls = new Set<string>();
    (pagesRes.data || []).forEach((p: any) => {
      const tempDisabled = p.disabled_until && new Date(p.disabled_until) > now;
      if (p.is_enabled === false || tempDisabled) urls.add(p.url);
    });

    const groups = new Set<string>();
    (groupsRes.data || []).forEach((g: any) => {
      if (g.is_enabled === false) groups.add(g.name);
    });

    setHiddenUrls(urls);
    setHiddenGroupNames(groups);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return { hiddenUrls, hiddenGroupNames, loading, reload: load };
}
