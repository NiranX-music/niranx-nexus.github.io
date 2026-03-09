import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Copy, Sparkles, BookOpen, Code, Pen, Brain, Zap, MessageCircle, Target } from 'lucide-react';
import { toast } from 'sonner';

const templates = [
  { title: 'Explain Like I\'m 5', prompt: 'Explain {topic} in the simplest way possible, as if I were 5 years old. Use fun analogies and examples.', category: 'Learning', icon: BookOpen },
  { title: 'Code Review', prompt: 'Review this code for bugs, performance issues, and best practices:\n\n{code}', category: 'Coding', icon: Code },
  { title: 'Essay Outline', prompt: 'Create a detailed essay outline for the topic: "{topic}". Include thesis statement, 3-5 main arguments with supporting evidence, and a conclusion.', category: 'Writing', icon: Pen },
  { title: 'Study Summary', prompt: 'Summarize the following topic into concise study notes with key points, definitions, and important facts:\n\nTopic: {topic}', category: 'Study', icon: Brain },
  { title: 'Debug Helper', prompt: 'I\'m getting this error: {error}\n\nHere\'s my code: {code}\n\nExplain what\'s wrong and how to fix it step by step.', category: 'Coding', icon: Zap },
  { title: 'Flashcard Generator', prompt: 'Generate 10 flashcards (question and answer format) for studying: {topic}. Make them challenging but clear.', category: 'Study', icon: Brain },
  { title: 'Creative Story', prompt: 'Write a short creative story about {topic}. Include vivid descriptions, dialogue, and an unexpected twist.', category: 'Writing', icon: Sparkles },
  { title: 'Interview Prep', prompt: 'Give me 10 common interview questions for a {role} position with model answers and tips for each.', category: 'Career', icon: Target },
  { title: 'Debate Arguments', prompt: 'Give me strong arguments for BOTH sides of this debate topic: "{topic}". Include evidence and counterarguments.', category: 'Learning', icon: MessageCircle },
  { title: 'Math Problem Solver', prompt: 'Solve this math problem step by step, explaining each step clearly:\n\n{problem}', category: 'Study', icon: Brain },
  { title: 'Code Generator', prompt: 'Write clean, well-commented {language} code that: {description}. Include error handling and edge cases.', category: 'Coding', icon: Code },
  { title: 'Lesson Plan', prompt: 'Create a comprehensive lesson plan for teaching {topic} to {audience}. Include objectives, activities, assessments, and timing.', category: 'Teaching', icon: BookOpen },
];

const categories = ['All', ...Array.from(new Set(templates.map(t => t.category)))];

export default function PromptTemplates() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = templates.filter(t =>
    (activeCategory === 'All' || t.category === activeCategory) &&
    (t.title.toLowerCase().includes(search.toLowerCase()) || t.prompt.toLowerCase().includes(search.toLowerCase()))
  );

  const copyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast.success('Prompt copied to clipboard!');
  };

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-5xl">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <Sparkles className="w-10 h-10 text-primary" />
          <h1 className="text-3xl font-bold font-[Orbitron]">Prompt Templates</h1>
        </div>
        <p className="text-muted-foreground">Pre-built prompts for common AI tasks — copy, customize, and use</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search templates..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(c => (
            <Button key={c} variant={activeCategory === c ? 'default' : 'outline'} size="sm" onClick={() => setActiveCategory(c)}>
              {c}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((t, i) => {
          const Icon = t.icon;
          return (
            <Card key={i} className="border-primary/20 bg-card/60 backdrop-blur-sm hover:border-primary/40 transition-all group">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Icon className="w-5 h-5 text-primary" />
                    {t.title}
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">{t.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground font-mono bg-background/50 p-3 rounded-lg border border-border/50 line-clamp-3">
                  {t.prompt}
                </p>
                <Button size="sm" variant="outline" onClick={() => copyPrompt(t.prompt)} className="w-full opacity-80 group-hover:opacity-100 transition-opacity">
                  <Copy className="w-3 h-3 mr-2" />Copy Prompt
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
