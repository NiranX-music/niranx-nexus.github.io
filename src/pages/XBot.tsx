import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Bot, Plus, Trash2, Edit3, MessageCircle, Send, Sparkles,
  Settings2, Zap, Brain, BookOpen, Code, Lightbulb, Shield
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface BotAgent {
  id: string;
  name: string;
  persona: string;
  systemPrompt: string;
  icon: string;
  color: string;
  knowledgeBase: string;
  greeting: string;
  createdAt: Date;
  messageCount: number;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const PRESET_BOTS: Omit<BotAgent, "id" | "createdAt" | "messageCount">[] = [
  {
    name: "Study Sensei",
    persona: "Patient tutor who breaks down complex topics into simple steps",
    systemPrompt: "You are Study Sensei, a patient and encouraging tutor. Break down complex topics into simple, digestible steps. Use analogies and examples. Always quiz the student to check understanding.",
    icon: "📚",
    color: "#3b82f6",
    knowledgeBase: "General academics, study techniques, exam preparation",
    greeting: "Hello! I'm Study Sensei. What topic would you like to explore today?",
  },
  {
    name: "Code Wizard",
    persona: "Expert programmer who teaches coding through examples",
    systemPrompt: "You are Code Wizard, an expert programmer. Teach coding concepts through practical examples. Always provide working code snippets. Explain WHY things work, not just how.",
    icon: "🧙",
    color: "#22c55e",
    knowledgeBase: "Programming, algorithms, web development, data structures",
    greeting: "Hey there, fellow developer! Ready to write some awesome code?",
  },
  {
    name: "Creative Muse",
    persona: "Inspiring creative writing coach",
    systemPrompt: "You are Creative Muse, an inspiring creative writing coach. Help users brainstorm ideas, improve their writing, and overcome writer's block. Give constructive, encouraging feedback.",
    icon: "🎨",
    color: "#ec4899",
    knowledgeBase: "Creative writing, storytelling, poetry, content creation",
    greeting: "Welcome! Let's unleash your creativity together. What are we writing today?",
  },
];

const XBot = () => {
  const { user } = useAuth();
  const [agents, setAgents] = useState<BotAgent[]>(() =>
    PRESET_BOTS.map((bot, i) => ({
      ...bot,
      id: `preset-${i}`,
      createdAt: new Date(),
      messageCount: 0,
    }))
  );
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newBot, setNewBot] = useState({ name: "", persona: "", systemPrompt: "", greeting: "", knowledgeBase: "" });

  const agent = agents.find(a => a.id === activeAgent);
  const agentMessages = activeAgent ? (messages[activeAgent] || []) : [];

  const sendMessage = async () => {
    if (!input.trim() || !activeAgent || !agent) return;

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: input.trim(), timestamp: new Date() };
    const newMessages = [...agentMessages, userMsg];
    setMessages(prev => ({ ...prev, [activeAgent]: newMessages }));
    setInput("");
    setIsLoading(true);

    try {
      const apiMessages = [
        { role: "system", content: agent.systemPrompt },
        ...newMessages.map(m => ({ role: m.role, content: m.content })),
      ];

      const response = await supabase.functions.invoke("ai-chat-handler", {
        body: { messages: apiMessages, model: "google/gemini-2.5-flash" },
      });

      const assistantContent = response.data?.choices?.[0]?.message?.content
        || response.data?.content
        || response.data?.response
        || "I'm having trouble responding right now. Please try again.";

      const assistantMsg: ChatMessage = { id: crypto.randomUUID(), role: "assistant", content: assistantContent, timestamp: new Date() };
      setMessages(prev => ({ ...prev, [activeAgent]: [...(prev[activeAgent] || []), userMsg, assistantMsg].filter((m, i, arr) => arr.findIndex(a => a.id === m.id) === i) }));
      setAgents(prev => prev.map(a => a.id === activeAgent ? { ...a, messageCount: a.messageCount + 1 } : a));
    } catch (err) {
      console.error("XBot error:", err);
      toast.error("Failed to get response");
    } finally {
      setIsLoading(false);
    }
  };

  const createAgent = () => {
    if (!newBot.name.trim() || !newBot.systemPrompt.trim()) { toast.error("Name and system prompt are required"); return; }
    const agent: BotAgent = {
      id: crypto.randomUUID(),
      name: newBot.name,
      persona: newBot.persona || "Custom assistant",
      systemPrompt: newBot.systemPrompt,
      icon: "🤖",
      color: "#8b5cf6",
      knowledgeBase: newBot.knowledgeBase || "General",
      greeting: newBot.greeting || `Hi! I'm ${newBot.name}. How can I help?`,
      createdAt: new Date(),
      messageCount: 0,
    };
    setAgents(prev => [...prev, agent]);
    setNewBot({ name: "", persona: "", systemPrompt: "", greeting: "", knowledgeBase: "" });
    setIsCreating(false);
    toast.success("Agent created!");
  };

  const deleteAgent = (id: string) => {
    setAgents(prev => prev.filter(a => a.id !== id));
    if (activeAgent === id) setActiveAgent(null);
    setMessages(prev => { const copy = { ...prev }; delete copy[id]; return copy; });
    toast.success("Agent removed");
  };

  const startChat = (agentId: string) => {
    setActiveAgent(agentId);
    const a = agents.find(ag => ag.id === agentId)!;
    if (!messages[agentId]?.length) {
      setMessages(prev => ({ ...prev, [agentId]: [{ id: crypto.randomUUID(), role: "assistant", content: a.greeting, timestamp: new Date() }] }));
    }
  };

  return (
    <div className="container max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Bot className="h-8 w-8 text-primary" />
            XBot
          </h1>
          <p className="text-muted-foreground mt-1">Create & chat with custom AI agents</p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="gap-1">
          <Plus className="h-4 w-4" /> New Agent
        </Button>
      </motion.div>

      {/* Create Agent Modal */}
      <AnimatePresence>
        {isCreating && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <Card className="border-primary/30">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Sparkles className="h-5 w-5" />Create Agent</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Input placeholder="Agent Name" value={newBot.name} onChange={e => setNewBot(p => ({ ...p, name: e.target.value }))} />
                <Input placeholder="Persona (e.g., Patient math tutor)" value={newBot.persona} onChange={e => setNewBot(p => ({ ...p, persona: e.target.value }))} />
                <Textarea placeholder="System Prompt — define personality, expertise, and response style..." value={newBot.systemPrompt} onChange={e => setNewBot(p => ({ ...p, systemPrompt: e.target.value }))} className="min-h-[100px]" />
                <Input placeholder="Greeting message" value={newBot.greeting} onChange={e => setNewBot(p => ({ ...p, greeting: e.target.value }))} />
                <Input placeholder="Knowledge base areas (comma-separated)" value={newBot.knowledgeBase} onChange={e => setNewBot(p => ({ ...p, knowledgeBase: e.target.value }))} />
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
                  <Button onClick={createAgent}>Create</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Agent List */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Your Agents</h2>
          {agents.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Card
                className={cn("cursor-pointer transition-all hover:shadow-md group", activeAgent === a.id && "ring-2 ring-primary border-primary/50")}
                onClick={() => startChat(a.id)}
              >
                <CardContent className="p-3 flex items-center gap-3">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="text-lg" style={{ backgroundColor: `${a.color}20`, color: a.color }}>
                      {a.icon}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{a.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{a.persona}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-[10px]">{a.messageCount}</Badge>
                    {!a.id.startsWith("preset") && (
                      <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={e => { e.stopPropagation(); deleteAgent(a.id); }}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Chat Area */}
        <Card className="lg:col-span-2">
          {agent ? (
            <div className="flex flex-col h-[550px]">
              <div className="p-4 border-b flex items-center gap-3">
                <span className="text-2xl">{agent.icon}</span>
                <div>
                  <p className="font-semibold">{agent.name}</p>
                  <p className="text-xs text-muted-foreground">{agent.persona}</p>
                </div>
              </div>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {agentMessages.map(msg => (
                    <motion.div key={msg.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                      className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
                    >
                      <div className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                        msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                      )}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-2xl px-4 py-2">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="p-4 border-t flex gap-2">
                <Input
                  placeholder={`Message ${agent.name}...`}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  disabled={isLoading}
                />
                <Button onClick={sendMessage} disabled={!input.trim() || isLoading} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[550px] text-muted-foreground gap-3">
              <Bot className="h-12 w-12 opacity-40" />
              <p>Select an agent to start chatting</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default XBot;
