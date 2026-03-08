import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Video, FileText, BookOpen, Upload, ExternalLink, Users,
  Calendar, GraduationCap, Brain, Timer, Gamepad2, MessageCircle,
  Link2, Orbit, CheckSquare, Clock, Plus, Trash2, Edit3
} from "lucide-react";

interface LiveClass {
  id: string;
  title: string;
  subject: string;
  description: string | null;
  scheduled_start: string | null;
  scheduled_end: string | null;
  status: string | null;
  class_link: string | null;
  start_time: string;
  end_time: string;
}

interface StudyMaterial {
  id: string;
  title: string;
  type: 'pdf' | 'link';
  url: string;
  subject?: string;
  addedAt: string;
}

const shortcuts = [
  { label: "Scheduler", icon: Calendar, path: "/niranx/scheduler" },
  { label: "XOrbit", icon: Orbit, path: "/niranx/xorbit" },
  { label: "Focus Engine", icon: Timer, path: "/niranx/focus-engine" },
  { label: "AI Chat", icon: Brain, path: "/niranx/ai-chat" },
  { label: "Tasks", icon: CheckSquare, path: "/niranx/tasks" },
  { label: "Debates", icon: MessageCircle, path: "/niranx/debates" },
  { label: "Exam Hub", icon: GraduationCap, path: "/niranx/exam-hub" },
  { label: "Games", icon: Gamepad2, path: "/niranx/games" },
];

