import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Bot, User, Loader2, Sparkles, Plus, History, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import AIChatMessage from "@/components/ai/AIChatMessage";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  model: string | null;
  created_at: string;
  updated_at: string;
}

const PUTER_MODELS = [
  { id: "gpt-5-nano", label: "GPT-5 Nano", provider: "OpenAI", category: "Fast" },
  { id: "gpt-5-mini", label: "GPT-5 Mini", provider: "OpenAI", category: "Balanced" },
  { id: "gpt-5", label: "GPT-5", provider: "OpenAI", category: "Powerful" },
  { id: "gpt-5.2", label: "GPT-5.2", provider: "OpenAI", category: "Latest" },
  { id: "gpt-5.4", label: "GPT-5.4", provider: "OpenAI", category: "Frontier" },
  { id: "claude-sonnet-4-20250514", label: "Claude Sonnet 4", provider: "Anthropic", category: "Balanced" },
  { id: "claude-3.5-sonnet", label: "Claude 3.5 Sonnet", provider: "Anthropic", category: "Balanced" },
  { id: "claude-3.7-sonnet", label: "Claude 3.7 Sonnet", provider: "Anthropic", category: "Latest" },
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash", provider: "Google", category: "Fast" },
  { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro", provider: "Google", category: "Powerful" },
  { id: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite", provider: "Google", category: "Fast" },
  { id: "deepseek-chat", label: "DeepSeek Chat", provider: "DeepSeek", category: "Chat" },
  { id: "deepseek-reasoner", label: "DeepSeek Reasoner", provider: "DeepSeek", category: "Reasoning" },
  { id: "grok-3", label: "Grok 3", provider: "xAI", category: "Powerful" },
  { id: "grok-3-mini", label: "Grok 3 Mini", provider: "xAI", category: "Fast" },
  { id: "llama-4-maverick", label: "Llama 4 Maverick", provider: "Meta", category: "Open" },
  { id: "llama-4-scout", label: "Llama 4 Scout", provider: "Meta", category: "Open" },
  { id: "mistral-large-latest", label: "Mistral Large", provider: "Mistral", category: "Powerful" },
  { id: "pixtral-large-latest", label: "Pixtral Large", provider: "Mistral", category: "Vision" },
  { id: "qwen-max", label: "Qwen Max", provider: "Qwen", category: "Powerful" },
];

// Load Puter.js via CDN script tag
const loadPuter = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if ((window as any).puter) {
      resolve((window as any).puter);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://js.puter.com/v2/";
    script.onload = () => {
      const checkPuter = () => {
        if ((window as any).puter) resolve((window as any).puter);
        else setTimeout(checkPuter, 100);
      };
      checkPuter();
    };
    script.onerror = () => reject(new Error("Failed to load Puter.js"));
    document.head.appendChild(script);
  });
};

