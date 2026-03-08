import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Home, CheckSquare, Timer, User, MessageCircle,
  BarChart3, Target, Star, Music, FolderOpen, Cloud, Users, BookOpen,
  GraduationCap, Shield, Flame, FileText, Brain, Bell, Settings,
  Sparkles, Zap, Layers, Clock, Loader2,
  FileMusic, Headphones, Map, Archive, Heart, Play, Plus, File
} from "lucide-react";

interface SearchResult {
  title: string;
  url: string;
  icon: any;
  category: string;
  description?: string;
  type: "page" | "task" | "note" | "file" | "action";
}

const allPages: SearchResult[] = [
  { title: "Dashboard", url: "/niranx/dashboard", icon: Home, category: "Core", type: "page" },
  { title: "AI Chat", url: "/niranx/ai-chat", icon: Brain, category: "Core", type: "page" },
  { title: "Web Search", url: "/niranx/web-search", icon: Search, category: "Core", type: "page" },
  { title: "Profile", url: "/niranx/profile", icon: User, category: "Core", type: "page" },
  { title: "Tasks", url: "/niranx/tasks", icon: CheckSquare, category: "Study", type: "page" },
  { title: "Focus Engine", url: "/niranx/focus-engine", icon: Timer, category: "Study", type: "page" },
  { title: "Analytics", url: "/niranx/analytics", icon: BarChart3, category: "Study", type: "page" },
  { title: "Exam Hub", url: "/niranx/exams", icon: GraduationCap, category: "Study", type: "page" },
  { title: "Scheduler", url: "/niranx/scheduler", icon: Clock, category: "Study", type: "page" },
  { title: "Messages", url: "/niranx/messages", icon: MessageCircle, category: "Social", type: "page" },
  { title: "XFlow", url: "/niranx/xflow", icon: Users, category: "Social", type: "page" },
  { title: "Debate Hub", url: "/niranx/debates", icon: Sparkles, category: "Social", type: "page" },
  { title: "Music", url: "/niranx/music", icon: Music, category: "Media", type: "page" },
  { title: "XVibe", url: "/xvibe", icon: Headphones, category: "Media", type: "page" },
  { title: "File Hub", url: "/niranx/file-hub", icon: FolderOpen, category: "Files", type: "page" },
  { title: "Cloud Storage", url: "/niranx/cloud", icon: Cloud, category: "Files", type: "page" },
  { title: "Flashcards", url: "/niranx/flashcards", icon: Layers, category: "Study", type: "page" },
  { title: "Habit Tracker", url: "/niranx/habits", icon: Target, category: "Productivity", type: "page" },
  { title: "Bookmarks", url: "/niranx/bookmarks", icon: Star, category: "Productivity", type: "page" },
  { title: "Settings", url: "/niranx/settings", icon: Settings, category: "System", type: "page" },
  { title: "Admin Dashboard", url: "/niranx/admin", icon: Shield, category: "Admin", type: "page" },
  { title: "Guilds", url: "/niranx/guilds", icon: Users, category: "Social", type: "page" },
  { title: "Daily Rewards", url: "/niranx/daily-rewards", icon: Zap, category: "Gamification", type: "page" },
  { title: "Leaderboard", url: "/niranx/leaderboard", icon: Flame, category: "Gamification", type: "page" },
  { title: "Xstellar", url: "/stellar", icon: Sparkles, category: "Developer", type: "page" },
  { title: "Smart PDF Chat", url: "/niranx/smart-pdf-chat", icon: FileText, category: "AI Tools", type: "page" },
  { title: "AI Solver", url: "/niranx/ai-solver", icon: Brain, category: "AI Tools", type: "page" },
  { title: "Mind Map Builder", url: "/niranx/mind-map", icon: Archive, category: "AI Tools", type: "page" },
  { title: "Notifications", url: "/niranx/notifications", icon: Bell, category: "System", type: "page" },
  { title: "What's New", url: "/niranx/whats-new", icon: Sparkles, category: "System", type: "page" },
];