export default function YourClasses() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [newMaterial, setNewMaterial] = useState({ title: "", url: "", subject: "", type: "link" as "pdf" | "link" });
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [addClassOpen, setAddClassOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<LiveClass | null>(null);
  const [classForm, setClassForm] = useState({
    title: "", subject: "", description: "", class_link: "",
    start_time: "", end_time: "",
  });

  const fetchClasses = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("live_classes")
      .select("id, title, subject, description, scheduled_start, scheduled_end, status, class_link, start_time, end_time")
      .eq("user_id", user.id)
      .order("start_time", { ascending: true });
    if (data) setLiveClasses(data as any);
  }, [user]);

  useEffect(() => { fetchClasses(); }, [fetchClasses]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('your-classes-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'live_classes',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        fetchClasses();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchClasses]);

  useEffect(() => {
    const saved = localStorage.getItem("yourClasses_materials");
    if (saved) setMaterials(JSON.parse(saved));
  }, []);

  const addClass = async () => {
    if (!user || !classForm.title || !classForm.subject) {
      toast.error("Title and subject are required");
      return;
    }
    const startTime = classForm.start_time || new Date().toISOString();
    const endTime = classForm.end_time || new Date(Date.now() + 3600000).toISOString();
    
    const { error } = await supabase.from("live_classes").insert({
      user_id: user.id,
      title: classForm.title,
      subject: classForm.subject,
      description: classForm.description || null,
      class_link: classForm.class_link || null,
      start_time: startTime,
      end_time: endTime,
      scheduled_start: startTime,
      scheduled_end: endTime,
      status: "scheduled",
    });
    if (error) { toast.error("Failed to add class"); return; }
    toast.success("Class added!");
    setClassForm({ title: "", subject: "", description: "", class_link: "", start_time: "", end_time: "" });
    setAddClassOpen(false);
    fetchClasses();
  };

  const updateClass = async () => {
    if (!editingClass) return;
    const { error } = await supabase.from("live_classes").update({
      title: classForm.title,
      subject: classForm.subject,
      description: classForm.description || null,
      class_link: classForm.class_link || null,
      start_time: classForm.start_time || editingClass.start_time,
      end_time: classForm.end_time || editingClass.end_time,
    }).eq("id", editingClass.id);
    if (error) { toast.error("Failed to update"); return; }
    toast.success("Class updated!");
    setEditingClass(null);
    setClassForm({ title: "", subject: "", description: "", class_link: "", start_time: "", end_time: "" });
    fetchClasses();
  };

  const deleteClass = async (id: string) => {
    const { error } = await supabase.from("live_classes").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    toast.success("Class deleted");
    fetchClasses();
  };

  const openEditDialog = (cls: LiveClass) => {
    setEditingClass(cls);
    setClassForm({
      title: cls.title,
      subject: cls.subject,
      description: cls.description || "",
      class_link: cls.class_link || "",
      start_time: cls.start_time,
      end_time: cls.end_time,
    });
  };

  const addMaterial = () => {
    if (!newMaterial.title || !newMaterial.url) { toast.error("Title and URL required"); return; }
    const mat: StudyMaterial = { ...newMaterial, id: crypto.randomUUID(), addedAt: new Date().toISOString() };
    const updated = [...materials, mat];
    setMaterials(updated);
    localStorage.setItem("yourClasses_materials", JSON.stringify(updated));
    setNewMaterial({ title: "", url: "", subject: "", type: "link" });
    setShowAddMaterial(false);
    toast.success("Material added!");
  };

  const removeMaterial = (id: string) => {
    const updated = materials.filter(m => m.id !== id);
    setMaterials(updated);
    localStorage.setItem("yourClasses_materials", JSON.stringify(updated));
  };

  const ClassFormContent = ({ onSubmit, submitLabel }: { onSubmit: () => void; submitLabel: string }) => (
    <div className="space-y-4">
      <Input placeholder="Class Title *" value={classForm.title} onChange={e => setClassForm(p => ({ ...p, title: e.target.value }))} />
      <Input placeholder="Subject *" value={classForm.subject} onChange={e => setClassForm(p => ({ ...p, subject: e.target.value }))} />
      <Textarea placeholder="Description (optional)" value={classForm.description} onChange={e => setClassForm(p => ({ ...p, description: e.target.value }))} />
      <Input placeholder="Class Link (Meet/Zoom URL)" value={classForm.class_link} onChange={e => setClassForm(p => ({ ...p, class_link: e.target.value }))} />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Start Time</label>
          <Input type="datetime-local" value={classForm.start_time ? classForm.start_time.slice(0, 16) : ""} onChange={e => setClassForm(p => ({ ...p, start_time: new Date(e.target.value).toISOString() }))} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">End Time</label>
          <Input type="datetime-local" value={classForm.end_time ? classForm.end_time.slice(0, 16) : ""} onChange={e => setClassForm(p => ({ ...p, end_time: new Date(e.target.value).toISOString() }))} />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => { setAddClassOpen(false); setEditingClass(null); }}>Cancel</Button>
        <Button onClick={onSubmit}>{submitLabel}</Button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text flex items-center gap-2">
            <GraduationCap className="h-8 w-8" />
            Your Classes
          </h1>
          <p className="text-muted-foreground mt-1">Classes, materials, and quick access to tools</p>
        </div>
        <Dialog open={addClassOpen} onOpenChange={setAddClassOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setClassForm({ title: "", subject: "", description: "", class_link: "", start_time: "", end_time: "" }); }}>
              <Plus className="h-4 w-4 mr-1" /> Add Class
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Class</DialogTitle></DialogHeader>
            <ClassFormContent onSubmit={addClass} submitLabel="Add Class" />
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {shortcuts.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <Button variant="outline" className="w-full h-auto flex-col gap-1.5 py-3 text-xs" onClick={() => navigate(s.path)}>
              <s.icon className="h-5 w-5 text-primary" />
              {s.label}
            </Button>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="live-classes">
        <TabsList>
          <TabsTrigger value="live-classes">
            <Video className="h-4 w-4 mr-1" /> Live Classes
          </TabsTrigger>
          <TabsTrigger value="materials">
            <BookOpen className="h-4 w-4 mr-1" /> Study Materials
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live-classes" className="space-y-4">
          {liveClasses.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Video className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No upcoming classes</p>
                <p className="text-sm">Add your classes with the button above</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {liveClasses.map((cls, i) => (
                <motion.div key={cls.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="hover:border-primary/50 transition-all">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{cls.title}</CardTitle>
                        <Badge variant={cls.status === "live" ? "destructive" : "secondary"}>
                          {cls.status === "live" ? "● LIVE" : cls.status || "Scheduled"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-xs font-medium text-primary">{cls.subject}</p>
                      {cls.description && <p className="text-xs text-muted-foreground line-clamp-2">{cls.description}</p>}
                      {cls.scheduled_start && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(cls.scheduled_start).toLocaleString()}
                        </div>
                      )}
                      <div className="flex gap-2 pt-1 flex-wrap">
                        {cls.class_link && (
                          <Button size="sm" className="text-xs" asChild>
                            <a href={cls.class_link} target="_blank" rel="noreferrer">
                              <ExternalLink className="h-3 w-3 mr-1" /> Join
                            </a>
                          </Button>
                        )}
                        <Dialog open={editingClass?.id === cls.id} onOpenChange={(open) => { if (!open) setEditingClass(null); }}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="text-xs" onClick={() => openEditDialog(cls)}>
                              <Edit3 className="h-3 w-3 mr-1" /> Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader><DialogTitle>Edit Class</DialogTitle></DialogHeader>
                            <ClassFormContent onSubmit={updateClass} submitLabel="Save Changes" />
                          </DialogContent>
                        </Dialog>
                        <Button size="sm" variant="ghost" className="text-xs text-destructive" onClick={() => deleteClass(cls.id)}>
                          <Trash2 className="h-3 w-3 mr-1" /> Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="materials" className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setShowAddMaterial(!showAddMaterial)}>
              <Upload className="h-4 w-4 mr-1" /> Add Material
            </Button>
          </div>

          {showAddMaterial && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input placeholder="Title" value={newMaterial.title} onChange={e => setNewMaterial(p => ({ ...p, title: e.target.value }))} />
                  <Input placeholder="URL (PDF link or webpage)" value={newMaterial.url} onChange={e => setNewMaterial(p => ({ ...p, url: e.target.value }))} />
                  <Input placeholder="Subject (optional)" value={newMaterial.subject} onChange={e => setNewMaterial(p => ({ ...p, subject: e.target.value }))} />
                  <div className="flex gap-2">
                    <Button size="sm" variant={newMaterial.type === "link" ? "default" : "outline"} onClick={() => setNewMaterial(p => ({ ...p, type: "link" }))}>
                      <Link2 className="h-3 w-3 mr-1" /> Link
                    </Button>
                    <Button size="sm" variant={newMaterial.type === "pdf" ? "default" : "outline"} onClick={() => setNewMaterial(p => ({ ...p, type: "pdf" }))}>
                      <FileText className="h-3 w-3 mr-1" /> PDF
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button size="sm" variant="outline" onClick={() => setShowAddMaterial(false)}>Cancel</Button>
                  <Button size="sm" onClick={addMaterial}>Save</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {materials.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No study materials yet</p>
                <p className="text-sm">Add PDFs or links to keep your resources organized</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {materials.map((mat, i) => (
                <motion.div key={mat.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <Card className="hover:border-primary/50 transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          {mat.type === "pdf" ? <FileText className="h-5 w-5 text-primary" /> : <Link2 className="h-5 w-5 text-primary" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{mat.title}</p>
                          {mat.subject && <Badge variant="secondary" className="text-[10px] mt-1">{mat.subject}</Badge>}
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" asChild>
                            <a href={mat.url} target="_blank" rel="noreferrer"><ExternalLink className="h-3 w-3" /></a>
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => removeMaterial(mat.id)}>×</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
