import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { FileText, Share2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Note {
  id: string;
  user_id: string;
  content: string;
  timestamp: string;
  is_shared: boolean;
  profiles?: {
    full_name: string;
  };
}

interface CollaborativeNotesProps {
  classId: string;
}

export function CollaborativeNotes({ classId }: CollaborativeNotesProps) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [shareNote, setShareNote] = useState(false);

  useEffect(() => {
    loadNotes();
    subscribeToNotes();
  }, [classId]);

  const loadNotes = async () => {
    const { data, error } = await supabase
      .from('live_class_notes')
      .select('*')
      .eq('class_id', classId)
      .or(`is_shared.eq.true,user_id.eq.${user?.id}`)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error loading notes:', error);
      return;
    }

    // Fetch profile data separately
    const notesWithProfiles = await Promise.all(
      (data || []).map(async (note) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', note.user_id)
          .single();
        return { ...note, profiles: profile || { full_name: 'Unknown' } };
      })
    );

    setNotes(notesWithProfiles);
  };

  const subscribeToNotes = () => {
    const channel = supabase
      .channel(`notes-${classId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_class_notes',
          filter: `class_id=eq.${classId}`,
        },
        () => {
          loadNotes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSaveNote = async () => {
    if (!newNote.trim() || !user) return;

    const { error } = await supabase.from('live_class_notes').insert({
      class_id: classId,
      user_id: user.id,
      content: newNote,
      is_shared: shareNote,
    });

    if (error) {
      console.error('Error saving note:', error);
      toast.error('Failed to save note');
    } else {
      toast.success(shareNote ? 'Note shared with class!' : 'Note saved privately');
      setNewNote('');
      setShareNote(false);
    }
  };

  const handleToggleShare = async (noteId: string, currentState: boolean) => {
    const { error } = await supabase
      .from('live_class_notes')
      .update({ is_shared: !currentState })
      .eq('id', noteId);

    if (error) {
      console.error('Error toggling share:', error);
      toast.error('Failed to update note');
    } else {
      toast.success(!currentState ? 'Note shared!' : 'Note made private');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
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
            rows={4}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                id="share-note"
                checked={shareNote}
                onCheckedChange={setShareNote}
              />
              <Label htmlFor="share-note" className="text-sm">
                Share with class
              </Label>
            </div>
            <Button onClick={handleSaveNote}>
              <FileText className="w-4 h-4 mr-2" />
              Save Note
            </Button>
          </div>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {notes.map((note) => (
            <Card key={note.id} className="bg-muted/50">
              <CardContent className="pt-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm font-semibold">
                      {note.profiles?.full_name || 'Unknown'}
                      {note.user_id === user?.id && ' (You)'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(note.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                  {note.user_id === user?.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleShare(note.id, note.is_shared)}
                    >
                      <Share2 className={`w-4 h-4 ${note.is_shared ? 'text-primary' : ''}`} />
                    </Button>
                  )}
                </div>
                <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                {note.is_shared && (
                  <div className="mt-2">
                    <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                      Shared
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {notes.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No notes yet. Start taking notes!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
