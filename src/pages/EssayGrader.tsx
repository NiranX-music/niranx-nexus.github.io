import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileEdit, Loader2, CheckCircle, AlertCircle, Lightbulb, BookOpen, Plus, Trash2, RefreshCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AIProviderSelector, useAIProvider } from '@/components/ai/AIProviderSelector';

interface CriteriaScore {
  name: string;
  score: number;
  maxScore: number;
  feedback: string;
}

interface GrammarIssue {
  issue: string;
  suggestion: string;
  type: 'grammar' | 'spelling' | 'punctuation' | 'style';
}

interface GradingResult {
  score: number;
  maxScore: number;
  percentage: number;
  letterGrade: string;
  wordCount: number;
  criteriaScores: CriteriaScore[];
  overallFeedback: string;
  strengths: string[];
  improvements: string[];
  grammarIssues: GrammarIssue[];
  nextSteps: string[];
}

interface RubricCriterion {
  name: string;
  description: string;
  maxPoints: number;
}

const DEFAULT_RUBRIC: RubricCriterion[] = [
  { name: 'Thesis & Argument', description: 'Clear thesis, strong argument, logical reasoning', maxPoints: 25 },
  { name: 'Evidence & Support', description: 'Relevant evidence, proper citations, examples', maxPoints: 25 },
  { name: 'Organization', description: 'Clear structure, smooth transitions, coherent flow', maxPoints: 20 },
  { name: 'Language & Style', description: 'Grammar, vocabulary, sentence variety', maxPoints: 15 },
  { name: 'Originality & Insight', description: 'Creative thinking, unique perspectives', maxPoints: 15 },
];

