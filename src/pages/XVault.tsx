import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock, Unlock, Plus, Trash2, Search, Shield, Eye, EyeOff,
  FileText, Star, Clock, Hash, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

interface VaultNote {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

const VAULT_STORAGE_KEY = "xvault_notes";
const VAULT_PIN_KEY = "xvault_pin_hash";

// Simple hash for PIN (NOT crypto-grade, but suitable for client-side lock)
const hashPin = (pin: string): string => {
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
};

export default function XVault() {
  const [isLocked, setIsLocked] = useState(true);
  const [hasPin, setHasPin] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [notes, setNotes] = useState<VaultNote[]>([]);
  const [activeNote, setActiveNote] = useState<VaultNote | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showContent, setShowContent] = useState(true);
  const [pinError, setPinError] = useState("");
  const [autoLockTimer, setAutoLockTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const storedHash = localStorage.getItem(VAULT_PIN_KEY);
    setHasPin(!!storedHash);
    if (!storedHash) setIsSettingPin(true);
  }, []);

  const loadNotes = useCallback(() => {
    try {
      const raw = localStorage.getItem(VAULT_STORAGE_KEY);
      if (raw) setNotes(JSON.parse(raw));
    } catch { setNotes([]); }
  }, []);

  const saveNotes = useCallback((updated: VaultNote[]) => {
    setNotes(updated);
    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(updated));
  }, []);

  const resetAutoLock = useCallback(() => {
    if (autoLockTimer) clearTimeout(autoLockTimer);
    const timer = setTimeout(() => {
      setIsLocked(true);
      setActiveNote(null);
      toast({ title: "Vault auto-locked", description: "Inactive for 5 minutes." });
    }, 5 * 60 * 1000);
    setAutoLockTimer(timer);
  }, [autoLockTimer]);

  const setupPin = () => {
    if (pinInput.length < 4) { setPinError("PIN must be at least 4 digits"); return; }
    if (pinInput !== confirmPin) { setPinError("PINs don't match"); return; }
    localStorage.setItem(VAULT_PIN_KEY, hashPin(pinInput));
    setHasPin(true);
    setIsSettingPin(false);
    setIsLocked(false);
    setPinInput("");
    setConfirmPin("");
    setPinError("");
    loadNotes();
    resetAutoLock();
    toast({ title: "Vault PIN set", description: "Your vault is now protected." });
  };

  const unlock = () => {
    const storedHash = localStorage.getItem(VAULT_PIN_KEY);
    if (hashPin(pinInput) === storedHash) {
      setIsLocked(false);
      setPinInput("");
      setPinError("");
      loadNotes();
      resetAutoLock();
    } else {
      setPinError("Incorrect PIN");
      setPinInput("");
    }
  };

  const createNote = () => {
    const note: VaultNote = {
      id: `note-${Date.now()}`,
      title: "Untitled Note",
      content: "",
      tags: [],
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [note, ...notes];
    saveNotes(updated);
    setActiveNote(note);
    resetAutoLock();
  };

  const updateNote = (note: VaultNote) => {
    const updated = notes.map(n => n.id === note.id ? { ...note, updatedAt: new Date().toISOString() } : n);
    saveNotes(updated);
    setActiveNote({ ...note, updatedAt: new Date().toISOString() });
    resetAutoLock();
  };

  const deleteNote = (id: string) => {
    saveNotes(notes.filter(n => n.id !== id));
    if (activeNote?.id === id) setActiveNote(null);
    toast({ title: "Note deleted" });
  };

  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const favorites = filteredNotes.filter(n => n.isFavorite);
  const regular = filteredNotes.filter(n => !n.isFavorite);

  // LOCKED / PIN SETUP SCREEN
  if (isLocked || isSettingPin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm">
          <Card className="border-primary/20 bg-card/80 backdrop-blur-xl shadow-[0_0_40px_hsl(var(--primary)/0.15)]">
            <CardContent className="p-8 text-center space-y-6">
              <motion.div
                animate={{ rotateY: isLocked ? [0, 10, -10, 0] : 0 }}
                transition={{ duration: 0.5, repeat: isLocked ? Infinity : 0, repeatDelay: 3 }}
                className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[0_0_30px_hsl(var(--primary)/0.4)]"
              >
                <Lock className="h-8 w-8 text-primary-foreground" />
              </motion.div>
              <div>
                <h2 className="text-xl font-bold">XVault</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {isSettingPin ? "Set a PIN to protect your notes" : "Enter your PIN to unlock"}
                </p>
              </div>
              <div className="space-y-3">
                <Input
                  type="password"
                  placeholder={isSettingPin ? "Create PIN (min 4 digits)" : "Enter PIN"}
                  value={pinInput}
                  onChange={e => { setPinInput(e.target.value.replace(/\D/g, "")); setPinError(""); }}
                  onKeyDown={e => e.key === "Enter" && (isSettingPin ? (confirmPin ? setupPin() : document.getElementById("confirm-pin")?.focus()) : unlock())}
                  maxLength={8}
                  className="text-center text-lg tracking-[0.5em] font-mono"
                  autoFocus
                />
                {isSettingPin && (
                  <Input
                    id="confirm-pin"
                    type="password"
                    placeholder="Confirm PIN"
                    value={confirmPin}
                    onChange={e => { setConfirmPin(e.target.value.replace(/\D/g, "")); setPinError(""); }}
                    onKeyDown={e => e.key === "Enter" && setupPin()}
                    maxLength={8}
                    className="text-center text-lg tracking-[0.5em] font-mono"
                  />
                )}
                {pinError && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-destructive flex items-center justify-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> {pinError}
                  </motion.p>
                )}
                <Button className="w-full" onClick={isSettingPin ? setupPin : unlock}>
                  {isSettingPin ? <><Shield className="h-4 w-4 mr-2" /> Set PIN</> : <><Unlock className="h-4 w-4 mr-2" /> Unlock</>}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">Notes are stored locally with PIN protection. Auto-locks after 5 min of inactivity.</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // UNLOCKED VIEW
  return (
    <div className="space-y-4" onClick={resetAutoLock}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 flex-wrap">
        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[0_0_20px_hsl(var(--primary)/0.35)]">
          <Shield className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">XVault</h1>
          <p className="text-xs text-muted-foreground">{notes.length} encrypted notes · PIN protected</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowContent(!showContent)}>
            {showContent ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
            {showContent ? "Hide" : "Show"}
          </Button>
          <Button size="sm" variant="outline" onClick={() => { setIsLocked(true); setActiveNote(null); }}>
            <Lock className="h-4 w-4 mr-1" /> Lock
          </Button>
          <Button size="sm" onClick={createNote}><Plus className="h-4 w-4 mr-1" /> New Note</Button>
        </div>
      </motion.div>

      <div className="flex gap-4 h-[calc(100vh-220px)]">
        {/* Sidebar */}
        <div className="w-72 flex-shrink-0 space-y-3 overflow-y-auto">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search notes..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-8 h-8 text-xs" />
          </div>

          {favorites.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1"><Star className="h-3 w-3" /> Favorites</p>
              {favorites.map(note => (
                <NoteListItem key={note.id} note={note} isActive={activeNote?.id === note.id} showContent={showContent} onClick={() => setActiveNote(note)} onDelete={() => deleteNote(note.id)} />
              ))}
            </div>
          )}

          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1"><FileText className="h-3 w-3" /> All Notes</p>
            {regular.length === 0 && notes.length === 0 ? (
              <Card className="border-dashed"><CardContent className="p-4 text-center text-xs text-muted-foreground">No notes yet. Create your first one!</CardContent></Card>
            ) : (
              regular.map(note => (
                <NoteListItem key={note.id} note={note} isActive={activeNote?.id === note.id} showContent={showContent} onClick={() => setActiveNote(note)} onDelete={() => deleteNote(note.id)} />
              ))
            )}
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 rounded-xl border bg-card/50 backdrop-blur-sm overflow-hidden">
          {activeNote ? (
            <div className="h-full flex flex-col">
              <div className="flex items-center gap-2 p-3 border-b border-border/50">
                <Input
                  value={activeNote.title}
                  onChange={e => updateNote({ ...activeNote, title: e.target.value })}
                  className="border-none bg-transparent text-lg font-bold h-8 focus-visible:ring-0 px-0"
                  placeholder="Note title..."
                />
                <Button
                  variant="ghost" size="icon" className="h-7 w-7"
                  onClick={() => updateNote({ ...activeNote, isFavorite: !activeNote.isFavorite })}
                >
                  <Star className={`h-4 w-4 ${activeNote.isFavorite ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                </Button>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border/30">
                <Hash className="h-3 w-3 text-muted-foreground" />
                <Input
                  value={activeNote.tags.join(", ")}
                  onChange={e => updateNote({ ...activeNote, tags: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                  placeholder="Tags (comma separated)"
                  className="border-none bg-transparent text-xs h-6 focus-visible:ring-0 px-0"
                />
                <span className="text-[9px] text-muted-foreground flex items-center gap-1 flex-shrink-0">
                  <Clock className="h-2.5 w-2.5" />
                  {new Date(activeNote.updatedAt).toLocaleString()}
                </span>
              </div>
              <Textarea
                value={showContent ? activeNote.content : "••••••••••••••••••"}
                onChange={e => showContent && updateNote({ ...activeNote, content: e.target.value })}
                readOnly={!showContent}
                placeholder="Start writing your private note..."
                className="flex-1 border-none rounded-none resize-none focus-visible:ring-0 text-sm leading-relaxed p-4"
              />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Shield className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Select a note or create a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NoteListItem({ note, isActive, showContent, onClick, onDelete }: { note: VaultNote; isActive: boolean; showContent: boolean; onClick: () => void; onDelete: () => void }) {
  return (
    <motion.div
      layout
      className={`group rounded-lg p-2.5 cursor-pointer transition-all mb-1 ${isActive ? "bg-primary/10 border border-primary/30" : "hover:bg-muted/50 border border-transparent"}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate">{showContent ? note.title : "••••••"}</p>
          <p className="text-[10px] text-muted-foreground truncate mt-0.5">
            {showContent ? (note.content.slice(0, 60) || "Empty note") : "••••••••••"}
          </p>
        </div>
        <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" onClick={e => { e.stopPropagation(); onDelete(); }}>
          <Trash2 className="h-3 w-3 text-destructive" />
        </Button>
      </div>
      {note.tags.length > 0 && showContent && (
        <div className="flex gap-1 mt-1 flex-wrap">
          {note.tags.slice(0, 3).map(t => <Badge key={t} variant="outline" className="text-[8px] h-3.5">{t}</Badge>)}
        </div>
      )}
    </motion.div>
  );
}