interface UniversalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UniversalSearch({ open, onOpenChange }: UniversalSearchProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [dbResults, setDbResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Search database for tasks, notes, files
  useEffect(() => {
    if (!user || query.length < 2) {
      setDbResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const results: SearchResult[] = [];

      // Search tasks
      const { data: tasks } = await supabase
        .from("tasks")
        .select("id, title")
        .eq("user_id", user.id)
        .ilike("title", `%${query}%`)
        .limit(5);

      tasks?.forEach((t) =>
        results.push({
          title: t.title,
          url: "/niranx/tasks",
          icon: CheckSquare,
          category: "Tasks",
          type: "task",
        })
      );

      // Search notes
      const { data: notes } = await supabase
        .from("notes")
        .select("id, title")
        .eq("user_id", user.id)
        .ilike("title", `%${query}%`)
        .limit(5);

      notes?.forEach((n) =>
        results.push({
          title: n.title,
          url: "/niranx/notes",
          icon: FileText,
          category: "Notes",
          type: "note",
        })
      );

      // Search files
      const { data: files } = await supabase
        .from("user_cloud_files")
        .select("id, file_name")
        .eq("user_id", user.id)
        .ilike("file_name", `%${query}%`)
        .limit(5);

      files?.forEach((f) =>
        results.push({
          title: f.file_name,
          url: "/niranx/cloud",
          icon: File,
          category: "Files",
          type: "file",
        })
      );

      setDbResults(results);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, user]);

  const filteredPages = useMemo(() => {
    if (!query) return allPages.slice(0, 8);
    const lower = query.toLowerCase();
    return allPages.filter(
      (p) =>
        p.title.toLowerCase().includes(lower) ||
        p.category.toLowerCase().includes(lower)
    );
  }, [query]);

  const allResults = useMemo(() => {
    const combined = [...filteredPages, ...dbResults];
    if (activeTab === "all") return combined;
    return combined.filter((r) => r.type === activeTab);
  }, [filteredPages, dbResults, activeTab]);

  const handleSelect = (result: SearchResult) => {
    navigate(result.url);
    onOpenChange(false);
    setQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden">
        <div className="flex items-center gap-2 px-4 border-b">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            placeholder="Search pages, tasks, notes, files..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 shadow-none focus-visible:ring-0 h-12 text-base"
            autoFocus
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
            ESC
          </kbd>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="px-4 pt-2">
            <TabsList className="h-8 p-0.5">
              <TabsTrigger value="all" className="text-xs h-7 px-2.5">All</TabsTrigger>
              <TabsTrigger value="page" className="text-xs h-7 px-2.5">Pages</TabsTrigger>
              <TabsTrigger value="task" className="text-xs h-7 px-2.5">Tasks</TabsTrigger>
              <TabsTrigger value="note" className="text-xs h-7 px-2.5">Notes</TabsTrigger>
              <TabsTrigger value="file" className="text-xs h-7 px-2.5">Files</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="h-80">
            <div className="p-2">
              {allResults.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-muted-foreground">
                  <Search className="h-8 w-8 mb-2 opacity-40" />
                  <p className="text-sm">No results found</p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {allResults.map((result, i) => (
                    <motion.button
                      key={`${result.type}-${result.title}-${i}`}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ delay: i * 0.02 }}
                      onClick={() => handleSelect(result)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-accent/50 transition-colors group"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted group-hover:bg-primary/10 transition-colors">
                        <result.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{result.title}</p>
                        {result.description && (
                          <p className="text-xs text-muted-foreground truncate">{result.description}</p>
                        )}
                      </div>
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        {result.category}
                      </Badge>
                    </motion.button>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </ScrollArea>
        </Tabs>

        <div className="flex items-center justify-between px-4 py-2 border-t text-[10px] text-muted-foreground">
          <span>↑↓ navigate · ↵ open · esc close</span>
          <span>{allResults.length} results</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
