import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface StudyRoom {
  id: string;
  name: string;
  description: string | null;
  host_id: string;
  subject: string | null;
  max_participants: number;
  is_public: boolean;
  is_active: boolean;
  room_code: string | null;
  settings: Record<string, any>;
  created_at: string;
  ends_at: string | null;
}

export interface RoomParticipant {
  id: string;
  room_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  left_at: string | null;
}

export interface RoomMessage {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  message_type: string;
  created_at: string;
}

export const useStudyRooms = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<StudyRoom[]>([]);
  const [myRooms, setMyRooms] = useState<StudyRoom[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPublicRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('study_rooms')
        .select('*')
        .eq('is_public', true)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setRooms((data || []).map(room => ({
        ...room,
        settings: (room.settings as Record<string, any>) || {},
      })));
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const fetchMyRooms = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('study_rooms')
        .select('*')
        .eq('host_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setMyRooms((data || []).map(room => ({
        ...room,
        settings: (room.settings as Record<string, any>) || {},
      })));
    } catch (error) {
      console.error('Error fetching my rooms:', error);
    }
  };

  const createRoom = async (room: Partial<StudyRoom>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('study_rooms')
        .insert([{
          name: room.name || 'Study Room',
          description: room.description,
          subject: room.subject,
          max_participants: room.max_participants,
          is_public: room.is_public,
          host_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      
      const newRoom = {
        ...data,
        settings: (data.settings as Record<string, any>) || {},
      };
      
      setMyRooms([newRoom, ...myRooms]);
      toast.success('Study room created!');
      return newRoom;
    } catch (error) {
      console.error('Error creating room:', error);
      toast.error('Failed to create room');
    }
  };

  const joinRoom = async (roomId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('study_room_participants')
        .insert({
          room_id: roomId,
          user_id: user.id,
          role: 'member',
        });

      if (error) throw error;
      toast.success('Joined room!');
      return true;
    } catch (error: any) {
      if (error.code === '23505') {
        return true; // Already joined
      }
      console.error('Error joining room:', error);
      toast.error('Failed to join room');
      return false;
    }
  };

  const leaveRoom = async (roomId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('study_room_participants')
        .update({ left_at: new Date().toISOString() })
        .eq('room_id', roomId)
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success('Left room');
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  };

  const closeRoom = async (roomId: string) => {
    try {
      const { error } = await supabase
        .from('study_rooms')
        .update({ is_active: false })
        .eq('id', roomId);

      if (error) throw error;
      setMyRooms(myRooms.map(r => r.id === roomId ? { ...r, is_active: false } : r));
      toast.success('Room closed');
    } catch (error) {
      console.error('Error closing room:', error);
    }
  };

  const getRoomByCode = async (code: string): Promise<StudyRoom | null> => {
    try {
      const { data, error } = await supabase
        .from('study_rooms')
        .select('*')
        .eq('room_code', code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error) return null;
      
      return {
        ...data,
        settings: (data.settings as Record<string, any>) || {},
      };
    } catch (error) {
      return null;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchPublicRooms(), fetchMyRooms()]);
      setLoading(false);
    };

    loadData();
  }, [user]);

  return {
    rooms,
    myRooms,
    loading,
    createRoom,
    joinRoom,
    leaveRoom,
    closeRoom,
    getRoomByCode,
    refreshRooms: () => Promise.all([fetchPublicRooms(), fetchMyRooms()]),
  };
};

export const useStudyRoom = (roomId: string) => {
  const { user } = useAuth();
  const [room, setRoom] = useState<StudyRoom | null>(null);
  const [participants, setParticipants] = useState<RoomParticipant[]>([]);
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoom = async () => {
    try {
      const { data, error } = await supabase
        .from('study_rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (error) throw error;
      
      setRoom({
        ...data,
        settings: (data.settings as Record<string, any>) || {},
      });
    } catch (error) {
      console.error('Error fetching room:', error);
    }
  };

  const fetchParticipants = async () => {
    try {
      const { data, error } = await supabase
        .from('study_room_participants')
        .select('*')
        .eq('room_id', roomId)
        .is('left_at', null);

      if (error) throw error;
      setParticipants(data || []);
    } catch (error) {
      console.error('Error fetching participants:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('study_room_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (content: string, messageType: string = 'text') => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('study_room_messages')
        .insert({
          room_id: roomId,
          user_id: user.id,
          content,
          message_type: messageType,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchRoom(), fetchParticipants(), fetchMessages()]);
      setLoading(false);
    };

    loadData();

    // Subscribe to realtime updates
    const messagesChannel = supabase
      .channel(`room-messages-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'study_room_messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as RoomMessage]);
        }
      )
      .subscribe();

    const participantsChannel = supabase
      .channel(`room-participants-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'study_room_participants',
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          fetchParticipants();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(participantsChannel);
    };
  }, [roomId, user]);

  return {
    room,
    participants,
    messages,
    loading,
    sendMessage,
    refreshRoom: fetchRoom,
  };
};
