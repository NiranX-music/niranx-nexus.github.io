import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Save, Trash2, Layout, Eye, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface Template {
  id: string;
  name: string;
  description: string | null;
  html_content: string;
  css_content: string;
  js_content: string;
  preview_image_url: string | null;
  is_active: boolean;
  is_default: boolean;
  updated_at: string;
}

export default function LandingTemplates() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selected, setSelected] = useState<Template | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("landing_page_templates").select("*").order("created_at", { ascending: false });
    setTemplates((data as Template[]) || []);
    if (data && data.length && !selected) setSelected(data[0] as Template);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!user) return;
    const { data, error } = await supabase.from("landing_page_templates").insert({
      name: "New Template",
      description: "",
      html_content: "<h1>Hello NiranX</h1>",
      css_content: "h1 { color: hotpink; }",
      js_content: "",
      created_by: user.id,
    }).select().single();
    if (error) toast.error(error.message);
    else { setSelected(data as Template); load(); }
  };

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    const { error } = await supabase.from("landing_page_templates").update({
      name: selected.name,
      description: selected.description,
      html_content: selected.html_content,
      css_content: selected.css_content,
      js_content: selected.js_content,
    }).eq("id", selected.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success("Saved"); load(); }
  };

  const remove = async () => {
    if (!selected || !confirm("Delete this template?")) return;
    await supabase.from("landing_page_templates").delete().eq("id", selected.id);
    setSelected(null); load();
  };

  const setActive = async () => {
    if (!selected) return;
    await supabase.from("landing_page_templates").update({ is_active: false }).neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("landing_page_templates").update({ is_active: true }).eq("id", selected.id);
    toast.success("Set as active landing template");
    load();
  };

  const previewHtml = selected
    ? `<!DOCTYPE html><html><head><style>${selected.css_content}</style></head><body>${selected.html_content}<script>${selected.js_content}<\/script></body></html>`
    : "";

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Layout className="h-7 w-7 text-primary" /> Landing Page Templates
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Edit and manage landing page templates with HTML, CSS, and JS</p>
        </div>
        <Button onClick={create}><Plus className="h-4 w-4 mr-2" />New Template</Button>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <aside className="col-span-3 space-y-2">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelected(t)}
              className={`w-full text-left p-3 rounded-xl border transition-colors ${selected?.id === t.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm truncate flex-1">{t.name}</span>
                {t.is_active && <Badge className="text-[9px] h-4">Active</Badge>}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{t.description || "No description"}</p>
            </button>
          ))}
          {templates.length === 0 && <p className="text-xs text-muted-foreground text-center p-4">No templates. Create one!</p>}
        </aside>

        <main className="col-span-9">
          {!selected ? (
            <div className="p-20 text-center text-muted-foreground border border-dashed border-border rounded-2xl">
              Select or create a template
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Input value={selected.name} onChange={(e) => setSelected({ ...selected, name: e.target.value })} className="text-lg font-semibold" />
                <Button variant="outline" size="icon" onClick={() => setPreviewing((p) => !p)}><Eye className="h-4 w-4" /></Button>
                {!selected.is_active && <Button variant="outline" onClick={setActive}><CheckCircle className="h-4 w-4 mr-2" />Set Active</Button>}
                <Button onClick={save} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} Save
                </Button>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={remove}><Trash2 className="h-4 w-4" /></Button>
              </div>

              <Input
                value={selected.description || ""}
                onChange={(e) => setSelected({ ...selected, description: e.target.value })}
                placeholder="Description"
              />

              {previewing && (
                <div className="rounded-xl border border-border overflow-hidden bg-white" style={{ height: 500 }}>
                  <iframe srcDoc={previewHtml} className="w-full h-full" sandbox="allow-scripts" title="Preview" />
                </div>
              )}

              <Tabs defaultValue="html">
                <TabsList>
                  <TabsTrigger value="html">HTML</TabsTrigger>
                  <TabsTrigger value="css">CSS</TabsTrigger>
                  <TabsTrigger value="js">JavaScript</TabsTrigger>
                </TabsList>
                <TabsContent value="html">
                  <Textarea
                    value={selected.html_content}
                    onChange={(e) => setSelected({ ...selected, html_content: e.target.value })}
                    rows={20}
                    className="font-mono text-sm"
                    placeholder="Paste HTML..."
                  />
                </TabsContent>
                <TabsContent value="css">
                  <Textarea
                    value={selected.css_content}
                    onChange={(e) => setSelected({ ...selected, css_content: e.target.value })}
                    rows={20}
                    className="font-mono text-sm"
                    placeholder="Paste CSS..."
                  />
                </TabsContent>
                <TabsContent value="js">
                  <Textarea
                    value={selected.js_content}
                    onChange={(e) => setSelected({ ...selected, js_content: e.target.value })}
                    rows={20}
                    className="font-mono text-sm"
                    placeholder="Paste JS..."
                  />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
