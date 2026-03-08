import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Brain, Send, Image as ImageIcon, Loader2, Plus, Trash2, MessageSquare, Sparkles } from "lucide-react";
import { useXPReward } from "@/hooks/useXPReward";

interface Message {
  role: "user" | "assistant";
  content: string;
  image_url?: string;
}

interface Conversation {
  id: string;
  title: string;
  subject: string | null;
  created_at: string;
}

// Simple markdown-like renderer
function RenderContent({ content }: { content: string }) {
  if (!content) return null;

  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Bold text: **text**
    const renderInline = (text: string) => {
      const parts = text.split(/(\*\*[^*]+\*\*)/g);
      return parts.map((part, j) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={j} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
        }
        return <span key={j}>{part}</span>;
      });
    };

    if (line.trim() === "") {
      elements.push(<div key={i} className="h-3" />);
    } else if (line.startsWith("### ")) {
      elements.push(<h3 key={i} className="text-base font-bold mt-4 mb-1.5 text-foreground">{renderInline(line.slice(4))}</h3>);
    } else if (line.startsWith("## ")) {
      elements.push(<h2 key={i} className="text-lg font-bold mt-4 mb-2 text-foreground">{renderInline(line.slice(3))}</h2>);
    } else if (line.startsWith("# ")) {
      elements.push(<h1 key={i} className="text-xl font-bold mt-4 mb-2 text-foreground">{renderInline(line.slice(2))}</h1>);
    } else if (/^\d+\.\s/.test(line.trim())) {
      const text = line.replace(/^\s*\d+\.\s*/, "");
      elements.push(
        <div key={i} className="flex gap-2.5 py-0.5 pl-1">
          <span className="text-primary font-mono text-sm mt-0.5 shrink-0 w-5 text-right">
            {line.trim().match(/^(\d+)\./)?.[1]}.
          </span>
          <span className="leading-relaxed">{renderInline(text)}</span>
        </div>
      );
    } else if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      const text = line.replace(/^\s*[-*]\s*/, "");
      elements.push(
        <div key={i} className="flex gap-2.5 py-0.5 pl-1">
          <span className="text-primary mt-2 shrink-0">•</span>
          <span className="leading-relaxed">{renderInline(text)}</span>
        </div>
      );
    } else {
      elements.push(<p key={i} className="leading-relaxed">{renderInline(line)}</p>);
    }
  }

  return <div className="space-y-0.5">{elements}</div>;
}

