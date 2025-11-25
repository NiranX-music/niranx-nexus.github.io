import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Clock, Calendar, Video } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

interface StudentClassViewProps {
  classroomId: string;
}

interface ClassSession {
  id: string;
  title: string;
  description: string | null;
  scheduled_start: string;
  scheduled_end: string;
  status: string;
}

export const StudentClassView = ({ classroomId }: StudentClassViewProps) => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('student-classes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_classes',
          filter: `classroom_id=eq.${classroomId}`,
        },
        () => {
          fetchClasses();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [classroomId]);

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('live_classes')
        .select('*')
        .eq('classroom_id', classroomId)
        .in('status', ['scheduled', 'live'])
        .order('scheduled_start', { ascending: true })
        .limit(10);

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClass = (classId: string) => {
    window.open(`/niranx/teacher/live-class/${classId}`, '_blank');
  };

  const isClassLive = (scheduledStart: string, scheduledEnd: string) => {
    const now = new Date();
    const start = new Date(scheduledStart);
    const end = new Date(scheduledEnd);
    return now >= start && now <= end;
  };

  const canJoinClass = (scheduledStart: string, scheduledEnd: string) => {
    const now = new Date();
    const start = new Date(scheduledStart);
    const end = new Date(scheduledEnd);
    // Allow joining 5 minutes before start
    const earlyJoinTime = new Date(start.getTime() - 5 * 60 * 1000);
    return now >= earlyJoinTime && now <= end;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Classes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (classes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Classes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No scheduled classes at the moment
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="w-5 h-5" />
          Upcoming Classes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {classes.map((cls) => {
          const isLive = isClassLive(cls.scheduled_start, cls.scheduled_end);
          const canJoin = canJoinClass(cls.scheduled_start, cls.scheduled_end);

          return (
            <Card key={cls.id} className="border-border/50">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold">{cls.title}</h4>
                    {cls.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {cls.description}
                      </p>
                    )}
                  </div>
                  <Badge variant={isLive ? 'destructive' : 'secondary'}>
                    {isLive ? 'Live Now' : 'Scheduled'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {new Date(cls.scheduled_start).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {new Date(cls.scheduled_start).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                  {isLive ? (
                    <span className="text-destructive font-semibold">Class is live!</span>
                  ) : (
                    <span>
                      Starts{' '}
                      {formatDistanceToNow(new Date(cls.scheduled_start), {
                        addSuffix: true,
                      })}
                    </span>
                  )}
                </div>

                <Button
                  onClick={() => handleJoinClass(cls.id)}
                  disabled={!canJoin}
                  className={`mt-4 w-full ${isLive ? 'bg-destructive hover:bg-destructive/90 animate-pulse' : ''}`}
                >
                  <Video className="w-4 h-4 mr-2" />
                  {isLive ? 'Join Live Class' : canJoin ? 'Join Class' : 'Not Yet Available'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </CardContent>
    </Card>
  );
};
