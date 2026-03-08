import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Clipboard, Copy, Pin, PinOff, Trash2, Search, Plus, Clock, Star, StarOff, Tag, ExternalLink, Hash } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ClipItem {
  id: string;
  content: string;
  type: "text" | "link" | "code" | "snippet";
  pinned: boolean;
  starred: boolean;
  tags: string[];
  createdAt: Date;
  copiedCount: number;
}

const detectType = (text: string): ClipItem["type"] => {
  if (/^https?:\/\//.test(text.trim())) return "link";
  if (/[{}\[\]();]/.test(text) && text.split("\n").length > 1) return "code";
  return text.length > 100 ? "snippet" : "text";
};

const TYPE_STYLES: Record<string, { color: string; icon: any }> = {
  text: { color: "bg-primary/10 text-primary border-primary/20", icon: Clipboard },
  link: { color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: ExternalLink },
  code: { color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: Hash },
  snippet: { color: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: Tag },
};

const XClip = () => {
  const { user } = useAuth();
  const [clips, setClips] = useState<ClipItem[]>([]);
  const [newContent, setNewContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);

  useEffect(() => {
    if (user) loadClips();
  }, [user]);

  const loadClips = async () => {
    if (!user) return;
    try {
      const { data } = await (supabase as any)
        .from('xclip_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (data) {
        setClips(data.map((c: any) => ({
          id: c.id,
          content: c.content,
          type: c.content_type || 'text',
          pinned: c.is_pinned || false,
          starred: c.is_starred || false,
          tags: [],
          createdAt: new Date(c.created_at),
          copiedCount: 0,
        })));
      }
    } catch (error) {
      console.error('Error loading clips:', error);
    }
  };

  const addClip = async () => {
    if (!newContent.trim()) return;
    const type = detectType(newContent.trim());
    if (user) {
      try {
        const { data } = await (supabase as any).from('xclip_items').insert({
          user_id: user.id,
          content: newContent.trim(),
          content_type: type,
          is_pinned: false,
          is_starred: false,
        }).select().single();
        if (data) {
          setClips(prev => [{
            id: data.id, content: data.content, type: data.content_type || 'text',
            pinned: false, starred: false, tags: [], createdAt: new Date(data.created_at), copiedCount: 0,
          }, ...prev]);
        }
      } catch (error) {
        console.error('Error adding clip:', error);
      }
    }
    setNewContent("");
    toast.success("Clip added");
  };

  const copyToClipboard = useCallback(async (id: string) => {
    const clip = clips.find(c => c.id === id);
    if (!clip) return;
    await navigator.clipboard.writeText(clip.content);
    toast.success("Copied to clipboard");
  }, [clips]);

  const togglePin = async (id: string) => {
    const clip = clips.find(c => c.id === id);
    if (!clip) return;
    setClips(prev => prev.map(c => c.id === id ? { ...c, pinned: !c.pinned } : c));
    if (user) {
      await (supabase as any).from('xclip_items').update({ is_pinned: !clip.pinned }).eq('id', id);
    }
  };

  const toggleStar = async (id: string) => {
    const clip = clips.find(c => c.id === id);
    if (!clip) return;
    setClips(prev => prev.map(c => c.id === id ? { ...c, starred: !c.starred } : c));
    if (user) {
      await (supabase as any).from('xclip_items').update({ is_starred: !clip.starred }).eq('id', id);
    }
  };

  const deleteClip = async (id: string) => {
    setClips(prev => prev.filter(c => c.id !== id));
    if (user) {
      await (supabase as any).from('xclip_items').delete().eq('id', id);
    }
    toast.success("Clip removed");
  };

  const formatTime = (date: Date) => {
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const filtered = clips
    .filter(c => {
      if (showPinnedOnly && !c.pinned) return false;
      if (filterType !== "all" && c.type !== filterType) return false;
      if (searchQuery && !c.content.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => { if (a.pinned !== b.pinned) return a.pinned ? -1 : 1; return b.createdAt.getTime() - a.createdAt.getTime(); });

  return (
    <div className="container max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2"><Clipboard className="h-8 w-8 text-primary" />XClip</h1>
          <p className="text-muted-foreground mt-1">Clipboard manager with history & pinned snippets</p>
        </div>
        <Badge variant="outline" className="self-start">{clips.length} clips</Badge>
      </motion.div>

      <Card>
        <CardContent className="pt-4 space-y-3">
          <Textarea placeholder="Paste or type content to save..." value={newContent} onChange={e => setNewContent(e.target.value)}
            className="min-h-[80px] resize-none" onKeyDown={e => { if (e.key === "Enter" && e.metaKey) addClip(); }} />
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">⌘ + Enter to save</span>
            <Button onClick={addClip} disabled={!newContent.trim()} size="sm" className="gap-1"><Plus className="h-4 w-4" /> Add Clip</Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search clips..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-1">
          {["all", "text", "link", "code", "snippet"].map(t => (
            <Button key={t} variant={filterType === t ? "default" : "outline"} size="sm" onClick={() => setFilterType(t)} className="capitalize text-xs">{t}</Button>
          ))}
        </div>
        <div className="flex items-center gap-2"><Pin className="h-4 w-4 text-muted-foreground" /><Switch checked={showPinnedOnly} onCheckedChange={setShowPinnedOnly} /></div>
      </div>

      <ScrollArea className="h-[500px]">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 text-muted-foreground">No clips found</motion.div>
          ) : (
            <div className="space-y-2">
              {filtered.map((clip, i) => {
                const style = TYPE_STYLES[clip.type];
                const Icon = style.icon;
                return (
                  <motion.div key={clip.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.03 }}>
                    <Card className={cn("group hover:shadow-md transition-all", clip.pinned && "border-primary/30 bg-primary/5")}>
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <div className={cn("p-1.5 rounded-md border shrink-0 mt-0.5", style.color)}><Icon className="h-3.5 w-3.5" /></div>
                          <div className="flex-1 min-w-0">
                            <pre className={cn("text-sm whitespace-pre-wrap break-all font-mono", clip.type === "link" && "text-blue-500 underline cursor-pointer")}>
                              {clip.content.length > 300 ? clip.content.slice(0, 300) + "..." : clip.content}
                            </pre>
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatTime(clip.createdAt)}</span>
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">{clip.type}</Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(clip.id)}><Copy className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => togglePin(clip.id)}>{clip.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}</Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleStar(clip.id)}>{clip.starred ? <StarOff className="h-3.5 w-3.5 text-amber-400" /> : <Star className="h-3.5 w-3.5" />}</Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteClip(clip.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </ScrollArea>
    </div>
  );
};

export default XClip;
