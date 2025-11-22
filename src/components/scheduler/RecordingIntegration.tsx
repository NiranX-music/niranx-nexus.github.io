import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Video, Play, Trash2, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Recording {
  id: string;
  recording_url: string;
  duration: number | null;
  ai_timestamps: any;
  topic_links: any;
  created_at: string;
}

interface RecordingIntegrationProps {
  classId: string;
}

export function RecordingIntegration({ classId }: RecordingIntegrationProps) {
  const { user } = useAuth();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [newRecordingUrl, setNewRecordingUrl] = useState('');
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    checkOwnership();
    loadRecordings();
  }, [classId, user]);

  const checkOwnership = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('live_classes')
      .select('user_id')
      .eq('id', classId)
      .single();

    setIsOwner(data?.user_id === user.id);
  };

  const loadRecordings = async () => {
    const { data, error } = await supabase
      .from('class_recordings')
      .select('*')
      .eq('class_id', classId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading recordings:', error);
    } else {
      setRecordings(data || []);
    }
  };

  const handleAddRecording = async () => {
    if (!newRecordingUrl.trim() || !user || !isOwner) return;

    const { error } = await supabase.from('class_recordings').insert({
      class_id: classId,
      recording_url: newRecordingUrl,
    });

    if (error) {
      console.error('Error adding recording:', error);
      toast.error('Failed to add recording');
    } else {
      toast.success('Recording added!');
      setNewRecordingUrl('');
      loadRecordings();
    }
  };

  const handleDeleteRecording = async (recordingId: string) => {
    if (!isOwner) return;

    const { error } = await supabase
      .from('class_recordings')
      .delete()
      .eq('id', recordingId);

    if (error) {
      console.error('Error deleting recording:', error);
      toast.error('Failed to delete recording');
    } else {
      toast.success('Recording deleted');
      loadRecordings();
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'Unknown duration';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="w-5 h-5" />
          Class Recordings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isOwner && (
          <div className="flex gap-2">
            <Input
              placeholder="Enter recording URL..."
              value={newRecordingUrl}
              onChange={(e) => setNewRecordingUrl(e.target.value)}
            />
            <Button onClick={handleAddRecording}>
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
        )}

        <div className="space-y-3">
          {recordings.map((recording) => (
            <Card key={recording.id} className="bg-muted/50">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Video className="w-4 h-4" />
                      <p className="text-sm font-semibold">Class Recording</p>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Added {formatDistanceToNow(new Date(recording.created_at), { addSuffix: true })}
                    </p>
                    {recording.duration && (
                      <Badge variant="outline" className="text-xs">
                        {formatDuration(recording.duration)}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(recording.recording_url, '_blank')}
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                    {isOwner && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRecording(recording.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {recordings.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No recordings yet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
