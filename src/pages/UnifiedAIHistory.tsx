import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  History, MessageCircle, Search, Calendar, Archive, Trash2,
  Clock, Plus, Brain, Sparkles, Bot, Code, Zap
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";

interface UnifiedConversation {
  id: string;
  title: string;
  source: "ai_chat" | "groq" | "bytez" | "puter" | "xvibing";
  model: string | null;
  subject: string | null;
  created_at: string;
  updated_at: string;
  is_archived?: boolean;
}

const SOURCE_CONFIG: Record<string, { label: string; icon: any; color: string; route: string }> = {
  ai_chat: { label: "AI Chat", icon: MessageCircle, color: "text-blue-500", route: "/niranx/ai-chat" },
  groq: { label: "Groq Chat", icon: Zap, color: "text-orange-500", route: "/niranx/groq-chat" },
  bytez: { label: "XNexus AI", icon: Brain, color: "text-purple-500", route: "/niranx/bytez-ai" },
  puter: { label: "Puter AI", icon: Sparkles, color: "text-cyan-500", route: "/niranx/puter-chat" },
  xvibing: { label: "Xvibing", icon: Code, color: "text-green-500", route: "/niranx/xvibing" },
};

export default function UnifiedAIHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<UnifiedConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  const fetchAll = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Fetch from all sources in parallel
      const [aiChats, groqChats, bytezChats] = await Promise.all([
        supabase
          .from("ai_conversations")
          .select("id, title, subject, created_at, last_activity, is_archived")
          .eq("user_id", user.id)
          .order("last_activity", { ascending: false })
          .limit(100),
        supabase
          .from("groq_conversations")
          .select("id, title, model, created_at, updated_at")
          .order("updated_at", { ascending: false })
          .limit(100),
        supabase
          .from("bytez_conversations")
          .select("id, title, model, created_at, updated_at")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false })
          .limit(100),
      ]);

      const unified: UnifiedConversation[] = [];

      // AI Chat conversations
      (aiChats.data || []).forEach((c) => {
        unified.push({
          id: c.id,
          title: c.title,
          source: "ai_chat",
          model: "Gemini 2.5 Flash",
          subject: c.subject,
          created_at: c.created_at,
          updated_at: c.last_activity || c.created_at,
          is_archived: c.is_archived,
        });
      });

      // Groq conversations
      (groqChats.data || []).forEach((c) => {
        unified.push({
          id: c.id,
          title: c.title,
          source: "groq",
          model: c.model,
          subject: null,
          created_at: c.created_at,
          updated_at: c.updated_at,
        });
      });

      // Bytez/Puter/Xvibing conversations
      (bytezChats.data || []).forEach((c) => {
        const isPuter = c.model?.startsWith("puter:");
        const isXvibing = c.model?.startsWith("xvibing:") || c.title?.includes("Xvibing");
        unified.push({
          id: c.id,
          title: c.title,
          source: isPuter ? "puter" : isXvibing ? "xvibing" : "bytez",
          model: isPuter ? c.model?.replace("puter:", "") : c.model,
          subject: null,
          created_at: c.created_at,
          updated_at: c.updated_at,
        });
      });

      // Sort by updated_at descending
      unified.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      setConversations(unified);
    } catch (err) {
      console.error("Error loading unified history:", err);
      toast.error("Failed to load chat history");
    } finally {
      setLoading(false);
    }
  };

  const deleteConversation = async (conv: UnifiedConversation) => {
    if (!confirm("Delete this conversation?")) return;

    try {
      if (conv.source === "ai_chat") {
        await supabase.from("ai_messages").delete().eq("conversation_id", conv.id);
        await supabase.from("ai_conversations").delete().eq("id", conv.id);
      } else if (conv.source === "groq") {
        await supabase.from("groq_conversations").delete().eq("id", conv.id);
      } else {
        await supabase.from("bytez_messages").delete().eq("conversation_id", conv.id);
        await supabase.from("bytez_conversations").delete().eq("id", conv.id);
      }
      setConversations((prev) => prev.filter((c) => c.id !== conv.id));
      toast.success("Conversation deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const openConversation = (conv: UnifiedConversation) => {
    const config = SOURCE_CONFIG[conv.source];
    if (!config) return;
    navigate(`${config.route}?conversation=${conv.id}`);
  };

  const filtered = conversations.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.model || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || c.source === activeTab;
    return matchesSearch && matchesTab;
  });

  const sourceCounts = conversations.reduce((acc, c) => {
    acc[c.source] = (acc[c.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (!user) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p className="text-muted-foreground">Please log in to view chat history.</p>
        <Button onClick={() => navigate("/auth")} className="mt-4">Login</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
            <History className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Unified AI History</h1>
            <p className="text-sm text-muted-foreground">
              {conversations.length} conversations across all AI providers
            </p>
          </div>
        </div>
        <Button onClick={() => navigate("/niranx/ai-corner")}>
          <Plus className="h-4 w-4 mr-2" /> New Chat
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="all" className="text-xs">
            All <Badge variant="secondary" className="ml-1 text-[10px]">{conversations.length}</Badge>
          </TabsTrigger>
          {Object.entries(SOURCE_CONFIG).map(([key, cfg]) => {
            const count = sourceCounts[key] || 0;
            if (count === 0) return null;
            const Icon = cfg.icon;
            return (
              <TabsTrigger key={key} value={key} className="text-xs gap-1.5">
                <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                {cfg.label}
                <Badge variant="secondary" className="text-[10px]">{count}</Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {/* List */}
      {loading ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">Loading...</CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
            <p className="text-muted-foreground">
              {searchQuery ? "No conversations match your search" : "No conversations yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((conv) => {
            const cfg = SOURCE_CONFIG[conv.source];
            const Icon = cfg?.icon || Bot;
            return (
              <Card
                key={`${conv.source}-${conv.id}`}
                className="hover:shadow-lg transition-all cursor-pointer group hover:border-primary/20"
                onClick={() => openConversation(conv)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg bg-muted/50`}>
                        <Icon className={`h-4 w-4 ${cfg?.color}`} />
                      </div>
                      <Badge variant="outline" className="text-[10px]">{cfg?.label}</Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => { e.stopPropagation(); deleteConversation(conv); }}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                  <CardTitle className="text-sm mt-2 line-clamp-2">{conv.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true })}
                    </div>
                    {conv.model && (
                      <span className="bg-muted px-1.5 py-0.5 rounded text-[10px] truncate max-w-[120px]">
                        {conv.model}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
