import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, UserMinus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface AttendanceUser {
  user_id: string;
  joined_at: string;
  is_online: boolean;
  profile?: {
    full_name: string;
  };
}

interface LiveAttendanceTrackerProps {
  classId: string;
}

export function LiveAttendanceTracker({ classId }: LiveAttendanceTrackerProps) {
  const { user } = useAuth();
  const [attendees, setAttendees] = useState<AttendanceUser[]>([]);
  const [presenceState, setPresenceState] = useState<Record<string, any>>({});
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!user) return;

    loadAttendance();
    setupRealtimePresence();

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [classId, user]);

  const loadAttendance = async () => {
    const { data, error } = await supabase
      .from('live_class_attendance')
      .select('user_id, joined_at, is_online')
      .eq('class_id', classId)
      .eq('is_online', true);

    if (error) {
      console.error('Error loading attendance:', error);
      return;
    }

    // Fetch profile data separately
    const attendeesWithProfiles = await Promise.all(
      (data || []).map(async (attendee) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', attendee.user_id)
          .single();
        return { ...attendee, profile };
      })
    );

    setAttendees(attendeesWithProfiles);
  };

  const setupRealtimePresence = async () => {
    const newChannel = supabase.channel(`class-${classId}`, {
      config: {
        presence: {
          key: user!.id,
        },
      },
    });

    newChannel
      .on('presence', { event: 'sync' }, () => {
        const state = newChannel.presenceState();
        setPresenceState(state);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
        const userName = newPresences[0]?.full_name || 'Someone';
        toast.success(`${userName} joined the class`, {
          icon: <UserPlus className="w-4 h-4" />,
        });
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
        const userName = leftPresences[0]?.full_name || 'Someone';
        toast.info(`${userName} left the class`, {
          icon: <UserMinus className="w-4 h-4" />,
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Join the class attendance
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', user!.id)
            .single();

          await newChannel.track({
            user_id: user!.id,
            full_name: profile?.full_name || 'Unknown',
            online_at: new Date().toISOString(),
          });

          // Record attendance in database
          await supabase.from('live_class_attendance').upsert({
            class_id: classId,
            user_id: user!.id,
            is_online: true,
          });
        }
      });

    setChannel(newChannel);
  };

  const onlineCount = Object.keys(presenceState).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Live Attendance
          <Badge variant="default" className="ml-auto">
            {onlineCount} online
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Object.entries(presenceState).map(([userId, presences]: [string, any]) => {
            const presence = presences[0];
            return (
              <div key={userId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {presence.full_name?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">{presence.full_name || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground">
                    {userId === user?.id ? 'You' : 'Student'}
                  </p>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </div>
            );
          })}
          {onlineCount === 0 && (
            <p className="text-center text-muted-foreground py-4">
              No one is online yet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
