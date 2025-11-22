import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, Users, MessageSquare, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
}

interface ChatRoom {
  id: string;
  name: string;
  is_group: boolean;
}

interface ForwardMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messageId: string;
  messageContent: string;
}

export function ForwardMessageDialog({ 
  open, 
  onOpenChange, 
  messageId, 
  messageContent 
}: ForwardMessageDialogProps) {
  const { user } = useAuth();
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<ChatRoom[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTarget, setSelectedTarget] = useState<{ type: 'user' | 'room'; id: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && user) {
      fetchUsers();
      fetchChatRooms();
    }
  }, [open, user]);

  useEffect(() => {
    if (searchQuery) {
      const filteredU = allUsers.filter(
        (u) =>
          u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filteredU);

      const filteredR = chatRooms.filter(
        (r) => r.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRooms(filteredR);
    } else {
      setFilteredUsers(allUsers);
      setFilteredRooms(chatRooms);
    }
  }, [searchQuery, allUsers, chatRooms]);

  const fetchUsers = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, user_id, username, display_name, avatar_url")
        .neq("user_id", user.id)
        .order("display_name");

      if (error) throw error;
      setAllUsers(data || []);
      setFilteredUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchChatRooms = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("chat_rooms")
        .select("id, name, is_group")
        .eq("is_group", true)
        .order("name");

      if (error) throw error;
      setChatRooms(data || []);
      setFilteredRooms(data || []);
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const forwardMessage = async () => {
    if (!user || !selectedTarget) return;

    setLoading(true);
    try {
      if (selectedTarget.type === 'user') {
        // Forward to direct message
        const { error } = await supabase
          .from("messages")
          .insert({
            content: messageContent,
            sender_id: user.id,
            receiver_id: selectedTarget.id,
            is_forwarded: true,
            original_message_id: messageId,
            forwarded_from: 'chat'
          });

        if (error) throw error;
      } else {
        // Forward to community/group
        const { error } = await supabase
          .from("messages")
          .insert({
            content: messageContent,
            sender_id: user.id,
            receiver_id: user.id, // Placeholder for community messages
            room_id: selectedTarget.id,
            is_forwarded: true,
            original_message_id: messageId,
            forwarded_from: 'chat'
          });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Message forwarded successfully",
      });

      onOpenChange(false);
      resetDialog();
    } catch (error) {
      console.error("Error forwarding message:", error);
      toast({
        title: "Error",
        description: "Failed to forward message",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetDialog = () => {
    setSelectedTarget(null);
    setSearchQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Forward Message
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Message Preview */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Message:</p>
            <p className="text-sm line-clamp-2">{messageContent}</p>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tabs for Users and Groups */}
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="users">Direct Messages</TabsTrigger>
              <TabsTrigger value="groups">Groups</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="mt-4">
              <ScrollArea className="h-[300px] border rounded-md">
                <div className="p-2 space-y-1">
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No users found</p>
                    </div>
                  ) : (
                    filteredUsers.map((profile) => (
                      <div
                        key={profile.user_id}
                        className={`flex items-center gap-3 p-2 hover:bg-muted rounded-lg cursor-pointer ${
                          selectedTarget?.type === 'user' && selectedTarget.id === profile.user_id ? 'bg-muted' : ''
                        }`}
                        onClick={() => setSelectedTarget({ type: 'user', id: profile.user_id })}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={profile.avatar_url} />
                          <AvatarFallback>
                            {getInitials(profile.display_name || profile.username || "U")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {profile.display_name || profile.username}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            @{profile.username}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="groups" className="mt-4">
              <ScrollArea className="h-[300px] border rounded-md">
                <div className="p-2 space-y-1">
                  {filteredRooms.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No groups found</p>
                    </div>
                  ) : (
                    filteredRooms.map((room) => (
                      <div
                        key={room.id}
                        className={`flex items-center gap-3 p-2 hover:bg-muted rounded-lg cursor-pointer ${
                          selectedTarget?.type === 'room' && selectedTarget.id === room.id ? 'bg-muted' : ''
                        }`}
                        onClick={() => setSelectedTarget({ type: 'room', id: room.id })}
                      >
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{room.name}</p>
                          <Badge variant="secondary" className="text-xs">Group</Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                resetDialog();
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={forwardMessage}
              disabled={!selectedTarget || loading}
              className="flex-1 gap-2"
            >
              <Send className="w-4 h-4" />
              {loading ? "Forwarding..." : "Forward"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
