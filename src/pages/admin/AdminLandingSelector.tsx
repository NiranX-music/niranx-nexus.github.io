import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle2, ExternalLink } from "lucide-react";

const KEY = "active_landing_variant";

const VARIANTS = [
  { id: "default", name: "Default NiranX", desc: "Original NiranX Universe landing page.", preview: "/" },
  { id: "velorah", name: "Velorah — Cinematic", desc: "Fullscreen looping video with glassmorphic nav and cinematic serif typography.", preview: "/velorah" },
  { id: "jack", name: "Jack — 3D Creator", desc: "Multi-section creator portfolio with marquee, magnet portrait, and stacked project cards.", preview: "/jack" },
];

export default function AdminLandingSelector() {
  const { user } = useAuth();
  const [current, setCurrent] = useState<string>("default");
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("admin_settings")
        .select("setting_value")
        .eq("setting_key", KEY)
        .maybeSingle();
      const v = (data?.setting_value as any)?.variant ?? "default";
      setCurrent(v);
    })();
  }, []);

  async function activate(variant: string) {
    setSaving(variant);
    const value = { variant };
    const { data: existing } = await supabase
      .from("admin_settings")
      .select("id")
      .eq("setting_key", KEY)
      .maybeSingle();

    const res = existing
      ? await supabase
          .from("admin_settings")
          .update({ setting_value: value, updated_at: new Date().toISOString(), updated_by: user?.id })
          .eq("setting_key", KEY)
      : await supabase
          .from("admin_settings")
          .insert({ setting_key: KEY, setting_value: value, updated_by: user?.id });

    setSaving(null);
    if (res.error) {
      toast.error(res.error.message);
      return;
    }
    setCurrent(variant);
    try { localStorage.setItem(KEY, variant); } catch {}
    toast.success(`Activated: ${variant}`);
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <Helmet>
        <title>Landing Selector — Admin</title>
        <meta name="description" content="Choose which landing page variant is served at the site root." />
      </Helmet>
      <div>
        <h1 className="text-3xl font-bold">Landing Page Selector</h1>
        <p className="text-muted-foreground mt-1">
          Control which landing variant users see at <code>/</code>.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {VARIANTS.map((v) => {
          const active = current === v.id;
          return (
            <Card key={v.id} className={active ? "border-primary" : ""}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {v.name}
                  {active && <CheckCircle2 className="h-4 w-4 text-primary" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{v.desc}</p>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    disabled={active || saving === v.id}
                    onClick={() => activate(v.id)}
                  >
                    {saving === v.id ? "Saving..." : active ? "Active" : "Activate"}
                  </Button>
                  <a
                    href={v.preview}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                  >
                    Preview <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
