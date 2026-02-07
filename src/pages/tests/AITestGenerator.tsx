import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ArrowLeft, Sparkles, Brain, Target, BookOpen, Clock,
  Zap, Loader2, Edit, Save, RefreshCw, Download, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import { useTests } from '@/hooks/useTests';
import { supabase } from '@/integrations/supabase/client';

const SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 
  'English', 'History', 'Geography', 'Computer Science'
];

const BOARDS = [
  'CBSE', 'ICSE', 'State Board', 'IB', 'Cambridge', 'Custom'
];

const EXAM_TYPES = [
  { value: 'school', label: 'School Exam' },
  { value: 'olympiad', label: 'Olympiad' },
  { value: 'competitive', label: 'Competitive (JEE/NEET)' },
  { value: 'practice', label: 'Practice Test' },
];

const BLOOMS_LEVELS = [
  { value: 'remember', label: 'Remember', color: 'bg-blue-500' },
  { value: 'understand', label: 'Understand', color: 'bg-green-500' },
  { value: 'apply', label: 'Apply', color: 'bg-yellow-500' },
  { value: 'analyze', label: 'Analyze', color: 'bg-orange-500' },
  { value: 'evaluate', label: 'Evaluate', color: 'bg-red-500' },
  { value: 'create', label: 'Create', color: 'bg-purple-500' },
];

interface GeneratedQuestion {
  id: string;
  question: string;
  type: string;
  options?: string[];
  answer: string;
  explanation: string;
  difficulty: string;
  bloomsLevel: string;
  marks: number;
}

