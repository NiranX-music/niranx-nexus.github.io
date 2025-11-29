import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, Loader2, Sparkles, User, Bot, History, Paperclip, X, Zap, Brain } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
  attachment_url?: string;
}

const GROQ_MODELS = [
  { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B" },
  { id: "llama-3.1-70b-versatile", name: "Llama 3.1 70B" },
  { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B" },
  { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B" },
  { id: "gemma2-9b-it", name: "Gemma 2 9B" },
];

const AIML_MODELS = [
  { id: "gpt-4o", name: "GPT-4o" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini" },
  { id: "claude-3.5-sonnet", name: "Claude 3.5 Sonnet" },
  { id: "claude-3-opus", name: "Claude 3 Opus" },
  { id: "mistral-large-latest", name: "Mistral Large" },
  { id: "gemini-2.0-flash-exp", name: "Gemini 2.0 Flash" },
];

export default function GroqChat() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [provider, setProvider] = useState<"groq" | "aiml">("groq");
  const [model, setModel] = useState(GROQ_MODELS[0].id);
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentModels = provider === "groq" ? GROQ_MODELS : AIML_MODELS;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const conversationParam = searchParams.get("conversation");
    if (conversationParam && user) {
      loadConversation(conversationParam);
    }
  }, [searchParams, user]);

  useEffect(() => {
    // Reset model when provider changes
    const newModels = provider === "groq" ? GROQ_MODELS : AIML_MODELS;
    setModel(newModels[0].id);
  }, [provider]);

  const loadConversation = async (id: string) => {
    try {
      const { data: conversation, error: convError } = await supabase
        .from("groq_conversations")
        .select("*")
        .eq("id", id)
        .single();

      if (convError) throw convError;

      const { data: msgs, error: msgsError } = await supabase
        .from("groq_messages")
        .select("*")
        .eq("conversation_id", id)
        .order("created_at", { ascending: true });

      if (msgsError) throw msgsError;

      setConversationId(id);
      setModel(conversation.model);
      setMessages(msgs.map(m => ({ 
        role: m.role as "user" | "assistant", 
        content: m.content, 
        attachment_url: m.attachment_url || undefined 
      })));
    } catch (error: any) {
      toast.error("Failed to load conversation");
      console.error(error);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!user) {
      toast.error("Please sign in to upload files");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setUploadedFile(file);
    
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("groq_attachments")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("groq_attachments")
        .getPublicUrl(fileName);

      setUploadedFileUrl(publicUrl);
      toast.success("File uploaded successfully");
    } catch (error: any) {
      toast.error("Failed to upload file");
      console.error(error);
      setUploadedFile(null);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setUploadedFileUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading || !user) return;

    const userMessage: Message = { 
      role: "user", 
      content: input,
      attachment_url: uploadedFileUrl || undefined
    };
    
    setMessages((prev) => [...prev, userMessage]);
    const newMessages = [...messages, userMessage];
    setInput("");
    setLoading(true);

    let currentConvId = conversationId;
    if (!currentConvId) {
      try {
        const title = input.slice(0, 50) + (input.length > 50 ? "..." : "");
        const { data: conv, error: convError } = await supabase
          .from("groq_conversations")
          .insert({ title, model, user_id: user.id })
          .select()
          .single();

        if (convError) throw convError;
        currentConvId = conv.id;
        setConversationId(conv.id);
      } catch (error) {
        console.error("Failed to create conversation:", error);
      }
    }

    if (currentConvId) {
      try {
        await supabase.from("groq_messages").insert({
          conversation_id: currentConvId,
          role: "user",
          content: input,
          attachment_url: uploadedFileUrl
        });

        await supabase
          .from("groq_conversations")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", currentConvId);
      } catch (error) {
        console.error("Failed to save message:", error);
      }
    }

    removeFile();

    try {
      const functionName = provider === "groq" ? "groq-chat" : "aiml-chat";
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { messages: newMessages, model },
      });

      if (error) throw error;

      const reader = data.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content || "";
              assistantMessage += content;

              setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  role: "assistant",
                  content: assistantMessage,
                };
                return newMessages;
              });
            } catch (e) {
              console.error("Parse error:", e);
            }
          }
        }
      }

      if (currentConvId && assistantMessage) {
        try {
          await supabase.from("groq_messages").insert({
            conversation_id: currentConvId,
            role: "assistant",
            content: assistantMessage
          });
        } catch (error) {
          console.error("Failed to save assistant message:", error);
        }
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to send message");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
            <p className="text-muted-foreground">Please sign in to use AI Chat</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-400 to-blue-400 bg-clip-text text-transparent">
              AI Chat Hub
            </h1>
            <p className="text-muted-foreground mt-2">Fast AI-powered conversations</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Tabs value={provider} onValueChange={(v) => setProvider(v as "groq" | "aiml")}>
              <TabsList>
                <TabsTrigger value="groq" className="gap-2">
                  <Zap className="w-4 h-4" />
                  Groq
                </TabsTrigger>
                <TabsTrigger value="aiml" className="gap-2">
                  <Brain className="w-4 h-4" />
                  AIML API
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Button
              variant="outline"
              onClick={() => navigate("/niranx/groq-chat-history")}
              className="gap-2"
            >
              <History className="w-4 h-4" />
              History
            </Button>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currentModels.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="bg-card/50 backdrop-blur border-primary/20 min-h-[600px] max-h-[70vh] flex flex-col">
          <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
                <Sparkles className="w-16 h-16" />
                <p className="text-lg">Start a conversation with AI</p>
                <p className="text-sm">
                  {provider === "groq" ? "Powered by Groq LPU" : "Powered by AIML API"}
                </p>
              </div>
            )}
            {messages.map((message, idx) => (
              <div key={idx} className="animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-start gap-4">
                  {message.role === "user" ? (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                  ) : (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    {message.attachment_url && (
                      <div className="mb-2">
                        <a
                          href={message.attachment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-2"
                        >
                          <Paperclip className="w-3 h-3" />
                          View Attachment
                        </a>
                      </div>
                    )}
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-primary/20 sticky bottom-6">
          <CardContent className="p-4">
            {uploadedFile && (
              <div className="mb-3 flex items-center gap-2 p-2 bg-primary/10 rounded-lg">
                <Paperclip className="w-4 h-4 text-primary" />
                <span className="text-sm flex-1 truncate">{uploadedFile.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={removeFile}
                  className="h-6 w-6"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
            <div className="flex gap-2">
              <Input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="flex-shrink-0"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Type your message..."
                className="min-h-[60px] resize-none"
                disabled={loading}
              />
              <Button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="gap-2 flex-shrink-0"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
