import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Hammer, Plus, Play, Trash2, Copy, Download, Eye, Code, 
  Sparkles, Layout, Type, Image, Square, CircleDot, 
  MousePointer, Layers, Settings, Palette, Save, Share2,
  Rocket, FolderOpen, Clock, Star, Zap, Grid3X3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

interface ForgeElement {
  id: string;
  type: "heading" | "text" | "button" | "image" | "card" | "input" | "divider" | "list" | "chart" | "timer";
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  styles: Record<string, string>;
}

interface ForgeProject {
  id: string;
  name: string;
  description: string;
  elements: ForgeElement[];
  createdAt: string;
  updatedAt: string;
  status: "draft" | "published" | "archived";
  category: string;
  thumbnail?: string;
}

const STARTER_TEMPLATES = [
  { id: "flashcard-app", name: "Flashcard Widget", description: "Interactive flashcard study tool", category: "Study", icon: "📚", elements: 6 },
  { id: "pomodoro-widget", name: "Pomodoro Timer", description: "Customizable focus timer widget", category: "Productivity", icon: "⏱️", elements: 4 },
  { id: "habit-tracker", name: "Habit Tracker", description: "Daily habit tracking micro-app", category: "Health", icon: "✅", elements: 8 },
  { id: "mood-board", name: "Mood Board", description: "Visual mood & inspiration collector", category: "Creative", icon: "🎨", elements: 5 },
  { id: "quiz-maker", name: "Quiz Maker", description: "Build interactive quizzes", category: "Education", icon: "❓", elements: 7 },
  { id: "budget-tracker", name: "Budget Tracker", description: "Simple expense tracking widget", category: "Finance", icon: "💰", elements: 6 },
  { id: "kanban-board", name: "Kanban Board", description: "Task management board", category: "Productivity", icon: "📋", elements: 5 },
  { id: "note-widget", name: "Sticky Notes", description: "Quick note-taking widget", category: "Productivity", icon: "📝", elements: 3 },
];

const ELEMENT_TYPES = [
  { type: "heading", icon: Type, label: "Heading" },
  { type: "text", icon: Type, label: "Text" },
  { type: "button", icon: Square, label: "Button" },
  { type: "image", icon: Image, label: "Image" },
  { type: "card", icon: Layout, label: "Card" },
  { type: "input", icon: Type, label: "Input" },
  { type: "divider", icon: Grid3X3, label: "Divider" },
  { type: "list", icon: Layers, label: "List" },
  { type: "chart", icon: CircleDot, label: "Chart" },
  { type: "timer", icon: Clock, label: "Timer" },
] as const;

