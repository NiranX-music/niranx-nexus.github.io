import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Clock, Users, Calendar, Video, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { ClassRecordingsViewer } from './ClassRecordingsViewer';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ClassHistoryProps {
  classroomId: string;
}

interface CompletedClass {
  id: string;
  title: string;
  description: string | null;
  scheduled_start: string;
  scheduled_end: string;
  actual_start: string | null;
  actual_end: string | null;
  attendance_count: number;
  recording_url: string | null;
}

export const ClassHistory = ({ classroomId }: ClassHistoryProps) => {
  const [classes, setClasses] = useState<CompletedClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedClass, setExpandedClass] = useState<string | null>(null);

  useEffect(() => {
    fetchCompletedClasses();
  }, [classroomId]);

  const fetchCompletedClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('live_classes')
        .select('*')
        .eq('classroom_id', classroomId)
        .eq('status', 'completed')
        .order('scheduled_start', { ascending: false })
        .limit(20);

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching completed classes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Class History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (classes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Class History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No completed classes yet
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
          Class History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {classes.map((cls) => (
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
                <Badge variant="secondary">Completed</Badge>
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

                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{cls.attendance_count || 0} attended</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                <span>
                  {formatDistanceToNow(new Date(cls.actual_end || cls.scheduled_end), {
                    addSuffix: true,
                  })}
                </span>
              </div>

              <Collapsible
                open={expandedClass === cls.id}
                onOpenChange={() => setExpandedClass(expandedClass === cls.id ? null : cls.id)}
              >
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="mt-3 gap-2">
                    <Video className="w-4 h-4" />
                    View Recordings
                    {expandedClass === cls.id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4">
                  <ClassRecordingsViewer classId={cls.id} />
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};
