import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useXFlow, useXFlowMessages, XFlowProfile } from "@/hooks/useXFlow";
import { ArrowLeft, Send, Image, Smile, MoreHorizontal, Search, Edit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export default function XFlowMessages() {
  const navigate = useNavigate();
  const { currentProfile, isAuthenticated, isLoading: profileLoading } = useXFlow();
  const { conversations, messages, fetchConversations, fetchMessages, sendMessage } = useXFlowMessages(currentProfile?.id);
  
  const [selectedChat, setSelectedChat] = useState<XFlowProfile | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<XFlowProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profileLoading && !isAuthenticated) {
      navigate('/xflow/login');
    }
  }, [profileLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (currentProfile) {
      fetchConversations(currentProfile.id);
    }
  }, [currentProfile]);

  useEffect(() => {
    if (currentProfile && selectedChat) {
      fetchMessages(currentProfile.id, selectedChat.id);
    }
  }, [currentProfile, selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!currentProfile) return;

    const channel = supabase
      .channel(`xflow-dm-${currentProfile.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'xflow_messages'
      }, () => {
        if (selectedChat) {
          fetchMessages(currentProfile.id, selectedChat.id);
        }
        fetchConversations(currentProfile.id);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentProfile, selectedChat]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const { data } = await supabase
      .from('xflow_profiles')
      .select('*')
      .ilike('username', `%${query}%`)
      .neq('id', currentProfile?.id)
      .limit(10);

    setSearchResults(data || []);
    setIsSearching(false);
  };

  const handleSendMessage = async () => {
    if (!currentProfile || !selectedChat || !newMessage.trim()) return;

    await sendMessage(currentProfile.id, selectedChat.id, newMessage.trim());
    setNewMessage("");
  };

  const startChat = (profile: XFlowProfile) => {
    setSelectedChat(profile);
    setSearchQuery("");
    setSearchResults([]);
  };

  if (profileLoading || !currentProfile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Conversations List */}
      <div className={`w-full md:w-[350px] border-r border-white/10 flex flex-col ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
        <header className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/xflow')}>
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="font-semibold">{currentProfile.username}</h1>
          </div>
          <button>
            <Edit className="h-5 w-5" />
          </button>
        </header>

        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
            <Input
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 bg-white/10 border-0"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {searchQuery.length >= 2 ? (
            <div className="p-2">
              {isSearching ? (
                <div className="text-center py-4 text-white/50">Searching...</div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-4 text-white/50">No users found</div>
              ) : (
                searchResults.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => startChat(profile)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/10"
                  >
                    <Avatar>
                      <AvatarImage src={profile.avatar_url || ''} />
                      <AvatarFallback>{profile.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="font-semibold">{profile.username}</p>
                      {profile.display_name && (
                        <p className="text-sm text-white/50">{profile.display_name}</p>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          ) : (
            <div className="p-2">
              {conversations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-white/50">No conversations yet</p>
                  <p className="text-sm text-white/30">Search for users to start chatting</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.partner.id}
                    onClick={() => setSelectedChat(conv.partner)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 ${
                      selectedChat?.id === conv.partner.id ? 'bg-white/10' : ''
                    }`}
                  >
                    <Avatar>
                      <AvatarImage src={conv.partner.avatar_url || ''} />
                      <AvatarFallback>{conv.partner.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left overflow-hidden">
                      <p className="font-semibold">{conv.partner.username}</p>
                      <p className="text-sm text-white/50 truncate">
                        {conv.lastMessage.content}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
        {selectedChat ? (
          <>
            <header className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button className="md:hidden" onClick={() => setSelectedChat(null)}>
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <Avatar>
                  <AvatarImage src={selectedChat.avatar_url || ''} />
                  <AvatarFallback>{selectedChat.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{selectedChat.username}</p>
                  <p className="text-xs text-white/50">Active now</p>
                </div>
              </div>
              <button>
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </header>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                <AnimatePresence>
                  {messages.map((msg, index) => {
                    const isMine = msg.sender_id === currentProfile.id;
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${isMine ? 'order-2' : ''}`}>
                          {!isMine && (
                            <Avatar className="h-6 w-6 mb-1">
                              <AvatarImage src={msg.sender?.avatar_url || ''} />
                              <AvatarFallback className="text-xs">
                                {selectedChat.username[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div className={`rounded-2xl px-4 py-2 ${
                            isMine 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-white/10'
                          }`}>
                            {msg.shared_post && (
                              <div className="mb-2 p-2 bg-black/30 rounded-lg">
                                <p className="text-xs text-white/50">Shared post</p>
                              </div>
                            )}
                            <p>{msg.content}</p>
                          </div>
                          <p className="text-[10px] text-white/30 mt-1 px-2">
                            {format(new Date(msg.created_at), 'HH:mm')}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <button className="p-2">
                  <Smile className="h-6 w-6" />
                </button>
                <Input
                  placeholder="Message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 bg-white/10 border-0"
                />
                <button className="p-2">
                  <Image className="h-6 w-6" />
                </button>
                {newMessage.trim() && (
                  <Button size="sm" onClick={handleSendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="h-24 w-24 rounded-full border-2 border-white/20 flex items-center justify-center mx-auto mb-4">
                <Send className="h-10 w-10 text-white/30" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Your messages</h3>
              <p className="text-white/50 mb-4">Send private messages to a friend</p>
              <Button onClick={() => document.querySelector('input')?.focus()}>
                Send message
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
