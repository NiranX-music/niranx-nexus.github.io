import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  Send, 
  Plus, 
  Search, 
  Phone, 
  Video, 
  MoreHorizontal,
  ArrowLeft,
  Users,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { formatDistance } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { NewChatDialog } from '@/components/NewChatDialog';
import { encryptMessage, decryptMessage } from '@/lib/security';
import { useMessageSync } from '@/hooks/useRealtimeSync';

interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  message_type?: string;
  is_read: boolean;
  created_at: string;
  sender_profile?: Profile;
}

interface ChatPreview {
  user: Profile;
  lastMessage?: Message;
  unreadCount: number;
}

const Messages = () => {
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [selectedChat, setSelectedChat] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Real-time message sync across devices
  const handleNewMessage = useCallback(async (msg: any) => {
    if (!user) return;
    
    // If viewing this conversation, add message
    if (selectedChat && (msg.sender_id === selectedChat.user_id || msg.receiver_id === selectedChat.user_id)) {
      try {
        const decryptedContent = await decryptMessage(msg.content, user.id);
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, { ...msg, content: decryptedContent }];
        });
      } catch {
        // If decryption fails, still add the message
        setMessages((prev) => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
    }
    
    // Refresh chat list
    fetchChats();
  }, [selectedChat, user]);

  useMessageSync(selectedChat?.user_id, handleNewMessage);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Back online",
        description: "Messages will sync automatically",
      });
      fetchChats();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "You're offline",
        description: "Messages will be sent when you're back online",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (user) {
      fetchChats();
    }
  }, [user]);

  useEffect(() => {
    const cleanup = setupRealtimeSubscription();
    return cleanup;
  }, [user]);

  const fetchChats = async () => {
    if (!user) return;
    
    try {
      // Fetch messages where user is involved
      const { data: messageData, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          sender_id,
          receiver_id,
          created_at,
          is_read
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by conversation partner
      const conversationsMap = new Map<string, ChatPreview>();
      
      for (const msg of messageData || []) {
        const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        
        if (!conversationsMap.has(partnerId)) {
          // Fetch partner profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, user_id, username, display_name, avatar_url')
            .eq('user_id', partnerId)
            .single();

          if (profile) {
            conversationsMap.set(partnerId, {
              user: profile,
              lastMessage: msg,
              unreadCount: msg.receiver_id === user.id && !msg.is_read ? 1 : 0,
            });
          }
        } else {
          const existing = conversationsMap.get(partnerId)!;
          if (msg.receiver_id === user.id && !msg.is_read) {
            existing.unreadCount++;
          }
        }
      }

      setChats(Array.from(conversationsMap.values()));
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
    }
  };

  const fetchMessages = async (partnerId: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Decrypt messages
      const decryptedMessages = await Promise.all(
        (data || []).map(async (msg) => ({
          ...msg,
          content: await decryptMessage(msg.content, user.id)
        }))
      );
      
      setMessages(decryptedMessages);

      // Mark as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('receiver_id', user.id)
        .eq('sender_id', partnerId)
        .eq('is_read', false);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!selectedChat || !newMessage.trim() || !user) return;

    setLoading(true);

    try {
      // Encrypt message content
      const encryptedContent = await encryptMessage(newMessage.trim(), user.id);
      
      const { error } = await supabase
        .from('messages')
        .insert({
          content: encryptedContent,
          sender_id: user.id,
          receiver_id: selectedChat.user_id,
        });

      if (error) throw error;

      setNewMessage('');
      await fetchMessages(selectedChat.user_id);
      await fetchChats();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChatCreated = async (chatId: string, isGroup: boolean) => {
    if (isGroup) {
      // Navigate to group chat room
      navigate(`/niranx/chat-room/${chatId}`);
    } else {
      // For direct message, fetch the user profile and set as selected chat
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id, user_id, username, display_name, avatar_url')
          .eq('user_id', chatId)
          .single();

        if (error) throw error;
        
        if (profile) {
          setSelectedChat(profile);
          await fetchMessages(chatId);
          await fetchChats();
        }
      } catch (error) {
        console.error('Error fetching chat partner:', error);
        toast({
          title: "Error",
          description: "Failed to open chat",
          variant: "destructive",
        });
      }
    }
  };

  const setupRealtimeSubscription = () => {
    if (!user) return () => {};

    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMsg = payload.new as Message;
          
          // If viewing this conversation, add message
          if (selectedChat && (newMsg.sender_id === selectedChat.user_id || newMsg.receiver_id === selectedChat.user_id)) {
            setMessages((prev) => [...prev, newMsg]);
          }
          
          // Refresh chat list
          fetchChats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Messages
            </h1>
          </div>
          <Button 
            onClick={() => setShowNewChatDialog(true)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Chat List */}
          <Card className="col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Chats
                </CardTitle>
                <Badge variant="secondary">{chats.length}</Badge>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                {chats.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No conversations yet</p>
                    <p className="text-sm">Start chatting with other users!</p>
                  </div>
                ) : (
                  chats
                    .filter(chat => 
                      chat.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      chat.user?.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((chat) => (
                      <div
                        key={chat.user.user_id}
                        className={`p-4 border-b hover:bg-muted/50 cursor-pointer transition-colors ${
                          selectedChat?.user_id === chat.user.user_id ? 'bg-muted' : ''
                        }`}
                        onClick={() => {
                          setSelectedChat(chat.user);
                          fetchMessages(chat.user.user_id);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={chat.user.avatar_url} />
                            <AvatarFallback>
                              {getInitials(chat.user.display_name || chat.user.username || 'U')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium truncate">
                                {chat.user.display_name || chat.user.username}
                              </p>
                              {chat.lastMessage && (
                                <span className="text-xs text-muted-foreground">
                                  {formatDistance(new Date(chat.lastMessage.created_at), new Date(), { addSuffix: true })}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-muted-foreground truncate">
                                {chat.lastMessage?.content || 'No messages yet'}
                              </p>
                              {chat.unreadCount > 0 && (
                                <Badge variant="destructive" className="ml-2 text-xs">
                                  {chat.unreadCount}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="col-span-1 lg:col-span-2">
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={selectedChat.avatar_url} />
                        <AvatarFallback>
                          {getInitials(selectedChat.display_name || selectedChat.username || 'U')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {selectedChat.display_name || selectedChat.username}
                        </p>
                        <p className="text-sm text-muted-foreground">@{selectedChat.username}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Video className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="p-0 flex flex-col h-[500px]">
                  <ScrollArea className="flex-1 p-4">
                    {messages.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No messages yet</p>
                        <p className="text-sm">Send a message to start the conversation!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                message.sender_id === user?.id
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {new Date(message.created_at).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="border-t p-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        disabled={loading}
                      />
                      <Button 
                        onClick={sendMessage} 
                        disabled={loading || !newMessage.trim()}
                        className="gap-2"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Select a conversation</p>
                  <p>Choose a chat from the sidebar to start messaging</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* New Chat Dialog */}
        <NewChatDialog
          open={showNewChatDialog}
          onOpenChange={setShowNewChatDialog}
          onChatCreated={handleChatCreated}
        />
      </div>
    </div>
  );
};

export default Messages;