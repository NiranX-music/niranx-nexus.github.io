import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Note {
  id: string;
  user_id: string;
  content: string;
  timestamp: string;
  is_shared: boolean;
}

interface CollaborativeNotesProps {
  classId: string;
}

export const CollaborativeNotes = ({ classId }: CollaborativeNotesProps) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isShared, setIsShared] = useState(true);
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
    const fetchNotes = async () => {
      const { data } = await supabase
        .from('live_class_notes')
        .select('*')
        .eq('class_id', classId)
        .order('timestamp', { ascending: false });

      if (data) setNotes(data);
    };

    fetchNotes();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`notes-${classId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_class_notes',
          filter: `class_id=eq.${classId}`
        },
        () => fetchNotes()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [classId]);

  const addNote = async () => {
    if (!newNote.trim()) return;

    const { error } = await supabase.from('live_class_notes').insert({
      class_id: classId,
      user_id: currentUserId,
      content: newNote,
      is_shared: isShared
    });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to add note',
        variant: 'destructive'
      });
    } else {
      setNewNote('');
      toast({
        title: 'Note Added',
        description: isShared ? 'Your note is visible to everyone' : 'Note saved privately'
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="w-5 h-5" />
          Collaborative Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Textarea
            placeholder="Take notes during the class..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            rows={3}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                id="share-note"
                checked={isShared}
                onCheckedChange={setIsShared}
              />
              <Label htmlFor="share-note" className="text-sm">
                Share with class
              </Label>
            </div>
            <Button onClick={addNote} size="sm">
              Add Note
            </Button>
          </div>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {notes.map((note) => (
            <div
              key={note.id}
              className={`p-3 rounded-lg border ${
                note.user_id === currentUserId ? 'bg-primary/10' : 'bg-muted/50'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{note.content}</p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(note.timestamp), { addSuffix: true })}
                </p>
                {note.is_shared ? (
                  <span className="text-xs text-muted-foreground">Shared</span>
                ) : (
                  <span className="text-xs text-muted-foreground">Private</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
