import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart, MessageCircle, Award, BookOpen, Zap, Trophy,
  Users, FileText, Star, Clock, Filter
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  id: string;
  type: "like" | "comment" | "achievement" | "xp" | "streak" | "post" | "join" | "level_up";
  user_name: string;
  user_avatar?: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

const ACTIVITY_ICONS: Record<string, any> = {
  like: Heart,
  comment: MessageCircle,
  achievement: Award,
  xp: Zap,
  streak: Star,
  post: FileText,
  join: Users,
  level_up: Trophy,
};

const ACTIVITY_COLORS: Record<string, string> = {
  like: "text-red-400 bg-red-400/10",
  comment: "text-blue-400 bg-blue-400/10",
  achievement: "text-amber-400 bg-amber-400/10",
  xp: "text-green-400 bg-green-400/10",
  streak: "text-orange-400 bg-orange-400/10",
  post: "text-purple-400 bg-purple-400/10",
  join: "text-cyan-400 bg-cyan-400/10",
  level_up: "text-yellow-400 bg-yellow-400/10",
};

// Generate mock activity for demo
function generateMockActivity(): ActivityItem[] {
  const names = ["Alex", "Sam", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Quinn"];
  const types: ActivityItem["type"][] = ["like", "comment", "achievement", "xp", "streak", "post", "join", "level_up"];
  const descriptions: Record<string, string[]> = {
    like: ["liked your post", "liked a study resource", "liked a debate comment"],
    comment: ["commented on your note", "replied to your question", "mentioned you in a thread"],
    achievement: ["unlocked 'Night Owl'", "earned 'Study Streak Master'", "completed 'First Quiz'"],
    xp: ["earned 500 XP from daily challenge", "gained 200 XP from study session", "received 1000 XP bonus"],
    streak: ["reached a 7-day streak!", "hit 30-day streak milestone", "maintained 100-day streak"],
    post: ["shared a study resource", "published a new blog post", "created a debate topic"],
    join: ["joined the platform", "joined Study Group Alpha", "joined the Science Guild"],
    level_up: ["reached Level 5!", "advanced to Scholar rank", "unlocked Expert tier"],
  };

  return Array.from({ length: 25 }, (_, i) => {
    const type = types[i % types.length];
    const descs = descriptions[type];
    return {
      id: `act-${i}`,
      type,
      user_name: names[i % names.length],
      description: descs[i % descs.length],
      timestamp: new Date(Date.now() - i * 3600000 * (1 + Math.random() * 3)).toISOString(),
    };
  });
}

export default function ActivityFeed() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In production, fetch from DB. Using mock for now.
    setTimeout(() => {
      setActivities(generateMockActivity());
      setLoading(false);
    }, 500);
  }, []);

  const filtered = filter === "all"
    ? activities
    : activities.filter(a => a.type === filter);

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Clock className="h-6 w-6 text-primary" />
          Activity Feed
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          See what's happening across the platform
        </p>
      </motion.div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {["all", "like", "comment", "achievement", "xp", "streak", "post"].map(f => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? "default" : "outline"}
            className="text-xs capitalize shrink-0"
            onClick={() => setFilter(f)}
          >
            {f === "all" ? <Filter className="h-3 w-3 mr-1" /> : null}
            {f}
          </Button>
        ))}
      </div>

      <ScrollArea className="h-[calc(100vh-250px)]">
        <div className="space-y-1">
          <AnimatePresence>
            {filtered.map((item, i) => {
              const Icon = ACTIVITY_ICONS[item.type] || Zap;
              const colorClass = ACTIVITY_COLORS[item.type] || "text-primary bg-primary/10";

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card className="border-0 shadow-none hover:bg-muted/30 transition-colors">
                    <CardContent className="flex items-center gap-3 py-3 px-4">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-semibold">{item.user_name}</span>{" "}
                          <span className="text-muted-foreground">{item.description}</span>
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-[9px] shrink-0 capitalize">
                        {item.type.replace("_", " ")}
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {!loading && filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No activity to show
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
