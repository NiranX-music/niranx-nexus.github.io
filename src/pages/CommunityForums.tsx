import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquare, Plus, ArrowUp, ArrowDown, MessageCircle,
  Clock, Pin, Search, Filter, TrendingUp
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface ForumThread {
  id: string;
  title: string;
  content: string;
  author: string;
  author_initial: string;
  category: string;
  created_at: string;
  upvotes: number;
  downvotes: number;
  reply_count: number;
  is_pinned: boolean;
  replies: ForumReply[];
}

interface ForumReply {
  id: string;
  content: string;
  author: string;
  author_initial: string;
  created_at: string;
  upvotes: number;
}

const CATEGORIES = ["General", "Study Help", "Tech", "Exam Prep", "Off-Topic", "Announcements"];

const MOCK_THREADS: ForumThread[] = [
  {
    id: "t1", title: "Best study techniques for physics?", content: "I'm struggling with mechanics problems. What techniques do you all use?",
    author: "Alex", author_initial: "A", category: "Study Help", created_at: new Date(Date.now() - 3600000).toISOString(),
    upvotes: 12, downvotes: 1, reply_count: 5, is_pinned: true, replies: [
      { id: "r1", content: "Try drawing free body diagrams for every problem first!", author: "Sam", author_initial: "S", created_at: new Date(Date.now() - 1800000).toISOString(), upvotes: 8 },
      { id: "r2", content: "The Feynman technique works great for physics concepts", author: "Jordan", author_initial: "J", created_at: new Date(Date.now() - 900000).toISOString(), upvotes: 5 },
    ],
  },
  {
    id: "t2", title: "New virtual labs are amazing!", content: "Just tried the chemistry lab simulation. The periodic table explorer is super helpful.",
    author: "Taylor", author_initial: "T", category: "General", created_at: new Date(Date.now() - 7200000).toISOString(),
    upvotes: 24, downvotes: 0, reply_count: 8, is_pinned: false, replies: [
      { id: "r3", content: "Agreed! The reaction simulator saved me hours of revision", author: "Casey", author_initial: "C", created_at: new Date(Date.now() - 5400000).toISOString(), upvotes: 12 },
    ],
  },
  {
    id: "t3", title: "Study group for calculus - anyone interested?", content: "Looking for 3-4 people to form a calculus study group. We'd meet online twice a week.",
    author: "Morgan", author_initial: "M", category: "Study Help", created_at: new Date(Date.now() - 14400000).toISOString(),
    upvotes: 18, downvotes: 2, reply_count: 12, is_pinned: false, replies: [],
  },
  {
    id: "t4", title: "Tip: Use the AI Quiz Generator", content: "Paste your notes into the AI Quiz Generator and it creates practice questions automatically!",
    author: "Riley", author_initial: "R", category: "Tech", created_at: new Date(Date.now() - 28800000).toISOString(),
    upvotes: 31, downvotes: 1, reply_count: 6, is_pinned: false, replies: [],
  },
];

