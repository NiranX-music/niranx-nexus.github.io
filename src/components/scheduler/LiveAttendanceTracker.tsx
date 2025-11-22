import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Circle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AttendanceUser {
  user_id: string;
  joined_at: string;
  is_online: boolean;
}

interface LiveAttendanceTrackerProps {
  classId: string;
}

export const LiveAttendanceTracker = ({ classId }: LiveAttendanceTrackerProps) => {
  const [attendees, setAttendees] = useState<AttendanceUser[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        // Mark current user as online
        await supabase.from('live_class_attendance').upsert({
          class_id: classId,
          user_id: user.id,
          is_online: true,
          joined_at: new Date().toISOString()
        });
      }
    };

    getCurrentUser();

    // Cleanup on unmount
    return () => {
      if (currentUserId) {
        supabase.from('live_class_attendance').update({
          is_online: false,
          left_at: new Date().toISOString()
        }).eq('class_id', classId).eq('user_id', currentUserId);
      }
    };
  }, [classId]);

  useEffect(() => {
    const fetchAttendees = async () => {
      const { data } = await supabase
        .from('live_class_attendance')
        .select('*')
        .eq('class_id', classId)
        .eq('is_online', true);

      if (data) setAttendees(data);
    };

    fetchAttendees();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`attendance-${classId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_class_attendance',
          filter: `class_id=eq.${classId}`
        },
        () => fetchAttendees()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [classId]);

  const onlineCount = attendees.filter(a => a.is_online).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="w-5 h-5" />
          Live Attendance ({onlineCount})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {attendees.filter(a => a.is_online).map((attendee) => (
            <div key={attendee.user_id} className="relative">
              <Avatar className="w-10 h-10">
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <Circle className="w-3 h-3 fill-green-500 text-green-500 absolute bottom-0 right-0" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
