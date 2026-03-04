import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FolderOpen, Globe, Code, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Project {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_published: boolean;
  project_type: string;
  created_at: string;
}

interface ProjectFile {
  id: string;
  filename: string;
  content: string;
  file_type: string;
}

export function XstellarProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadProjects(); }, []);

  const loadProjects = async () => {
    const { data } = await supabase.from("xstellar_projects" as any).select("*").order("created_at", { ascending: false });
    setProjects((data as any[]) || []);
    setLoading(false);
  };

  const createProject = async () => {
    if (!newName.trim() || !user) return;
    setSaving(true);
    const slug = newName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const { data, error } = await supabase.from("xstellar_projects" as any).insert({
      name: newName, slug, description: newDesc || null, owner_id: user.id,
    } as any).select().single();
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    else {
      // Create default files
      await supabase.from("xstellar_project_files" as any).insert([
        { project_id: (data as any).id, filename: "index.html", content: `<!DOCTYPE html>\n<html>\n<head>\n  <title>${newName}</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <h1>Hello from ${newName}!</h1>\n  <script src="app.js"></script>\n</body>\n</html>`, file_type: "html" },
        { project_id: (data as any).id, filename: "style.css", content: "body {\n  font-family: system-ui, sans-serif;\n  margin: 0;\n  padding: 2rem;\n  background: #0a0a0a;\n  color: #fafafa;\n}", file_type: "css" },
        { project_id: (data as any).id, filename: "app.js", content: 'console.log("Project loaded!");', file_type: "js" },
      ] as any);
      toast({ title: "Project created" });
      setCreateOpen(false);
      setNewName("");
      setNewDesc("");
      loadProjects();
    }
    setSaving(false);
  };

  const selectProject = async (project: Project) => {
    setSelectedProject(project);
    const { data } = await supabase.from("xstellar_project_files" as any).select("*").eq("project_id", project.id);
    setFiles((data as any[]) || []);
    setSelectedFile(null);
  };

  const saveFile = async () => {
    if (!selectedFile) return;
    setSaving(true);
    await supabase.from("xstellar_project_files" as any).update({ content: selectedFile.content } as any).eq("id", selectedFile.id);
    toast({ title: "File saved" });
    setSaving(false);
  };

  const togglePublish = async (project: Project) => {
    await supabase.from("xstellar_projects" as any).update({ is_published: !project.is_published } as any).eq("id", project.id);
    loadProjects();
    toast({ title: project.is_published ? "Unpublished" : "Published!" });
  };

  const deleteProject = async (id: string) => {
    await supabase.from("xstellar_projects" as any).delete().eq("id", id);
    if (selectedProject?.id === id) { setSelectedProject(null); setFiles([]); }
    loadProjects();
    toast({ title: "Project deleted" });
  };

  const previewProject = () => {
    if (!selectedProject) return;
    const htmlFile = files.find(f => f.filename.endsWith(".html"));
    const cssFile = files.find(f => f.filename.endsWith(".css"));
    const jsFile = files.find(f => f.filename.endsWith(".js"));
    const html = `<!DOCTYPE html><html><head><style>${cssFile?.content || ""}</style></head><body>${htmlFile?.content?.replace(/<\/?html>|<\/?head>|<\/?body>|<link[^>]*>|<script[^>]*>.*?<\/script>/gs, "") || ""}<script>${jsFile?.content || ""}<\/script></body></html>`;
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* Project List */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2"><FolderOpen className="h-4 w-4" /> Projects</CardTitle>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild><Button size="sm" variant="outline" className="h-7 text-xs"><Plus className="h-3 w-3 mr-1" />New</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Project</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Project name" value={newName} onChange={e => setNewName(e.target.value)} />
                  <Textarea placeholder="Description (optional)" value={newDesc} onChange={e => setNewDesc(e.target.value)} className="min-h-[60px]" />
                  <Button onClick={createProject} disabled={saving || !newName.trim()} className="w-full">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Create
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[60vh]">
            <div className="space-y-1 p-2">
              {projects.map(p => (
                <button key={p.id} onClick={() => selectProject(p)}
                  className={`w-full text-left px-3 py-2.5 rounded-md text-sm transition-colors ${selectedProject?.id === p.id ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}>
                  <div className="flex items-center justify-between">
                    <span className="truncate font-medium">{p.name}</span>
                    <div className="flex gap-1">
                      {p.is_published && <Badge variant="secondary" className="text-[10px] h-4">Live</Badge>}
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate mt-0.5">/x/{p.slug}</p>
                </button>
              ))}
              {projects.length === 0 && <p className="text-xs text-muted-foreground text-center py-8">No projects yet</p>}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Editor */}
      <Card className="lg:col-span-3">
        {selectedProject ? (
          <>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle className="text-sm">{selectedProject.name}</CardTitle>
                  <p className="text-[10px] text-muted-foreground">/x/{selectedProject.slug}</p>
                </div>
                <div className="flex gap-1.5">
                  <Button size="sm" variant="outline" className="text-xs h-7" onClick={previewProject}>
                    <ExternalLink className="h-3 w-3 mr-1" />Preview
                  </Button>
                  <Button size="sm" variant={selectedProject.is_published ? "secondary" : "default"} className="text-xs h-7"
                    onClick={() => togglePublish(selectedProject)}>
                    <Globe className="h-3 w-3 mr-1" />{selectedProject.is_published ? "Unpublish" : "Publish"}
                  </Button>
                  <Button size="sm" variant="ghost" className="text-xs h-7 text-destructive" onClick={() => deleteProject(selectedProject.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-3 flex-wrap">
                {files.map(f => (
                  <Button key={f.id} size="sm" variant={selectedFile?.id === f.id ? "default" : "outline"}
                    className="text-xs h-7" onClick={() => setSelectedFile(f)}>
                    <Code className="h-3 w-3 mr-1" />{f.filename}
                  </Button>
                ))}
              </div>
              {selectedFile ? (
                <div className="space-y-2">
                  <Textarea value={selectedFile.content}
                    onChange={e => setSelectedFile({ ...selectedFile, content: e.target.value })}
                    className="font-mono text-xs min-h-[400px] bg-muted/30"
                    onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === "s") { e.preventDefault(); saveFile(); } }} />
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-muted-foreground">⌘+S to save</span>
                    <Button size="sm" onClick={saveFile} disabled={saving} className="text-xs">
                      {saving ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-muted-foreground text-sm">Select a file to edit</div>
              )}
            </CardContent>
          </>
        ) : (
          <CardContent className="py-16">
            <div className="text-center text-muted-foreground text-sm">Select a project or create a new one</div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
