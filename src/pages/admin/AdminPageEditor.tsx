import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Save, Trash2, FileCode, FolderPlus, Eye, ExternalLink, FilePlus } from "lucide-react";
import { invalidateRouteOverrideCache } from "@/components/RouteOverrideGate";

interface FileEntry {
  path: string;     // e.g. "src/index.html" or "assets/style.css"
  language: string; // "html" | "css" | "javascript" | "python" | "typescript" | etc
  content: string;
}

interface CustomPage {
  id: string;
  title: string;
  slug: string;
  html_content: string;
  css_content: string | null;
  js_content: string | null;
  is_published: boolean;
  show_in_sidebar: boolean;
  route_override: string | null;
  files: FileEntry[] | null;
  meta_description: string | null;
}

const LANGS = ["html","css","javascript","typescript","jsx","tsx","python","json","markdown","yaml","sql","bash","go","rust","java","c","cpp","php","ruby","other"];

function inferLang(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() || "";
  const m: Record<string,string> = {
    html:"html", htm:"html", css:"css", js:"javascript", mjs:"javascript",
    ts:"typescript", tsx:"tsx", jsx:"jsx", py:"python", json:"json",
    md:"markdown", yml:"yaml", yaml:"yaml", sql:"sql", sh:"bash",
    go:"go", rs:"rust", java:"java", c:"c", cpp:"cpp", php:"php", rb:"ruby",
  };
  return m[ext] || "other";
}

