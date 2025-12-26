import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useStudyRoom, useStudyRooms } from '@/hooks/useStudyRooms';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Send, Users, LogOut, Copy, Clock, Loader2,
  MessageSquare, Timer, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const StudyRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { leaveRoom, joinRoom } = useStudyRooms();
  const { room, participants, messages, loading, sendMessage } = useStudyRoom(roomId || '');
  
  const [messageInput, setMessageInput] = useState('');
  const [userProfiles, setUserProfiles] = useState<Record<string, { full_name: string; avatar_url: string | null }>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [pomodoroActive, setPomodoroActive] = useState(false);

  useEffect(() => {
    if (roomId && user) {
      joinRoom(roomId);
    }
  }, [roomId, user]);

  useEffect(() => {
    const fetchProfiles = async () => {
      const userIds = [...new Set([...participants.map(p => p.user_id), ...messages.map(m => m.user_id)])];
      if (userIds.length === 0) return;

      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      if (data) {
        const profiles: Record<string, { full_name: string; avatar_url: string | null }> = {};
        data.forEach(p => {
          profiles[p.id] = { full_name: p.full_name || 'Anonymous', avatar_url: p.avatar_url };
        });
        setUserProfiles(profiles);
      }
    };

    fetchProfiles();
  }, [participants, messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (pomodoroActive && pomodoroTime > 0) {
      interval = setInterval(() => {
        setPomodoroTime(t => t - 1);
      }, 1000);
    } else if (pomodoroTime === 0) {
      setPomodoroActive(false);
      toast.success('Pomodoro session complete! Take a break 🎉');
      setPomodoroTime(25 * 60);
    }
    return () => clearInterval(interval);
  }, [pomodoroActive, pomodoroTime]);

  const handleSend = async () => {
    if (!messageInput.trim()) return;
    await sendMessage(messageInput.trim());
    setMessageInput('');
  };

  const handleLeave = async () => {
    if (roomId) {
      await leaveRoom(roomId);
      navigate('/study-rooms');
    }
  };

  const copyRoomCode = () => {
    if (room?.room_code) {
      navigator.clipboard.writeText(room.room_code);
      toast.success('Room code copied!');
    }
  };

  const formatPomodoroTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getUserName = (userId: string) => {
    return userProfiles[userId]?.full_name || 'Anonymous';
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Room not found</h1>
        <Button onClick={() => navigate('/study-rooms')}>Back to Rooms</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl h-[calc(100vh-5rem)]">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
        {/* Main Chat Area */}
        <div className="lg:col-span-3 flex flex-col">
          {/* Header */}
          <Card className="mb-4">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold">{room.name}</h1>
                  <p className="text-sm text-muted-foreground">{room.subject || 'General Study'}</p>
                </div>
                <div className="flex items-center gap-2">
                  {room.room_code && (
                    <Button variant="outline" size="sm" onClick={copyRoomCode}>
                      <Copy className="h-4 w-4 mr-2" />
                      {room.room_code}
                    </Button>
                  )}
                  <Button variant="destructive" size="sm" onClick={handleLeave}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Leave
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Messages */}
          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardHeader className="py-3 border-b">
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Chat
              </CardTitle>
            </CardHeader>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No messages yet. Start the conversation!
                  </p>
                ) : (
                  messages.map((message) => {
                    const isOwn = message.user_id === user?.id;
                    const userName = getUserName(message.user_id);
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {getInitials(userName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`max-w-[70%] ${isOwn ? 'text-right' : ''}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium">{userName}</span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(message.created_at), 'HH:mm')}
                            </span>
                          </div>
                          <div
                            className={`inline-block p-3 rounded-lg ${
                              isOwn
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            <div className="p-4 border-t">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-2"
              >
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button type="submit" disabled={!messageInput.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Participants */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4" />
                Participants ({participants.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <div className="space-y-2">
                {participants.map((participant) => {
                  const userName = getUserName(participant.user_id);
                  const isHost = participant.role === 'host';
                  
                  return (
                    <div key={participant.id} className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {getInitials(userName)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm flex-1 truncate">{userName}</span>
                      {isHost && (
                        <Badge variant="secondary" className="text-xs">Host</Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Pomodoro Timer */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Timer className="h-4 w-4" />
                Focus Timer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-mono font-bold mb-4">
                  {formatPomodoroTime(pomodoroTime)}
                </div>
                <div className="flex gap-2 justify-center">
                  <Button
                    variant={pomodoroActive ? 'destructive' : 'default'}
                    size="sm"
                    onClick={() => setPomodoroActive(!pomodoroActive)}
                  >
                    {pomodoroActive ? 'Pause' : 'Start'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPomodoroActive(false);
                      setPomodoroTime(25 * 60);
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Room Info */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Room Info
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p className="text-muted-foreground">
                Created {format(new Date(room.created_at), 'MMM d, yyyy')}
              </p>
              {room.description && (
                <p className="text-muted-foreground">{room.description}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudyRoom;
