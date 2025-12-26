import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIProviderSelector, useAIProvider, AI_PROVIDERS } from '@/components/ai/AIProviderSelector';
import { useFlashcards, useDeckFlashcards } from '@/hooks/useFlashcards';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  Check,
  X,
  Plus,
  FileText,
  BookOpen,
  Brain,
} from 'lucide-react';

interface GeneratedCard {
  question: string;
  answer: string;
  difficulty: string;
  selected: boolean;
}

export default function FlashcardCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const existingDeckId = searchParams.get('deckId');
  const { user } = useAuth();
  const { createDeck } = useFlashcards();
  const { addMultipleCards } = useDeckFlashcards(existingDeckId || undefined);

  const { provider, model, setProvider, setModel } = useAIProvider('flashcards');

  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [cardCount, setCardCount] = useState('10');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const [deckTitle, setDeckTitle] = useState('');
  const [deckSubject, setDeckSubject] = useState('');
  const [deckDescription, setDeckDescription] = useState('');

  const [generating, setGenerating] = useState(false);
  const [generatedCards, setGeneratedCards] = useState<GeneratedCard[]>([]);
  const [saving, setSaving] = useState(false);

  const [existingDeck, setExistingDeck] = useState<any>(null);

  useEffect(() => {
    if (existingDeckId) {
      fetchExistingDeck();
    }
  }, [existingDeckId]);

  const fetchExistingDeck = async () => {
    if (!existingDeckId) return;

    try {
      const { data, error } = await supabase
        .from('flashcard_decks')
        .select('*')
        .eq('id', existingDeckId)
        .single();

      if (error) throw error;
      setExistingDeck(data);
      setDeckTitle(data.title);
      setDeckSubject(data.subject || '');
    } catch (error) {
      console.error('Error fetching deck:', error);
    }
  };

  const handleGenerate = async () => {
    if (!topic && !content) {
      toast.error('Please enter a topic or paste content');
      return;
    }

    setGenerating(true);
    setGeneratedCards([]);

    try {
      const response = await supabase.functions.invoke('generate-flashcards', {
        body: {
          topic,
          content,
          count: parseInt(cardCount),
          difficulty,
          provider,
          model,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      const cards = response.data.flashcards.map((c: any) => ({
        ...c,
        selected: true,
      }));

      setGeneratedCards(cards);
      toast.success(`Generated ${cards.length} flashcards!`);
    } catch (error: any) {
      console.error('Generation error:', error);
      toast.error(error.message || 'Failed to generate flashcards');
    } finally {
      setGenerating(false);
    }
  };

  const toggleCard = (index: number) => {
    setGeneratedCards((prev) =>
      prev.map((card, i) => (i === index ? { ...card, selected: !card.selected } : card))
    );
  };

  const selectAll = () => {
    setGeneratedCards((prev) => prev.map((card) => ({ ...card, selected: true })));
  };

  const deselectAll = () => {
    setGeneratedCards((prev) => prev.map((card) => ({ ...card, selected: false })));
  };

  const handleSave = async () => {
    const selectedCards = generatedCards.filter((c) => c.selected);
    if (selectedCards.length === 0) {
      toast.error('Please select at least one card');
      return;
    }

    setSaving(true);

    try {
      let targetDeckId = existingDeckId;

      // Create new deck if needed
      if (!targetDeckId) {
        if (!deckTitle) {
          toast.error('Please enter a deck title');
          setSaving(false);
          return;
        }

        const newDeck = await createDeck(deckTitle, deckDescription, deckSubject);
        if (!newDeck) {
          throw new Error('Failed to create deck');
        }
        targetDeckId = newDeck.id;
      }

      // Add cards to deck
      const cardsToAdd = selectedCards.map((c) => ({
        question: c.question,
        answer: c.answer,
        difficulty: c.difficulty,
      }));

      const { error } = await supabase.from('flashcards').insert(
        cardsToAdd.map((c) => ({
          deck_id: targetDeckId,
          question: c.question,
          answer: c.answer,
          difficulty: c.difficulty,
        }))
      );

      if (error) throw error;

      toast.success(`Added ${selectedCards.length} cards to deck!`);
      navigate(`/niranx/flashcards/${targetDeckId}`);
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(error.message || 'Failed to save flashcards');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Sign in to create Flashcards</h2>
            <Button onClick={() => navigate('/auth')}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() =>
          navigate(existingDeckId ? `/niranx/flashcards/${existingDeckId}` : '/niranx/flashcards')
        }
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="h-8 w-8" />
          AI Flashcard Generator
        </h1>
        <p className="text-muted-foreground">
          Generate flashcards automatically using AI
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Generator */}
        <div className="space-y-6">
          {/* AI Provider */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select AI Tool</CardTitle>
              <CardDescription>
                Choose which AI model to use for generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AIProviderSelector
                selectedProvider={provider}
                selectedModel={model}
                onProviderChange={setProvider}
                onModelChange={setModel}
              />
              {AI_PROVIDERS.find((p) => p.id === provider)?.requiresApiKey && (
                <p className="text-xs text-amber-500 mt-2">
                  ⚠️ This provider requires an API key. Make sure it's configured in your settings.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Content Input */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Content Source</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="topic">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="topic">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Topic
                  </TabsTrigger>
                  <TabsTrigger value="content">
                    <FileText className="h-4 w-4 mr-2" />
                    Paste Content
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="topic" className="mt-4">
                  <div>
                    <Label htmlFor="topic">Topic or Subject</Label>
                    <Input
                      id="topic"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g., French Revolution, Photosynthesis, JavaScript Arrays"
                    />
                  </div>
                </TabsContent>
                <TabsContent value="content" className="mt-4">
                  <div>
                    <Label htmlFor="content">Your Content</Label>
                    <Textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Paste your notes, textbook content, or any text you want to create flashcards from..."
                      rows={6}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="count">Number of Cards</Label>
                  <Select value={cardCount} onValueChange={setCardCount}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 cards</SelectItem>
                      <SelectItem value="10">10 cards</SelectItem>
                      <SelectItem value="15">15 cards</SelectItem>
                      <SelectItem value="20">20 cards</SelectItem>
                      <SelectItem value="30">30 cards</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select value={difficulty} onValueChange={(v: any) => setDifficulty(v)}>
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
            </CardContent>
          </Card>

          {/* Deck Details (only if creating new deck) */}
          {!existingDeckId && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">New Deck Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="deck-title">Deck Title *</Label>
                  <Input
                    id="deck-title"
                    value={deckTitle}
                    onChange={(e) => setDeckTitle(e.target.value)}
                    placeholder="e.g., Biology Chapter 5"
                  />
                </div>
                <div>
                  <Label htmlFor="deck-subject">Subject</Label>
                  <Input
                    id="deck-subject"
                    value={deckSubject}
                    onChange={(e) => setDeckSubject(e.target.value)}
                    placeholder="e.g., Biology"
                  />
                </div>
                <div>
                  <Label htmlFor="deck-description">Description</Label>
                  <Textarea
                    id="deck-description"
                    value={deckDescription}
                    onChange={(e) => setDeckDescription(e.target.value)}
                    placeholder="What will you learn?"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {existingDeck && (
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">
                  Adding cards to: <strong>{existingDeck.title}</strong>
                </p>
              </CardContent>
            </Card>
          )}

          <Button
            className="w-full"
            size="lg"
            onClick={handleGenerate}
            disabled={generating || (!topic && !content)}
          >
            {generating ? (
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
        </div>

        {/* Right: Preview */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Preview</CardTitle>
                {generatedCards.length > 0 && (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={selectAll}>
                      Select All
                    </Button>
                    <Button variant="ghost" size="sm" onClick={deselectAll}>
                      Clear All
                    </Button>
                  </div>
                )}
              </div>
              {generatedCards.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {generatedCards.filter((c) => c.selected).length} of {generatedCards.length}{' '}
                  cards selected
                </p>
              )}
            </CardHeader>
            <CardContent>
              {generating ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
                  <p className="text-muted-foreground">Generating flashcards...</p>
                </div>
              ) : generatedCards.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Brain className="h-12 w-12 mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Generated flashcards will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {generatedCards.map((card, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        card.selected
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-muted-foreground'
                      }`}
                      onClick={() => toggleCard(index)}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`h-5 w-5 rounded border flex-shrink-0 flex items-center justify-center ${
                            card.selected
                              ? 'bg-primary border-primary text-primary-foreground'
                              : 'border-muted-foreground'
                          }`}
                        >
                          {card.selected && <Check className="h-3 w-3" />}
                        </div>
                        <div className="flex-1 min-w-0">
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
                          </div>
                          <p className="text-sm font-medium">{card.question}</p>
                          <p className="text-sm text-muted-foreground mt-1">{card.answer}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {generatedCards.length > 0 && (
                <Button
                  className="w-full mt-4"
                  onClick={handleSave}
                  disabled={saving || generatedCards.filter((c) => c.selected).length === 0}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Save {generatedCards.filter((c) => c.selected).length} Cards
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
