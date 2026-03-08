import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { StickyNote, Plus, Save, Trash2, Download, BookOpen, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CornellNote {
  id: string;
  title: string;
  subject: string;
  cueColumn: string;
  notesColumn: string;
  summary: string;
  createdAt: string;
}

const CornellNotes = () => {
  const [notes, setNotes] = useState<CornellNote[]>(() => {
    const saved = localStorage.getItem('cornell-notes');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeNote, setActiveNote] = useState<CornellNote | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('');

  const saveNotes = (updated: CornellNote[]) => {
    setNotes(updated);
    localStorage.setItem('cornell-notes', JSON.stringify(updated));
  };

  const createNote = () => {
    if (!newTitle.trim()) return;
    const note: CornellNote = {
      id: Date.now().toString(),
      title: newTitle,
      subject: newSubject || 'General',
      cueColumn: '',
      notesColumn: '',
      summary: '',
      createdAt: new Date().toISOString(),
    };
    const updated = [note, ...notes];
    saveNotes(updated);
    setActiveNote(note);
    setNewTitle('');
    setNewSubject('');
    toast.success('Note created');
  };

  const updateActiveNote = (field: keyof CornellNote, value: string) => {
    if (!activeNote) return;
    const updated = { ...activeNote, [field]: value };
    setActiveNote(updated);
    const all = notes.map(n => n.id === updated.id ? updated : n);
    saveNotes(all);
  };

  const deleteNote = (id: string) => {
    const updated = notes.filter(n => n.id !== id);
    saveNotes(updated);
    if (activeNote?.id === id) setActiveNote(null);
    toast.success('Deleted');
  };

  const exportNote = () => {
    if (!activeNote) return;
    const text = `CORNELL NOTES: ${activeNote.title}\nSubject: ${activeNote.subject}\nDate: ${new Date(activeNote.createdAt).toLocaleDateString()}\n\n--- CUES / QUESTIONS ---\n${activeNote.cueColumn}\n\n--- NOTES ---\n${activeNote.notesColumn}\n\n--- SUMMARY ---\n${activeNote.summary}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeNote.title.replace(/\s+/g, '_')}_cornell.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported');
  };

  return (
    <div className="min-h-full p-4 md:p-6 space-y-6 cyber-grid">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <StickyNote className="w-8 h-8 text-primary" />
            <h1 className="text-2xl md:text-3xl font-display font-bold gradient-text tracking-wider">
              CORNELL_NOTES
            </h1>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="font-mono text-xs gap-2">
                <Plus className="w-4 h-4" /> NEW_NOTE
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-mono tracking-wider">CREATE_NOTE</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Note title" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="font-mono text-sm" />
                <Input placeholder="Subject" value={newSubject} onChange={e => setNewSubject(e.target.value)} className="font-mono text-sm" />
                <Button onClick={createNote} className="w-full font-mono text-xs">CREATE</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <p className="font-mono text-xs text-muted-foreground tracking-widest">
          {">"} STRUCTURED_NOTES // CUE_RECALL_METHOD
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Notes List */}
        <Card className="tech-card lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="font-mono text-xs tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" /> MY_NOTES ({notes.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <ScrollArea className="h-[60vh]">
              <div className="space-y-1.5 p-1">
                {notes.length === 0 && (
                  <p className="text-center py-8 font-mono text-xs text-muted-foreground">NO_NOTES_YET</p>
                )}
                {notes.map(note => (
                  <motion.div key={note.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className={cn(
                      "p-2.5 rounded-lg border cursor-pointer transition-all group",
                      activeNote?.id === note.id
                        ? "border-primary bg-primary/10"
                        : "border-border/50 hover:border-primary/50 hover:bg-muted/30"
                    )}
                    onClick={() => setActiveNote(note)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <p className="font-mono text-xs font-semibold truncate">{note.title}</p>
                        <Badge variant="outline" className="text-[9px] font-mono mt-1">{note.subject}</Badge>
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100"
                        onClick={e => { e.stopPropagation(); deleteNote(note.id); }}>
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </Button>
                    </div>
                    <p className="font-mono text-[9px] text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(note.createdAt).toLocaleDateString()}
                    </p>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Cornell Template */}
        <div className="lg:col-span-3">
          {activeNote ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-lg font-bold">{activeNote.title}</h2>
                  <Badge variant="secondary" className="font-mono text-[10px]">{activeNote.subject}</Badge>
                </div>
                <Button variant="outline" size="sm" onClick={exportNote} className="glass-button font-mono text-xs gap-2">
                  <Download className="w-3.5 h-3.5" /> EXPORT
                </Button>
              </div>

              {/* Cornell Layout */}
              <div className="grid grid-cols-3 gap-3 min-h-[50vh]">
                {/* Cue Column */}
                <Card className="tech-card col-span-1">
                  <CardHeader className="pb-1 px-3 pt-3">
                    <CardTitle className="font-mono text-[10px] tracking-widest text-primary">CUES / QUESTIONS</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <Textarea
                      value={activeNote.cueColumn}
                      onChange={e => updateActiveNote('cueColumn', e.target.value)}
                      placeholder="Key questions, cues, and keywords..."
                      className="min-h-[40vh] resize-none font-mono text-xs border-0 bg-transparent focus-visible:ring-0"
                    />
                  </CardContent>
                </Card>

                {/* Notes Column */}
                <Card className="tech-card col-span-2">
                  <CardHeader className="pb-1 px-3 pt-3">
                    <CardTitle className="font-mono text-[10px] tracking-widest text-accent">NOTES</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <Textarea
                      value={activeNote.notesColumn}
                      onChange={e => updateActiveNote('notesColumn', e.target.value)}
                      placeholder="Main notes, details, examples, diagrams..."
                      className="min-h-[40vh] resize-none font-mono text-xs border-0 bg-transparent focus-visible:ring-0"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Summary */}
              <Card className="tech-card">
                <CardHeader className="pb-1 px-3 pt-3">
                  <CardTitle className="font-mono text-[10px] tracking-widest text-success">SUMMARY</CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <Textarea
                    value={activeNote.summary}
                    onChange={e => updateActiveNote('summary', e.target.value)}
                    placeholder="Summarize the main ideas in your own words..."
                    rows={3}
                    className="resize-none font-mono text-xs border-0 bg-transparent focus-visible:ring-0"
                  />
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="flex items-center justify-center h-[60vh]">
              <div className="text-center">
                <StickyNote className="w-16 h-16 mx-auto text-muted-foreground/20 mb-4" />
                <p className="font-mono text-sm text-muted-foreground">SELECT_OR_CREATE_NOTE</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CornellNotes;