export default function XForge() {
  const [projects, setProjects] = useState<ForgeProject[]>([
    {
      id: "demo-1",
      name: "My Study Dashboard",
      description: "A personalized study tracking widget",
      elements: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "draft",
      category: "Study",
    },
  ]);
  const [activeProject, setActiveProject] = useState<ForgeProject | null>(null);
  const [activeView, setActiveView] = useState<"projects" | "editor" | "preview">("projects");
  const [selectedElement, setSelectedElement] = useState<ForgeElement | null>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [draggedType, setDraggedType] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState("");
  const [showNewProject, setShowNewProject] = useState(false);

  const createProject = (name: string, template?: typeof STARTER_TEMPLATES[0]) => {
    const project: ForgeProject = {
      id: `forge-${Date.now()}`,
      name: name || "Untitled Project",
      description: template?.description || "A new XForge project",
      elements: template ? generateTemplateElements(template.id) : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "draft",
      category: template?.category || "General",
    };
    setProjects(prev => [project, ...prev]);
    setActiveProject(project);
    setActiveView("editor");
    setShowNewProject(false);
    toast({ title: "Project created", description: `${project.name} is ready to build.` });
  };

  const generateTemplateElements = (templateId: string): ForgeElement[] => {
    const base: ForgeElement[] = [
      { id: `el-${Date.now()}-1`, type: "heading", content: "My Widget", x: 20, y: 20, width: 300, height: 40, styles: {} },
      { id: `el-${Date.now()}-2`, type: "text", content: "Click elements to customize", x: 20, y: 70, width: 300, height: 30, styles: {} },
      { id: `el-${Date.now()}-3`, type: "button", content: "Action", x: 20, y: 120, width: 120, height: 40, styles: {} },
    ];
    return base;
  };

  const addElement = (type: ForgeElement["type"]) => {
    if (!activeProject) return;
    const el: ForgeElement = {
      id: `el-${Date.now()}`,
      type,
      content: type === "heading" ? "New Heading" : type === "button" ? "Click Me" : type === "timer" ? "25:00" : "New element",
      x: 20 + Math.random() * 200,
      y: 80 + Math.random() * 200,
      width: type === "card" ? 280 : type === "divider" ? 400 : 200,
      height: type === "card" ? 160 : type === "divider" ? 4 : 40,
      styles: {},
    };
    const updated = { ...activeProject, elements: [...activeProject.elements, el], updatedAt: new Date().toISOString() };
    setActiveProject(updated);
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
    setSelectedElement(el);
  };

  const deleteElement = (id: string) => {
    if (!activeProject) return;
    const updated = { ...activeProject, elements: activeProject.elements.filter(e => e.id !== id) };
    setActiveProject(updated);
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
    setSelectedElement(null);
  };

  const aiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    // Simulated AI generation
    await new Promise(r => setTimeout(r, 2000));
    const elements: ForgeElement[] = [
      { id: `el-${Date.now()}-a1`, type: "heading", content: aiPrompt.split(" ").slice(0, 4).join(" "), x: 20, y: 20, width: 350, height: 44, styles: {} },
      { id: `el-${Date.now()}-a2`, type: "card", content: "Generated content based on your prompt", x: 20, y: 80, width: 350, height: 140, styles: {} },
      { id: `el-${Date.now()}-a3`, type: "button", content: "Get Started", x: 20, y: 240, width: 140, height: 42, styles: {} },
      { id: `el-${Date.now()}-a4`, type: "text", content: "AI-generated layout based on: " + aiPrompt, x: 20, y: 300, width: 350, height: 30, styles: {} },
    ];
    if (activeProject) {
      const updated = { ...activeProject, elements, updatedAt: new Date().toISOString() };
      setActiveProject(updated);
      setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
    } else {
      createProject("AI Generated: " + aiPrompt.slice(0, 30));
    }
    setIsGenerating(false);
    setAiPrompt("");
    toast({ title: "AI Generated", description: "Layout created from your prompt." });
  };

  const renderElement = (el: ForgeElement) => {
    const isSelected = selectedElement?.id === el.id;
    const baseClass = `absolute cursor-pointer transition-all duration-200 ${isSelected ? "ring-2 ring-primary shadow-[0_0_16px_hsl(var(--primary)/0.4)]" : "hover:ring-1 hover:ring-primary/40"}`;

    switch (el.type) {
      case "heading":
        return (
          <div key={el.id} className={baseClass} style={{ left: el.x, top: el.y, width: el.width }} onClick={() => setSelectedElement(el)}>
            <h2 className="text-xl font-bold text-foreground tracking-tight">{el.content}</h2>
          </div>
        );
      case "text":
        return (
          <div key={el.id} className={baseClass} style={{ left: el.x, top: el.y, width: el.width }} onClick={() => setSelectedElement(el)}>
            <p className="text-sm text-muted-foreground">{el.content}</p>
          </div>
        );
      case "button":
        return (
          <div key={el.id} className={baseClass} style={{ left: el.x, top: el.y }} onClick={() => setSelectedElement(el)}>
            <Button size="sm" variant="default">{el.content}</Button>
          </div>
        );
      case "card":
        return (
          <div key={el.id} className={`${baseClass} rounded-lg border bg-card/80 backdrop-blur-sm p-4`} style={{ left: el.x, top: el.y, width: el.width, minHeight: el.height }} onClick={() => setSelectedElement(el)}>
            <p className="text-sm text-card-foreground">{el.content}</p>
          </div>
        );
      case "input":
        return (
          <div key={el.id} className={baseClass} style={{ left: el.x, top: el.y, width: el.width }} onClick={() => setSelectedElement(el)}>
            <Input placeholder={el.content} readOnly className="pointer-events-none" />
          </div>
        );
      case "divider":
        return (
          <div key={el.id} className={`${baseClass} h-px bg-border`} style={{ left: el.x, top: el.y, width: el.width }} onClick={() => setSelectedElement(el)} />
        );
      case "timer":
        return (
          <div key={el.id} className={`${baseClass} text-center`} style={{ left: el.x, top: el.y }} onClick={() => setSelectedElement(el)}>
            <span className="text-3xl font-mono font-bold text-primary">{el.content}</span>
          </div>
        );
      case "chart":
        return (
          <div key={el.id} className={`${baseClass} rounded-lg border bg-card/50 p-3 flex items-end gap-1`} style={{ left: el.x, top: el.y, width: el.width, height: el.height }} onClick={() => setSelectedElement(el)}>
            {[40, 65, 30, 80, 55, 70, 45].map((h, i) => (
              <div key={i} className="flex-1 bg-primary/60 rounded-t" style={{ height: `${h}%` }} />
            ))}
          </div>
        );
      default:
        return (
          <div key={el.id} className={`${baseClass} rounded border bg-muted p-2`} style={{ left: el.x, top: el.y, width: el.width, height: el.height }} onClick={() => setSelectedElement(el)}>
            <span className="text-xs text-muted-foreground">{el.type}: {el.content}</span>
          </div>
        );
    }
  };

  // PROJECTS VIEW
  if (activeView === "projects") {
    return (
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary via-accent to-primary/60 flex items-center justify-center shadow-[0_0_24px_hsl(var(--primary)/0.4)]">
            <Hammer className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">XForge</h1>
            <p className="text-sm text-muted-foreground">Build micro-apps, widgets & tools visually</p>
          </div>
          <div className="ml-auto flex gap-2">
            <Dialog open={showNewProject} onOpenChange={setShowNewProject}>
              <DialogTrigger asChild>
                <Button className="gap-2"><Plus className="h-4 w-4" /> New Project</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input placeholder="Project name..." value={newProjectName} onChange={e => setNewProjectName(e.target.value)} />
                  <Button className="w-full" onClick={() => createProject(newProjectName)}>
                    <Rocket className="h-4 w-4 mr-2" /> Create Blank Project
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* AI Quick Generate */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                <span className="text-sm font-medium">AI Quick Build</span>
              </div>
              <div className="flex gap-2 mt-3">
                <Input placeholder="Describe what you want to build... e.g. 'A study tracker with daily goals'" value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} onKeyDown={e => e.key === "Enter" && aiGenerate()} className="flex-1" />
                <Button onClick={aiGenerate} disabled={isGenerating || !aiPrompt.trim()} className="gap-2">
                  {isGenerating ? <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <Zap className="h-4 w-4" />}
                  Generate
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Templates */}
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><Layout className="h-4 w-4 text-primary" /> Starter Templates</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {STARTER_TEMPLATES.map((tmpl, i) => (
              <motion.div key={tmpl.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="group cursor-pointer hover:border-primary/40 hover:shadow-[0_0_16px_hsl(var(--primary)/0.15)] transition-all" onClick={() => createProject(tmpl.name, tmpl)}>
                  <CardContent className="p-4 text-center">
                    <span className="text-3xl mb-2 block">{tmpl.icon}</span>
                    <h3 className="font-semibold text-sm">{tmpl.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{tmpl.description}</p>
                    <Badge variant="secondary" className="mt-2 text-[10px]">{tmpl.category}</Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* My Projects */}
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><FolderOpen className="h-4 w-4 text-primary" /> My Projects</h2>
          {projects.length === 0 ? (
            <Card className="border-dashed border-2 border-muted-foreground/20">
              <CardContent className="p-8 text-center">
                <Hammer className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No projects yet. Create one or use a template!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                  <Card className="group cursor-pointer hover:border-primary/30 transition-all" onClick={() => { setActiveProject(p); setActiveView("editor"); }}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold">{p.name}</h3>
                        <Badge variant={p.status === "published" ? "default" : "secondary"} className="text-[10px]">{p.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">{p.description}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{p.elements.length} elements</span>
                        <span>{new Date(p.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Projects", value: projects.length, icon: FolderOpen },
            { label: "Published", value: projects.filter(p => p.status === "published").length, icon: Rocket },
            { label: "Templates Used", value: 0, icon: Layout },
            { label: "Total Elements", value: projects.reduce((s, p) => s + p.elements.length, 0), icon: Layers },
          ].map((stat, i) => (
            <Card key={i} className="border-muted">
              <CardContent className="p-3 flex items-center gap-3">
                <stat.icon className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-lg font-bold">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // EDITOR VIEW
  return (
    <div className="space-y-4">
      {/* Editor Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="ghost" size="sm" onClick={() => { setActiveView("projects"); setActiveProject(null); setSelectedElement(null); }}>
          ← Back
        </Button>
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Hammer className="h-4 w-4 text-primary-foreground" />
        </div>
        <h1 className="text-xl font-bold">{activeProject?.name || "Untitled"}</h1>
        <Badge variant="secondary">{activeProject?.status}</Badge>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setActiveView(activeView === "preview" ? "editor" : "preview")}>
            {activeView === "preview" ? <Code className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
            {activeView === "preview" ? "Edit" : "Preview"}
          </Button>
          <Button size="sm" onClick={() => { 
            if (activeProject) {
              const updated = { ...activeProject, status: "published" as const };
              setActiveProject(updated);
              setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
              toast({ title: "Published!", description: `${activeProject.name} is now live.` });
            }
          }}>
            <Rocket className="h-4 w-4 mr-1" /> Publish
          </Button>
        </div>
      </div>

      <div className="flex gap-4 h-[calc(100vh-220px)]">
        {/* Element Palette */}
        {activeView === "editor" && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="w-48 flex-shrink-0 space-y-2 overflow-y-auto">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Elements</p>
            {ELEMENT_TYPES.map(et => (
              <Button key={et.type} variant="outline" size="sm" className="w-full justify-start gap-2 text-xs" onClick={() => addElement(et.type as ForgeElement["type"])}>
                <et.icon className="h-3.5 w-3.5" /> {et.label}
              </Button>
            ))}
            <div className="border-t border-border my-3" />
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">AI Assist</p>
            <Textarea placeholder="Describe a component..." value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} className="text-xs h-20 resize-none" />
            <Button size="sm" className="w-full gap-1" onClick={aiGenerate} disabled={isGenerating}>
              <Sparkles className="h-3.5 w-3.5" /> Generate
            </Button>
          </motion.div>
        )}

        {/* Canvas */}
        <div className="flex-1 rounded-xl border bg-background/50 backdrop-blur-sm relative overflow-auto">
          <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle, hsl(var(--muted-foreground) / 0.08) 1px, transparent 1px)", backgroundSize: "20px 20px" }}>
            {activeProject?.elements.map(el => renderElement(el))}
            {activeProject?.elements.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <MousePointer className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">Add elements from the palette or use AI to generate</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Properties Panel */}
        {activeView === "editor" && selectedElement && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-56 flex-shrink-0 space-y-3 overflow-y-auto">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Properties</p>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteElement(selectedElement.id)}>
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Type</label>
              <Badge variant="secondary" className="text-xs">{selectedElement.type}</Badge>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Content</label>
              <Input value={selectedElement.content} onChange={e => {
                const updated = { ...selectedElement, content: e.target.value };
                setSelectedElement(updated);
                if (activeProject) {
                  const proj = { ...activeProject, elements: activeProject.elements.map(el => el.id === updated.id ? updated : el) };
                  setActiveProject(proj);
                  setProjects(prev => prev.map(p => p.id === proj.id ? proj : p));
                }
              }} className="text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-muted-foreground">X</label>
                <Input type="number" value={selectedElement.x} onChange={e => {
                  const updated = { ...selectedElement, x: Number(e.target.value) };
                  setSelectedElement(updated);
                  if (activeProject) {
                    const proj = { ...activeProject, elements: activeProject.elements.map(el => el.id === updated.id ? updated : el) };
                    setActiveProject(proj);
                    setProjects(prev => prev.map(p => p.id === proj.id ? proj : p));
                  }
                }} className="text-xs h-8" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">Y</label>
                <Input type="number" value={selectedElement.y} onChange={e => {
                  const updated = { ...selectedElement, y: Number(e.target.value) };
                  setSelectedElement(updated);
                  if (activeProject) {
                    const proj = { ...activeProject, elements: activeProject.elements.map(el => el.id === updated.id ? updated : el) };
                    setActiveProject(proj);
                    setProjects(prev => prev.map(p => p.id === proj.id ? proj : p));
                  }
                }} className="text-xs h-8" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-muted-foreground">Width</label>
                <Input type="number" value={selectedElement.width} onChange={e => {
                  const updated = { ...selectedElement, width: Number(e.target.value) };
                  setSelectedElement(updated);
                  if (activeProject) {
                    const proj = { ...activeProject, elements: activeProject.elements.map(el => el.id === updated.id ? updated : el) };
                    setActiveProject(proj);
                    setProjects(prev => prev.map(p => p.id === proj.id ? proj : p));
                  }
                }} className="text-xs h-8" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">Height</label>
                <Input type="number" value={selectedElement.height} onChange={e => {
                  const updated = { ...selectedElement, height: Number(e.target.value) };
                  setSelectedElement(updated);
                  if (activeProject) {
                    const proj = { ...activeProject, elements: activeProject.elements.map(el => el.id === updated.id ? updated : el) };
                    setActiveProject(proj);
                    setProjects(prev => prev.map(p => p.id === proj.id ? proj : p));
                  }
                }} className="text-xs h-8" />
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full gap-1 text-xs" onClick={() => {
              const dup: ForgeElement = { ...selectedElement, id: `el-${Date.now()}`, x: selectedElement.x + 20, y: selectedElement.y + 20 };
              if (activeProject) {
                const proj = { ...activeProject, elements: [...activeProject.elements, dup] };
                setActiveProject(proj);
                setProjects(prev => prev.map(p => p.id === proj.id ? proj : p));
                setSelectedElement(dup);
              }
            }}>
              <Copy className="h-3 w-3" /> Duplicate
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
