import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ScrollText, MessageCircle, Search, Calendar, Archive, Trash2, Clock, Plus } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Conversation {
  id: string;
  title: string;
  subject: string | null;
  created_at: string;
  last_activity: string;
  is_archived: boolean;
}

export default function AIChatHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "archived">("all");

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user, filter]);

  const fetchConversations = async () => {
    try {
      let query = supabase
        .from("ai_conversations")
        .select("*")
        .eq("user_id", user?.id)
        .order("last_activity", { ascending: false });

      if (filter === "archived") {
        query = query.eq("is_archived", true);
      } else {
        query = query.eq("is_archived", false);
      }

      const { data, error } = await query;

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast.error("Failed to load conversation history");
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveConversation = async (conversationId: string, currentlyArchived: boolean) => {
    try {
      const { error } = await supabase
        .from("ai_conversations")
        .update({ is_archived: !currentlyArchived })
        .eq("id", conversationId);

      if (error) throw error;

      toast.success(currentlyArchived ? "Conversation unarchived" : "Conversation archived");
      fetchConversations();
    } catch (error) {
      console.error("Error archiving conversation:", error);
      toast.error("Failed to archive conversation");
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    if (!confirm("Are you sure you want to delete this conversation? This action cannot be undone.")) {
      return;
    }

    try {
      // Delete messages first
      await supabase.from("ai_messages").delete().eq("conversation_id", conversationId);
      
      // Then delete conversation
      const { error } = await supabase
        .from("ai_conversations")
        .delete()
        .eq("id", conversationId);

      if (error) throw error;

      toast.success("Conversation deleted");
      fetchConversations();
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast.error("Failed to delete conversation");
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (conv.subject && conv.subject.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Please log in to view your chat history</p>
            <Button onClick={() => navigate("/auth")} className="mt-4">
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ScrollText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text">AI Chat History</h1>
              <p className="text-muted-foreground">View and manage your past conversations</p>
            </div>
          </div>
          <Button onClick={() => navigate("/ai-chat")}>
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>

        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
            >
              Active
            </Button>
            <Button
              variant={filter === "archived" ? "default" : "outline"}
              onClick={() => setFilter("archived")}
            >
              <Archive className="h-4 w-4 mr-2" />
              Archived
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Loading conversations...</p>
          </CardContent>
        </Card>
      ) : filteredConversations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-2">
              {searchQuery ? "No conversations found matching your search" : "No conversations yet"}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Start a new chat with the AI assistant to begin
            </p>
            <Button onClick={() => navigate("/ai-chat")}>
              <Plus className="h-4 w-4 mr-2" />
              Start New Chat
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredConversations.map((conversation) => (
            <Card
              key={conversation.id}
              className="cursor-pointer hover:shadow-lg transition-shadow group"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg line-clamp-2 mb-2">
                      {conversation.title}
                    </CardTitle>
                    {conversation.subject && (
                      <Badge variant="secondary" className="text-xs">
                        {conversation.subject}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Created: {format(new Date(conversation.created_at), "MMM d, yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Last activity: {format(new Date(conversation.last_activity), "MMM d, yyyy h:mm a")}</span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/niranx/ai-chat?conversation=${conversation.id}`)}
                    >
                      <MessageCircle className="h-3 w-3 mr-1" />
                      Open
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleArchiveConversation(conversation.id, conversation.is_archived);
                      }}
                    >
                      <Archive className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteConversation(conversation.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