export default function AdminPageEditor() {
  const { user } = useAuth();
  const [pages, setPages] = useState<CustomPage[]>([]);
  const [selected, setSelected] = useState<CustomPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // form
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [routeOverride, setRouteOverride] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [showInSidebar, setShowInSidebar] = useState(false);
  const [meta, setMeta] = useState("");
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [activeFile, setActiveFile] = useState<string>("");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("admin_custom_pages")
      .select("id,title,slug,html_content,css_content,js_content,is_published,show_in_sidebar,route_override,files,meta_description")
      .order("created_at", { ascending: false });
    setPages((data as any) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const open = (p: CustomPage) => {
    setSelected(p);
    setTitle(p.title); setSlug(p.slug);
    setRouteOverride(p.route_override || "");
    setIsPublished(p.is_published); setShowInSidebar(p.show_in_sidebar);
    setMeta(p.meta_description || "");
    const f: FileEntry[] = Array.isArray(p.files) && p.files.length > 0
      ? p.files
      : [
          { path: "index.html", language: "html", content: p.html_content || "" },
          ...(p.css_content ? [{ path: "style.css", language: "css", content: p.css_content }] : []),
          ...(p.js_content ? [{ path: "app.js", language: "javascript", content: p.js_content }] : []),
        ];
    setFiles(f);
    setActiveFile(f[0]?.path || "");
  };

  const newPage = () => {
    setSelected(null);
    setTitle(""); setSlug(""); setRouteOverride("");
    setIsPublished(false); setShowInSidebar(false); setMeta("");
    const f: FileEntry[] = [
      { path: "index.html", language: "html", content: "<!doctype html>\n<html>\n<head>\n  <title>New Page</title>\n</head>\n<body>\n  <h1>Hello</h1>\n</body>\n</html>" },
    ];
    setFiles(f); setActiveFile(f[0].path);
  };

  const getFile = (path: string) => files.find(f => f.path === path);
  const updateActive = (patch: Partial<FileEntry>) => {
    setFiles(prev => prev.map(f => f.path === activeFile ? { ...f, ...patch } : f));
    if (patch.path) setActiveFile(patch.path);
  };
  const addFile = () => {
    const name = prompt("File path (e.g. assets/style.css or src/app.py):");
    if (!name) return;
    if (files.some(f => f.path === name)) { toast({ title: "Already exists", variant: "destructive" }); return; }
    const newF: FileEntry = { path: name, language: inferLang(name), content: "" };
    setFiles([...files, newF]); setActiveFile(name);
  };
  const addFolder = () => {
    const name = prompt("Folder path (e.g. src/components):");
    if (!name) return;
    const path = `${name.replace(/\/$/, "")}/.gitkeep`;
    setFiles([...files, { path, language: "other", content: "" }]); setActiveFile(path);
  };
  const removeFile = (path: string) => {
    if (!confirm(`Delete ${path}?`)) return;
    const next = files.filter(f => f.path !== path);
    setFiles(next);
    if (activeFile === path) setActiveFile(next[0]?.path || "");
  };

  const previewHtml = useMemo(() => {
    const html = getFile("index.html")?.content || files.find(f => f.language === "html")?.content || "<html><body><p>No index.html</p></body></html>";
    const css = files.filter(f => f.language === "css").map(f => f.content).join("\n");
    const js = files.filter(f => f.language === "javascript").map(f => f.content).join("\n");
    let out = html;
    if (!/<html/i.test(out)) out = `<!doctype html><html><head></head><body>${out}</body></html>`;
    if (css) out = out.replace(/<\/head>/i, `<style>${css}</style></head>`);
    if (js) out = out.replace(/<\/body>/i, `<script>${js}</script></body>`);
    return out;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files, activeFile]);

  const save = async () => {
    if (!title || !slug) { toast({ title: "Title and slug required", variant: "destructive" }); return; }
    setSaving(true);
    try {
      const indexFile = getFile("index.html") || files.find(f => f.language === "html");
      const cssFile = files.find(f => f.language === "css");
      const jsFile = files.find(f => f.language === "javascript");
      const payload = {
        title,
        slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
        route_override: routeOverride.trim() ? routeOverride.trim() : null,
        html_content: indexFile?.content || "",
        css_content: cssFile?.content || null,
        js_content: jsFile?.content || null,
        files: files as any,
        meta_description: meta || null,
        is_published: isPublished,
        show_in_sidebar: showInSidebar,
        created_by: user?.id,
      };
      if (selected) {
        const { error } = await supabase.from("admin_custom_pages").update(payload).eq("id", selected.id);
        if (error) throw error;
        toast({ title: "Saved" });
      } else {
        const { error } = await supabase.from("admin_custom_pages").insert(payload);
        if (error) throw error;
        toast({ title: "Created" });
      }
      invalidateRouteOverrideCache();
      await load();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const del = async () => {
    if (!selected || !confirm("Delete this page?")) return;
    await supabase.from("admin_custom_pages").delete().eq("id", selected.id);
    invalidateRouteOverrideCache();
    setSelected(null);
    load();
  };

  const active = getFile(activeFile);

  return (
    <div className="container max-w-[1600px] py-4">
      <div className="grid grid-cols-12 gap-4">
        {/* Pages list */}
        <Card className="col-span-12 lg:col-span-2">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Pages</CardTitle>
            <Button size="sm" variant="ghost" onClick={newPage}><Plus className="h-4 w-4" /></Button>
          </CardHeader>
          <CardContent className="p-2">
            <ScrollArea className="h-[75vh]">
              {loading ? <p className="text-xs text-muted-foreground p-2">Loading...</p> :
                pages.map(p => (
                  <button key={p.id} onClick={() => open(p)}
                    className={`w-full text-left px-2 py-1.5 rounded text-xs ${selected?.id===p.id?"bg-primary/10 text-primary":"hover:bg-muted"}`}>
                    <div className="flex items-center justify-between gap-1">
                      <span className="truncate font-medium">{p.title}</span>
                      {p.is_published && <Badge variant="outline" className="text-[10px] py-0">live</Badge>}
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate">
                      {p.route_override || `/p/${p.slug}`}
                    </div>
                  </button>
                ))}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* File tree */}
        <Card className="col-span-12 lg:col-span-2">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Files</CardTitle>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={addFile} title="New file"><FilePlus className="h-3.5 w-3.5" /></Button>
              <Button size="sm" variant="ghost" onClick={addFolder} title="New folder"><FolderPlus className="h-3.5 w-3.5" /></Button>
            </div>
          </CardHeader>
          <CardContent className="p-2">
            <ScrollArea className="h-[75vh]">
              {files.length === 0 ? <p className="text-xs text-muted-foreground p-2">Select or create a page</p> :
                files.map(f => (
                  <div key={f.path} className={`group flex items-center justify-between gap-1 px-2 py-1 rounded text-xs ${activeFile===f.path?"bg-primary/10 text-primary":"hover:bg-muted"}`}>
                    <button onClick={() => setActiveFile(f.path)} className="flex-1 text-left flex items-center gap-1.5 truncate">
                      <FileCode className="h-3 w-3 shrink-0" />
                      <span className="truncate font-mono">{f.path}</span>
                    </button>
                    <button onClick={() => removeFile(f.path)} className="opacity-0 group-hover:opacity-100"><Trash2 className="h-3 w-3 text-destructive" /></button>
                  </div>
                ))}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Editor + meta */}
        <Card className="col-span-12 lg:col-span-8">
          <CardHeader className="pb-2">
            <div className="flex flex-wrap items-center gap-2">
              <Input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} className="h-8 w-48" />
              <Input placeholder="slug" value={slug} onChange={e=>setSlug(e.target.value)} className="h-8 w-40 font-mono text-xs" />
              <Input placeholder="route override (e.g. /dashboard)" value={routeOverride} onChange={e=>setRouteOverride(e.target.value)} className="h-8 w-56 font-mono text-xs" />
              <div className="flex items-center gap-1"><Switch checked={isPublished} onCheckedChange={setIsPublished}/><Label className="text-xs">Published</Label></div>
              <div className="flex items-center gap-1"><Switch checked={showInSidebar} onCheckedChange={setShowInSidebar}/><Label className="text-xs">In sidebar</Label></div>
              <div className="flex-1" />
              <Button size="sm" variant="outline" onClick={() => setShowPreview(s => !s)}><Eye className="h-3.5 w-3.5 mr-1"/>{showPreview?"Hide":"Preview"}</Button>
              {selected?.is_published && (
                <Button size="sm" variant="ghost" asChild><a href={selected.route_override || `/p/${selected.slug}`} target="_blank"><ExternalLink className="h-3.5 w-3.5"/></a></Button>
              )}
              {selected && <Button size="sm" variant="ghost" onClick={del}><Trash2 className="h-3.5 w-3.5 text-destructive"/></Button>}
              <Button size="sm" onClick={save} disabled={saving || files.length===0}><Save className="h-3.5 w-3.5 mr-1"/>{saving?"Saving":"Save"}</Button>
            </div>
            <Input placeholder="Meta description (SEO)" value={meta} onChange={e=>setMeta(e.target.value)} className="h-8 mt-2 text-xs" />
          </CardHeader>
          <CardContent>
            {!active ? (
              <p className="text-sm text-muted-foreground text-center py-16">Select a file to edit or create a new page</p>
            ) : (
              <Tabs defaultValue="code">
                <div className="flex items-center justify-between mb-2">
                  <TabsList className="h-8">
                    <TabsTrigger value="code" className="text-xs">Code</TabsTrigger>
                    {showPreview && <TabsTrigger value="preview" className="text-xs">Preview</TabsTrigger>}
                  </TabsList>
                  <div className="flex items-center gap-2">
                    <Input value={active.path} onChange={e => updateActive({ path: e.target.value, language: inferLang(e.target.value) })} className="h-7 w-56 font-mono text-xs" />
                    <select value={active.language} onChange={e => updateActive({ language: e.target.value })} className="h-7 text-xs bg-background border rounded px-2">
                      {LANGS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                </div>
                <TabsContent value="code">
                  <Textarea
                    value={active.content}
                    onChange={e => updateActive({ content: e.target.value })}
                    className="font-mono text-xs min-h-[65vh] bg-muted/30"
                    spellCheck={false}
                  />
                </TabsContent>
                {showPreview && (
                  <TabsContent value="preview">
                    <iframe srcDoc={previewHtml} className="w-full min-h-[65vh] border rounded bg-white" sandbox="allow-scripts allow-forms" title="preview" />
                  </TabsContent>
                )}
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
