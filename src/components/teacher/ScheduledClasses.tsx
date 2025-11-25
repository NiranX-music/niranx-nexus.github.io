import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Clock, Users, Calendar, Video, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface ScheduledClassesProps {
  classroomId: string;
  onUpdate?: () => void;
}

interface ScheduledClass {
  id: string;
  title: string;
  description: string | null;
  scheduled_start: string;
  scheduled_end: string;
  status: string;
  agora_channel_name: string | null;
}

export const ScheduledClasses = ({ classroomId, onUpdate }: ScheduledClassesProps) => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ScheduledClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScheduledClasses();

    // Subscribe to changes
    const channel = supabase
      .channel('scheduled-classes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_classes',
          filter: `classroom_id=eq.${classroomId}`,
        },
        () => {
          fetchScheduledClasses();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [classroomId]);

  const fetchScheduledClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('live_classes')
        .select('*')
        .eq('classroom_id', classroomId)
        .in('status', ['scheduled', 'live'])
        .order('scheduled_start', { ascending: true });

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching scheduled classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (classId: string) => {
    try {
      const { error } = await supabase
        .from('live_classes')
        .delete()
        .eq('id', classId);

      if (error) throw error;

      toast.success('Class deleted successfully');
      fetchScheduledClasses();
      onUpdate?.();
    } catch (error) {
      console.error('Error deleting class:', error);
      toast.error('Failed to delete class');
    }
  };

  const handleJoinClass = (classId: string) => {
    navigate(`/niranx/teacher/live-class/${classId}`);
  };

  const isClassLive = (scheduledStart: string, scheduledEnd: string) => {
    const now = new Date();
    const start = new Date(scheduledStart);
    const end = new Date(scheduledEnd);
    return now >= start && now <= end;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Classes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
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
          <CardTitle>Scheduled Classes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No scheduled classes. Click "Schedule Class" to create one.
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
          Scheduled Classes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {classes.map((cls) => {
          const isLive = isClassLive(cls.scheduled_start, cls.scheduled_end);
          
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
                      {' - '}
                      {new Date(cls.scheduled_end).toLocaleTimeString([], {
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

                <div className="flex items-center gap-2 mt-4">
                  <Button
                    onClick={() => handleJoinClass(cls.id)}
                    className={isLive ? 'bg-destructive hover:bg-destructive/90' : ''}
                  >
                    <Video className="w-4 h-4 mr-2" />
                    {isLive ? 'Join Live Class' : 'Start Class'}
                  </Button>
                  
                  {!isLive && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteClass(cls.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </CardContent>
    </Card>
  );
};