export default function AITestGenerator() {
  const navigate = useNavigate();
  const { createTest } = useTests();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  
  const [config, setConfig] = useState({
    topic: '',
    subject: '',
    board: '',
    examType: 'school',
    grade: '',
    numQuestions: 10,
    duration: 30,
    difficultyDistribution: {
      easy: 30,
      medium: 50,
      hard: 20,
    },
    bloomsLevels: ['remember', 'understand', 'apply'],
    includeExplanations: true,
    includeMCQ: true,
    includeNumerical: false,
    includeShortAnswer: false,
  });

  const handleGenerate = async () => {
    if (!config.topic || !config.subject) {
      toast({ title: 'Please enter topic and subject', variant: 'destructive' });
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const mockQuestions: GeneratedQuestion[] = Array.from({ length: config.numQuestions }, (_, i) => ({
      id: crypto.randomUUID(),
      question: `Sample question ${i + 1} about ${config.topic} in ${config.subject}. This is a ${['easy', 'medium', 'hard'][i % 3]} level question testing ${BLOOMS_LEVELS[i % 6].label.toLowerCase()} skills.`,
      type: 'mcq',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      answer: 'A',
      explanation: `This is the explanation for question ${i + 1}. The correct answer is A because...`,
      difficulty: ['easy', 'medium', 'hard'][i % 3],
      bloomsLevel: BLOOMS_LEVELS[i % 6].value,
      marks: 4,
    }));

    setGeneratedQuestions(mockQuestions);
    setIsGenerating(false);
    toast({ title: `Generated ${config.numQuestions} questions!` });
  };

  const handleSaveTest = async (publish = true) => {
    if (generatedQuestions.length === 0) {
      toast({ title: 'No questions to save', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      // Create the test
      const createdTest = await createTest({
        title: `${config.topic} - ${config.subject} Test`,
        subject: config.subject,
        description: `Board: ${config.board}, Exam Type: ${config.examType}, Grade: ${config.grade}`,
        duration_minutes: config.duration,
        total_marks: generatedQuestions.reduce((acc, q) => acc + q.marks, 0),
        difficulty: Object.entries(config.difficultyDistribution).sort((a, b) => b[1] - a[1])[0][0],
        status: publish ? 'published' : 'draft',
        shuffle_questions: false,
        show_result_immediately: true,
        published_at: publish ? new Date().toISOString() : null,
      });

      if (!createdTest) {
        throw new Error('Failed to create test');
      }

      // Add questions to the test
      const questionsToInsert = generatedQuestions.map((q, index) => ({
        test_id: createdTest.id,
        question_text: q.question,
        question_type: q.type,
        options: q.options,
        correct_answer: q.answer,
        marks: q.marks,
        order_index: index + 1,
        explanation: q.explanation,
      }));

      const { error: questionsError } = await supabase
        .from('test_questions')
        .insert(questionsToInsert);

      if (questionsError) {
        console.error('Error adding questions:', questionsError);
        toast({ title: 'Test created but questions failed to save', variant: 'destructive' });
      }

      toast({ title: publish ? 'Test published successfully!' : 'Test saved as draft!' });
      navigate(`/niranx/tests/${createdTest.id}`);
    } catch (error: any) {
      console.error('Error saving test:', error);
      toast({ title: 'Error saving test', description: error.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const updateDifficulty = (level: 'easy' | 'medium' | 'hard', value: number) => {
    const remaining = 100 - value;
    const others = Object.keys(config.difficultyDistribution).filter(k => k !== level) as ('easy' | 'medium' | 'hard')[];
    const perOther = Math.floor(remaining / 2);
    
    setConfig({
      ...config,
      difficultyDistribution: {
        ...config.difficultyDistribution,
        [level]: value,
        [others[0]]: perOther,
        [others[1]]: remaining - perOther,
      },
    });
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate('/niranx/tests')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-500" />
            AI Test Generator
          </h1>
          <p className="text-muted-foreground">Generate tests instantly using AI</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5" />
                Test Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Topic *</Label>
                <Input
                  placeholder="e.g., Quadratic Equations"
                  value={config.topic}
                  onChange={(e) => setConfig({ ...config, topic: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Subject *</Label>
                <Select value={config.subject} onValueChange={(v) => setConfig({ ...config, subject: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Board/Curriculum</Label>
                <Select value={config.board} onValueChange={(v) => setConfig({ ...config, board: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select board" />
                  </SelectTrigger>
                  <SelectContent>
                    {BOARDS.map(b => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Exam Type</Label>
                <Select value={config.examType} onValueChange={(v) => setConfig({ ...config, examType: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXAM_TYPES.map(e => (
                      <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Questions</Label>
                  <Input
                    type="number"
                    value={config.numQuestions}
                    onChange={(e) => setConfig({ ...config, numQuestions: parseInt(e.target.value) || 10 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duration (min)</Label>
                  <Input
                    type="number"
                    value={config.duration}
                    onChange={(e) => setConfig({ ...config, duration: parseInt(e.target.value) || 30 })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Difficulty Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(['easy', 'medium', 'hard'] as const).map((level) => (
                <div key={level} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="capitalize">{level}</Label>
                    <span className="text-sm font-medium">{config.difficultyDistribution[level]}%</span>
                  </div>
                  <Slider
                    value={[config.difficultyDistribution[level]]}
                    onValueChange={([v]) => updateDifficulty(level, v)}
                    max={100}
                    step={5}
                    className={`${level === 'easy' ? '[&_[role=slider]]:bg-green-500' : level === 'medium' ? '[&_[role=slider]]:bg-yellow-500' : '[&_[role=slider]]:bg-red-500'}`}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Bloom's Taxonomy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {BLOOMS_LEVELS.map((level) => (
                  <div key={level.value} className="flex items-center gap-2">
                    <Checkbox
                      id={level.value}
                      checked={config.bloomsLevels.includes(level.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setConfig({ ...config, bloomsLevels: [...config.bloomsLevels, level.value] });
                        } else {
                          setConfig({ ...config, bloomsLevels: config.bloomsLevels.filter(l => l !== level.value) });
                        }
                      }}
                    />
                    <Label htmlFor={level.value} className="text-sm cursor-pointer">
                      {level.label}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button 
            className="w-full gap-2 h-12" 
            size="lg"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Generate Test
              </>
            )}
          </Button>
        </div>

        {/* Generated Questions */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Generated Questions
                </CardTitle>
                {generatedQuestions.length > 0 && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleGenerate} disabled={isGenerating}>
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Regenerate
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleSaveTest(false)} disabled={isSaving}>
                      {isSaving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                      Save Draft
                    </Button>
                    <Button size="sm" onClick={() => handleSaveTest(true)} disabled={isSaving}>
                      {isSaving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                      Publish
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="relative">
                    <div className="h-24 w-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <Sparkles className="h-8 w-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <p className="mt-6 text-lg font-medium">AI is generating your test...</p>
                  <p className="text-muted-foreground">This may take a few moments</p>
                </div>
              ) : generatedQuestions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Brain className="h-16 w-16 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold">No Questions Generated</h3>
                  <p className="text-muted-foreground max-w-md mt-2">
                    Configure your test parameters and click "Generate Test" to create AI-powered questions
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                  <AnimatePresence>
                    {generatedQuestions.map((q, index) => (
                      <motion.div
                        key={q.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <Badge variant="secondary" className="mt-1">Q{index + 1}</Badge>
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between gap-4">
                              {editingQuestion === q.id ? (
                                <Textarea
                                  defaultValue={q.question}
                                  className="flex-1"
                                  rows={2}
                                />
                              ) : (
                                <p className="text-sm">{q.question}</p>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setEditingQuestion(editingQuestion === q.id ? null : q.id)}
                              >
                                {editingQuestion === q.id ? <Check className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                              </Button>
                            </div>

                            {q.options && (
                              <div className="grid grid-cols-2 gap-2">
                                {q.options.map((opt, i) => (
                                  <div
                                    key={i}
                                    className={`p-2 rounded text-sm ${
                                      String.fromCharCode(65 + i) === q.answer
                                        ? 'bg-green-500/10 border border-green-500/30 text-green-600'
                                        : 'bg-muted'
                                    }`}
                                  >
                                    <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
                                    {opt}
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className={
                                q.difficulty === 'easy' ? 'bg-green-500/10 text-green-600' :
                                q.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-600' :
                                'bg-red-500/10 text-red-600'
                              }>
                                {q.difficulty}
                              </Badge>
                              <Badge variant="outline">{q.marks} marks</Badge>
                              <Badge variant="outline" className="bg-purple-500/10 text-purple-600">
                                {q.bloomsLevel}
                              </Badge>
                            </div>

                            {config.includeExplanations && (
                              <details className="text-sm">
                                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                  View Explanation
                                </summary>
                                <p className="mt-2 p-3 bg-muted rounded-lg">{q.explanation}</p>
                              </details>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
