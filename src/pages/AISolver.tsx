import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Brain, Send, Image as ImageIcon, Loader2, Plus, Trash2 } from "lucide-react";
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    if (currentConversationId) {
      loadMessages(currentConversationId);
    }
  }, [currentConversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

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
      toast.error("Failed to load conversations");
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
      
      const loadedMessages: Message[] = (data || []).map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
        image_url: msg.image_url || undefined,
      }));
      
      setMessages(loadedMessages);
    } catch (error) {
      console.error("Error loading messages:", error);
      toast.error("Failed to load messages");
    }
  };

  const createNewConversation = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("ai_solver_conversations")
        .insert({
          user_id: user.id,
          title: "New Problem",
          subject: null,
        })
        .select()
        .single();

      if (error) throw error;
      
      setConversations([data, ...conversations]);
      setCurrentConversationId(data.id);
      setMessages([]);
      toast.success("New conversation created");
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast.error("Failed to create conversation");
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      const { error } = await supabase
        .from("ai_solver_conversations")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      setConversations(conversations.filter((c) => c.id !== id));
      
      if (currentConversationId === id) {
        setCurrentConversationId(conversations[0]?.id || null);
        setMessages([]);
      }
      
      toast.success("Conversation deleted");
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast.error("Failed to delete conversation");
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          setSelectedImage(file);
          const reader = new FileReader();
          reader.onloadend = () => {
            setImagePreview(reader.result as string);
            toast.success("Image pasted! Ready to analyze.");
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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const sendMessage = async () => {
    if ((!input.trim() && !selectedImage) || !user || isLoading) return;

    // Create new conversation if none exists
    if (!currentConversationId) {
      await createNewConversation();
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: input.trim() || "Analyze this image",
    };

    // Handle image if present
    if (selectedImage && imagePreview) {
      userMessage.image_url = imagePreview;
    }

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Save user message to database
      const { error: userMsgError } = await supabase
        .from("ai_solver_messages")
        .insert({
          conversation_id: currentConversationId,
          role: "user",
          content: userMessage.content,
          image_url: userMessage.image_url,
        });

      if (userMsgError) throw userMsgError;

      // Prepare messages for AI
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

      // Add current message
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

      // Call edge function
      const response = await supabase.functions.invoke("ai-solver", {
        body: { messages: messagesToSend, conversationId: currentConversationId },
      });

      if (response.error) throw response.error;

      // Stream the response
      let assistantMessage = "";
      const reader = response.data.getReader();
      const decoder = new TextDecoder();

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
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                assistantMessage += content;
                setMessages((prev) => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1].content = assistantMessage;
                  return newMessages;
                });
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }

      // Save assistant message to database
      if (assistantMessage) {
        await supabase.from("ai_solver_messages").insert({
          conversation_id: currentConversationId,
          role: "assistant",
          content: assistantMessage,
        });

        // Update conversation title if it's the first message
        if (messages.length === 0) {
          const title = input.trim().slice(0, 50) + (input.length > 50 ? "..." : "");
          await supabase
            .from("ai_solver_conversations")
            .update({ title })
            .eq("id", currentConversationId);
          loadConversations();
        }

        // Award XP
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
    <div className="flex h-[calc(100vh-4rem)] gap-4 p-4">
      {/* Sidebar - Conversations */}
      <div className="w-64 flex flex-col gap-2">
        <Button onClick={createNewConversation} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          New Problem
        </Button>
        <ScrollArea className="flex-1">
          <div className="space-y-2">
            {isLoadingConversations ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : conversations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center p-4">
                No conversations yet
              </p>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`p-3 rounded-lg cursor-pointer flex items-center justify-between group ${
                    currentConversationId === conv.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-card hover:bg-accent"
                  }`}
                  onClick={() => setCurrentConversationId(conv.id)}
                >
                  <span className="text-sm truncate flex-1">{conv.title}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conv.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>GPAI AI Solver</CardTitle>
              <CardDescription>
                Upload images or type your problem - I can help with any subject!
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 px-6">
            <div className="space-y-4 py-4">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-12">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Start by typing a problem or uploading an image</p>
                </div>
              )}
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {message.image_url && (
                      <img
                        src={message.image_url}
                        alt="Problem"
                        className="rounded-lg mb-2 max-w-full"
                      />
                    )}
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-4">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t p-4 space-y-2">
            {imagePreview && (
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-20 rounded-lg border"
                />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-6 w-6"
                  onClick={removeImage}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
            <div className="flex gap-2">
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
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onPaste={handlePaste}
                placeholder="Type your problem here or paste an image (Ctrl+V)..."
                className="flex-1 min-h-[60px]"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                disabled={isLoading}
              />
              <Button onClick={sendMessage} disabled={isLoading || (!input.trim() && !selectedImage)}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}