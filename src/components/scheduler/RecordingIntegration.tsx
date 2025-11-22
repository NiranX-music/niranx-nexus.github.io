import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Video, Play, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Recording {
  id: string;
  recording_url: string;
  duration: number | null;
  ai_timestamps: any;
  created_at: string;
}

interface RecordingIntegrationProps {
  classId: string;
}

export const RecordingIntegration = ({ classId }: RecordingIntegrationProps) => {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [recordingUrl, setRecordingUrl] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
    };

    getCurrentUser();
  }, []);

  useEffect(() => {
    const fetchRecordings = async () => {
      const { data } = await supabase
        .from('class_recordings')
        .select('*')
        .eq('class_id', classId)
        .order('created_at', { ascending: false });

      if (data) setRecordings(data);
    };

    fetchRecordings();
  }, [classId]);

  const addRecording = async () => {
    if (!recordingUrl.trim()) return;

    const { error } = await supabase.from('class_recordings').insert({
      class_id: classId,
      user_id: currentUserId,
      recording_url: recordingUrl
    });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to add recording',
        variant: 'destructive'
      });
    } else {
      setRecordingUrl('');
      toast({
        title: 'Recording Added',
        description: 'Class recording has been saved'
      });
      
      // Refresh recordings list
      const { data } = await supabase
        .from('class_recordings')
        .select('*')
        .eq('class_id', classId)
        .order('created_at', { ascending: false });

      if (data) setRecordings(data);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Video className="w-5 h-5" />
          Class Recordings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Recording URL..."
            value={recordingUrl}
            onChange={(e) => setRecordingUrl(e.target.value)}
          />
          <Button onClick={addRecording} size="icon">
            <Upload className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {recordings.map((recording) => (
            <div
              key={recording.id}
              className="p-3 rounded-lg border bg-background flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Video className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Class Recording</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(recording.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(recording.recording_url, '_blank')}
              >
                <Play className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
