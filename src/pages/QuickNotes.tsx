import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Search, Trash2, Pin, PinOff, 
  Edit2, Save, X, StickyNote, Palette, Clock
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  pinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const colors = [
  { name: "Default", value: "bg-card" },
  { name: "Yellow", value: "bg-yellow-100 dark:bg-yellow-900/30" },
  { name: "Green", value: "bg-green-100 dark:bg-green-900/30" },
  { name: "Blue", value: "bg-blue-100 dark:bg-blue-900/30" },
  { name: "Pink", value: "bg-pink-100 dark:bg-pink-900/30" },
  { name: "Purple", value: "bg-purple-100 dark:bg-purple-900/30" },
];

export default function QuickNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newNote, setNewNote] = useState({ title: "", content: "", color: "bg-card" });
  const { user } = useAuth();
  const { toast } = useToast();

  // Load notes from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem(`quicknotes-${user?.id || "guest"}`);
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes).map((n: any) => ({
        ...n,
        createdAt: new Date(n.createdAt),
        updatedAt: new Date(n.updatedAt),
      })));
    }
  }, [user]);

  // Save notes to localStorage
  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem(`quicknotes-${user?.id || "guest"}`, JSON.stringify(notes));
    }
  }, [notes, user]);

  const createNote = () => {
    if (!newNote.title.trim() && !newNote.content.trim()) {
      toast({ title: "Note is empty", variant: "destructive" });
      return;
    }

    const note: Note = {
      id: Date.now().toString(),
      title: newNote.title || "Untitled",
      content: newNote.content,
      color: newNote.color,
      pinned: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setNotes(prev => [note, ...prev]);
    setNewNote({ title: "", content: "", color: "bg-card" });
    setIsCreating(false);
    toast({ title: "Note created!" });
  };

  const updateNote = () => {
    if (!editingNote) return;

    setNotes(prev => prev.map(n => 
      n.id === editingNote.id 
        ? { ...editingNote, updatedAt: new Date() }
        : n
    ));
    setEditingNote(null);
    toast({ title: "Note updated!" });
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    toast({ title: "Note deleted" });
  };

  const togglePin = (id: string) => {
    setNotes(prev => prev.map(n => 
      n.id === id ? { ...n, pinned: !n.pinned } : n
    ));
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedNotes = filteredNotes.filter(n => n.pinned);
  const unpinnedNotes = filteredNotes.filter(n => !n.pinned);

  const NoteCard = ({ note }: { note: Note }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <Card className={`${note.color} border-border/50 group relative overflow-hidden`}>
        <CardContent className="p-4">
          {note.pinned && (
            <Pin className="h-4 w-4 absolute top-2 right-2 text-primary" />
          )}
          
          <h3 className="font-semibold mb-2 pr-6">{note.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap">
            {note.content}
          </p>
          
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {note.updatedAt.toLocaleDateString()}
            </div>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => togglePin(note.id)}
              >
                {note.pinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setEditingNote(note)}
              >
                <Edit2 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={() => deleteNote(note.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white">
              <StickyNote className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Quick Notes</h1>
              <p className="text-muted-foreground">Capture your thoughts instantly</p>
            </div>
          </div>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Note
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes..."
            className="pl-10"
          />
        </div>

        {/* Create Note Modal */}
        <AnimatePresence>
          {isCreating && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className={`${newNote.color} border-border/50`}>
                <CardContent className="p-4 space-y-4">
                  <Input
                    value={newNote.title}
                    onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Title"
                    className="border-0 bg-transparent text-lg font-semibold focus-visible:ring-0 px-0"
                  />
                  <Textarea
                    value={newNote.content}
                    onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Take a note..."
                    className="border-0 bg-transparent resize-none min-h-[100px] focus-visible:ring-0 px-0"
                  />
                  
                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <div className="flex gap-1">
                      {colors.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => setNewNote(prev => ({ ...prev, color: color.value }))}
                          className={`w-6 h-6 rounded-full border-2 ${color.value} ${
                            newNote.color === color.value ? "border-primary" : "border-transparent"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsCreating(false);
                          setNewNote({ title: "", content: "", color: "bg-card" });
                        }}
                      >
                        Cancel
                      </Button>
                      <Button size="sm" onClick={createNote}>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Note Modal */}
        <AnimatePresence>
          {editingNote && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setEditingNote(null)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg"
              >
                <Card className={`${editingNote.color} border-border/50`}>
                  <CardContent className="p-4 space-y-4">
                    <Input
                      value={editingNote.title}
                      onChange={(e) => setEditingNote(prev => prev ? { ...prev, title: e.target.value } : null)}
                      placeholder="Title"
                      className="border-0 bg-transparent text-lg font-semibold focus-visible:ring-0 px-0"
                    />
                    <Textarea
                      value={editingNote.content}
                      onChange={(e) => setEditingNote(prev => prev ? { ...prev, content: e.target.value } : null)}
                      placeholder="Take a note..."
                      className="border-0 bg-transparent resize-none min-h-[200px] focus-visible:ring-0 px-0"
                    />
                    
                    <div className="flex items-center justify-between pt-3 border-t border-border/50">
                      <div className="flex gap-1">
                        {colors.map((color) => (
                          <button
                            key={color.value}
                            onClick={() => setEditingNote(prev => prev ? { ...prev, color: color.value } : null)}
                            className={`w-6 h-6 rounded-full border-2 ${color.value} ${
                              editingNote.color === color.value ? "border-primary" : "border-transparent"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setEditingNote(null)}>
                          Cancel
                        </Button>
                        <Button size="sm" onClick={updateNote}>
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pinned Notes */}
        {pinnedNotes.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Pin className="h-4 w-4" />
              Pinned
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <AnimatePresence>
                {pinnedNotes.map((note) => (
                  <NoteCard key={note.id} note={note} />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Other Notes */}
        {unpinnedNotes.length > 0 && (
          <div className="space-y-3">
            {pinnedNotes.length > 0 && (
              <h2 className="text-sm font-medium text-muted-foreground">Others</h2>
            )}
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <AnimatePresence>
                {unpinnedNotes.map((note) => (
                  <NoteCard key={note.id} note={note} />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredNotes.length === 0 && (
          <div className="text-center py-12">
            <StickyNote className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">No notes yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first note to get started
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Note
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
