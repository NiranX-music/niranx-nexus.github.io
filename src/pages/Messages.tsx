import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  MessageSquare, 
  Send, 
  Plus, 
  Search, 
  Phone, 
  Video, 
  MoreHorizontal,
  ArrowLeft,
  Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { formatDistance } from 'date-fns';

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
  message_type: string;
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
  const { user, profile } = useAuth();
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [selectedChat, setSelectedChat] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [showUserList, setShowUserList] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchChats();
      fetchAllUsers();
      setupRealtimeSubscription();
    }
  }, [user]);

  const fetchAllUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .neq('user_id', user?.id);

    if (error) {
      console.error('Error fetching users:', error);
    } else {
      setAllUsers(data || []);
    }
  };

  const fetchChats = async () => {
    if (!user) return;

    // Fetch messages with profiles joined manually
    const { data: messagesData, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    // Get unique user IDs that are conversation partners
    const partnerIds = new Set<string>();
    messagesData?.forEach((message: any) => {
      const partnerId = message.sender_id === user.id ? message.receiver_id : message.sender_id;
      partnerIds.add(partnerId);
    });

    // Fetch profiles for all partners
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('*')
      .in('user_id', Array.from(partnerIds));

    // Group messages by conversation partners
    const chatMap = new Map<string, ChatPreview>();
    const profileMap = new Map<string, Profile>();
    
    // Create profile map for quick lookup
    profilesData?.forEach((profile: any) => {
      profileMap.set(profile.user_id, profile);
    });
    
    messagesData?.forEach((message: any) => {
      const partnerId = message.sender_id === user.id ? message.receiver_id : message.sender_id;
      const partnerProfile = profileMap.get(partnerId);

      if (partnerProfile && !chatMap.has(partnerId)) {
        chatMap.set(partnerId, {
          user: partnerProfile,
          lastMessage: message,
          unreadCount: message.receiver_id === user.id && !message.is_read ? 1 : 0
        });
      } else if (partnerProfile) {
        const existing = chatMap.get(partnerId)!;
        if (!existing.lastMessage || new Date(message.created_at) > new Date(existing.lastMessage.created_at)) {
          existing.lastMessage = message;
        }
        if (message.receiver_id === user.id && !message.is_read) {
          existing.unreadCount++;
        }
      }
    });

    setChats(Array.from(chatMap.values()));
  };

  const fetchMessages = async (partnerId: string) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
    } else {
      setMessages(data || []);
      // Mark messages as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_id', partnerId)
        .eq('receiver_id', user.id);
    }
  };

  const sendMessage = async () => {
    if (!user || !selectedChat || !newMessage.trim()) return;

    setLoading(true);

    const { error } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        receiver_id: selectedChat.user_id,
        content: newMessage.trim(),
        message_type: 'text'
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } else {
      setNewMessage('');
      fetchMessages(selectedChat.user_id);
      fetchChats();
    }

    setLoading(false);
  };

  const startNewChat = (userProfile: Profile) => {
    setShowUserList(false);
    navigate(`/messages/${userProfile.user_id}`);
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        () => {
          fetchChats();
          if (selectedChat) {
            fetchMessages(selectedChat.user_id);
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Authentication Required</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/login')} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            onClick={() => setShowUserList(true)}
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
                        onClick={() => navigate(`/messages/${chat.user.user_id}`)}
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
                            className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                message.sender_id === user.id
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

        {/* New Chat Modal */}
        {showUserList && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Start New Chat
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowUserList(false)}
                  >
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-60">
                  {allUsers.map((userProfile) => (
                    <div
                      key={userProfile.user_id}
                      className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg cursor-pointer"
                      onClick={() => startNewChat(userProfile)}
                    >
                      <Avatar>
                        <AvatarImage src={userProfile.avatar_url} />
                        <AvatarFallback>
                          {getInitials(userProfile.display_name || userProfile.username || 'U')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {userProfile.display_name || userProfile.username}
                        </p>
                        <p className="text-sm text-muted-foreground">@{userProfile.username}</p>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;