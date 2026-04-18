import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Trash2, Save, ArrowLeft, Sparkles, Loader2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { LandingHighlight } from "@/hooks/useLandingHighlights";

const empty = (): Partial<LandingHighlight> => ({
  title: "",
  description: "",
  url: "/",
  icon: "Sparkles",
  badge: "",
  is_external: false,
  is_active: true,
  order_index: 0,
  gradient_from: "",
  gradient_to: "",
});

export default function LandingHighlightsManager() {
  const [items, setItems] = useState<LandingHighlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<LandingHighlight>>(empty());

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("landing_highlights")
      .select("*")
      .order("order_index");
    if (error) toast.error(error.message);
    else setItems((data || []) as LandingHighlight[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!draft.title || !draft.url) {
      toast.error("Title and URL are required");
      return;
    }
    const { error } = await supabase.from("landing_highlights").insert({
      title: draft.title!,
      description: draft.description || null,
      url: draft.url!,
      icon: draft.icon || "Sparkles",
      badge: draft.badge || null,
      is_external: !!draft.is_external,
      is_active: !!draft.is_active,
      order_index: draft.order_index || items.length,
      gradient_from: draft.gradient_from || null,
      gradient_to: draft.gradient_to || null,
    });
    if (error) return toast.error(error.message);
    toast.success("Highlight added");
    setDraft(empty());
    load();
  };

  const update = async (id: string, patch: Partial<LandingHighlight>) => {
    setSaving(id);
    const { error } = await supabase.from("landing_highlights").update(patch).eq("id", id);
    setSaving(null);
    if (error) return toast.error(error.message);
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this highlight?")) return;
    const { error } = await supabase.from("landing_highlights").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  return (
    <div className="container max-w-5xl py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/admin" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-2">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Admin
          </Link>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-primary" /> Landing Highlights
          </h1>
          <p className="text-muted-foreground">Manage promo cards shown on the landing page.</p>
        </div>
      </div>

      <Card className="p-6 border-primary/20">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add new highlight
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input placeholder="Title" value={draft.title || ""} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          <Input placeholder="URL (e.g. /discover or https://...)" value={draft.url || ""} onChange={(e) => setDraft({ ...draft, url: e.target.value })} />
          <Input placeholder="Icon name (lucide, e.g. Sparkles)" value={draft.icon || ""} onChange={(e) => setDraft({ ...draft, icon: e.target.value })} />
          <Input placeholder="Badge (optional, e.g. NEW)" value={draft.badge || ""} onChange={(e) => setDraft({ ...draft, badge: e.target.value })} />
          <Input placeholder="Gradient from (hsl/hex)" value={draft.gradient_from || ""} onChange={(e) => setDraft({ ...draft, gradient_from: e.target.value })} />
          <Input placeholder="Gradient to (hsl/hex)" value={draft.gradient_to || ""} onChange={(e) => setDraft({ ...draft, gradient_to: e.target.value })} />
          <Textarea className="md:col-span-2" placeholder="Description" value={draft.description || ""} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
          <div className="flex items-center gap-2">
            <Switch checked={!!draft.is_external} onCheckedChange={(v) => setDraft({ ...draft, is_external: v })} />
            <Label>External link</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={!!draft.is_active} onCheckedChange={(v) => setDraft({ ...draft, is_active: v })} />
            <Label>Active</Label>
          </div>
        </div>
        <Button className="mt-4" onClick={create}>
          <Plus className="h-4 w-4 mr-2" /> Add Highlight
        </Button>
      </Card>

      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : items.length === 0 ? (
          <Card className="p-12 text-center text-muted-foreground">No highlights yet.</Card>
        ) : (
          items.map((it) => (
            <Card key={it.id} className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Input value={it.title} onChange={(e) => update(it.id, { title: e.target.value })} />
                <Input value={it.url} onChange={(e) => update(it.id, { url: e.target.value })} />
                <Input value={it.icon || ""} placeholder="Icon" onChange={(e) => update(it.id, { icon: e.target.value })} />
                <Input value={it.badge || ""} placeholder="Badge" onChange={(e) => update(it.id, { badge: e.target.value })} />
                <Textarea className="md:col-span-2" value={it.description || ""} onChange={(e) => update(it.id, { description: e.target.value })} />
              </div>
              <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Switch checked={it.is_active} onCheckedChange={(v) => update(it.id, { is_active: v })} />
                    <Label className="text-xs">Active</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={it.is_external} onCheckedChange={(v) => update(it.id, { is_external: v })} />
                    <Label className="text-xs">External</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">Order</Label>
                    <Input
                      type="number"
                      className="w-20 h-8"
                      value={it.order_index}
                      onChange={(e) => update(it.id, { order_index: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  {saving === it.id && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                  <Button size="sm" variant="outline" asChild>
                    <a href={it.url} target={it.is_external ? "_blank" : "_self"} rel="noreferrer">
                      <ExternalLink className="h-3 w-3 mr-1" /> Preview
                    </a>
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => remove(it.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
