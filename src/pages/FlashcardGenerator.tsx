import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Layers, Sparkles, Plus, Trash2, Download, Loader2, Edit2, Check, History, Clock, FolderOpen, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AIProviderSelector, useAIProvider } from '@/components/ai/AIProviderSelector';
import { motion, AnimatePresence } from 'framer-motion';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  tags?: string[];
}

interface SavedDeck {
  id: string;
  title: string;
  description: string | null;
  card_count: number | null;
  created_at: string;
  subject: string | null;
}

export default function FlashcardGenerator() {
  const { toast } = useToast();
  const { provider, model, setProvider, setModel } = useAIProvider('flashcard-generator');
  const [notes, setNotes] = useState('');
  const [deckName, setDeckName] = useState('');
  const [cardCount, setCardCount] = useState('10');
  const [cardStyle, setCardStyle] = useState<'qa' | 'definition' | 'fill'>('qa');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCards, setGeneratedCards] = useState<Flashcard[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // History state
  const [savedDecks, setSavedDecks] = useState<SavedDeck[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [selectedDeckCards, setSelectedDeckCards] = useState<Flashcard[]>([]);
  const [loadingDeckCards, setLoadingDeckCards] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('flashcard_decks')
        .select('id, title, description, card_count, created_at, subject')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setSavedDecks(data || []);
    } catch (e) {
      console.error('Failed to load history:', e);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const loadDeckCards = async (deckId: string) => {
    setLoadingDeckCards(true);
    setSelectedDeckId(deckId);
    try {
      const { data, error } = await supabase
        .from('flashcards')
        .select('id, question, answer, difficulty')
        .eq('deck_id', deckId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const cards: Flashcard[] = (data || []).map(c => ({
        id: c.id,
        front: c.question,
        back: c.answer,
        tags: c.difficulty ? [c.difficulty] : [],
      }));
      setSelectedDeckCards(cards);
    } catch (e) {
      toast({ title: 'Failed to load cards', variant: 'destructive' });
    } finally {
      setLoadingDeckCards(false);
    }
  };

  const generateFlashcards = async () => {
    if (!notes.trim()) {
      toast({ title: 'Please enter notes or content', variant: 'destructive' });
      return;
    }

    setIsGenerating(true);
    try {
      let styleInstructions = '';
      switch (cardStyle) {
        case 'qa':
          styleInstructions = 'Create question and answer pairs. Front: question, Back: answer.';
          break;
        case 'definition':
          styleInstructions = 'Create term and definition pairs. Front: term/concept, Back: definition/explanation.';
          break;
        case 'fill':
          styleInstructions = 'Create fill-in-the-blank cards. Front: sentence with ___ for blank, Back: the missing word(s).';
          break;
      }

      const prompt = `Generate ${cardCount} flashcards from these notes:\n\n${notes}\n\nStyle: ${styleInstructions}\n\nReturn JSON array:\n[\n  {\n    "front": "front of card",\n    "back": "back of card",\n    "tags": ["tag1", "tag2"]\n  }\n]\n\nMake cards clear, focused on one concept each, and useful for studying.`;

      let functionName = 'ai-chat';
      if (provider === 'openrouter') functionName = 'openrouter-chat';

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { messages: [{ role: 'user', content: prompt }], model, stream: false },
      });

      if (error) throw error;

      const content = data?.choices?.[0]?.message?.content || data?.content || '';
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('Invalid response format');

      const cards: Flashcard[] = JSON.parse(jsonMatch[0]).map((card: any, i: number) => ({
        id: `${Date.now()}-${i}`,
        front: card.front,
        back: card.back,
        tags: card.tags || [],
      }));

      setGeneratedCards(cards);
      toast({ title: 'Flashcards generated!', description: `${cards.length} cards created` });
    } catch (error) {
      console.error('Generation error:', error);
      toast({ title: 'Failed to generate flashcards', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const updateCard = (id: string, field: 'front' | 'back', value: string) => {
    setGeneratedCards(cards => cards.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const deleteCard = (id: string) => {
    setGeneratedCards(cards => cards.filter(c => c.id !== id));
  };

  const addCard = () => {
    const newCard: Flashcard = { id: Date.now().toString(), front: '', back: '', tags: [] };
    setGeneratedCards([...generatedCards, newCard]);
    setEditingId(newCard.id);
  };

  const saveDeck = async () => {
    if (!deckName.trim()) {
      toast({ title: 'Please enter a deck name', variant: 'destructive' });
      return;
    }
    if (generatedCards.length === 0) {
      toast({ title: 'No cards to save', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: 'Please log in to save', variant: 'destructive' });
        return;
      }

      // Create deck
      const { data: deck, error: deckError } = await supabase
        .from('flashcard_decks')
        .insert({
          title: deckName,
          user_id: session.user.id,
          card_count: generatedCards.length,
          description: `Generated from notes (${cardStyle} style)`,
        })
        .select('id')
        .single();

      if (deckError) throw deckError;

      // Insert cards
      const cardsToInsert = generatedCards.map(c => ({
        deck_id: deck.id,
        question: c.front,
        answer: c.back,
        difficulty: c.tags?.[0] || null,
      }));

      const { error: cardsError } = await supabase
        .from('flashcards')
        .insert(cardsToInsert);

      if (cardsError) throw cardsError;

      setGeneratedCards([]);
      setDeckName('');
      setNotes('');
      toast({ title: 'Deck saved!', description: `${cardsToInsert.length} cards in "${deckName}"` });
      loadHistory();
    } catch (error) {
      console.error('Save error:', error);
      toast({ title: 'Failed to save deck', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteDeck = async (deckId: string) => {
    try {
      // Cards cascade-delete via FK
      const { error } = await supabase.from('flashcard_decks').delete().eq('id', deckId);
      if (error) throw error;
      toast({ title: 'Deck deleted' });
      if (selectedDeckId === deckId) {
        setSelectedDeckId(null);
        setSelectedDeckCards([]);
      }
      loadHistory();
    } catch (e) {
      toast({ title: 'Failed to delete', variant: 'destructive' });
    }
  };

  const exportDeck = () => {
    if (generatedCards.length === 0) return;
    const exportData = generatedCards.map(c => ({ front: c.front, back: c.back }));
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${deckName || 'flashcards'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const restoreDeck = (cards: Flashcard[], deck: SavedDeck) => {
    setGeneratedCards(cards);
    setDeckName(deck.title);
    setShowHistory(false);
    toast({ title: 'Deck loaded into editor' });
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500">
            <Layers className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Flashcard Generator</h1>
            <p className="text-muted-foreground">Turn your notes into study flashcards</p>
          </div>
        </div>
        <Button
          variant={showHistory ? "default" : "outline"}
          onClick={() => setShowHistory(!showHistory)}
          className="gap-2"
        >
          <History className="h-4 w-4" />
          History ({savedDecks.length})
        </Button>
      </div>

      {showHistory ? (
        /* HISTORY VIEW */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5" /> Saved Decks
            </h2>
            <Button variant="ghost" size="sm" onClick={loadHistory} disabled={historyLoading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${historyLoading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
          </div>

          {savedDecks.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No saved decks yet</p>
                <p className="text-sm">Generate flashcards and save them to see history</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {/* Deck List */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Your Decks</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-2">
                      {savedDecks.map(deck => (
                        <div
                          key={deck.id}
                          className={`border rounded-lg p-3 cursor-pointer transition-colors hover:bg-muted/50 ${selectedDeckId === deck.id ? 'border-primary bg-primary/5' : ''}`}
                          onClick={() => loadDeckCards(deck.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{deck.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-[10px]">
                                  {deck.card_count || 0} cards
                                </Badge>
                                {deck.subject && (
                                  <Badge variant="outline" className="text-[10px]">{deck.subject}</Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(deck.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive flex-shrink-0"
                              onClick={(e) => { e.stopPropagation(); deleteDeck(deck.id); }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Card Preview */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">
                      {selectedDeckId ? 'Cards Preview' : 'Select a deck'}
                    </CardTitle>
                    {selectedDeckId && selectedDeckCards.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const deck = savedDecks.find(d => d.id === selectedDeckId);
                          if (deck) restoreDeck(selectedDeckCards, deck);
                        }}
                      >
                        <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingDeckCards ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : !selectedDeckId ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Layers className="h-10 w-10 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Click a deck to preview cards</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[450px]">
                      <div className="space-y-2">
                        {selectedDeckCards.map((card, i) => (
                          <div key={card.id} className="border rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">
                                {i + 1}
                              </span>
                              <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium">{card.front}</p>
                                <p className="text-sm text-muted-foreground">{card.back}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      ) : (
        /* GENERATOR VIEW */
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Generate from Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <AIProviderSelector
                selectedProvider={provider}
                selectedModel={model}
                onProviderChange={setProvider}
                onModelChange={setModel}
              />

              <div className="space-y-2">
                <Label>Deck Name</Label>
                <Input
                  placeholder="e.g., Biology Chapter 5"
                  value={deckName}
                  onChange={(e) => setDeckName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Card Count</Label>
                  <Select value={cardCount} onValueChange={setCardCount}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[5, 10, 15, 20, 25, 30].map(n => (
                        <SelectItem key={n} value={n.toString()}>{n} cards</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Card Style</Label>
                  <Select value={cardStyle} onValueChange={(v: any) => setCardStyle(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="qa">Q&A Format</SelectItem>
                      <SelectItem value="definition">Term & Definition</SelectItem>
                      <SelectItem value="fill">Fill in the Blank</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes / Content</Label>
                <Textarea
                  placeholder="Paste your notes, textbook content, or any text you want to learn from..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={10}
                />
                <p className="text-xs text-muted-foreground">
                  {notes.split(/\s+/).filter(Boolean).length} words
                </p>
              </div>

              <Button onClick={generateFlashcards} disabled={isGenerating} className="w-full">
                {isGenerating ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
                ) : (
                  <><Sparkles className="h-4 w-4 mr-2" /> Generate Flashcards</>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Generated Cards ({generatedCards.length})</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={addCard}>
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                  {generatedCards.length > 0 && (
                    <>
                      <Button variant="outline" size="sm" onClick={exportDeck}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="sm" onClick={saveDeck} disabled={isSaving}>
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                        Save Deck
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {generatedCards.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Layers className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>No flashcards yet</p>
                  <p className="text-sm">Paste notes and generate to create cards</p>
                </div>
              ) : (
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-3">
                    <AnimatePresence>
                      {generatedCards.map((card, index) => (
                        <motion.div
                          key={card.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, height: 0 }}
                          className="group"
                        >
                          <Card className="overflow-hidden">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary text-sm flex items-center justify-center font-bold">
                                  {index + 1}
                                </span>
                                <div className="flex-1 space-y-3">
                                  {editingId === card.id ? (
                                    <>
                                      <div>
                                        <Label className="text-xs">Front</Label>
                                        <Textarea value={card.front} onChange={(e) => updateCard(card.id, 'front', e.target.value)} rows={2} className="text-sm" />
                                      </div>
                                      <div>
                                        <Label className="text-xs">Back</Label>
                                        <Textarea value={card.back} onChange={(e) => updateCard(card.id, 'back', e.target.value)} rows={2} className="text-sm" />
                                      </div>
                                      <Button size="sm" onClick={() => setEditingId(null)}>
                                        <Check className="h-3 w-3 mr-1" /> Done
                                      </Button>
                                    </>
                                  ) : (
                                    <>
                                      <div>
                                        <Badge variant="outline" className="text-xs mb-1">Front</Badge>
                                        <p className="text-sm">{card.front}</p>
                                      </div>
                                      <div>
                                        <Badge variant="secondary" className="text-xs mb-1">Back</Badge>
                                        <p className="text-sm text-muted-foreground">{card.back}</p>
                                      </div>
                                      {card.tags && card.tags.length > 0 && (
                                        <div className="flex gap-1 flex-wrap">
                                          {card.tags.map((tag, i) => (
                                            <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
                                          ))}
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingId(editingId === card.id ? null : card.id)}>
                                    <Edit2 className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteCard(card.id)}>
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
