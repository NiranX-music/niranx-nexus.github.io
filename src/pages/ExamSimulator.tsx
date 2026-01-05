import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Clock, Play, CheckCircle2, XCircle, RotateCcw, Trophy, TrendingUp, Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AIProviderSelector, useAIProvider } from '@/components/ai/AIProviderSelector';
import { motion, AnimatePresence } from 'framer-motion';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface ExamResult {
  id: string;
  date: string;
  subject: string;
  score: number;
  totalQuestions: number;
  timeSpent: number;
  percentage: number;
}

export default function ExamSimulator() {
  const { toast } = useToast();
  const { provider, model, setProvider, setModel } = useAIProvider('exam-simulator');
  const [subject, setSubject] = useState('');
  const [questionCount, setQuestionCount] = useState('10');
  const [difficulty, setDifficulty] = useState('medium');
  const [timeLimit, setTimeLimit] = useState('30');
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [isExamActive, setIsExamActive] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [results, setResults] = useState<ExamResult[]>([]);

  // Load results from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('exam-results');
    if (saved) {
      setResults(JSON.parse(saved));
    }
  }, []);

  // Save results to localStorage
  useEffect(() => {
    localStorage.setItem('exam-results', JSON.stringify(results));
  }, [results]);

  // Timer
  useEffect(() => {
    if (!isExamActive || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          submitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isExamActive, timeRemaining]);

  const generateExam = async () => {
    if (!subject.trim()) {
      toast({ title: 'Please enter a subject', variant: 'destructive' });
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `Generate ${questionCount} multiple choice exam questions about "${subject}".
Difficulty: ${difficulty}

Return JSON array:
[
  {
    "question": "Question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0
  }
]

Make questions appropriate for the difficulty level. Vary question types (factual, conceptual, application).`;

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

      const generatedQuestions: Question[] = JSON.parse(jsonMatch[0]).map((q: any, i: number) => ({
        id: i,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
      }));

      setQuestions(generatedQuestions);
      setAnswers(new Array(generatedQuestions.length).fill(null));
      setCurrentIndex(0);
      setTimeRemaining(parseInt(timeLimit) * 60);
      setStartTime(Date.now());
      setIsExamActive(true);
      setShowResults(false);

      toast({ title: 'Exam ready!', description: `${generatedQuestions.length} questions, ${timeLimit} minutes` });
    } catch (error) {
      console.error('Generation error:', error);
      toast({ title: 'Failed to generate exam', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const selectAnswer = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  const submitExam = () => {
    setIsExamActive(false);
    setShowResults(true);

    const score = questions.reduce((sum, q, i) => {
      return sum + (answers[i] === q.correctAnswer ? 1 : 0);
    }, 0);

    const timeSpent = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;

    const result: ExamResult = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      subject,
      score,
      totalQuestions: questions.length,
      timeSpent,
      percentage: Math.round((score / questions.length) * 100),
    };

    setResults([result, ...results.slice(0, 19)]);
    toast({ 
      title: 'Exam complete!', 
      description: `You scored ${score}/${questions.length} (${result.percentage}%)` 
    });
  };

  const resetExam = () => {
    setQuestions([]);
    setAnswers([]);
    setCurrentIndex(0);
    setIsExamActive(false);
    setShowResults(false);
    setTimeRemaining(0);
    setStartTime(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScore = () => {
    return questions.reduce((sum, q, i) => {
      return sum + (answers[i] === q.correctAnswer ? 1 : 0);
    }, 0);
  };

  const getAverageScore = () => {
    if (results.length === 0) return 0;
    return Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length);
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-pink-500">
          <FileText className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Exam Simulator</h1>
          <p className="text-muted-foreground">Practice exams with AI-generated questions</p>
        </div>
      </div>

      {!isExamActive && !showResults ? (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Setup */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Create Practice Exam
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
                  <Label>Subject / Topic</Label>
                  <Input
                    placeholder="e.g., World History, Organic Chemistry, JavaScript..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Questions</Label>
                    <Select value={questionCount} onValueChange={setQuestionCount}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[5, 10, 15, 20, 25, 30].map(n => (
                          <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Difficulty</Label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
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

                  <div className="space-y-2">
                    <Label>Time (min)</Label>
                    <Select value={timeLimit} onValueChange={setTimeLimit}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[10, 15, 20, 30, 45, 60].map(n => (
                          <SelectItem key={n} value={n.toString()}>{n} min</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={generateExam} disabled={isGenerating} className="w-full">
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Exam...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Start Exam
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Your Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-4xl font-bold">{getAverageScore()}%</p>
                <p className="text-sm text-muted-foreground">Average Score</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{results.length}</p>
                <p className="text-sm text-muted-foreground">Exams Taken</p>
              </div>

              {results.length > 0 && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-2">Recent Exams</p>
                  <ScrollArea className="h-[200px]">
                    {results.slice(0, 10).map((r) => (
                      <div key={r.id} className="flex justify-between items-center p-2 hover:bg-muted rounded">
                        <div>
                          <p className="text-sm font-medium">{r.subject}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(r.date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={r.percentage >= 70 ? 'default' : 'destructive'}>
                          {r.percentage}%
                        </Badge>
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : showResults ? (
        /* Results View */
        <div className="space-y-6">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Trophy className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
              <p className="text-4xl font-bold mb-2">
                {getScore()}/{questions.length}
              </p>
              <p className="text-xl text-muted-foreground mb-4">
                {Math.round((getScore() / questions.length) * 100)}%
              </p>
              <Button onClick={resetExam}>
                <RotateCcw className="h-4 w-4 mr-2" />
                New Exam
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {questions.map((q, i) => {
              const isCorrect = answers[i] === q.correctAnswer;
              return (
                <Card key={q.id} className={isCorrect ? 'border-green-500' : 'border-red-500'}>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-2 mb-3">
                      {isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                      )}
                      <p className="font-medium">{q.question}</p>
                    </div>
                    <div className="grid gap-2 ml-7">
                      {q.options.map((opt, oi) => (
                        <div
                          key={oi}
                          className={`p-2 rounded-lg text-sm ${
                            oi === q.correctAnswer
                              ? 'bg-green-500/20 text-green-700 dark:text-green-300'
                              : answers[i] === oi
                              ? 'bg-red-500/20 text-red-700 dark:text-red-300'
                              : 'bg-muted'
                          }`}
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        /* Exam View */
        <div className="space-y-4">
          {/* Timer & Progress */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="outline">
                  Question {currentIndex + 1} of {questions.length}
                </Badge>
                <div className={`flex items-center gap-2 font-mono text-lg ${timeRemaining < 60 ? 'text-red-500' : ''}`}>
                  <Clock className="h-4 w-4" />
                  {formatTime(timeRemaining)}
                </div>
              </div>
              <Progress value={((currentIndex + 1) / questions.length) * 100} className="h-2" />
            </CardContent>
          </Card>

          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">{questions[currentIndex]?.question}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <RadioGroup
                    value={answers[currentIndex]?.toString()}
                    onValueChange={(v) => selectAnswer(parseInt(v))}
                  >
                    {questions[currentIndex]?.options.map((option, i) => (
                      <div
                        key={i}
                        className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                          answers[currentIndex] === i
                            ? 'border-primary bg-primary/10'
                            : 'border-muted hover:border-muted-foreground/50'
                        }`}
                        onClick={() => selectAnswer(i)}
                      >
                        <RadioGroupItem value={i.toString()} id={`option-${i}`} />
                        <Label htmlFor={`option-${i}`} className="flex-1 cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>

                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
                      disabled={currentIndex === 0}
                    >
                      Previous
                    </Button>
                    {currentIndex < questions.length - 1 ? (
                      <Button
                        onClick={() => setCurrentIndex(i => i + 1)}
                        className="flex-1"
                      >
                        Next
                      </Button>
                    ) : (
                      <Button
                        onClick={submitExam}
                        className="flex-1"
                      >
                        Submit Exam
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Question Navigator */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-wrap gap-2">
                {questions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                      i === currentIndex
                        ? 'bg-primary text-primary-foreground'
                        : answers[i] !== null
                        ? 'bg-green-500/20 text-green-700 dark:text-green-300'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
