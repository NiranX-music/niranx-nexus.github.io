import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookA, Plus, Sparkles, Volume2, Star, Trash2, Search, Loader2, Brain, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AIProviderSelector, useAIProvider } from '@/components/ai/AIProviderSelector';
import { motion, AnimatePresence } from 'framer-motion';

interface Word {
  id: string;
  word: string;
  definition: string;
  example: string;
  pronunciation?: string;
  partOfSpeech?: string;
  synonyms?: string[];
  mastery: number; // 0-100
  lastReviewed?: Date;
}

export default function VocabularyBuilder() {
  const { toast } = useToast();
  const { provider, model, setProvider, setModel } = useAIProvider('vocabulary-builder');
  const [words, setWords] = useState<Word[]>([]);
  const [newWord, setNewWord] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [quizWord, setQuizWord] = useState<Word | null>(null);
  const [quizAnswer, setQuizAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);

  // Load words from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('vocabulary-words');
    if (saved) {
      setWords(JSON.parse(saved));
    }
  }, []);

  // Save words to localStorage
  useEffect(() => {
    localStorage.setItem('vocabulary-words', JSON.stringify(words));
  }, [words]);

  const addWord = async () => {
    if (!newWord.trim()) {
      toast({ title: 'Please enter a word', variant: 'destructive' });
      return;
    }

    if (words.some(w => w.word.toLowerCase() === newWord.toLowerCase())) {
      toast({ title: 'Word already exists', variant: 'destructive' });
      return;
    }

    setIsAdding(true);
    try {
      const prompt = `Provide detailed information about the word "${newWord}". Return a JSON object with:
{
  "definition": "clear definition",
  "example": "example sentence using the word",
  "pronunciation": "phonetic pronunciation",
  "partOfSpeech": "noun/verb/adjective/etc",
  "synonyms": ["synonym1", "synonym2", "synonym3"]
}

Return ONLY the JSON object, no other text.`;

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
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Invalid response');

      const wordInfo = JSON.parse(jsonMatch[0]);

      const newWordEntry: Word = {
        id: Date.now().toString(),
        word: newWord.trim(),
        definition: wordInfo.definition,
        example: wordInfo.example,
        pronunciation: wordInfo.pronunciation,
        partOfSpeech: wordInfo.partOfSpeech,
        synonyms: wordInfo.synonyms,
        mastery: 0,
        lastReviewed: new Date(),
      };

      setWords([newWordEntry, ...words]);
      setNewWord('');
      toast({ title: 'Word added!', description: `"${newWord}" added to your vocabulary` });
    } catch (error) {
      console.error('Add word error:', error);
      toast({ title: 'Failed to add word', variant: 'destructive' });
    } finally {
      setIsAdding(false);
    }
  };

  const deleteWord = (id: string) => {
    setWords(words.filter(w => w.id !== id));
    toast({ title: 'Word removed' });
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
  };

  const startQuiz = () => {
    const wordsToReview = words.filter(w => w.mastery < 100);
    if (wordsToReview.length === 0) {
      toast({ title: 'All words mastered!', description: 'Add more words to continue learning' });
      return;
    }
    const randomWord = wordsToReview[Math.floor(Math.random() * wordsToReview.length)];
    setQuizWord(randomWord);
    setQuizAnswer('');
    setShowAnswer(false);
  };

  const checkAnswer = () => {
    if (!quizWord) return;
    
    const isCorrect = quizAnswer.toLowerCase().includes(quizWord.word.toLowerCase());
    
    setWords(words.map(w => {
      if (w.id === quizWord.id) {
        return {
          ...w,
          mastery: Math.min(100, w.mastery + (isCorrect ? 20 : -10)),
          lastReviewed: new Date(),
        };
      }
      return w;
    }));

    setShowAnswer(true);
    toast({
      title: isCorrect ? '🎉 Correct!' : '❌ Not quite',
      description: isCorrect ? 'Great job!' : `The word was "${quizWord.word}"`,
    });
  };

  const filteredWords = words.filter(w => {
    const matchesSearch = w.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         w.definition.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'mastered') return matchesSearch && w.mastery >= 80;
    if (activeTab === 'learning') return matchesSearch && w.mastery < 80;
    return matchesSearch;
  });

  const averageMastery = words.length > 0 
    ? Math.round(words.reduce((sum, w) => sum + w.mastery, 0) / words.length)
    : 0;

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
          <BookA className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Vocabulary Builder</h1>
          <p className="text-muted-foreground">Learn and master new words</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold">{words.length}</p>
            <p className="text-sm text-muted-foreground">Total Words</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold text-green-500">
              {words.filter(w => w.mastery >= 80).length}
            </p>
            <p className="text-sm text-muted-foreground">Mastered</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center mb-2">
              <p className="text-3xl font-bold">{averageMastery}%</p>
              <p className="text-sm text-muted-foreground">Avg Mastery</p>
            </div>
            <Progress value={averageMastery} className="h-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Add Word & Quiz */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add Word
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <AIProviderSelector
                selectedProvider={provider}
                selectedModel={model}
                onProviderChange={setProvider}
                onModelChange={setModel}
                compact
              />
              
              <div className="flex gap-2">
                <Input
                  placeholder="Enter a new word..."
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addWord()}
                />
                <Button onClick={addWord} disabled={isAdding}>
                  {isAdding ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Quick Quiz
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!quizWord ? (
                <Button onClick={startQuiz} className="w-full" disabled={words.length === 0}>
                  <Trophy className="h-4 w-4 mr-2" />
                  Start Quiz
                </Button>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">What word matches this definition?</p>
                  <p className="font-medium">{quizWord.definition}</p>
                  
                  {!showAnswer ? (
                    <>
                      <Input
                        placeholder="Your answer..."
                        value={quizAnswer}
                        onChange={(e) => setQuizAnswer(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
                      />
                      <div className="flex gap-2">
                        <Button onClick={checkAnswer} className="flex-1">Check</Button>
                        <Button variant="outline" onClick={() => setShowAnswer(true)}>
                          Show Answer
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <p className="font-bold text-primary">{quizWord.word}</p>
                        <p className="text-sm italic mt-1">"{quizWord.example}"</p>
                      </div>
                      <Button onClick={startQuiz} className="w-full">Next Word</Button>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Word List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>My Vocabulary</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-[200px]"
                  />
                </div>
              </div>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
                <TabsList>
                  <TabsTrigger value="all">All ({words.length})</TabsTrigger>
                  <TabsTrigger value="learning">
                    Learning ({words.filter(w => w.mastery < 80).length})
                  </TabsTrigger>
                  <TabsTrigger value="mastered">
                    Mastered ({words.filter(w => w.mastery >= 80).length})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {filteredWords.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <BookA className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>No words yet</p>
                    <p className="text-sm">Add words to start building your vocabulary</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {filteredWords.map((word) => (
                        <motion.div
                          key={word.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, height: 0 }}
                          className="group p-4 bg-muted rounded-lg"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-lg">{word.word}</h3>
                                <Badge variant="outline" className="text-xs">
                                  {word.partOfSpeech}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => speak(word.word)}
                                >
                                  <Volume2 className="h-3 w-3" />
                                </Button>
                                {word.mastery >= 80 && (
                                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                )}
                              </div>
                              {word.pronunciation && (
                                <p className="text-sm text-muted-foreground">/{word.pronunciation}/</p>
                              )}
                              <p className="mt-1">{word.definition}</p>
                              <p className="text-sm italic text-muted-foreground mt-1">
                                "{word.example}"
                              </p>
                              {word.synonyms && word.synonyms.length > 0 && (
                                <div className="flex gap-1 mt-2 flex-wrap">
                                  {word.synonyms.map((syn, i) => (
                                    <Badge key={i} variant="secondary" className="text-xs">
                                      {syn}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              <Progress value={word.mastery} className="h-1 mt-3" />
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                              onClick={() => deleteWord(word.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
