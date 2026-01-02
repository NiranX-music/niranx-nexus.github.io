import { useState, useEffect, useRef } from 'react';
import { useXstage } from '../contexts/XstageContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { XstageChannel, XstageMessage, MessageType } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Hash, Plus, Send, Paperclip, Image, FileText, MoreVertical, Trash2, Pin, Smile, X } from 'lucide-react';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const EMOJI_LIST = ['👍', '❤️', '😂', '🎸', '🔥', '🎵', '👏', '🤘'];

export const XstageChat = () => {
  const { currentProject, members } = useXstage();
  const { user } = useAuth();
  const [channels, setChannels] = useState<XstageChannel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<XstageChannel | null>(null);
  const [messages, setMessages] = useState<XstageMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showNewChannel, setShowNewChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentProject) {
      fetchChannels();
    }
  }, [currentProject]);

  useEffect(() => {
    if (selectedChannel) {
      fetchMessages();
      
      // Subscribe to new messages
      const channel = supabase
        .channel(`messages-${selectedChannel.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'xstage_messages',
          filter: `channel_id=eq.${selectedChannel.id}`,
        }, (payload) => {
          fetchMessages();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchChannels = async () => {
    if (!currentProject) return;
    
    try {
      const { data, error } = await supabase
        .from('xstage_channels')
        .select('*')
        .eq('project_id', currentProject.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      const typedChannels = (data || []) as XstageChannel[];
      setChannels(typedChannels);
      
      if (typedChannels.length > 0 && !selectedChannel) {
        setSelectedChannel(typedChannels[0]);
      }
    } catch (error) {
      console.error('Error fetching channels:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedChannel) return;

    try {
      const { data, error } = await supabase
        .from('xstage_messages')
        .select('*')
        .eq('channel_id', selectedChannel.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch sender profiles
      const userIds = [...new Set((data || []).map(m => m.sender_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      // Fetch reactions
      const messageIds = (data || []).map(m => m.id);
      const { data: reactions } = await supabase
        .from('xstage_message_reactions')
        .select('*')
        .in('message_id', messageIds);

      const reactionsByMessage = new Map<string, any[]>();
      reactions?.forEach(r => {
        const existing = reactionsByMessage.get(r.message_id) || [];
        reactionsByMessage.set(r.message_id, [...existing, r]);
      });

      const typedMessages = (data || []).map(m => ({
        ...m,
        message_type: m.message_type as MessageType,
        sender: profileMap.get(m.sender_id),
        reactions: reactionsByMessage.get(m.id) || [],
      })) as XstageMessage[];

      setMessages(typedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!selectedChannel || !user || !newMessage.trim()) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('xstage_messages')
        .insert({
          channel_id: selectedChannel.id,
          project_id: currentProject!.id,
          sender_id: user.id,
          content: newMessage.trim(),
          message_type: 'text',
        });

      if (error) throw error;
      setNewMessage('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedChannel || !user) return;

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('xstage-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('xstage-files')
        .getPublicUrl(filePath);

      let messageType: MessageType = 'file';
      if (file.type.startsWith('image/')) messageType = 'image';
      else if (file.type.startsWith('video/')) messageType = 'video';

      const { error } = await supabase
        .from('xstage_messages')
        .insert({
          channel_id: selectedChannel.id,
          project_id: currentProject!.id,
          sender_id: user.id,
          content: file.name,
          message_type: messageType,
          file_url: publicUrl,
          file_name: file.name,
          file_size: file.size,
        });

      if (error) throw error;
      toast.success('File uploaded');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload file');
    }

    e.target.value = '';
  };

  const handleCreateChannel = async () => {
    if (!currentProject || !user || !newChannelName.trim()) return;

    try {
      const { error } = await supabase
        .from('xstage_channels')
        .insert({
          project_id: currentProject.id,
          name: newChannelName.trim().toLowerCase().replace(/\s+/g, '-'),
          created_by: user.id,
        });

      if (error) throw error;
      
      setShowNewChannel(false);
      setNewChannelName('');
      fetchChannels();
      toast.success('Channel created');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create channel');
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    if (!user) return;

    try {
      // Check if reaction exists
      const { data: existing } = await supabase
        .from('xstage_message_reactions')
        .select('id')
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .eq('emoji', emoji)
        .single();

      if (existing) {
        await supabase
          .from('xstage_message_reactions')
          .delete()
          .eq('id', existing.id);
      } else {
        await supabase
          .from('xstage_message_reactions')
          .insert({
            message_id: messageId,
            user_id: user.id,
            emoji,
          });
      }

      fetchMessages();
    } catch (error) {
      // Ignore errors for reactions
    }
    setShowEmojiPicker(null);
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('xstage_messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;
      fetchMessages();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete message');
    }
  };

  const formatMessageDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return format(date, 'h:mm a');
    if (isYesterday(date)) return `Yesterday ${format(date, 'h:mm a')}`;
    return format(date, 'MMM d, h:mm a');
  };

  const groupedReactions = (reactions: any[]) => {
    const groups = new Map<string, string[]>();
    reactions.forEach(r => {
      const existing = groups.get(r.emoji) || [];
      groups.set(r.emoji, [...existing, r.user_id]);
    });
    return groups;
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Channels Sidebar */}
      <div className="w-64 border-r border-border flex flex-col bg-card/50 hidden md:flex">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold">Channels</h2>
          <Button size="icon" variant="ghost" onClick={() => setShowNewChannel(true)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => setSelectedChannel(channel)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left',
                  selectedChannel?.id === channel.id
                    ? 'bg-cyan-500/20 text-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Hash className="h-4 w-4 shrink-0" />
                <span className="truncate">{channel.name}</span>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col">
        {selectedChannel ? (
          <>
            {/* Channel Header */}
            <div className="p-4 border-b border-border flex items-center gap-2">
              <Hash className="h-5 w-5 text-muted-foreground" />
              <h2 className="font-semibold">{selectedChannel.name}</h2>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => {
                  const isOwn = message.sender_id === user?.id;
                  const reactions = groupedReactions(message.reactions || []);

                  return (
                    <div key={message.id} className={cn('flex gap-3', isOwn && 'flex-row-reverse')}>
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={message.sender?.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {message.sender?.full_name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className={cn('max-w-[70%] space-y-1', isOwn && 'items-end')}>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {message.sender?.full_name || 'Unknown'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatMessageDate(message.created_at)}
                          </span>
                        </div>
                        
                        <div className={cn(
                          'rounded-lg p-3 relative group',
                          isOwn ? 'bg-cyan-500/20' : 'bg-muted'
                        )}>
                          {message.message_type === 'text' && (
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          )}
                          {message.message_type === 'image' && message.file_url && (
                            <img
                              src={message.file_url}
                              alt={message.file_name || 'Image'}
                              className="max-w-full rounded-lg cursor-pointer"
                              onClick={() => window.open(message.file_url!, '_blank')}
                            />
                          )}
                          {message.message_type === 'video' && message.file_url && (
                            <video
                              src={message.file_url}
                              controls
                              className="max-w-full rounded-lg"
                            />
                          )}
                          {message.message_type === 'file' && (
                            <a
                              href={message.file_url || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-cyan-400 hover:underline"
                            >
                              <FileText className="h-4 w-4" />
                              {message.file_name || 'Download file'}
                            </a>
                          )}

                          {/* Message Actions */}
                          <div className="absolute -top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <Button
                              size="icon"
                              variant="secondary"
                              className="h-6 w-6"
                              onClick={() => setShowEmojiPicker(showEmojiPicker === message.id ? null : message.id)}
                            >
                              <Smile className="h-3 w-3" />
                            </Button>
                            {isOwn && (
                              <Button
                                size="icon"
                                variant="secondary"
                                className="h-6 w-6 text-destructive"
                                onClick={() => handleDeleteMessage(message.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>

                          {/* Emoji Picker */}
                          {showEmojiPicker === message.id && (
                            <div className="absolute top-full right-0 mt-1 p-2 bg-popover border rounded-lg shadow-lg flex gap-1 z-10">
                              {EMOJI_LIST.map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={() => handleReaction(message.id, emoji)}
                                  className="p-1 hover:bg-muted rounded text-lg"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Reactions */}
                        {reactions.size > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {Array.from(reactions.entries()).map(([emoji, users]) => (
                              <button
                                key={emoji}
                                onClick={() => handleReaction(message.id, emoji)}
                                className={cn(
                                  'px-2 py-0.5 rounded-full text-xs border flex items-center gap-1',
                                  users.includes(user?.id || '') ? 'bg-cyan-500/20 border-cyan-500/50' : 'border-border'
                                )}
                              >
                                <span>{emoji}</span>
                                <span>{users.length}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
              <div className="flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Message #${selectedChannel.name}`}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!newMessage.trim() || sending}
                  className="bg-gradient-to-r from-cyan-500 to-fuchsia-500"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a channel to start chatting
          </div>
        )}
      </div>

      {/* New Channel Dialog */}
      <Dialog open={showNewChannel} onOpenChange={setShowNewChannel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Channel</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="channel-name"
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Channel names are lowercase with dashes instead of spaces
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewChannel(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateChannel} disabled={!newChannelName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
