import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  message_type?: string;
  profiles?: {
    username: string;
    avatar_url: string | null;
    display_name?: string;
  };
}

export default function Community() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
    
    // Subscribe to new community messages
    const channel = supabase
      .channel("community-messages")
      .on(
        "postgres_changes",
        { 
          event: "INSERT", 
          schema: "public", 
          table: "messages",
          filter: "message_type=eq.community"
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select(`
          id,
          sender_id,
          content,
          created_at,
          message_type
        `)
        .eq("message_type", "community")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      // Fetch sender profiles for all messages
      if (data && data.length > 0) {
        const senderIds = [...new Set(data.map(m => m.sender_id))];
        const { data: profilesData } = await supabase
          .rpc('get_public_user_info', { target_user_id: senderIds[0] });

        // Fetch all profiles separately since we can't do complex joins
        const profilesMap = new Map();
        for (const senderId of senderIds) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, avatar_url, display_name')
            .eq('user_id', senderId)
            .single();
          
          if (profile) {
            profilesMap.set(senderId, profile);
          }
        }

        // Attach profiles to messages
        const messagesWithProfiles = data.map(msg => ({
          ...msg,
          profiles: profilesMap.get(msg.sender_id) || { username: 'Anonymous', avatar_url: null }
        }));

        setMessages(messagesWithProfiles);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim()) return;

    // Validate message length
    if (newMessage.trim().length > 1000) {
      toast.error("Message is too long (max 1000 characters)");
      return;
    }

    try {
      const { error } = await supabase.from("messages").insert({
        sender_id: user.id,
        receiver_id: user.id, // Using same ID for community messages
        content: newMessage.trim(),
        message_type: "community",
      });

      if (error) throw error;

      setNewMessage("");
      toast.success("Message sent!");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold gradient-text">Community</h1>
        <p className="text-muted-foreground">
          Connect with fellow students and share your thoughts
        </p>
      </div>

      <Card className="p-4 mb-6">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Textarea
            placeholder="Share something with the community..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="min-h-[80px]"
          />
          <Button type="submit" size="lg" disabled={!newMessage.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </Card>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-2">No messages yet</p>
            <p className="text-sm text-muted-foreground">Be the first to share something!</p>
          </div>
        ) : (
          messages.map((message) => (
            <Card key={message.id} className="p-4 glass-card hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-3">
                <Avatar className="ring-2 ring-primary/20">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
                    {message.profiles?.username?.[0]?.toUpperCase() || 
                     message.profiles?.display_name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-sm">
                      {message.profiles?.display_name || message.profiles?.username || "Anonymous"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm break-words whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