export default function AISolver() {
  const { user } = useAuth();
  const { awardXP } = useXPReward();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) loadConversations();
  }, [user]);

  useEffect(() => {
    if (currentConversationId) loadMessages(currentConversationId);
  }, [currentConversationId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversations = async () => {
    try {
      setIsLoadingConversations(true);
      const { data, error } = await supabase
        .from("ai_solver_conversations")
        .select("*")
        .eq("user_id", user?.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setConversations(data || []);
      if (data && data.length > 0 && !currentConversationId) {
        setCurrentConversationId(data[0].id);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from("ai_solver_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(
        (data || []).map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
          image_url: msg.image_url || undefined,
        }))
      );
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const createNewConversation = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("ai_solver_conversations")
        .insert({ user_id: user.id, title: "New Problem", subject: null })
        .select()
        .single();

      if (error) throw error;
      setConversations([data, ...conversations]);
      setCurrentConversationId(data.id);
      setMessages([]);
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast.error("Failed to create conversation");
    }
  };

  const deleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await supabase.from("ai_solver_conversations").delete().eq("id", id);
      if (error) throw error;
      const remaining = conversations.filter((c) => c.id !== id);
      setConversations(remaining);
      if (currentConversationId === id) {
        setCurrentConversationId(remaining[0]?.id || null);
        setMessages([]);
      }
    } catch (error) {
      toast.error("Failed to delete conversation");
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (file) {
          setSelectedImage(file);
          const reader = new FileReader();
          reader.onloadend = () => {
            setImagePreview(reader.result as string);
            toast.success("Image pasted!");
          };
          reader.readAsDataURL(file);
        }
        break;
      }
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const sendMessage = async () => {
    if ((!input.trim() && !selectedImage) || !user || isLoading) return;

    if (!currentConversationId) {
      await createNewConversation();
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: input.trim() || "Analyze this image",
    };
    if (selectedImage && imagePreview) userMessage.image_url = imagePreview;

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      await supabase.from("ai_solver_messages").insert({
        conversation_id: currentConversationId,
        role: "user",
        content: userMessage.content,
        image_url: userMessage.image_url,
      });

      const messagesToSend = messages.map((msg) => {
        if (msg.image_url) {
          return {
            role: msg.role,
            content: [
              { type: "text", text: msg.content },
              { type: "image_url", image_url: { url: msg.image_url } },
            ],
          };
        }
        return { role: msg.role, content: msg.content };
      });

      if (userMessage.image_url) {
        messagesToSend.push({
          role: "user",
          content: [
            { type: "text", text: userMessage.content },
            { type: "image_url", image_url: { url: userMessage.image_url } },
          ],
        });
      } else {
        messagesToSend.push({ role: "user", content: userMessage.content });
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-solver`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            messages: messagesToSend,
            conversationId: currentConversationId,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to get response from AI");

      let assistantMessage = "";
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");
      const decoder = new TextDecoder();

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          const line = buffer.slice(0, newlineIndex).trim();
          buffer = buffer.slice(newlineIndex + 1);

          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") continue;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantMessage += content;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { ...updated[updated.length - 1], content: assistantMessage };
                return updated;
              });
            }
          } catch {}
        }
      }

      if (assistantMessage) {
        await supabase.from("ai_solver_messages").insert({
          conversation_id: currentConversationId,
          role: "assistant",
          content: assistantMessage,
        });

        if (messages.length === 0) {
          const title = input.trim().slice(0, 50) + (input.length > 50 ? "..." : "");
          await supabase
            .from("ai_solver_conversations")
            .update({ title })
            .eq("id", currentConversationId);
          loadConversations();
        }

        await awardXP("USE_AI_CHAT");
      }

      removeImage();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to use the AI Solver</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? "w-72" : "w-0"} transition-all duration-300 border-r border-border bg-card/50 flex flex-col overflow-hidden shrink-0`}>
        <div className="p-3 border-b border-border">
          <Button onClick={createNewConversation} className="w-full gap-2" size="sm">
            <Plus className="h-4 w-4" />
            New Problem
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {isLoadingConversations ? (
              <div className="flex justify-center p-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8 px-3">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                <p className="text-xs text-muted-foreground">No conversations yet</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2 group transition-colors text-sm ${
                    currentConversationId === conv.id
                      ? "bg-primary/15 text-primary border border-primary/20"
                      : "hover:bg-muted/60 text-foreground/80"
                  }`}
                  onClick={() => setCurrentConversationId(conv.id)}
                >
                  <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-50" />
                  <span className="truncate flex-1">{conv.title}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0 hover:bg-destructive/10 hover:text-destructive"
                    onClick={(e) => deleteConversation(conv.id, e)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="border-b border-border px-5 py-3 flex items-center gap-3 bg-card/30 shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-md hover:bg-muted transition-colors lg:hidden"
          >
            <MessageSquare className="h-4 w-4" />
          </button>
          <div className="p-2 rounded-lg bg-primary/10">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-semibold truncate">GPAI AI Solver</h1>
            <p className="text-xs text-muted-foreground">Upload images or type your problem — I can help with any subject</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
            {messages.length === 0 && (
              <div className="text-center py-20">
                <div className="inline-flex p-4 rounded-2xl bg-primary/5 mb-4">
                  <Sparkles className="h-10 w-10 text-primary/40" />
                </div>
                <h2 className="text-lg font-medium mb-1">How can I help?</h2>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Type a question, paste an image, or upload a photo of a problem to get started
                </p>
                <div className="flex flex-wrap gap-2 justify-center mt-6">
                  {["Solve a math equation", "Explain a concept", "Help with homework"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setInput(s)}
                      className="px-3 py-1.5 text-xs rounded-full border border-border hover:bg-muted/60 hover:border-primary/30 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground px-4 py-3"
                      : "bg-muted/40 border border-border/50 px-5 py-4"
                  }`}
                >
                  {message.image_url && (
                    <img
                      src={message.image_url}
                      alt="Problem"
                      className="rounded-xl mb-3 max-w-full max-h-64 object-contain"
                    />
                  )}
                  {message.role === "assistant" ? (
                    <div className="text-sm">
                      <RenderContent content={message.content} />
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>
              </div>
            ))}

            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex justify-start">
                <div className="bg-muted/40 border border-border/50 rounded-2xl px-5 py-4">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-border bg-card/30 p-3 shrink-0">
          <div className="max-w-3xl mx-auto">
            {imagePreview && (
              <div className="relative inline-block mb-2">
                <img src={imagePreview} alt="Preview" className="h-16 rounded-lg border border-border" />
                <button
                  onClick={removeImage}
                  className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs hover:bg-destructive/90"
                >
                  ×
                </button>
              </div>
            )}
            <div className="flex items-end gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0 rounded-xl"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onPaste={handlePaste}
                placeholder="Type your problem or paste an image (Ctrl+V)..."
                className="flex-1 min-h-[44px] max-h-32 resize-none rounded-xl text-sm"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading || (!input.trim() && !selectedImage)}
                size="icon"
                className="h-10 w-10 shrink-0 rounded-xl"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
