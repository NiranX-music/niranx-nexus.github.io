import { useState, useCallback } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  Plus, Trash2, GripVertical, MoreHorizontal, Edit3,
  CheckCircle2, Clock, AlertCircle, Sparkles, LayoutGrid,
  Calendar, Tag, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";

interface KanbanCard {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  tags: string[];
  assignee?: string;
  dueDate?: string;
  createdAt: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  cards: KanbanCard[];
}

const PRIORITY_CONFIG = {
  low: { label: "Low", color: "bg-muted text-muted-foreground", icon: Clock },
  medium: { label: "Medium", color: "bg-primary/20 text-primary", icon: AlertCircle },
  high: { label: "High", color: "bg-accent/20 text-accent-foreground", icon: AlertCircle },
  urgent: { label: "Urgent", color: "bg-destructive/20 text-destructive", icon: AlertCircle },
};

const DEFAULT_COLUMNS: KanbanColumn[] = [
  { id: "backlog", title: "Backlog", color: "border-muted-foreground/30", cards: [] },
  {
    id: "todo", title: "To Do", color: "border-primary/40", cards: [
      { id: "c1", title: "Research study techniques", description: "Look into active recall and spaced repetition methods", priority: "medium", tags: ["research"], createdAt: new Date().toISOString() },
      { id: "c2", title: "Create flashcard deck", description: "Biology chapter 5 key terms", priority: "high", tags: ["biology", "flashcards"], dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0], createdAt: new Date().toISOString() },
    ]
  },
  {
    id: "progress", title: "In Progress", color: "border-accent/40", cards: [
      { id: "c3", title: "Math problem set", description: "Complete exercises 1-20 from chapter 4", priority: "high", tags: ["math"], createdAt: new Date().toISOString() },
    ]
  },
  { id: "review", title: "Review", color: "border-warning/40", cards: [] },
  {
    id: "done", title: "Done", color: "border-green-500/40", cards: [
      { id: "c4", title: "Read chapter 3", description: "History textbook", priority: "low", tags: ["history"], createdAt: new Date().toISOString() },
    ]
  },
];

