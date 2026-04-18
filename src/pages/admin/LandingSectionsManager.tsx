import { useState } from "react";
import { useLandingSections } from "@/hooks/useLandingSections";
import { supabase } from "@/integrations/supabase/client";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { ChevronUp, ChevronDown, Loader2, Layers, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { PageMeta } from "@/components/discover/PageMeta";

export default function LandingSectionsManager() {
  const { isAdmin, isLoading } = useAdminCheck();
  const { sections, loading, reload } = useLandingSections();
  const [savingId, setSavingId] = useState<string | null>(null);

  if (isLoading || loading) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin h-6 w-6 text-primary" /></div>;
  }
  if (!isAdmin) return <Navigate to="/" replace />;

  const toggle = async (id: string, current: boolean) => {
    setSavingId(id);
    const { error } = await supabase.from("landing_sections").update({ is_enabled: !current }).eq("id", id);
    setSavingId(null);
    if (error) return toast.error("Failed");
    toast.success(!current ? "Section enabled" : "Section hidden");
    reload();
  };

  const move = async (id: string, dir: "up" | "down") => {
    const idx = sections.findIndex(s => s.id === id);
    const target = dir === "up" ? idx - 1 : idx + 1;
    if (target < 0 || target >= sections.length) return;
    const a = sections[idx], b = sections[target];
    setSavingId(id);
    await Promise.all([
      supabase.from("landing_sections").update({ order_index: b.order_index }).eq("id", a.id),
      supabase.from("landing_sections").update({ order_index: a.order_index }).eq("id", b.id),
    ]);
    setSavingId(null);
    reload();
  };

  return (
    <>
      <PageMeta title="Landing Sections — Admin" description="Manage landing page sections" canonical="/admin/landing-sections" />
      <div className="container max-w-3xl mx-auto py-10 px-4">
        <Link to="/admin" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to admin
        </Link>
        <header className="mb-8 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Layers className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Landing Page Sections</h1>
            <p className="text-sm text-muted-foreground">Toggle, reorder and manage every section on the landing page.</p>
          </div>
        </header>

        <div className="space-y-3">
          {sections.map((s, i) => (
            <Card key={s.id} className="p-4 flex items-center gap-3 hover:border-primary/40 transition-colors">
              <div className="flex flex-col">
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => move(s.id, "up")} disabled={i === 0 || savingId === s.id}>
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => move(s.id, "down")} disabled={i === sections.length - 1 || savingId === s.id}>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold flex items-center gap-2">
                  {s.display_name}
                  <code className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{s.section_key}</code>
                </div>
                {s.description && <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>}
              </div>
              <Switch checked={s.is_enabled} onCheckedChange={() => toggle(s.id, s.is_enabled)} disabled={savingId === s.id} />
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
