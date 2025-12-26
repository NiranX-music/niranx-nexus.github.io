import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStudyRooms, StudyRoom } from '@/hooks/useStudyRooms';
import { 
  Plus, Users, Lock, Unlock, Clock, Search, 
  ArrowRight, Copy, Loader2, BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const StudyRooms = () => {
  const navigate = useNavigate();
  const { rooms, myRooms, loading, createRoom, joinRoom, getRoomByCode, refreshRooms } = useStudyRooms();
  
  const [isCreating, setIsCreating] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newRoom, setNewRoom] = useState({
    name: '',
    description: '',
    subject: '',
    max_participants: 10,
    is_public: true,
  });

  const handleCreate = async () => {
    if (!newRoom.name.trim()) {
      toast.error('Please enter a room name');
      return;
    }

    const room = await createRoom(newRoom);
    if (room) {
      setIsCreating(false);
      setNewRoom({
        name: '',
        description: '',
        subject: '',
        max_participants: 10,
        is_public: true,
      });
      navigate(`/study-room/${room.id}`);
    }
  };

  const handleJoinByCode = async () => {
    if (!joinCode.trim()) {
      toast.error('Please enter a room code');
      return;
    }

    setIsJoining(true);
    const room = await getRoomByCode(joinCode);
    
    if (room) {
      const joined = await joinRoom(room.id);
      if (joined) {
        navigate(`/study-room/${room.id}`);
      }
    } else {
      toast.error('Room not found');
    }
    setIsJoining(false);
  };

  const handleJoinRoom = async (roomId: string) => {
    const joined = await joinRoom(roomId);
    if (joined) {
      navigate(`/study-room/${roomId}`);
    }
  };

  const copyRoomCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Room code copied!');
  };

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.subject?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Study Rooms</h1>
          <p className="text-muted-foreground">Collaborate and study together in real-time</p>
        </div>
        <div className="flex gap-2">
          <div className="flex">
            <Input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Enter room code"
              className="w-32 rounded-r-none uppercase"
              maxLength={6}
            />
            <Button 
              onClick={handleJoinByCode} 
              disabled={isJoining}
              className="rounded-l-none"
            >
              {isJoining ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Join'}
            </Button>
          </div>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Room
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Study Room</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Room Name *</Label>
                  <Input
                    value={newRoom.name}
                    onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                    placeholder="e.g., Math Study Group"
                  />
                </div>
                <div>
                  <Label>Subject</Label>
                  <Input
                    value={newRoom.subject}
                    onChange={(e) => setNewRoom({ ...newRoom, subject: e.target.value })}
                    placeholder="e.g., Calculus"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newRoom.description}
                    onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                    placeholder="What will you be studying?"
                  />
                </div>
                <div>
                  <Label>Max Participants</Label>
                  <Input
                    type="number"
                    min={2}
                    max={50}
                    value={newRoom.max_participants}
                    onChange={(e) => setNewRoom({ ...newRoom, max_participants: parseInt(e.target.value) || 10 })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Public Room</Label>
                    <p className="text-sm text-muted-foreground">
                      Anyone can find and join
                    </p>
                  </div>
                  <Switch
                    checked={newRoom.is_public}
                    onCheckedChange={(checked) => setNewRoom({ ...newRoom, is_public: checked })}
                  />
                </div>
                <Button onClick={handleCreate} className="w-full">
                  Create Room
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="public">
        <TabsList>
          <TabsTrigger value="public">Public Rooms</TabsTrigger>
          <TabsTrigger value="my-rooms">My Rooms</TabsTrigger>
        </TabsList>

        <TabsContent value="public" className="mt-6 space-y-4">
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rooms..."
              className="pl-10"
            />
          </div>

          {filteredRooms.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No public rooms available</h3>
                <p className="text-muted-foreground">Create a room to start studying with others</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRooms.map((room) => (
                <RoomCard 
                  key={room.id} 
                  room={room} 
                  onJoin={() => handleJoinRoom(room.id)}
                  onCopyCode={copyRoomCode}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-rooms" className="mt-6">
          {myRooms.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No rooms created yet</h3>
                <p className="text-muted-foreground">Create your first study room</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myRooms.map((room) => (
                <RoomCard 
                  key={room.id} 
                  room={room} 
                  onJoin={() => navigate(`/study-room/${room.id}`)}
                  onCopyCode={copyRoomCode}
                  isOwner
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const RoomCard = ({ 
  room, 
  onJoin, 
  onCopyCode,
  isOwner = false 
}: { 
  room: StudyRoom; 
  onJoin: () => void;
  onCopyCode: (code: string) => void;
  isOwner?: boolean;
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="line-clamp-1">{room.name}</CardTitle>
            {room.subject && (
              <CardDescription>{room.subject}</CardDescription>
            )}
          </div>
          {room.is_public ? (
            <Badge variant="secondary" className="gap-1">
              <Unlock className="h-3 w-3" />
              Public
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1">
              <Lock className="h-3 w-3" />
              Private
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {room.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {room.description}
          </p>
        )}
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{room.max_participants} max</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{format(new Date(room.created_at), 'MMM d')}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {room.room_code && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCopyCode(room.room_code!)}
              className="text-xs"
            >
              <Copy className="h-3 w-3 mr-1" />
              {room.room_code}
            </Button>
          )}
          <Button size="sm" onClick={onJoin} className="ml-auto">
            {isOwner ? 'Open' : 'Join'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudyRooms;
