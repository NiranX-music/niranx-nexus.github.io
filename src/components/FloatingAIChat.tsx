import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2, Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AIChatMessage from "@/components/ai/AIChatMessage";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_PROMPTS = [
  "How do I use the Pomodoro timer?",
  "Explain the XP system",
  "Help me plan my study schedule",
  "What are virtual labs?",
];

export default function FloatingAIChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    const userMsg: Message = { role: "user", content: msg };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setLoading(true);

    let assistantContent = "";

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMessages }),
      });

      if (!resp.ok || !resp.body) throw new Error("AI response failed");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, content: assistantContent } : m
                  );
                }
                return [...prev, { role: "assistant", content: assistantContent }];
              });
            }
          } catch {}
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn't process that. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="fixed bottom-20 right-4 z-[9999] w-80 md:w-96 h-[30rem] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-primary/5">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                <span className="font-semibold text-sm">NiranX AI</span>
                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">v2</span>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="flex-1 p-3" ref={scrollRef as any}>
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-6">
                  <Bot className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p className="font-medium">Hi! How can I help?</p>
                  <p className="text-xs mt-1 mb-4">Ask me anything about NiranX Universe</p>
                  <div className="grid grid-cols-1 gap-1.5">
                    {SUGGESTED_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => sendMessage(prompt)}
                        className="text-left text-xs px-3 py-2 rounded-lg border border-border hover:bg-accent transition-colors flex items-center gap-2"
                      >
                        <Sparkles className="h-3 w-3 text-primary shrink-0" />
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-3">
                {messages.map((msg, i) => (
                  <AIChatMessage key={i} role={msg.role} content={msg.content} index={i} />
                ))}
                {loading && messages[messages.length - 1]?.role !== "assistant" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-muted rounded-xl px-3 py-2 flex gap-1">
                      <motion.span animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-foreground/40" />
                      <motion.span animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }} className="w-1.5 h-1.5 rounded-full bg-foreground/40" />
                      <motion.span animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }} className="w-1.5 h-1.5 rounded-full bg-foreground/40" />
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            <form
              onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
              className="flex gap-2 p-3 border-t border-border"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything..."
                className="flex-1 text-sm h-9"
                disabled={loading}
              />
              <Button type="submit" size="icon" className="h-9 w-9 shrink-0" disabled={loading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 right-4 z-[9999] h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="h-5 w-5" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle className="h-5 w-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
