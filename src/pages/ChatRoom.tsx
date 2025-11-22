import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Send,
  MoreVertical,
  Phone,
  Video,
  Search,
  Paperclip,
  Smile,
  Info,
  Heart,
  ThumbsUp,
  Laugh,
  Frown,
  Angry,
  Lightbulb,
  FileImage,
  File,
  Download,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Attachment {
  path: string;
  name: string;
  type: string;
  size: number;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  is_read: boolean;
  attachments?: Attachment[];
}

interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  reaction: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry';
  created_at: string;
}

interface Profile {
  id: string;
  display_name: string;
  avatar_url?: string;
  username?: string;
}

export default function ChatRoom() {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatPartner, setChatPartner] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [reactions, setReactions] = useState<Record<string, MessageReaction[]>>({});
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!chatId) {
      navigate("/niranx/messages");
      return;
    }

    fetchChatData();
    setupRealtimeSubscription();
    fetchReactions();
  }, [chatId, navigate]);

  const fetchChatData = async () => {
    if (!chatId || !user) return;

    try {
      // Fetch partner profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, user_id, username, display_name, avatar_url')
        .eq('user_id', chatId)
        .single();

      if (profileError) throw profileError;
      setChatPartner(profileData);

      // Fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${chatId}),and(sender_id.eq.${chatId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;
      setMessages((messagesData || []).map(msg => ({
        ...msg,
        attachments: (msg.attachments as any) || [],
      })));

      // Mark as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('receiver_id', user.id)
        .eq('sender_id', chatId)
        .eq('is_read', false);
    } catch (error) {
      console.error("Error fetching chat data:", error);
      toast({
        title: "Error",
        description: "Failed to load chat data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!user || !chatId) return () => {};

    const channel = supabase
      .channel(`chat-${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMsg = payload.new as Message;
          if (
            (newMsg.sender_id === user.id && newMsg.receiver_id === chatId) ||
            (newMsg.sender_id === chatId && newMsg.receiver_id === user.id)
          ) {
            setMessages((prev) => [...prev, newMsg]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchReactions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('message_reactions')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const grouped = (data || []).reduce((acc, reaction) => {
        if (!acc[reaction.message_id]) {
          acc[reaction.message_id] = [];
        }
        acc[reaction.message_id].push(reaction as MessageReaction);
        return acc;
      }, {} as Record<string, MessageReaction[]>);

      setReactions(grouped);
    } catch (error) {
      console.error("Error fetching reactions:", error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  };

  const uploadFiles = async (): Promise<Attachment[]> => {
    if (selectedFiles.length === 0 || !user) return [];

    setUploading(true);
    const uploadedFiles: Attachment[] = [];

    try {
      for (const file of selectedFiles) {
        const filePath = `${user.id}/${Date.now()}-${file.name}`;
        
        const { error: uploadError } = await supabase.storage
          .from('chat-files')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        uploadedFiles.push({
          path: filePath,
          name: file.name,
          type: file.type,
          size: file.size,
        });
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      toast({
        title: "Error",
        description: "Failed to upload files",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }

    return uploadedFiles;
  };

  const sendMessage = async () => {
    if ((!newMessage.trim() && selectedFiles.length === 0) || !chatId || !user) return;

    try {
      const attachments = await uploadFiles();

      const { error } = await supabase
        .from('messages')
        .insert({
          content: newMessage.trim() || "Sent an attachment",
          sender_id: user.id,
          receiver_id: chatId,
          attachments: attachments as any,
        });

      if (error) throw error;
      setNewMessage("");
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const addReaction = async (messageId: string, reactionType: MessageReaction['reaction']) => {
    if (!user) return;

    try {
      const existing = reactions[messageId]?.find(
        r => r.user_id === user.id && r.reaction === reactionType
      );

      if (existing) {
        await supabase
          .from('message_reactions')
          .delete()
          .eq('id', existing.id);

        setReactions(prev => ({
          ...prev,
          [messageId]: prev[messageId].filter(r => r.id !== existing.id),
        }));
      } else {
        const { data, error } = await supabase
          .from('message_reactions')
          .insert({
            message_id: messageId,
            user_id: user.id,
            reaction: reactionType,
          })
          .select()
          .single();

        if (error) throw error;

        setReactions(prev => ({
          ...prev,
          [messageId]: [...(prev[messageId] || []), data as MessageReaction],
        }));
      }
    } catch (error) {
      console.error("Error adding reaction:", error);
      toast({
        title: "Error",
        description: "Failed to add reaction",
        variant: "destructive",
      });
    }
  };

  const downloadFile = async (attachment: Attachment) => {
    try {
      const { data, error } = await supabase.storage
        .from('chat-files')
        .download(attachment.path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
      });
    }
  };

  const getReactionIcon = (reaction: string) => {
    switch (reaction) {
      case 'like': return <ThumbsUp className="w-3 h-3" />;
      case 'love': return <Heart className="w-3 h-3" />;
      case 'laugh': return <Laugh className="w-3 h-3" />;
      case 'wow': return <Lightbulb className="w-3 h-3" />;
      case 'sad': return <Frown className="w-3 h-3" />;
      case 'angry': return <Angry className="w-3 h-3" />;
      default: return null;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!chatPartner) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Chat not found</h3>
          <p className="text-muted-foreground">This conversation doesn't exist.</p>
          <Button onClick={() => navigate("/niranx/messages")} className="mt-4">
            Back to Messages
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Chat Header */}
      <Card className="rounded-b-none border-b">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/niranx/messages")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Avatar className="h-10 w-10">
                <AvatarImage src={chatPartner.avatar_url} />
                <AvatarFallback>
                  {getInitials(chatPartner.display_name || chatPartner.username || "User")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">
                  {chatPartner.display_name || chatPartner.username}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  Online
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Video className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Info className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender_id === user?.id ? "justify-end" : "justify-start"
              }`}
            >
              <div className="group">
                <div
                  className={`max-w-[70%] rounded-lg px-3 py-2 ${
                    message.sender_id === user?.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>

                  {/* File Attachments */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {message.attachments.map((attachment, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 p-2 rounded bg-background/10 hover:bg-background/20 cursor-pointer"
                          onClick={() => downloadFile(attachment)}
                        >
                          {attachment.type.startsWith('image/') ? (
                            <FileImage className="w-4 h-4" />
                          ) : (
                            <File className="w-4 h-4" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{attachment.name}</p>
                            <p className="text-xs opacity-70">{formatFileSize(attachment.size)}</p>
                          </div>
                          <Download className="w-3 h-3" />
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-xs opacity-70 mt-1">
                    {formatTime(message.created_at)}
                  </p>
                </div>

                {/* Reactions */}
                <div className="flex items-center gap-2 mt-1">
                  {reactions[message.id] && reactions[message.id].length > 0 && (
                    <div className="flex gap-1">
                      {Array.from(new Set(reactions[message.id].map(r => r.reaction))).map(reaction => {
                        const count = reactions[message.id].filter(r => r.reaction === reaction).length;
                        const hasReacted = reactions[message.id].some(r => r.reaction === reaction && r.user_id === user?.id);
                        return (
                          <Badge
                            key={reaction}
                            variant={hasReacted ? "default" : "secondary"}
                            className="text-xs gap-1 cursor-pointer"
                            onClick={() => addReaction(message.id, reaction as MessageReaction['reaction'])}
                          >
                            {getReactionIcon(reaction)}
                            {count > 1 && count}
                          </Badge>
                        );
                      })}
                    </div>
                  )}

                  {/* Add Reaction Button */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Smile className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => addReaction(message.id, 'like')}>
                        <ThumbsUp className="w-4 h-4 mr-2" /> Like
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => addReaction(message.id, 'love')}>
                        <Heart className="w-4 h-4 mr-2" /> Love
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => addReaction(message.id, 'laugh')}>
                        <Laugh className="w-4 h-4 mr-2" /> Laugh
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => addReaction(message.id, 'wow')}>
                        <Lightbulb className="w-4 h-4 mr-2" /> Wow
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => addReaction(message.id, 'sad')}>
                        <Frown className="w-4 h-4 mr-2" /> Sad
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => addReaction(message.id, 'angry')}>
                        <Angry className="w-4 h-4 mr-2" /> Angry
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <Card className="rounded-t-none border-t">
        <CardContent className="p-4">
          <div className="space-y-2">
            {/* Selected Files Preview */}
            {selectedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 p-2 bg-muted rounded-lg">
                {selectedFiles.map((file, idx) => (
                  <Badge key={idx} variant="secondary" className="gap-1">
                    {file.type.startsWith('image/') ? (
                      <FileImage className="w-3 h-3" />
                    ) : (
                      <File className="w-3 h-3" />
                    )}
                    {file.name}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                className="flex-1"
                disabled={uploading}
              />
              <Button
                onClick={sendMessage}
                size="icon"
                disabled={(!newMessage.trim() && selectedFiles.length === 0) || uploading}
              >
                {uploading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}