export default function CommunityForums() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<ForumThread[]>(MOCK_THREADS);
  const [selectedThread, setSelectedThread] = useState<ForumThread | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("General");
  const [replyContent, setReplyContent] = useState("");
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");

  const filtered = threads
    .filter(t => filterCat === "All" || t.category === filterCat)
    .filter(t => t.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0));

  const createThread = () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    const thread: ForumThread = {
      id: `t-${Date.now()}`, title: newTitle.trim(), content: newContent.trim(),
      author: "You", author_initial: user?.email?.[0]?.toUpperCase() || "U",
      category: newCategory, created_at: new Date().toISOString(),
      upvotes: 0, downvotes: 0, reply_count: 0, is_pinned: false, replies: [],
    };
    setThreads([thread, ...threads]);
    setNewTitle(""); setNewContent(""); setShowCreate(false);
    toast.success("Thread created!");
  };

  const addReply = () => {
    if (!replyContent.trim() || !selectedThread) return;
    const reply: ForumReply = {
      id: `r-${Date.now()}`, content: replyContent.trim(),
      author: "You", author_initial: user?.email?.[0]?.toUpperCase() || "U",
      created_at: new Date().toISOString(), upvotes: 0,
    };
    const updated = threads.map(t =>
      t.id === selectedThread.id
        ? { ...t, replies: [...t.replies, reply], reply_count: t.reply_count + 1 }
        : t
    );
    setThreads(updated);
    setSelectedThread({ ...selectedThread, replies: [...selectedThread.replies, reply], reply_count: selectedThread.reply_count + 1 });
    setReplyContent("");
    toast.success("Reply posted!");
  };

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              Community Forums
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Discuss, ask questions, and share knowledge</p>
          </div>
          <Button onClick={() => setShowCreate(true)} size="sm">
            <Plus className="h-4 w-4 mr-1" /> New Thread
          </Button>
        </div>
      </motion.div>

      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search threads..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <div className="flex gap-1 overflow-x-auto">
          {["All", ...CATEGORIES].map(c => (
            <Button key={c} size="sm" variant={filterCat === c ? "default" : "outline"} className="text-xs shrink-0" onClick={() => setFilterCat(c)}>
              {c}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {filtered.map((thread, i) => (
            <motion.div key={thread.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => setSelectedThread(thread)}>
                <CardContent className="py-3 px-4">
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center gap-1 text-muted-foreground shrink-0 pt-1">
                      <button onClick={e => { e.stopPropagation(); }} className="hover:text-primary"><ArrowUp className="h-4 w-4" /></button>
                      <span className="text-xs font-semibold text-foreground">{thread.upvotes - thread.downvotes}</span>
                      <button onClick={e => { e.stopPropagation(); }} className="hover:text-destructive"><ArrowDown className="h-4 w-4" /></button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {thread.is_pinned && <Pin className="h-3 w-3 text-primary" />}
                        <h3 className="text-sm font-semibold">{thread.title}</h3>
                        <Badge variant="secondary" className="text-[10px]">{thread.category}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{thread.content}</p>
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Avatar className="h-4 w-4"><AvatarFallback className="text-[8px]">{thread.author_initial}</AvatarFallback></Avatar>
                          {thread.author}
                        </span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}</span>
                        <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{thread.reply_count}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Thread Detail Dialog */}
      <Dialog open={!!selectedThread} onOpenChange={() => setSelectedThread(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-base">{selectedThread?.title}</DialogTitle>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{selectedThread?.author}</span>
              <Badge variant="secondary" className="text-[10px]">{selectedThread?.category}</Badge>
            </div>
          </DialogHeader>
          <p className="text-sm border-b pb-3">{selectedThread?.content}</p>
          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-3 py-2">
              {selectedThread?.replies.map((reply, i) => (
                <motion.div key={reply.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex gap-3 pl-4 border-l-2 border-primary/20">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Avatar className="h-5 w-5"><AvatarFallback className="text-[9px]">{reply.author_initial}</AvatarFallback></Avatar>
                      <span className="text-xs font-medium">{reply.author}</span>
                      <span className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}</span>
                    </div>
                    <p className="text-sm">{reply.content}</p>
                  </div>
                </motion.div>
              ))}
              {selectedThread?.replies.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No replies yet. Be the first!</p>
              )}
            </div>
          </ScrollArea>
          <div className="flex gap-2 pt-3 border-t">
            <Textarea value={replyContent} onChange={e => setReplyContent(e.target.value)} placeholder="Write a reply..." rows={2} className="flex-1 resize-none" />
            <Button onClick={addReply} disabled={!replyContent.trim()} className="self-end">Reply</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Thread Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Thread</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Thread title" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
            <Textarea placeholder="What do you want to discuss?" value={newContent} onChange={e => setNewContent(e.target.value)} rows={4} />
            <div className="flex gap-1 flex-wrap">
              {CATEGORIES.map(c => (
                <Button key={c} size="sm" variant={newCategory === c ? "default" : "outline"} className="text-xs" onClick={() => setNewCategory(c)}>
                  {c}
                </Button>
              ))}
            </div>
            <Button onClick={createThread} className="w-full" disabled={!newTitle.trim() || !newContent.trim()}>
              Post Thread
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
