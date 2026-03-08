import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Activity, Heart, MessageCircle, Award, Zap, Trophy, Users,
  FileText, Star, Clock, TrendingUp, Flame, BookOpen, Target,
  Bell, Filter, RefreshCw, Volume2, VolumeX
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface PulseEvent {
  id: string;
  type: "achievement" | "streak" | "level_up" | "xp" | "post" | "join" | "challenge" | "study";
  userName: string;
  userInitials: string;
  description: string;
  timestamp: string;
  value?: number;
  isLive?: boolean;
}

const EVENT_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
  achievement: { icon: Award, color: "text-amber-400 bg-amber-400/10 border-amber-400/20", label: "Achievement" },
  streak: { icon: Flame, color: "text-orange-400 bg-orange-400/10 border-orange-400/20", label: "Streak" },
  level_up: { icon: Trophy, color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20", label: "Level Up" },
  xp: { icon: Zap, color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", label: "XP Gain" },
  post: { icon: FileText, color: "text-blue-400 bg-blue-400/10 border-blue-400/20", label: "Post" },
  join: { icon: Users, color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20", label: "Joined" },
  challenge: { icon: Target, color: "text-purple-400 bg-purple-400/10 border-purple-400/20", label: "Challenge" },
  study: { icon: BookOpen, color: "text-primary bg-primary/10 border-primary/20", label: "Study" },
};

const NAMES = ["Arjun", "Priya", "Kai", "Zara", "Leo", "Maya", "Ravi", "Suki", "Dev", "Noor", "Yuki", "Ava"];
const ACHIEVEMENTS = ["Night Owl 🦉", "Speed Reader 📖", "Quiz Master 🧠", "Social Butterfly 🦋", "Study Streak 🔥", "First Blood ⚔️"];
const STUDY_SUBJECTS = ["Physics", "Calculus", "History", "Chemistry", "Literature", "Biology"];

function generateEvent(index: number): PulseEvent {
  const types: PulseEvent["type"][] = ["achievement", "streak", "level_up", "xp", "post", "join", "challenge", "study"];
  const type = types[Math.floor(Math.random() * types.length)];
  const name = NAMES[Math.floor(Math.random() * NAMES.length)];
  
  const descriptions: Record<string, () => string> = {
    achievement: () => `unlocked "${ACHIEVEMENTS[Math.floor(Math.random() * ACHIEVEMENTS.length)]}"`,
    streak: () => `reached a ${Math.floor(Math.random() * 30 + 3)}-day streak!`,
    level_up: () => `advanced to Level ${Math.floor(Math.random() * 20 + 2)}`,
    xp: () => `earned ${Math.floor(Math.random() * 500 + 100)} XP`,
    post: () => `shared a study resource`,
    join: () => `joined the platform`,
    challenge: () => `completed daily challenge`,
    study: () => `finished a ${STUDY_SUBJECTS[Math.floor(Math.random() * STUDY_SUBJECTS.length)]} session`,
  };

  return {
    id: `pulse-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 5)}`,
    type,
    userName: name,
    userInitials: name.slice(0, 2).toUpperCase(),
    description: descriptions[type](),
    timestamp: new Date(Date.now() - index * (1000 * 60 * Math.random() * 20)).toISOString(),
    value: type === "xp" ? Math.floor(Math.random() * 500 + 100) : undefined,
    isLive: index < 2,
  };
}

export default function XPulse() {
  const { user } = useAuth();
  const [events, setEvents] = useState<PulseEvent[]>(() =>
    Array.from({ length: 30 }, (_, i) => generateEvent(i))
  );
  const [filter, setFilter] = useState("all");
  const [isLive, setIsLive] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Simulate live events
  useEffect(() => {
    if (!isLive) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      const newEvent = generateEvent(0);
      newEvent.isLive = true;
      setEvents(prev => [newEvent, ...prev.slice(0, 99)]);
    }, 4000 + Math.random() * 6000);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isLive]);

  const filtered = filter === "all" ? events : events.filter(e => e.type === filter);

  // Stats
  const last24h = events.filter(e => Date.now() - new Date(e.timestamp).getTime() < 86400000);
  const totalXP = events.filter(e => e.type === "xp").reduce((s, e) => s + (e.value || 0), 0);
  const uniqueUsers = new Set(events.map(e => e.userName)).size;

  return (
    <div className="container max-w-4xl mx-auto py-6 px-4 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            XPulse
            {isLive && (
              <span className="relative flex h-2.5 w-2.5 ml-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
              </span>
            )}
          </h1>
          <p className="text-sm text-muted-foreground">Live activity across the platform</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setSoundEnabled(!soundEnabled)} title={soundEnabled ? "Mute" : "Unmute"}>
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
          <Button variant={isLive ? "default" : "outline"} size="sm" onClick={() => setIsLive(!isLive)} className="gap-1.5">
            {isLive ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Live</> : "Paused"}
          </Button>
        </div>
      </motion.div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Events (24h)", value: last24h.length, icon: Activity, color: "text-primary" },
          { label: "XP Earned", value: totalXP.toLocaleString(), icon: Zap, color: "text-emerald-400" },
          { label: "Active Users", value: uniqueUsers, icon: Users, color: "text-cyan-400" },
          { label: "Live Events", value: events.filter(e => e.isLive).length, icon: Bell, color: "text-amber-400" },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="pt-4 pb-3 flex items-center gap-3">
              <stat.icon className={cn("h-5 w-5 shrink-0", stat.color)} />
              <div>
                <p className="text-lg font-bold">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {["all", "achievement", "streak", "xp", "level_up", "study", "challenge", "post"].map(f => (
          <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} className="text-[11px] capitalize shrink-0 h-7 px-2.5" onClick={() => setFilter(f)}>
            {f === "all" ? <><Filter className="h-3 w-3 mr-1" />All</> : (EVENT_CONFIG[f]?.label || f)}
          </Button>
        ))}
      </div>

      {/* Event Feed */}
      <ScrollArea className="h-[calc(100vh-380px)]">
        <div className="space-y-1.5">
          <AnimatePresence initial={false}>
            {filtered.map((event, i) => {
              const config = EVENT_CONFIG[event.type] || EVENT_CONFIG.xp;
              const Icon = config.icon;

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: "auto" }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ type: "spring", damping: 20, stiffness: 300 }}
                >
                  <Card className={cn(
                    "border shadow-none transition-all hover:bg-muted/30",
                    event.isLive && "border-primary/20 bg-primary/[0.03]"
                  )}>
                    <CardContent className="flex items-center gap-3 py-2.5 px-4">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="text-[10px] bg-muted font-bold">{event.userInitials}</AvatarFallback>
                      </Avatar>
                      <div className={cn("h-7 w-7 rounded-full flex items-center justify-center shrink-0 border", config.color)}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-semibold">{event.userName}</span>{" "}
                          <span className="text-muted-foreground">{event.description}</span>
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {event.isLive && (
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                          </span>
                        )}
                        <Badge variant="secondary" className="text-[9px] capitalize">{config.label}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground text-sm">No events match this filter</div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
