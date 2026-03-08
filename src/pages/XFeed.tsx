import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rss, Plus, Trash2, ExternalLink, RefreshCw, Clock, Bookmark, BookmarkCheck, Globe, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

interface FeedSource {
  id: string;
  name: string;
  url: string;
  icon?: string;
  category: string;
}

interface FeedItem {
  id: string;
  sourceId: string;
  sourceName: string;
  title: string;
  summary: string;
  link: string;
  publishedAt: Date;
  isBookmarked: boolean;
  isRead: boolean;
  category: string;
}

const DEMO_SOURCES: FeedSource[] = [
  { id: "1", name: "Tech News", url: "https://technews.example.com", category: "Tech" },
  { id: "2", name: "Science Daily", url: "https://sciencedaily.example.com", category: "Science" },
  { id: "3", name: "Study Tips", url: "https://studytips.example.com", category: "Education" },
  { id: "4", name: "Dev Blog", url: "https://devblog.example.com", category: "Dev" },
];

const generateDemoItems = (): FeedItem[] => {
  const items: FeedItem[] = [
    { id: "f1", sourceId: "1", sourceName: "Tech News", title: "AI Models Getting Smarter Every Day", summary: "New breakthroughs in language models show 40% improvement in reasoning tasks compared to previous generations.", link: "#", publishedAt: new Date(Date.now() - 3600000), isBookmarked: false, isRead: false, category: "Tech" },
    { id: "f2", sourceId: "2", sourceName: "Science Daily", title: "CRISPR Gene Editing Reaches New Milestone", summary: "Researchers achieve 99.9% precision in targeted gene therapy, opening doors for treating rare genetic disorders.", link: "#", publishedAt: new Date(Date.now() - 7200000), isBookmarked: true, isRead: false, category: "Science" },
    { id: "f3", sourceId: "3", sourceName: "Study Tips", title: "The Pomodoro Technique Explained", summary: "How breaking study sessions into 25-minute focused intervals can dramatically improve retention and productivity.", link: "#", publishedAt: new Date(Date.now() - 14400000), isBookmarked: false, isRead: true, category: "Education" },
    { id: "f4", sourceId: "4", sourceName: "Dev Blog", title: "React Server Components Deep Dive", summary: "Understanding the architecture behind RSC and how it changes the way we build modern web applications.", link: "#", publishedAt: new Date(Date.now() - 28800000), isBookmarked: false, isRead: false, category: "Dev" },
    { id: "f5", sourceId: "1", sourceName: "Tech News", title: "Quantum Computing Goes Mainstream", summary: "IBM announces 1000+ qubit processor available for commercial applications starting next quarter.", link: "#", publishedAt: new Date(Date.now() - 43200000), isBookmarked: false, isRead: true, category: "Tech" },
    { id: "f6", sourceId: "2", sourceName: "Science Daily", title: "Mars Water Discovery Confirmed", summary: "NASA confirms presence of liquid water beneath Martian surface using new radar imaging technology.", link: "#", publishedAt: new Date(Date.now() - 86400000), isBookmarked: true, isRead: false, category: "Science" },
    { id: "f7", sourceId: "3", sourceName: "Study Tips", title: "Active Recall vs Passive Reading", summary: "Research shows active recall methods are 3x more effective than re-reading notes for long-term memory.", link: "#", publishedAt: new Date(Date.now() - 172800000), isBookmarked: false, isRead: false, category: "Education" },
    { id: "f8", sourceId: "4", sourceName: "Dev Blog", title: "TypeScript 6.0 Release Notes", summary: "Pattern matching, pipe operator, and improved type inference headline the latest TypeScript release.", link: "#", publishedAt: new Date(Date.now() - 259200000), isBookmarked: false, isRead: true, category: "Dev" },
  ];
  return items;
};

const XFeed = () => {
  const [sources] = useState<FeedSource[]>(DEMO_SOURCES);
  const [items, setItems] = useState<FeedItem[]>(generateDemoItems);
  const [filter, setFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newSourceName, setNewSourceName] = useState("");
  const [newSourceUrl, setNewSourceUrl] = useState("");
  const [newSourceCategory, setNewSourceCategory] = useState("General");

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const toggleBookmark = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, isBookmarked: !i.isBookmarked } : i));
  };

  const markRead = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, isRead: true } : i));
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Feed refreshed!");
    }, 1500);
  };

  const categories = ["all", ...Array.from(new Set(sources.map(s => s.category)))];
  const filteredItems = filter === "all" ? items
    : filter === "bookmarked" ? items.filter(i => i.isBookmarked)
    : filter === "unread" ? items.filter(i => !i.isRead)
    : items.filter(i => i.category === filter);

  const unreadCount = items.filter(i => !i.isRead).length;
  const bookmarkCount = items.filter(i => i.isBookmarked).length;

  return (
    <div className="container max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Rss className="h-8 w-8 text-primary" /> XFeed
          </h1>
          <p className="text-muted-foreground mt-1">Curated news & RSS reader</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" /> Add Source</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Feed Source</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Source name" value={newSourceName} onChange={e => setNewSourceName(e.target.value)} />
                <Input placeholder="Feed URL" value={newSourceUrl} onChange={e => setNewSourceUrl(e.target.value)} />
                <Input placeholder="Category" value={newSourceCategory} onChange={e => setNewSourceCategory(e.target.value)} />
                <Button className="w-full" onClick={() => {
                  toast.success("Source added!");
                  setNewSourceName(""); setNewSourceUrl(""); setNewSourceCategory("General");
                }}>Add Source</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Sources", value: sources.length, icon: <Globe className="h-4 w-4" /> },
          { label: "Unread", value: unreadCount, icon: <Clock className="h-4 w-4" /> },
          { label: "Bookmarked", value: bookmarkCount, icon: <Bookmark className="h-4 w-4" /> },
        ].map((s, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">{s.icon}</div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {["all", "unread", "bookmarked", ...Array.from(new Set(sources.map(s => s.category)))].map(cat => (
          <Button key={cat} variant={filter === cat ? "default" : "outline"} size="sm" onClick={() => setFilter(cat)} className="capitalize">
            {cat === "all" ? "All" : cat === "unread" ? `Unread (${unreadCount})` : cat === "bookmarked" ? `Saved (${bookmarkCount})` : cat}
          </Button>
        ))}
      </div>

      {/* Feed Items */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className={`hover:shadow-md transition-all cursor-pointer ${item.isRead ? "opacity-70" : ""}`}
                onClick={() => markRead(item.id)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">{item.sourceName}</Badge>
                        <span className="text-xs text-muted-foreground">{formatTimeAgo(item.publishedAt)}</span>
                        {!item.isRead && <div className="h-2 w-2 rounded-full bg-primary" />}
                      </div>
                      <h3 className="font-semibold text-sm leading-tight mb-1">{item.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">{item.summary}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); toggleBookmark(item.id); }}>
                        {item.isBookmarked ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default XFeed;