export default function XBoard() {
  const [columns, setColumns] = useState<KanbanColumn[]>(DEFAULT_COLUMNS);
  const [draggedCard, setDraggedCard] = useState<{ card: KanbanCard; fromCol: string } | null>(null);
  const [editingCard, setEditingCard] = useState<KanbanCard | null>(null);
  const [editingColId, setEditingColId] = useState<string | null>(null);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [addingToCol, setAddingToCol] = useState<string | null>(null);
  const [newColTitle, setNewColTitle] = useState("");
  const [showNewCol, setShowNewCol] = useState(false);
  const [filterTag, setFilterTag] = useState<string | null>(null);

  const allTags = Array.from(new Set(columns.flatMap(c => c.cards.flatMap(card => card.tags))));
  const totalCards = columns.reduce((s, c) => s + c.cards.length, 0);

  const addCard = (colId: string) => {
    if (!newCardTitle.trim()) return;
    const card: KanbanCard = {
      id: `card-${Date.now()}`,
      title: newCardTitle.trim(),
      description: "",
      priority: "medium",
      tags: [],
      createdAt: new Date().toISOString(),
    };
    setColumns(prev => prev.map(c => c.id === colId ? { ...c, cards: [...c.cards, card] } : c));
    setNewCardTitle("");
    setAddingToCol(null);
    toast({ title: "Card added" });
  };

  const deleteCard = (colId: string, cardId: string) => {
    setColumns(prev => prev.map(c => c.id === colId ? { ...c, cards: c.cards.filter(card => card.id !== cardId) } : c));
  };

  const moveCard = (cardId: string, fromColId: string, toColId: string) => {
    if (fromColId === toColId) return;
    let movedCard: KanbanCard | null = null;
    setColumns(prev => {
      const updated = prev.map(c => {
        if (c.id === fromColId) {
          movedCard = c.cards.find(card => card.id === cardId) || null;
          return { ...c, cards: c.cards.filter(card => card.id !== cardId) };
        }
        return c;
      });
      if (!movedCard) return prev;
      return updated.map(c => c.id === toColId ? { ...c, cards: [...c.cards, movedCard!] } : c);
    });
  };

  const updateCard = (colId: string, updated: KanbanCard) => {
    setColumns(prev => prev.map(c => c.id === colId ? { ...c, cards: c.cards.map(card => card.id === updated.id ? updated : card) } : c));
    setEditingCard(null);
    setEditingColId(null);
  };

  const addColumn = () => {
    if (!newColTitle.trim()) return;
    setColumns(prev => [...prev, { id: `col-${Date.now()}`, title: newColTitle.trim(), color: "border-primary/30", cards: [] }]);
    setNewColTitle("");
    setShowNewCol(false);
  };

  const deleteColumn = (colId: string) => {
    setColumns(prev => prev.filter(c => c.id !== colId));
    toast({ title: "Column removed" });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 flex-wrap">
        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[0_0_20px_hsl(var(--primary)/0.35)]">
          <LayoutGrid className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">XBoard</h1>
          <p className="text-xs text-muted-foreground">{totalCards} cards · {columns.length} columns</p>
        </div>
        <div className="ml-auto flex gap-2 flex-wrap">
          {filterTag && (
            <Badge variant="secondary" className="cursor-pointer gap-1" onClick={() => setFilterTag(null)}>
              {filterTag} ✕
            </Badge>
          )}
          {allTags.length > 0 && (
            <Select value={filterTag || ""} onValueChange={v => setFilterTag(v || null)}>
              <SelectTrigger className="w-32 h-8 text-xs"><SelectValue placeholder="Filter tag" /></SelectTrigger>
              <SelectContent>
                {allTags.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
          <Button size="sm" variant="outline" onClick={() => setShowNewCol(true)}><Plus className="h-4 w-4 mr-1" /> Column</Button>
        </div>
      </motion.div>

      {/* New Column Dialog */}
      <Dialog open={showNewCol} onOpenChange={setShowNewCol}>
        <DialogContent className="max-w-xs">
          <DialogHeader><DialogTitle>New Column</DialogTitle></DialogHeader>
          <Input placeholder="Column name..." value={newColTitle} onChange={e => setNewColTitle(e.target.value)} onKeyDown={e => e.key === "Enter" && addColumn()} />
          <Button onClick={addColumn} className="w-full">Add Column</Button>
        </DialogContent>
      </Dialog>

      {/* Edit Card Dialog */}
      {editingCard && editingColId && (
        <Dialog open={!!editingCard} onOpenChange={() => { setEditingCard(null); setEditingColId(null); }}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Edit Card</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input value={editingCard.title} onChange={e => setEditingCard({ ...editingCard, title: e.target.value })} placeholder="Title" />
              <Textarea value={editingCard.description} onChange={e => setEditingCard({ ...editingCard, description: e.target.value })} placeholder="Description..." className="h-20 resize-none" />
              <Select value={editingCard.priority} onValueChange={v => setEditingCard({ ...editingCard, priority: v as KanbanCard["priority"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PRIORITY_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input type="date" value={editingCard.dueDate || ""} onChange={e => setEditingCard({ ...editingCard, dueDate: e.target.value })} />
              <Input placeholder="Tags (comma separated)" value={editingCard.tags.join(", ")} onChange={e => setEditingCard({ ...editingCard, tags: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} />
              <Select value="" onValueChange={colId => { moveCard(editingCard.id, editingColId, colId); updateCard(colId, editingCard); }}>
                <SelectTrigger><SelectValue placeholder="Move to column..." /></SelectTrigger>
                <SelectContent>
                  {columns.filter(c => c.id !== editingColId).map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button className="w-full" onClick={() => updateCard(editingColId!, editingCard)}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Board */}
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[60vh]">
        {columns.map((col, ci) => (
          <motion.div
            key={col.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: ci * 0.05 }}
            className={`flex-shrink-0 w-72 rounded-xl border-2 ${col.color} bg-card/30 backdrop-blur-sm flex flex-col`}
            onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
            onDrop={e => {
              e.preventDefault();
              const data = e.dataTransfer.getData("text/plain");
              if (data) {
                const { cardId, fromCol } = JSON.parse(data);
                moveCard(cardId, fromCol, col.id);
              }
            }}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between p-3 border-b border-border/50">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm">{col.title}</h3>
                <Badge variant="secondary" className="text-[10px] h-5 min-w-[20px] justify-center">
                  {col.cards.filter(c => !filterTag || c.tags.includes(filterTag)).length}
                </Badge>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6"><MoreHorizontal className="h-3.5 w-3.5" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setAddingToCol(col.id)}><Plus className="h-3.5 w-3.5 mr-2" /> Add Card</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={() => deleteColumn(col.id)}><Trash2 className="h-3.5 w-3.5 mr-2" /> Delete Column</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Cards */}
            <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-300px)]">
              <AnimatePresence>
                {col.cards
                  .filter(c => !filterTag || c.tags.includes(filterTag))
                  .map(card => {
                    const priorityCfg = PRIORITY_CONFIG[card.priority];
                    return (
                      <motion.div
                        key={card.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        draggable
                        onDragStart={e => {
                          (e as any).dataTransfer.setData("text/plain", JSON.stringify({ cardId: card.id, fromCol: col.id }));
                          setDraggedCard({ card, fromCol: col.id });
                        }}
                        onDragEnd={() => setDraggedCard(null)}
                        className="group cursor-grab active:cursor-grabbing"
                      >
                        <Card className="border-border/50 bg-background/80 hover:border-primary/30 hover:shadow-[0_0_12px_hsl(var(--primary)/0.1)] transition-all">
                          <CardContent className="p-3 space-y-2">
                            <div className="flex items-start justify-between gap-1">
                              <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 mt-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                              <p className="text-sm font-medium flex-1 leading-snug">{card.title}</p>
                              <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => { setEditingCard(card); setEditingColId(col.id); }}>
                                <Edit3 className="h-3 w-3" />
                              </Button>
                            </div>
                            {card.description && <p className="text-xs text-muted-foreground line-clamp-2 pl-5">{card.description}</p>}
                            <div className="flex items-center gap-1.5 flex-wrap pl-5">
                              <Badge className={`text-[9px] h-4 ${priorityCfg.color}`}>{priorityCfg.label}</Badge>
                              {card.tags.map(t => <Badge key={t} variant="outline" className="text-[9px] h-4">{t}</Badge>)}
                              {card.dueDate && (
                                <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                                  <Calendar className="h-2.5 w-2.5" /> {card.dueDate}
                                </span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
              </AnimatePresence>

              {/* Quick Add */}
              {addingToCol === col.id ? (
                <div className="space-y-1.5">
                  <Input autoFocus placeholder="Card title..." value={newCardTitle} onChange={e => setNewCardTitle(e.target.value)} onKeyDown={e => { if (e.key === "Enter") addCard(col.id); if (e.key === "Escape") setAddingToCol(null); }} className="text-xs h-8" />
                  <div className="flex gap-1">
                    <Button size="sm" className="flex-1 h-7 text-xs" onClick={() => addCard(col.id)}>Add</Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setAddingToCol(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <Button variant="ghost" size="sm" className="w-full justify-start text-xs text-muted-foreground h-7" onClick={() => setAddingToCol(col.id)}>
                  <Plus className="h-3 w-3 mr-1" /> Add card
                </Button>
              )}
            </div>
          </motion.div>
        ))}

        {/* Add Column Placeholder */}
        <div className="flex-shrink-0 w-72 rounded-xl border-2 border-dashed border-muted-foreground/20 flex items-center justify-center cursor-pointer hover:border-primary/30 transition-colors min-h-[200px]" onClick={() => setShowNewCol(true)}>
          <div className="text-center">
            <Plus className="h-6 w-6 text-muted-foreground/40 mx-auto mb-1" />
            <span className="text-xs text-muted-foreground">Add Column</span>
          </div>
        </div>
      </div>
    </div>
  );
}
