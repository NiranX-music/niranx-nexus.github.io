import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Plus, Trash2, RotateCcw, Check, X, Clock, Flame, Star, Zap, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

interface MemoCard {
  id: string;
  front: string;
  back: string;
  deck: string;
  interval: number; // days until next review
  easeFactor: number;
  nextReview: string; // ISO date
  repetitions: number;
  createdAt: string;
}

const STORAGE_KEY = "xmemo_cards";

const XMemo = () => {
  const [cards, setCards] = useState<MemoCard[]>([]);
  const [currentCard, setCurrentCard] = useState<MemoCard | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [newFront, setNewFront] = useState("");
  const [newBack, setNewBack] = useState("");
  const [newDeck, setNewDeck] = useState("General");
  const [reviewQueue, setReviewQueue] = useState<MemoCard[]>([]);
  const [sessionStats, setSessionStats] = useState({ reviewed: 0, correct: 0, streak: 0 });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCards(JSON.parse(raw));
    } catch { /* empty */ }
  }, []);

  const save = useCallback((updated: MemoCard[]) => {
    setCards(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const due = cards.filter(c => c.nextReview <= today);
    setReviewQueue(due);
    if (due.length > 0 && !currentCard) setCurrentCard(due[0]);
  }, [cards, currentCard]);

  const addCard = () => {
    if (!newFront.trim() || !newBack.trim()) return;
    const card: MemoCard = {
      id: crypto.randomUUID(),
      front: newFront.trim(),
      back: newBack.trim(),
      deck: newDeck,
      interval: 1,
      easeFactor: 2.5,
      nextReview: new Date().toISOString().split("T")[0],
      repetitions: 0,
      createdAt: new Date().toISOString(),
    };
    save([...cards, card]);
    setNewFront("");
    setNewBack("");
    toast.success("Card added!");
  };

  // SM-2 algorithm
  const gradeCard = (quality: number) => {
    if (!currentCard) return;

    const card = { ...currentCard };
    if (quality >= 3) {
      if (card.repetitions === 0) card.interval = 1;
      else if (card.repetitions === 1) card.interval = 6;
      else card.interval = Math.round(card.interval * card.easeFactor);
      card.repetitions += 1;
    } else {
      card.repetitions = 0;
      card.interval = 1;
    }

    card.easeFactor = Math.max(1.3, card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
    const next = new Date();
    next.setDate(next.getDate() + card.interval);
    card.nextReview = next.toISOString().split("T")[0];

    const updated = cards.map(c => c.id === card.id ? card : c);
    save(updated);

    setSessionStats(prev => ({
      reviewed: prev.reviewed + 1,
      correct: quality >= 3 ? prev.correct + 1 : prev.correct,
      streak: quality >= 3 ? prev.streak + 1 : 0,
    }));

    setShowAnswer(false);
    const remaining = reviewQueue.filter(c => c.id !== card.id);
    setReviewQueue(remaining);
    setCurrentCard(remaining.length > 0 ? remaining[0] : null);
  };

  const deleteCard = (id: string) => {
    save(cards.filter(c => c.id !== id));
    toast.success("Card deleted");
  };

  const decks = Array.from(new Set(cards.map(c => c.deck)));
  const dueToday = reviewQueue.length;
  const masteredCount = cards.filter(c => c.repetitions >= 5).length;

  return (
    <div className="container max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" /> XMemo
          </h1>
          <p className="text-muted-foreground mt-1">Spaced repetition memory system</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> New Card</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Memory Card</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Front (question)" value={newFront} onChange={e => setNewFront(e.target.value)} />
              <Textarea placeholder="Back (answer)" value={newBack} onChange={e => setNewBack(e.target.value)} />
              <Input placeholder="Deck name" value={newDeck} onChange={e => setNewDeck(e.target.value)} />
              <Button onClick={addCard} className="w-full">Add Card</Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Cards", value: cards.length, icon: <BookOpen className="h-4 w-4" /> },
          { label: "Due Today", value: dueToday, icon: <Clock className="h-4 w-4" /> },
          { label: "Mastered", value: masteredCount, icon: <Star className="h-4 w-4" /> },
          { label: "Session Streak", value: sessionStats.streak, icon: <Flame className="h-4 w-4" /> },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 rounded bg-primary/10 text-primary">{s.icon}</div>
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                </div>
                <p className="text-2xl font-bold">{s.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Review Session */}
      {currentCard ? (
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2"><Zap className="h-5 w-5 text-primary" /> Review Session</span>
              <Badge variant="secondary">{reviewQueue.length} remaining</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <motion.div
              key={currentCard.id + (showAnswer ? "-answer" : "-question")}
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="min-h-[200px] flex items-center justify-center p-8 rounded-xl border-2 border-dashed border-primary/20 bg-primary/5 text-center"
            >
              <div>
                <Badge variant="outline" className="mb-4">{showAnswer ? "Answer" : "Question"}</Badge>
                <p className="text-xl font-medium">{showAnswer ? currentCard.back : currentCard.front}</p>
                <p className="text-xs text-muted-foreground mt-2">{currentCard.deck}</p>
              </div>
            </motion.div>

            {!showAnswer ? (
              <Button onClick={() => setShowAnswer(true)} className="w-full" size="lg">Show Answer</Button>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                <Button variant="destructive" onClick={() => gradeCard(1)} className="flex-col h-auto py-3">
                  <X className="h-4 w-4" />
                  <span className="text-xs mt-1">Again</span>
                </Button>
                <Button variant="outline" onClick={() => gradeCard(3)} className="flex-col h-auto py-3">
                  <RotateCcw className="h-4 w-4" />
                  <span className="text-xs mt-1">Hard</span>
                </Button>
                <Button variant="secondary" onClick={() => gradeCard(4)} className="flex-col h-auto py-3">
                  <Check className="h-4 w-4" />
                  <span className="text-xs mt-1">Good</span>
                </Button>
                <Button onClick={() => gradeCard(5)} className="flex-col h-auto py-3">
                  <Zap className="h-4 w-4" />
                  <span className="text-xs mt-1">Easy</span>
                </Button>
              </div>
            )}

            {sessionStats.reviewed > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Session progress</span>
                  <span>{sessionStats.correct}/{sessionStats.reviewed} correct</span>
                </div>
                <Progress value={(sessionStats.correct / sessionStats.reviewed) * 100} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Star className="h-12 w-12 mx-auto mb-4 text-primary" />
            <p className="text-lg font-medium">All caught up!</p>
            <p className="text-muted-foreground">No cards due for review. Add more cards or come back later.</p>
          </CardContent>
        </Card>
      )}

      {/* Card Library */}
      {cards.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Card Library ({cards.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2 max-h-[300px] overflow-y-auto">
            {cards.map(card => (
              <div key={card.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{card.front}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-xs">{card.deck}</Badge>
                    <span>Next: {card.nextReview}</span>
                    <span>×{card.repetitions}</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteCard(card.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default XMemo;
