import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Plus, Users, Clock, Search, Edit3, Trash2, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Note {
  id: string;
  title: string;
  content: string;
  collaborators: string[];
  lastEdited: string;
  editedBy: string;
  color: string;
}

const MOCK_NOTES: Note[] = [
  { id: '1', title: 'Organic Chemistry Reactions', content: 'Key reactions: SN1, SN2, E1, E2...\n\nMechanism notes for alkene reactions...', collaborators: ['Alex', 'Priya'], lastEdited: '5 min ago', editedBy: 'Alex', color: 'from-cyan-500/20 to-blue-500/20' },
  { id: '2', title: 'Linear Algebra Summary', content: 'Eigenvalues and eigenvectors\nMatrix decomposition methods...', collaborators: ['Jordan'], lastEdited: '1 hour ago', editedBy: 'You', color: 'from-purple-500/20 to-pink-500/20' },
  { id: '3', title: 'World War II Timeline', content: '1939 - Germany invades Poland\n1941 - Pearl Harbor...', collaborators: ['Fatima', 'Maria'], lastEdited: '3 hours ago', editedBy: 'Fatima', color: 'from-amber-500/20 to-orange-500/20' },
];

export default function CollaborativeNotes() {
  const [notes, setNotes] = useState(MOCK_NOTES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [editContent, setEditContent] = useState('');

  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startEditing = (note: Note) => {
    setSelectedNote(note);
    setEditContent(note.content);
  };

  const saveNote = () => {
    if (!selectedNote) return;
    setNotes(prev => prev.map(n => n.id === selectedNote.id ? { ...n, content: editContent, lastEdited: 'just now', editedBy: 'You' } : n));
    setSelectedNote(null);
    toast.success('Note saved');
  };

  return (
    <div className="min-h-screen p-6 space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-primary/10">
          <FileText className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Collaborative Notes</h1>
          <p className="text-muted-foreground">Create and edit notes together with your study partners</p>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search notes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <Button onClick={() => toast.info('Create note coming soon')}>
          <Plus className="w-4 h-4 mr-1" /> New Note
        </Button>
      </div>

      {selectedNote ? (
        <div className="holo-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">{selectedNote.title}</h2>
            <div className="flex gap-2">
              <Button size="sm" onClick={saveNote}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => setSelectedNote(null)}>Cancel</Button>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            {selectedNote.collaborators.join(', ')} & You
          </div>
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="min-h-[400px] font-mono text-sm"
            placeholder="Start writing..."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map(note => (
            <div
              key={note.id}
              className="holo-card p-5 space-y-3 cursor-pointer hover:scale-[1.02] transition-transform"
              onClick={() => startEditing(note)}
            >
              <div className={`h-2 rounded-full bg-gradient-to-r ${note.color}`} />
              <h3 className="font-semibold text-foreground">{note.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-3">{note.content}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {note.collaborators.length + 1} collaborators
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {note.lastEdited} by {note.editedBy}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); toast.success('Link copied'); }}>
                  <Share2 className="w-3 h-3 mr-1" /> Share
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
