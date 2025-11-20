import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Home, CheckSquare, Timer, User, Search, MessageCircle,
  BarChart3, TrendingUp, Target, Star, Trophy, ShoppingBag,
  Music, Video, FolderOpen, Cloud, Users, BookOpen, Calendar,
  GraduationCap, PenTool, Shield, Flame, Gamepad2, FileMusic,
  Headphones, Youtube, Upload, Image, HardDrive, MessagesSquare,
  Smartphone, Lock, Map, Sparkles, Archive, Brain, Bell, UserCog,
  Clock, Heart, Zap, Settings
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface Page {
  title: string;
  url: string;
  icon: any;
  category: string;
  keywords?: string[];
}

const allPages: Page[] = [
  // Core
  { title: "Dashboard", url: "/niranx/dashboard", icon: Home, category: "Core" },
  { title: "Search", url: "/niranx/search", icon: Search, category: "Core" },
  { title: "Profile", url: "/niranx/profile", icon: User, category: "Core" },
  { title: "Feedback & Suggestions", url: "/niranx/feedback", icon: MessagesSquare, category: "Core" },
  
  // Study & Focus
  { title: "Tasks", url: "/niranx/tasks", icon: CheckSquare, category: "Study", keywords: ["todo", "checklist"] },
  { title: "Focus Engine", url: "/niranx/focus-engine", icon: Timer, category: "Study", keywords: ["pomodoro", "concentrate"] },
  { title: "Distraction Blocker", url: "/niranx/distraction-blocker", icon: Shield, category: "Study" },
  { title: "Scheduler", url: "/niranx/scheduler", icon: Calendar, category: "Study", keywords: ["timetable", "schedule"] },
  { title: "Exams", url: "/niranx/exams", icon: GraduationCap, category: "Study", keywords: ["test", "examination"] },
  { title: "Whiteboard", url: "/niranx/whiteboard", icon: PenTool, category: "Study", keywords: ["draw", "sketch"] },
  { title: "Study Groups", url: "/niranx/study-groups", icon: Users, category: "Study" },
  
  // Progress
  { title: "Advanced Dashboard", url: "/niranx/advanced-dashboard", icon: BarChart3, category: "Progress" },
  { title: "Analytics", url: "/niranx/analytics", icon: TrendingUp, category: "Progress", keywords: ["stats", "statistics"] },
  { title: "Goals", url: "/niranx/goals", icon: Target, category: "Progress", keywords: ["objectives", "targets"] },
  { title: "Daily Challenges", url: "/niranx/daily-challenges", icon: Star, category: "Progress" },
  { title: "Study Streaks", url: "/niranx/study-streak-challenges", icon: Flame, category: "Progress" },
  { title: "Leaderboard", url: "/niranx/leaderboard", icon: Trophy, category: "Progress", keywords: ["ranking", "top"] },
  { title: "Reward Store", url: "/niranx/reward-store", icon: ShoppingBag, category: "Progress", keywords: ["shop", "buy"] },
  { title: "Games", url: "/niranx/games", icon: Gamepad2, category: "Progress" },
  
  // Media
  { title: "Music Player", url: "/niranx/music", icon: Music, category: "Media" },
  { title: "Music Hub", url: "/niranx/music-hub", icon: FileMusic, category: "Media" },
  { title: "Listening Library", url: "/niranx/listening-library", icon: Headphones, category: "Media" },
  { title: "Video Player", url: "/niranx/video-player", icon: Video, category: "Media" },
  { title: "Video Library", url: "/niranx/video-library", icon: Video, category: "Media" },
  { title: "StreamSphere", url: "/niranx/stream-sphere", icon: Youtube, category: "Media" },
  
  // Files
  { title: "File Hub", url: "/niranx/file-hub", icon: FolderOpen, category: "Files" },
  { title: "My Cloud", url: "/niranx/my-cloud", icon: Cloud, category: "Files" },
  { title: "Manage Drives", url: "/niranx/manage-drives", icon: HardDrive, category: "Files" },
  { title: "Upload", url: "/niranx/upload", icon: Upload, category: "Files" },
  
  // Social
  { title: "Messages", url: "/niranx/messages", icon: MessageCircle, category: "Social" },
  { title: "Community", url: "/niranx/community", icon: MessagesSquare, category: "Social" },
  { title: "Blogs", url: "/niranx/blogs", icon: BookOpen, category: "Social" },
  { title: "Picture Share", url: "/niranx/picture-share", icon: Image, category: "Social" },
  
  // System
  { title: "Settings", url: "/niranx/settings", icon: Settings, category: "System" },
  { title: "Notification Settings", url: "/niranx/notification-settings", icon: Bell, category: "System" },
  { title: "Admin Dashboard", url: "/niranx/admin", icon: UserCog, category: "System" },
];

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentPages, setRecentPages] = useState<Page[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    if (open) {
      setSearch("");
      setSelectedIndex(0);
      fetchRecentPages();
    }
  }, [open]);

  async function fetchRecentPages() {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("recent_pages")
        .select("*")
        .order("visited_at", { ascending: false })
        .limit(5);

      if (error) throw error;

      const recent = data.map(page => {
        const foundPage = allPages.find(p => p.url === page.page_url);
        return foundPage || {
          title: page.page_title,
          url: page.page_url,
          icon: Clock,
          category: "Recent"
        };
      });

      setRecentPages(recent);
    } catch (error) {
      console.error("Error fetching recent pages:", error);
    }
  }

  const filteredPages = useMemo(() => {
    if (!search.trim()) {
      return recentPages;
    }

    const query = search.toLowerCase();
    return allPages.filter(page => {
      const titleMatch = page.title.toLowerCase().includes(query);
      const categoryMatch = page.category.toLowerCase().includes(query);
      const keywordsMatch = page.keywords?.some(k => k.toLowerCase().includes(query));
      return titleMatch || categoryMatch || keywordsMatch;
    });
  }, [search, recentPages]);

  const groupedPages = useMemo(() => {
    const groups: Record<string, Page[]> = {};
    
    filteredPages.forEach(page => {
      const category = search.trim() ? page.category : "Recent";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(page);
    });

    return groups;
  }, [filteredPages, search]);

  async function trackPageVisit(pageUrl: string, pageTitle: string) {
    if (!user) return;

    try {
      await supabase.rpc("update_recent_page", {
        p_user_id: user.id,
        p_page_url: pageUrl,
        p_page_title: pageTitle,
      });
    } catch (error) {
      console.error("Error tracking page visit:", error);
    }
  }

  function handleNavigate(page: Page) {
    trackPageVisit(page.url, page.title);
    navigate(page.url);
    onOpenChange(false);
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!open) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredPages.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const page = filteredPages[selectedIndex];
        if (page) {
          handleNavigate(page);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, selectedIndex, filteredPages]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 max-w-2xl">
        <div className="flex items-center border-b px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search pages or type a command..."
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            autoFocus
          />
          <Badge variant="outline" className="ml-2">
            <Zap className="h-3 w-3 mr-1" />
            ⌘K
          </Badge>
        </div>

        <ScrollArea className="max-h-[400px]">
          <div className="p-2">
            {Object.entries(groupedPages).map(([category, pages]) => (
              <div key={category} className="mb-4">
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  {category}
                </div>
                {pages.map((page, idx) => {
                  const globalIndex = filteredPages.indexOf(page);
                  const Icon = page.icon;
                  
                  return (
                    <button
                      key={page.url}
                      onClick={() => handleNavigate(page)}
                      className={cn(
                        "flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm transition-colors",
                        globalIndex === selectedIndex
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent/50"
                      )}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span className="flex-1 text-left">{page.title}</span>
                      {page.url === location.pathname && (
                        <Badge variant="outline" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}

            {filteredPages.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No pages found</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t px-3 py-2 text-xs text-muted-foreground flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{filteredPages.length} results</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
