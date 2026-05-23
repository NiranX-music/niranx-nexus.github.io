import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { History, RotateCcw, Save, Loader2, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

export interface PageSnapshot {
  title: string;
  slug: string;
  route_override: string | null;
  html_content: string | null;
  css_content: string | null;
  js_content: string | null;
  files: any;
  meta_description: string | null;
  is_published: boolean;
}

interface Version extends PageSnapshot {
  id: string;
  version_number: number;
  label: string | null;
  created_at: string;
}

export function PageVersionHistory({
  pageId,
  currentSnapshot,
  userId,
  onRestore,
}: {
  pageId: string | null;
  currentSnapshot: PageSnapshot | null;
  userId: string | undefined;
  onRestore: (snap: PageSnapshot) => void;
}) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [label, setLabel] = useState("");

  const load = async () => {
    if (!pageId) { setVersions([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from("admin_custom_page_versions")
      .select("*")
      .eq("page_id", pageId)
      .order("created_at", { ascending: false })
      .limit(50);
    setVersions((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [pageId]);

  const saveVersion = async () => {
    if (!pageId || !currentSnapshot) {
      toast({ title: "Save the page first", variant: "destructive" }); return;
    }
    setSaving(true);
    try {
      const next = (versions[0]?.version_number || 0) + 1;
      const { error } = await supabase.from("admin_custom_page_versions").insert({
        page_id: pageId,
        version_number: next,
        label: label.trim() || `v${next}`,
        created_by: userId ?? null,
        ...currentSnapshot,
      });
      if (error) throw error;
      setLabel("");
      toast({ title: "Restore point saved" });
      await load();
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const restore = (v: Version) => {
    if (!confirm(`Restore "${v.label}"? Current unsaved changes will be replaced.`)) return;
    onRestore({
      title: v.title, slug: v.slug, route_override: v.route_override,
      html_content: v.html_content, css_content: v.css_content, js_content: v.js_content,
      files: v.files, meta_description: v.meta_description, is_published: v.is_published,
    });
    toast({ title: `Restored ${v.label}` });
  };

  const remove = async (v: Version) => {
    if (!confirm(`Delete restore point "${v.label}"?`)) return;
    await supabase.from("admin_custom_page_versions").delete().eq("id", v.id);
    await load();
  };

  if (!pageId) {
    return (
      <Card><CardContent className="py-6 text-center text-xs text-muted-foreground">
        Save a page to enable version history
      </CardContent></Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2"><History className="h-4 w-4"/>Versions</CardTitle>
        <Badge variant="secondary" className="text-[10px]">{versions.length}</Badge>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex gap-1">
          <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label (optional)" className="h-7 text-xs" />
          <Button size="sm" className="h-7 text-xs" onClick={saveVersion} disabled={saving}>
            {saving ? <Loader2 className="h-3 w-3 animate-spin"/> : <Save className="h-3 w-3"/>}
          </Button>
        </div>
        <ScrollArea className="h-[60vh]">
          {loading ? <p className="text-xs text-muted-foreground p-2">Loading…</p> :
            versions.length === 0 ? <p className="text-xs text-muted-foreground p-2">No restore points yet</p> :
            versions.map((v) => (
              <div key={v.id} className="group flex items-center justify-between gap-1 py-1.5 px-2 rounded hover:bg-muted/50">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate flex items-center gap-1">
                    {v.label} {v.is_published && <Badge variant="outline" className="text-[9px] py-0">live</Badge>}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(v.created_at), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100">
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => restore(v)} title="Restore">
                    <RotateCcw className="h-3 w-3"/>
                  </Button>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => remove(v)} title="Delete">
                    <Trash2 className="h-3 w-3 text-destructive"/>
                  </Button>
                </div>
              </div>
            ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
