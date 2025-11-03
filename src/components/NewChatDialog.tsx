import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Search, Users, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
}

interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChatCreated: (chatId: string, isGroup: boolean) => void;
}

export function NewChatDialog({ open, onOpenChange, onChatCreated }: NewChatDialogProps) {
  const { user } = useAuth();
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && user) {
      fetchUsers();
    }
  }, [open, user]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = allUsers.filter(
        (u) =>
          u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(allUsers);
    }
  }, [searchQuery, allUsers]);

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
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    }
  };

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const createChat = async () => {
    if (!user || selectedUsers.size === 0) return;

    setLoading(true);
    try {
      const selectedUserIds = Array.from(selectedUsers);

      // If only 1 user selected, create direct message
      if (selectedUserIds.length === 1) {
        onChatCreated(selectedUserIds[0], false);
        onOpenChange(false);
        resetDialog();
        return;
      }

      // If 2+ users selected, create group chat
      if (!groupName.trim()) {
        toast({
          title: "Group name required",
          description: "Please enter a name for your group chat",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Create chat room
      const { data: room, error: roomError } = await supabase
        .from("chat_rooms")
        .insert({
          name: groupName.trim(),
          is_group: true,
          created_by: user.id,
        })
        .select()
        .single();

      if (roomError) throw roomError;

      // Add creator as admin
      const members = [
        {
          room_id: room.id,
          user_id: user.id,
          role: "admin",
        },
        ...selectedUserIds.map((userId) => ({
          room_id: room.id,
          user_id: userId,
          role: "member",
        })),
      ];

      const { error: membersError } = await supabase
        .from("chat_room_members")
        .insert(members);

      if (membersError) throw membersError;

      toast({
        title: "Success",
        description: "Group chat created successfully",
      });

      onChatCreated(room.id, true);
      onOpenChange(false);
      resetDialog();
    } catch (error) {
      console.error("Error creating chat:", error);
      toast({
        title: "Error",
        description: "Failed to create chat",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetDialog = () => {
    setSelectedUsers(new Set());
    setGroupName("");
    setSearchQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Start New Chat
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Selected Users */}
          {selectedUsers.size > 0 && (
            <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-lg">
              <Badge variant="secondary" className="gap-1">
                <Users className="w-3 h-3" />
                {selectedUsers.size} selected
              </Badge>
              {selectedUsers.size >= 2 && (
                <Badge variant="outline" className="gap-1">
                  <MessageSquare className="w-3 h-3" />
                  Group Chat
                </Badge>
              )}
            </div>
          )}

          {/* Group Name Input (shown when 2+ users selected) */}
          {selectedUsers.size >= 2 && (
            <Input
              placeholder="Enter group name..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          )}

          {/* User List */}
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
                    className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg cursor-pointer"
                    onClick={() => toggleUserSelection(profile.user_id)}
                  >
                    <Checkbox
                      checked={selectedUsers.has(profile.user_id)}
                      onCheckedChange={() => toggleUserSelection(profile.user_id)}
                    />
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
              onClick={createChat}
              disabled={selectedUsers.size === 0 || loading}
              className="flex-1"
            >
              {loading ? (
                "Creating..."
              ) : selectedUsers.size === 1 ? (
                "Start Chat"
              ) : (
                `Create Group (${selectedUsers.size})`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
