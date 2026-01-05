import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Layers, Sparkles, Plus, Trash2, Copy, Download, Loader2, Edit2, Check, X, RotateCcw } from 'lucide-react';
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

interface FlashcardDeck {
  id: string;
  name: string;
  cards: Flashcard[];
  createdAt: Date;
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
  const [savedDecks, setSavedDecks] = useState<FlashcardDeck[]>([]);

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

      const prompt = `Generate ${cardCount} flashcards from these notes:

${notes}

Style: ${styleInstructions}

Return JSON array:
[
  {
    "front": "front of card",
    "back": "back of card",
    "tags": ["tag1", "tag2"]
  }
]

Make cards clear, focused on one concept each, and useful for studying.`;

      let functionName = 'ai-chat';
      if (provider === 'openrouter') functionName = 'openrouter-chat';

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: {
          messages: [{ role: 'user', content: prompt }],
          model: model,
        },
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
    setGeneratedCards(cards => 
      cards.map(c => c.id === id ? { ...c, [field]: value } : c)
    );
  };

  const deleteCard = (id: string) => {
    setGeneratedCards(cards => cards.filter(c => c.id !== id));
  };

  const addCard = () => {
    const newCard: Flashcard = {
      id: Date.now().toString(),
      front: '',
      back: '',
      tags: [],
    };
    setGeneratedCards([...generatedCards, newCard]);
    setEditingId(newCard.id);
  };

  const saveDeck = () => {
    if (!deckName.trim()) {
      toast({ title: 'Please enter a deck name', variant: 'destructive' });
      return;
    }
    if (generatedCards.length === 0) {
      toast({ title: 'No cards to save', variant: 'destructive' });
      return;
    }

    const deck: FlashcardDeck = {
      id: Date.now().toString(),
      name: deckName,
      cards: generatedCards,
      createdAt: new Date(),
    };

    setSavedDecks([deck, ...savedDecks]);
    setGeneratedCards([]);
    setDeckName('');
    setNotes('');
    toast({ title: 'Deck saved!', description: `${deck.cards.length} cards in "${deck.name}"` });
  };

  const exportDeck = () => {
    if (generatedCards.length === 0) return;
    
    const exportData = generatedCards.map(c => ({
      front: c.front,
      back: c.back,
    }));
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${deckName || 'flashcards'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500">
          <Layers className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Flashcard Generator</h1>
          <p className="text-muted-foreground">Turn your notes into study flashcards</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
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
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
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
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
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
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Flashcards
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Cards */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Generated Cards ({generatedCards.length})</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={addCard}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
                {generatedCards.length > 0 && (
                  <>
                    <Button variant="outline" size="sm" onClick={exportDeck}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button size="sm" onClick={saveDeck}>
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
                                      <Textarea
                                        value={card.front}
                                        onChange={(e) => updateCard(card.id, 'front', e.target.value)}
                                        rows={2}
                                        className="text-sm"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-xs">Back</Label>
                                      <Textarea
                                        value={card.back}
                                        onChange={(e) => updateCard(card.id, 'back', e.target.value)}
                                        rows={2}
                                        className="text-sm"
                                      />
                                    </div>
                                    <div className="flex gap-2">
                                      <Button size="sm" onClick={() => setEditingId(null)}>
                                        <Check className="h-3 w-3 mr-1" />
                                        Done
                                      </Button>
                                    </div>
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
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => setEditingId(editingId === card.id ? null : card.id)}
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive"
                                  onClick={() => deleteCard(card.id)}
                                >
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
    </div>
  );
}
