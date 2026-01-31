import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Trash2, Calendar, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Conversation {
  id: string;
  title: string;
  model: string;
  created_at: string;
  updated_at: string;
}

export default function GroqChatHistory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  const loadConversations = async () => {
    try {
      const { data, error } = await supabase
        .from("groq_conversations")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error: any) {
      toast.error("Failed to load conversations");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      const { error } = await supabase
        .from("groq_conversations")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      toast.success("Conversation deleted");
      setConversations(prev => prev.filter(c => c.id !== id));
    } catch (error: any) {
      toast.error("Failed to delete conversation");
      console.error(error);
    }
  };

  const openConversation = (id: string) => {
    navigate(`/groq-chat?conversation=${id}`);
  };

  const startNewChat = () => {
    navigate("/groq-chat");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse text-muted-foreground">Loading conversations...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-400 to-blue-400 bg-clip-text text-transparent">
              Groq Chat History
            </h1>
            <p className="text-muted-foreground mt-2">View and manage your Groq AI conversations</p>
          </div>
          <Button onClick={startNewChat} className="gap-2">
            <Sparkles className="w-4 h-4" />
            New Chat
          </Button>
        </div>

        {conversations.length === 0 ? (
          <Card className="bg-card/50 backdrop-blur border-primary/20">
            <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
              <MessageCircle className="w-16 h-16 text-muted-foreground" />
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">No conversations yet</h3>
                <p className="text-muted-foreground mb-4">Start a new chat to begin your conversation</p>
                <Button onClick={startNewChat} className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  Start New Chat
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {conversations.map((conversation) => (
              <Card
                key={conversation.id}
                className="bg-card/50 backdrop-blur border-primary/20 hover:border-primary/40 transition-all cursor-pointer group"
                onClick={() => openConversation(conversation.id)}
              >
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                    {conversation.title}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 text-xs">
                    <Calendar className="w-3 h-3" />
                    {formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground bg-primary/10 px-2 py-1 rounded-full">
                      {conversation.model}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conversation.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
