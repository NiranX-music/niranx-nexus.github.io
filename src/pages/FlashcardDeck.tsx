import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDeckFlashcards, useFlashcards } from '@/hooks/useFlashcards';
import { supabase } from '@/integrations/supabase/client';
import {
  ArrowLeft,
  Plus,
  Play,
  Sparkles,
  Edit,
  Trash2,
  BookOpen,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

export default function FlashcardDeck() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const { cards, loading, addCard, deleteCard, updateCard, getDueCards } = useDeckFlashcards(deckId);

  const [deck, setDeck] = useState<any>(null);
  const [deckLoading, setDeckLoading] = useState(true);

  const [addOpen, setAddOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newDifficulty, setNewDifficulty] = useState('medium');

  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState('');
  const [editAnswer, setEditAnswer] = useState('');

  useEffect(() => {
    const fetchDeck = async () => {
      if (!deckId) return;

      try {
        const { data, error } = await supabase
          .from('flashcard_decks')
          .select('*')
          .eq('id', deckId)
          .single();

        if (error) throw error;
        setDeck(data);
      } catch (error) {
        console.error('Error fetching deck:', error);
        navigate('/niranx/flashcards');
      } finally {
        setDeckLoading(false);
      }
    };

    fetchDeck();
  }, [deckId, navigate]);

  const handleAddCard = async () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    await addCard(newQuestion, newAnswer, newDifficulty);
    setAddOpen(false);
    setNewQuestion('');
    setNewAnswer('');
    setNewDifficulty('medium');
  };

  const handleEditCard = async () => {
    if (!editingCard || !editQuestion.trim() || !editAnswer.trim()) return;

    await updateCard(editingCard, {
      question: editQuestion,
      answer: editAnswer,
    });
    setEditingCard(null);
  };

  const startEdit = (card: any) => {
    setEditingCard(card.id);
    setEditQuestion(card.question);
    setEditAnswer(card.answer);
  };

  const dueCards = getDueCards();

  if (deckLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-4 w-96 mb-8" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!deck) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate('/niranx/flashcards')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Decks
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{deck.title}</h1>
            {deck.subject && (
              <Badge variant="secondary" className="mt-1">
                {deck.subject}
              </Badge>
            )}
            {deck.description && (
              <p className="text-muted-foreground mt-2">{deck.description}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/niranx/flashcards/create?deckId=${deckId}`)}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              AI Add Cards
            </Button>
            {cards.length > 0 && (
              <Button onClick={() => navigate(`/niranx/flashcards/${deckId}/study`)}>
                <Play className="h-4 w-4 mr-2" />
                Study {dueCards.length > 0 ? `(${dueCards.length} due)` : ''}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <div className="text-2xl font-bold">{cards.length}</div>
            <div className="text-sm text-muted-foreground">Total Cards</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <div className="text-2xl font-bold">{dueCards.length}</div>
            <div className="text-sm text-muted-foreground">Due for Review</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <RotateCcw className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <div className="text-2xl font-bold">
              {cards.reduce((sum, c) => sum + c.review_count, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Reviews</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Sparkles className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <div className="text-2xl font-bold">
              {Math.round(cards.reduce((sum, c) => sum + Number(c.ease_factor), 0) / cards.length * 10 || 0) / 10 || 2.5}
            </div>
            <div className="text-sm text-muted-foreground">Avg Ease</div>
          </CardContent>
        </Card>
      </div>

      {/* Cards List */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Cards</h2>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Card
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : cards.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No cards yet</h3>
            <p className="text-muted-foreground mb-4">
              Add your first flashcard or generate with AI.
            </p>
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => navigate(`/niranx/flashcards/create?deckId=${deckId}`)}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                AI Generate
              </Button>
              <Button onClick={() => setAddOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Card
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {cards.map((card, index) => (
            <Card key={card.id} className="overflow-hidden">
              <div className="flex">
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground">#{index + 1}</span>
                        <Badge
                          variant={
                            card.difficulty === 'easy'
                              ? 'default'
                              : card.difficulty === 'hard'
                              ? 'destructive'
                              : 'secondary'
                          }
                          className="text-xs"
                        >
                          {card.difficulty}
                        </Badge>
                        {new Date(card.next_review_at) <= new Date() && (
                          <Badge variant="outline" className="text-xs">
                            Due
                          </Badge>
                        )}
                      </div>
                      <p className="font-medium">{card.question}</p>
                      <p className="text-sm text-muted-foreground mt-1">{card.answer}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => startEdit(card)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => deleteCard(card.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Reviews: {card.review_count}</span>
                    <span>
                      Next: {formatDistanceToNow(new Date(card.next_review_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Card Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Flashcard</DialogTitle>
            <DialogDescription>Create a new flashcard for this deck.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="question">Question *</Label>
              <Textarea
                id="question"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Enter the question..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="answer">Answer *</Label>
              <Textarea
                id="answer"
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder="Enter the answer..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={newDifficulty} onValueChange={setNewDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddCard}
              disabled={!newQuestion.trim() || !newAnswer.trim()}
            >
              Add Card
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Card Dialog */}
      <Dialog open={!!editingCard} onOpenChange={(open) => !open && setEditingCard(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Flashcard</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-question">Question</Label>
              <Textarea
                id="edit-question"
                value={editQuestion}
                onChange={(e) => setEditQuestion(e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-answer">Answer</Label>
              <Textarea
                id="edit-answer"
                value={editAnswer}
                onChange={(e) => setEditAnswer(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCard(null)}>
              Cancel
            </Button>
            <Button onClick={handleEditCard}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
