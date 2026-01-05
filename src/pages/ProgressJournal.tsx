import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { BookOpen, Plus, Calendar as CalendarIcon, Smile, Meh, Frown, TrendingUp, Target, Sparkles, Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AIProviderSelector, useAIProvider } from '@/components/ai/AIProviderSelector';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface JournalEntry {
  id: string;
  date: string;
  mood: 'great' | 'good' | 'okay' | 'struggling';
  accomplishments: string[];
  challenges: string[];
  reflection: string;
  goals: string[];
  studyHours?: number;
  subjects?: string[];
}

const MOODS = [
  { id: 'great', label: 'Great', icon: Smile, color: 'text-green-500' },
  { id: 'good', label: 'Good', icon: Smile, color: 'text-blue-500' },
  { id: 'okay', label: 'Okay', icon: Meh, color: 'text-yellow-500' },
  { id: 'struggling', label: 'Struggling', icon: Frown, color: 'text-red-500' },
];

export default function ProgressJournal() {
  const { toast } = useToast();
  const { provider, model, setProvider, setModel } = useAIProvider('progress-journal');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isEditing, setIsEditing] = useState(false);
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
  const [insight, setInsight] = useState('');
  
  // Form state
  const [mood, setMood] = useState<'great' | 'good' | 'okay' | 'struggling'>('good');
  const [accomplishment, setAccomplishment] = useState('');
  const [accomplishments, setAccomplishments] = useState<string[]>([]);
  const [challenge, setChallenge] = useState('');
  const [challenges, setChallenges] = useState<string[]>([]);
  const [reflection, setReflection] = useState('');
  const [goal, setGoal] = useState('');
  const [goals, setGoals] = useState<string[]>([]);
  const [studyHours, setStudyHours] = useState('');

  // Load entries from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('progress-journal');
    if (saved) {
      setEntries(JSON.parse(saved));
    }
  }, []);

  // Save entries to localStorage
  useEffect(() => {
    localStorage.setItem('progress-journal', JSON.stringify(entries));
  }, [entries]);

  // Load entry for selected date
  useEffect(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const existing = entries.find(e => e.date === dateStr);
    if (existing) {
      setMood(existing.mood);
      setAccomplishments(existing.accomplishments);
      setChallenges(existing.challenges);
      setReflection(existing.reflection);
      setGoals(existing.goals);
      setStudyHours(existing.studyHours?.toString() || '');
      setIsEditing(true);
    } else {
      resetForm();
      setIsEditing(false);
    }
  }, [selectedDate, entries]);

  const resetForm = () => {
    setMood('good');
    setAccomplishments([]);
    setChallenges([]);
    setReflection('');
    setGoals([]);
    setStudyHours('');
  };

  const addItem = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
    list: string[],
    listSetter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (value.trim()) {
      listSetter([...list, value.trim()]);
      setter('');
    }
  };

  const removeItem = (index: number, list: string[], listSetter: React.Dispatch<React.SetStateAction<string[]>>) => {
    listSetter(list.filter((_, i) => i !== index));
  };

  const saveEntry = () => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const entry: JournalEntry = {
      id: dateStr,
      date: dateStr,
      mood,
      accomplishments,
      challenges,
      reflection,
      goals,
      studyHours: studyHours ? parseFloat(studyHours) : undefined,
    };

    const existingIndex = entries.findIndex(e => e.date === dateStr);
    if (existingIndex >= 0) {
      const updated = [...entries];
      updated[existingIndex] = entry;
      setEntries(updated);
    } else {
      setEntries([entry, ...entries]);
    }

    setIsEditing(true);
    toast({ title: 'Entry saved!', description: format(selectedDate, 'MMMM d, yyyy') });
  };

  const generateInsight = async () => {
    if (entries.length < 3) {
      toast({ title: 'Need more entries', description: 'Add at least 3 journal entries for insights', variant: 'destructive' });
      return;
    }

    setIsGeneratingInsight(true);
    try {
      const recentEntries = entries.slice(0, 7);
      const prompt = `Analyze these learning journal entries and provide personalized insights and recommendations:

${recentEntries.map(e => `
Date: ${e.date}
Mood: ${e.mood}
Accomplishments: ${e.accomplishments.join(', ')}
Challenges: ${e.challenges.join(', ')}
Study Hours: ${e.studyHours || 'N/A'}
`).join('\n---\n')}

Provide:
1. Patterns you notice (mood, productivity, challenges)
2. Strengths to build on
3. Areas for improvement
4. Specific actionable recommendations
5. Motivational message

Be encouraging but honest.`;

      let functionName = 'ai-chat';
      if (provider === 'openrouter') functionName = 'openrouter-chat';

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: {
          messages: [{ role: 'user', content: prompt }],
          model: model,
        },
      });

      if (error) throw error;
      setInsight(data?.choices?.[0]?.message?.content || data?.content || '');
    } catch (error) {
      console.error('Insight error:', error);
      toast({ title: 'Failed to generate insight', variant: 'destructive' });
    } finally {
      setIsGeneratingInsight(false);
    }
  };

  const getMoodIcon = (moodId: string) => {
    const moodData = MOODS.find(m => m.id === moodId);
    if (!moodData) return null;
    const Icon = moodData.icon;
    return <Icon className={`h-5 w-5 ${moodData.color}`} />;
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500">
          <BookOpen className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Progress Journal</h1>
          <p className="text-muted-foreground">Track your learning journey</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar & Stats */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md"
                modifiers={{
                  hasEntry: entries.map(e => new Date(e.date)),
                }}
                modifiersStyles={{
                  hasEntry: { backgroundColor: 'hsl(var(--primary) / 0.2)' },
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Entries</span>
                <span className="font-bold">{entries.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Study Hours</span>
                <span className="font-bold">
                  {entries.reduce((sum, e) => sum + (e.studyHours || 0), 0).toFixed(1)}h
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Goals Completed</span>
                <span className="font-bold">
                  {entries.reduce((sum, e) => sum + e.accomplishments.length, 0)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AIProviderSelector
                selectedProvider={provider}
                selectedModel={model}
                onProviderChange={setProvider}
                onModelChange={setModel}
                compact
              />
              <Button 
                onClick={generateInsight} 
                disabled={isGeneratingInsight || entries.length < 3}
                className="w-full mt-3"
              >
                {isGeneratingInsight ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Get Insights
                  </>
                )}
              </Button>
              {insight && (
                <div className="mt-3 p-3 bg-muted rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm font-sans">{insight}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Journal Entry Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </CardTitle>
                {isEditing && <Badge variant="outline">Editing</Badge>}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Mood */}
              <div className="space-y-2">
                <Label>How are you feeling today?</Label>
                <div className="flex gap-2">
                  {MOODS.map((m) => (
                    <Button
                      key={m.id}
                      variant={mood === m.id ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setMood(m.id as any)}
                    >
                      <m.icon className={`h-4 w-4 mr-2 ${m.color}`} />
                      {m.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Study Hours */}
              <div className="space-y-2">
                <Label>Study Hours Today</Label>
                <Input
                  type="number"
                  placeholder="e.g., 3.5"
                  value={studyHours}
                  onChange={(e) => setStudyHours(e.target.value)}
                  min="0"
                  step="0.5"
                />
              </div>

              {/* Accomplishments */}
              <div className="space-y-2">
                <Label>What did you accomplish?</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add an accomplishment..."
                    value={accomplishment}
                    onChange={(e) => setAccomplishment(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addItem(accomplishment, setAccomplishment, accomplishments, setAccomplishments)}
                  />
                  <Button variant="outline" onClick={() => addItem(accomplishment, setAccomplishment, accomplishments, setAccomplishments)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {accomplishments.map((item, i) => (
                    <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => removeItem(i, accomplishments, setAccomplishments)}>
                      ✓ {item} ×
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Challenges */}
              <div className="space-y-2">
                <Label>What challenges did you face?</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a challenge..."
                    value={challenge}
                    onChange={(e) => setChallenge(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addItem(challenge, setChallenge, challenges, setChallenges)}
                  />
                  <Button variant="outline" onClick={() => addItem(challenge, setChallenge, challenges, setChallenges)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {challenges.map((item, i) => (
                    <Badge key={i} variant="outline" className="cursor-pointer text-orange-500" onClick={() => removeItem(i, challenges, setChallenges)}>
                      ⚡ {item} ×
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Goals for Tomorrow */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Goals for Tomorrow
                </Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a goal..."
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addItem(goal, setGoal, goals, setGoals)}
                  />
                  <Button variant="outline" onClick={() => addItem(goal, setGoal, goals, setGoals)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {goals.map((item, i) => (
                    <Badge key={i} className="cursor-pointer bg-primary/20" onClick={() => removeItem(i, goals, setGoals)}>
                      🎯 {item} ×
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Reflection */}
              <div className="space-y-2">
                <Label>Daily Reflection</Label>
                <Textarea
                  placeholder="Write your thoughts, learnings, or anything on your mind..."
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  rows={4}
                />
              </div>

              <Button onClick={saveEntry} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Entry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