export default function PuterChat() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gpt-5-nano");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const puterRef = useRef<any>(null);

  useEffect(() => {
    loadPuter().then((p) => { puterRef.current = p; }).catch(() => toast.error("Failed to load Puter AI"));
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (user) {
      loadConversations();
      const convId = searchParams.get("conversation");
      if (convId) loadConversation(convId);
      else createNewConversation();
    }
  }, [user, searchParams]);

  const loadConversations = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("bytez_conversations")
      .select("*")
      .eq("user_id", user.id)
      .like("model", "puter:%")
      .order("updated_at", { ascending: false })
      .limit(50);
    setConversations(data || []);
  };

  const loadConversation = async (convId: string) => {
    const { data: msgs } = await supabase
      .from("bytez_messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });
    if (msgs) {
      setConversationId(convId);
      setMessages(msgs.map((m) => ({ role: m.role as any, content: m.content })));
    }
  };

  const createNewConversation = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("bytez_conversations")
      .insert({ user_id: user.id, title: "New Puter Chat", model: `puter:${selectedModel}` })
      .select()
      .single();
    if (data) {
      setConversationId(data.id);
      setMessages([]);
    }
  };

  const saveMessage = async (role: string, content: string) => {
    if (!conversationId) return;
    await supabase.from("bytez_messages").insert({
      conversation_id: conversationId,
      role,
      content,
    });
  };

  const handleNewChat = () => {
    setMessages([]);
    setConversationId(null);
    createNewConversation();
  };

  const deleteConversation = async (id: string) => {
    await supabase.from("bytez_messages").delete().eq("conversation_id", id);
    await supabase.from("bytez_conversations").delete().eq("id", id);
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (conversationId === id) handleNewChat();
    toast.success("Conversation deleted");
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const puter = puterRef.current;
    if (!puter) { toast.error("Puter AI not loaded yet"); return; }

    const userMsg: Message = { role: "user", content: input.trim() };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setIsLoading(true);
    await saveMessage("user", userMsg.content);

    try {
      const chatMessages = allMessages.map((m) => ({ role: m.role, content: m.content }));

      const resp = await puter.ai.chat(chatMessages, { model: selectedModel, stream: true });

      let assistantContent = "";
      setMessages([...allMessages, { role: "assistant", content: "" }]);

      for await (const part of resp) {
        const text = part?.text || part?.message?.content || "";
        if (text) {
          assistantContent += text;
          setMessages([...allMessages, { role: "assistant", content: assistantContent }]);
        }
      }

      if (assistantContent) {
        await saveMessage("assistant", assistantContent);
        // Update title on first message
        if (messages.length === 0 && conversationId) {
          await supabase
            .from("bytez_conversations")
            .update({ title: userMsg.content.slice(0, 60), updated_at: new Date().toISOString() })
            .eq("id", conversationId);
          loadConversations();
        } else if (conversationId) {
          await supabase
            .from("bytez_conversations")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", conversationId);
        }
      }
    } catch (err: any) {
      console.error("Puter AI error:", err);
      const errorMsg = err?.message || "Failed to get AI response";
      toast.error(errorMsg);
      setMessages([...allMessages, { role: "assistant", content: `Error: ${errorMsg}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p className="text-muted-foreground">Please log in to use Puter AI Chat.</p>
        <Button onClick={() => navigate("/auth")} className="mt-4">Login</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 h-screen flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
            <Sparkles className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Puter AI Chat</h1>
            <p className="text-xs text-muted-foreground">500+ free AI models — No API key needed</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-[200px] h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {PUTER_MODELS.map((m) => (
                <SelectItem key={m.id} value={m.id} className="text-xs">
                  <span className="font-medium">{m.label}</span>
                  <span className="ml-1 text-muted-foreground">({m.provider})</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleNewChat}>
            <Plus className="h-4 w-4 mr-1" /> New
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate("/niranx/unified-ai-history")}>
            <History className="h-4 w-4 mr-1" /> History
          </Button>
        </div>
      </div>

      <div className="flex flex-1 gap-4 min-h-0">
        {/* Sidebar */}
        <div className="hidden lg:block w-64 shrink-0">
          <Card className="h-full flex flex-col">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm">Recent Chats</CardTitle>
            </CardHeader>
            <ScrollArea className="flex-1">
              <div className="px-2 pb-2 space-y-1">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-xs cursor-pointer group transition-colors",
                      conversationId === conv.id ? "bg-primary/10 text-primary" : "hover:bg-muted"
                    )}
                    onClick={() => navigate(`/niranx/puter-chat?conversation=${conv.id}`)}
                  >
                    <span className="flex-1 truncate">{conv.title}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </button>
                  </div>
                ))}
                {conversations.length === 0 && (
                  <p className="text-xs text-muted-foreground px-3 py-4 text-center">No conversations yet</p>
                )}
              </div>
            </ScrollArea>
          </Card>
        </div>

        {/* Chat Area */}
        <Card className="flex-1 flex flex-col min-h-0">
          <CardContent className="flex-1 flex flex-col p-0 min-h-0">
            <ScrollArea ref={scrollRef as any} className="flex-1 p-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-16">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 mb-4">
                    <Bot className="h-12 w-12 text-blue-500" />
                  </div>
                  <p className="text-lg font-medium mb-1">Puter AI — 500+ Models</p>
                  <p className="text-sm max-w-md mb-6">Free access to GPT-5, Claude, Gemini, DeepSeek, Grok, Llama and hundreds more. No API keys required.</p>
                  <div className="grid grid-cols-2 gap-2 max-w-sm">
                    {["Explain quantum computing", "Write a Python script", "Summarize this topic", "Help me study math"].map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => { setInput(prompt); }}
                        className="text-left text-xs px-3 py-2 rounded-lg border border-border hover:bg-accent transition-colors"
                      >
                        <Sparkles className="h-3 w-3 text-primary inline mr-1.5" />
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, i) => (
                    <AIChatMessage key={i} role={msg.role as "user" | "assistant"} content={msg.content} index={i} />
                  ))}
                  {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-xl px-4 py-3 flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-xs text-muted-foreground">Thinking...</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            <div className="border-t p-4">
              <form
                onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                className="flex gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Ask ${PUTER_MODELS.find(m => m.id === selectedModel)?.label || "AI"} anything...`}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading || !input.trim()}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>
              <p className="text-[10px] text-muted-foreground mt-2 text-center">
                Powered by <a href="https://developer.puter.com/" target="_blank" rel="noreferrer" className="underline">Puter.com</a> — Free, no API keys required
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
