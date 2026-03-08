import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Video, FileText, BookOpen, Upload, ExternalLink, Users,
  Calendar, GraduationCap, Brain, Timer, Gamepad2, MessageCircle,
  ArrowRight, Link2, Orbit, CheckSquare, Clock
} from "lucide-react";

interface LiveClass {
  id: string;
  title: string;
  subject: string | null;
  scheduled_start: string | null;
  scheduled_end: string | null;
  status: string | null;
  class_link: string | null;
  channel_name: string | null;
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

  const fetchClasses = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("live_classes")
      .select("id, title, subject, scheduled_start, scheduled_end, status, class_link, channel_name")
      .eq("user_id", user.id)
      .in("status", ["scheduled", "live"])
      .order("scheduled_start");
    if (data) setLiveClasses(data);
  }, [user]);

  useEffect(() => { fetchClasses(); }, [fetchClasses]);

  useEffect(() => {
    const saved = localStorage.getItem("yourClasses_materials");
    if (saved) setMaterials(JSON.parse(saved));
  }, []);

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
                <p className="text-sm">Schedule classes via the Scheduler or create live classes</p>
                <div className="flex gap-2 justify-center mt-4">
                  <Button size="sm" onClick={() => navigate("/niranx/scheduler")}>
                    <Calendar className="h-4 w-4 mr-1" /> Scheduler
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => navigate("/niranx/xorbit")}>
                    <Orbit className="h-4 w-4 mr-1" /> XOrbit
                  </Button>
                </div>
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
                          {cls.status === "live" ? "● LIVE" : "Scheduled"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {cls.subject && <p className="text-xs text-muted-foreground">{cls.subject}</p>}
                      {cls.scheduled_start && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(cls.scheduled_start).toLocaleString()}
                        </div>
                      )}
                      <div className="flex gap-2 pt-1">
                        {cls.class_link && (
                          <Button size="sm" className="flex-1 text-xs" asChild>
                            <a href={cls.class_link} target="_blank" rel="noreferrer">
                              <Video className="h-3 w-3 mr-1" /> Join Class
                            </a>
                          </Button>
                        )}
                        {cls.channel_name && (
                          <Button size="sm" variant="outline" className="text-xs" onClick={() => navigate(`/niranx/live-classroom?channel=${cls.channel_name}`)}>
                            <Users className="h-3 w-3 mr-1" /> Live Room
                          </Button>
                        )}
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
