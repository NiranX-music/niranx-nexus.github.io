import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  StickyNote, 
  Plus, 
  Search,
  Edit,
  Trash2,
  Pin,
  Hash,
  Calendar
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotesWidget = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    tags: ''
  });

  // Load notes from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem('studyverse-notes');
    if (savedNotes) {
      try {
        const parsed = JSON.parse(savedNotes);
        setNotes(parsed.map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt)
        })));
      } catch (error) {
        console.error('Error loading notes:', error);
      }
    }
  }, []);

  // Save notes to localStorage
  useEffect(() => {
    localStorage.setItem('studyverse-notes', JSON.stringify(notes));
  }, [notes]);

  const addOrUpdateNote = () => {
    if (!newNote.title.trim() || !newNote.content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both title and content",
        variant: "destructive",
      });
      return;
    }

    const tags = newNote.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const noteData: Note = {
      id: editingNote?.id || Math.random().toString(36).substr(2, 9),
      title: newNote.title,
      content: newNote.content,
      tags,
      isPinned: editingNote?.isPinned || false,
      createdAt: editingNote?.createdAt || new Date(),
      updatedAt: new Date()
    };

    if (editingNote) {
      setNotes(prev => prev.map(note => note.id === editingNote.id ? noteData : note));
      toast({
        title: "Note Updated",
        description: "Your note has been updated successfully",
      });
    } else {
      setNotes(prev => [noteData, ...prev]);
      toast({
        title: "Note Added",
        description: "New note created successfully",
      });
    }

    resetForm();
  };

  const deleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
    toast({
      title: "Note Deleted",
      description: "Note removed successfully",
    });
  };

  const togglePin = (noteId: string) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId 
        ? { ...note, isPinned: !note.isPinned }
        : note
    ));
  };

  const resetForm = () => {
    setNewNote({
      title: '',
      content: '',
      tags: ''
    });
    setShowAddForm(false);
    setEditingNote(null);
  };

  const startEdit = (note: Note) => {
    setEditingNote(note);
    setNewNote({
      title: note.title,
      content: note.content,
      tags: note.tags.join(', ')
    });
    setShowAddForm(true);
  };

  const getAllTags = () => {
    const tagSet = new Set<string>();
    notes.forEach(note => {
      note.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet);
  };

  const filteredNotes = notes
    .filter(note => {
      const matchesSearch = 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesTag = !selectedTag || note.tags.includes(selectedTag);
      
      return matchesSearch && matchesTag;
    })
    .sort((a, b) => {
      // Sort by pinned first, then by updated date
      if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1;
      }
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });

  const truncateContent = (content: string, maxLength: number = 100) => {
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Card className="widget">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-accent rounded-full flex items-center justify-center">
              <StickyNote className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Quick Notes</h3>
              <p className="text-sm text-muted-foreground">
                {notes.length} note{notes.length !== 1 ? 's' : ''} saved
              </p>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddForm(true)}
            className="glass-button"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Note
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Tags Filter */}
          {getAllTags().length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedTag === '' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTag('')}
                className="text-xs"
              >
                All
              </Button>
              {getAllTags().map((tag) => (
                <Button
                  key={tag}
                  variant={selectedTag === tag ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTag(tag)}
                  className="text-xs"
                >
                  <Hash className="w-3 h-3 mr-1" />
                  {tag}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Notes List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredNotes.length > 0 ? (
            filteredNotes.map((note) => (
              <div
                key={note.id}
                className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                  note.isPinned ? 'bg-primary/5 border-primary/30' : 'bg-muted/30'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {note.isPinned && (
                      <Pin className="w-4 h-4 text-primary flex-shrink-0" />
                    )}
                    <h5 className="font-medium truncate">{note.title}</h5>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePin(note.id)}
                    >
                      <Pin className={`w-4 h-4 ${note.isPinned ? 'text-primary' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(note)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteNote(note.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  {truncateContent(note.content)}
                </p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex flex-wrap gap-1">
                    {note.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(note.updatedAt)}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <StickyNote className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No notes found</p>
              <p className="text-sm">Create your first note to get started!</p>
            </div>
          )}
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-card rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
              <h4 className="font-semibold mb-4">
                {editingNote ? 'Edit Note' : 'New Note'}
              </h4>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={newNote.title}
                    onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter note title..."
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Content</label>
                  <Textarea
                    value={newNote.content}
                    onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Write your note here..."
                    rows={6}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Tags (optional)</label>
                  <Input
                    value={newNote.tags}
                    onChange={(e) => setNewNote(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="study, important, project (comma separated)"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Separate multiple tags with commas
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2 mt-6">
                <Button onClick={addOrUpdateNote} className="flex-1">
                  {editingNote ? 'Update' : 'Save'} Note
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default NotesWidget;