export default function EssayGrader() {
  const [title, setTitle] = useState('');
  const [essay, setEssay] = useState('');
  const [isGrading, setIsGrading] = useState(false);
  const [result, setResult] = useState<GradingResult | null>(null);
  const [rubric, setRubric] = useState<RubricCriterion[]>(DEFAULT_RUBRIC);
  const [isRubricDialogOpen, setIsRubricDialogOpen] = useState(false);
  const { provider, model, setProvider, setModel } = useAIProvider('essay-grader');

  const wordCount = essay.split(/\s+/).filter(w => w.length > 0).length;

  const gradeEssay = async () => {
    if (!essay.trim()) {
      toast.error('Please enter your essay');
      return;
    }

    if (wordCount < 50) {
      toast.error('Essay should be at least 50 words');
      return;
    }

    setIsGrading(true);

    try {
      const { data, error } = await supabase.functions.invoke('grade-essay', {
        body: {
          essay,
          title,
          rubric: { criteria: rubric, maxScore: rubric.reduce((sum, c) => sum + c.maxPoints, 0) },
          provider,
          model,
        },
      });

      if (error) throw error;

      setResult(data);

      // Save to database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('essay_submissions').insert({
          user_id: user.id,
          title: title || 'Untitled Essay',
          content: essay,
          word_count: wordCount,
          ai_grade: data,
          feedback: data.overallFeedback,
          strengths: data.strengths,
          improvements: data.improvements,
          score: data.percentage,
          ai_provider: provider,
        });
      }

      toast.success('Essay graded successfully!');
    } catch (error: any) {
      console.error('Grading error:', error);
      if (error.message?.includes('429') || error.message?.includes('Rate limit')) {
        toast.error('Rate limit exceeded. Please wait a moment and try again.');
      } else if (error.message?.includes('402') || error.message?.includes('Payment')) {
        toast.error('Credits exhausted. Please add credits to continue.');
      } else {
        toast.error(error.message || 'Failed to grade essay');
      }
    } finally {
      setIsGrading(false);
    }
  };

  const resetGrader = () => {
    setTitle('');
    setEssay('');
    setResult(null);
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-500';
    if (grade.startsWith('B')) return 'text-blue-500';
    if (grade.startsWith('C')) return 'text-yellow-500';
    if (grade.startsWith('D')) return 'text-orange-500';
    return 'text-red-500';
  };

  const addCriterion = () => {
    setRubric([...rubric, { name: '', description: '', maxPoints: 10 }]);
  };

  const removeCriterion = (index: number) => {
    setRubric(rubric.filter((_, i) => i !== index));
  };

  const updateCriterion = (index: number, field: keyof RubricCriterion, value: string | number) => {
    const updated = [...rubric];
    updated[index] = { ...updated[index], [field]: value };
    setRubric(updated);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
              <FileEdit className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">AI Essay Grader</h1>
              <p className="text-muted-foreground text-sm">Get detailed feedback and grading on your essays</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Dialog open={isRubricDialogOpen} onOpenChange={setIsRubricDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Edit Rubric
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Grading Rubric</DialogTitle>
                  <DialogDescription>Customize the grading criteria for your essay</DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh]">
                  <div className="space-y-4 p-1">
                    {rubric.map((criterion, idx) => (
                      <div key={idx} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <Input
                            value={criterion.name}
                            onChange={e => updateCriterion(idx, 'name', e.target.value)}
                            placeholder="Criterion name"
                            className="flex-1 mr-2"
                          />
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={criterion.maxPoints}
                              onChange={e => updateCriterion(idx, 'maxPoints', parseInt(e.target.value) || 0)}
                              className="w-20"
                              min={1}
                            />
                            <span className="text-sm text-muted-foreground">pts</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeCriterion(idx)}
                              disabled={rubric.length <= 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <Input
                          value={criterion.description}
                          onChange={e => updateCriterion(idx, 'description', e.target.value)}
                          placeholder="Description"
                        />
                      </div>
                    ))}
                    <Button variant="outline" onClick={addCriterion} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Criterion
                    </Button>
                  </div>
                </ScrollArea>
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-sm text-muted-foreground">
                    Total: {rubric.reduce((sum, c) => sum + c.maxPoints, 0)} points
                  </span>
                  <Button onClick={() => setIsRubricDialogOpen(false)}>Save Rubric</Button>
                </div>
              </DialogContent>
            </Dialog>

            {result && (
              <Button variant="outline" onClick={resetGrader}>
                <RefreshCw className="h-4 w-4 mr-2" />
                New Essay
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Essay Input */}
          <Card className="lg:row-span-2">
            <CardHeader>
              <CardTitle>Your Essay</CardTitle>
              <CardDescription>Paste or type your essay below</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title (optional)</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Enter essay title"
                  disabled={isGrading || !!result}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="essay">Essay Content</Label>
                  <span className="text-sm text-muted-foreground">{wordCount} words</span>
                </div>
                <Textarea
                  id="essay"
                  value={essay}
                  onChange={e => setEssay(e.target.value)}
                  placeholder="Paste your essay here..."
                  className="min-h-[400px] resize-none"
                  disabled={isGrading || !!result}
                />
              </div>

              <div className="space-y-2">
                <Label>AI Provider</Label>
                <AIProviderSelector
                  selectedProvider={provider}
                  selectedModel={model}
                  onProviderChange={setProvider}
                  onModelChange={setModel}
                />
              </div>

              <Button
                onClick={gradeEssay}
                disabled={isGrading || !essay.trim() || !!result}
                className="w-full"
              >
                {isGrading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Grading Essay...
                  </>
                ) : (
                  <>
                    <FileEdit className="h-4 w-4 mr-2" />
                    Grade Essay
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Score Card */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-4xl font-bold">{result.score}/{result.maxScore}</h3>
                        <p className="text-muted-foreground">Overall Score</p>
                      </div>
                      <div className="text-right">
                        <h3 className={`text-4xl font-bold ${getGradeColor(result.letterGrade)}`}>
                          {result.letterGrade}
                        </h3>
                        <p className="text-muted-foreground">{result.percentage}%</p>
                      </div>
                    </div>
                    <Progress value={result.percentage} className="h-3" />
                  </CardContent>
                </Card>

                {/* Tabs for detailed feedback */}
                <Card>
                  <Tabs defaultValue="criteria" className="w-full">
                    <CardHeader className="pb-0">
                      <TabsList className="w-full">
                        <TabsTrigger value="criteria" className="flex-1">Criteria</TabsTrigger>
                        <TabsTrigger value="feedback" className="flex-1">Feedback</TabsTrigger>
                        <TabsTrigger value="grammar" className="flex-1">Grammar</TabsTrigger>
                      </TabsList>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <TabsContent value="criteria" className="space-y-4 mt-0">
                        {result.criteriaScores.map((criterion, idx) => (
                          <div key={idx} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{criterion.name}</span>
                              <Badge variant={criterion.score >= criterion.maxScore * 0.8 ? 'default' : 'secondary'}>
                                {criterion.score}/{criterion.maxScore}
                              </Badge>
                            </div>
                            <Progress value={(criterion.score / criterion.maxScore) * 100} className="h-2" />
                            <p className="text-sm text-muted-foreground">{criterion.feedback}</p>
                          </div>
                        ))}
                      </TabsContent>

                      <TabsContent value="feedback" className="space-y-4 mt-0">
                        <div>
                          <h4 className="font-medium mb-2">Overall Feedback</h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {result.overallFeedback}
                          </p>
                        </div>

                        <Separator />

                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            Strengths
                          </h4>
                          <ul className="space-y-1">
                            {result.strengths.map((s, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-green-500">•</span>
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                            Areas for Improvement
                          </h4>
                          <ul className="space-y-1">
                            {result.improvements.map((i, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-yellow-500">•</span>
                                {i}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-blue-500" />
                            Next Steps
                          </h4>
                          <ul className="space-y-1">
                            {result.nextSteps.map((s, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-blue-500">{idx + 1}.</span>
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </TabsContent>

                      <TabsContent value="grammar" className="mt-0">
                        {result.grammarIssues?.length > 0 ? (
                          <ScrollArea className="h-[300px]">
                            <div className="space-y-3">
                              {result.grammarIssues.map((issue, idx) => (
                                <div key={idx} className="p-3 bg-muted rounded-lg">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline" className="capitalize text-xs">
                                      {issue.type}
                                    </Badge>
                                  </div>
                                  <p className="text-sm font-medium">{issue.issue}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Suggestion: {issue.suggestion}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                            No major grammar issues found!
                          </div>
                        )}
                      </TabsContent>
                    </CardContent>
                  </Tabs>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {!result && (
            <Card className="flex items-center justify-center min-h-[300px]">
              <div className="text-center p-6">
                <FileEdit className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">Ready to Grade</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Enter your essay on the left and click "Grade Essay" to receive detailed feedback and scores.
                </p>
              </div>
            </Card>
          )}
        </div>
      </motion.div>
    </div>
  );
}
