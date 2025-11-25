import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, Download, Clock, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Recording {
  id: string;
  recording_url: string;
  duration: number | null;
  created_at: string;
  class_id: string;
  class_title?: string;
}

interface ClassRecordingsViewerProps {
  classId?: string;
  showAllRecordings?: boolean;
}

export const ClassRecordingsViewer = ({ classId, showAllRecordings = false }: ClassRecordingsViewerProps) => {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecordings();
  }, [classId]);

  const loadRecordings = async () => {
    try {
      let query = supabase
        .from('class_recordings')
        .select(`
          *,
          live_classes!inner(title)
        `)
        .order('created_at', { ascending: false });

      if (classId && !showAllRecordings) {
        query = query.eq('class_id', classId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedData = data?.map((rec: any) => ({
        ...rec,
        class_title: rec.live_classes?.title,
      })) || [];

      setRecordings(formattedData);
    } catch (error) {
      console.error('Error loading recordings:', error);
      toast.error('Failed to load recordings');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'Processing...';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const isRecordingReady = (url: string) => {
    return url && !url.startsWith('pending_') && url !== 'processing';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Loading recordings...</p>
        </CardContent>
      </Card>
    );
  }

  if (recordings.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No recordings available yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Class Recordings</h3>
      {recordings.map((recording) => (
        <Card key={recording.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-base">
                  {recording.class_title || 'Class Recording'}
                </CardTitle>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(recording.created_at), 'MMM dd, yyyy')}
                  </div>
                  {recording.duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDuration(recording.duration)}
                    </div>
                  )}
                </div>
              </div>
              {isRecordingReady(recording.recording_url) ? (
                <Badge variant="default">Ready</Badge>
              ) : (
                <Badge variant="secondary">Processing</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {isRecordingReady(recording.recording_url) ? (
                <>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => window.open(recording.recording_url, '_blank')}
                    className="gap-2"
                  >
                    <Video className="w-4 h-4" />
                    Watch
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = recording.recording_url;
                      link.download = `recording-${recording.id}.mp4`;
                      link.click();
                    }}
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  Recording is being processed...
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
