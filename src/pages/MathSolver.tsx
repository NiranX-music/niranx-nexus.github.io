import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, Sparkles, Copy, Camera, Loader2, ChevronRight, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AIProviderSelector, useAIProvider } from '@/components/ai/AIProviderSelector';
import { motion } from 'framer-motion';

interface Solution {
  id: string;
  problem: string;
  steps: string[];
  answer: string;
  explanation: string;
  relatedConcepts?: string[];
}

export default function MathSolver() {
  const { toast } = useToast();
  const { provider, model, setProvider, setModel } = useAIProvider('math-solver');
  const [problem, setProblem] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [activeTab, setActiveTab] = useState('solve');

  const solveProblem = async () => {
    if (!problem.trim()) {
      toast({ title: 'Please enter a math problem', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const prompt = `Solve this math problem step by step:

Problem: ${problem}

Return a JSON object with this exact format:
{
  "steps": ["Step 1: description", "Step 2: description", ...],
  "answer": "final answer",
  "explanation": "Brief explanation of the solution approach",
  "relatedConcepts": ["concept1", "concept2"]
}

Be detailed in each step. Show all work. If it's a word problem, identify the variables first.`;

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
      if (!jsonMatch) throw new Error('Invalid response format');

      const solution = JSON.parse(jsonMatch[0]);
      
      const newSolution: Solution = {
        id: Date.now().toString(),
        problem: problem.trim(),
        steps: solution.steps || [],
        answer: solution.answer || '',
        explanation: solution.explanation || '',
        relatedConcepts: solution.relatedConcepts || [],
      };

      setSolutions([newSolution, ...solutions]);
      setProblem('');
      toast({ title: 'Problem solved!', description: 'Check the step-by-step solution' });
    } catch (error) {
      console.error('Solve error:', error);
      toast({ title: 'Failed to solve problem', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard!' });
  };

  const EXAMPLE_PROBLEMS = [
    "Solve for x: 2x + 5 = 13",
    "Find the derivative of f(x) = x³ + 2x² - 5x + 3",
    "Calculate the area of a circle with radius 7 cm",
    "Solve the quadratic equation: x² - 5x + 6 = 0",
    "If a train travels at 60 mph for 2.5 hours, how far does it go?",
    "Find the integral of sin(x)cos(x) dx",
  ];

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500">
          <Calculator className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Math Solver</h1>
          <p className="text-muted-foreground">Step-by-step solutions for any math problem</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Input Section */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Enter Problem
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
                <Label>Math Problem</Label>
                <Textarea
                  placeholder="Enter your math problem here...
Example: Solve for x: 3x + 7 = 22"
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  rows={5}
                  className="font-mono"
                />
              </div>

              <Button onClick={solveProblem} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Solving...
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4 mr-2" />
                    Solve Problem
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Example Problems */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Try These Examples</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {EXAMPLE_PROBLEMS.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => setProblem(ex)}
                    className="w-full text-left p-2 text-sm bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Solutions Section */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Solutions ({solutions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {solutions.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Calculator className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg">No solutions yet</p>
                  <p className="text-sm">Enter a math problem to get started</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {solutions.map((sol, index) => (
                    <motion.div
                      key={sol.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="border-2">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <Badge variant="outline" className="mb-2">Problem</Badge>
                              <p className="font-mono text-sm">{sol.problem}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => copyToClipboard(`Problem: ${sol.problem}\n\nSteps:\n${sol.steps.join('\n')}\n\nAnswer: ${sol.answer}`)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Steps */}
                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <ChevronRight className="h-4 w-4" />
                              Solution Steps
                            </h4>
                            <div className="space-y-2 ml-6">
                              {sol.steps.map((step, i) => (
                                <div key={i} className="flex gap-3 items-start">
                                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">
                                    {i + 1}
                                  </span>
                                  <p className="text-sm">{step.replace(/^Step \d+:\s*/i, '')}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Answer */}
                          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                            <h4 className="font-semibold text-green-700 dark:text-green-300 mb-1">Answer</h4>
                            <p className="text-xl font-mono font-bold">{sol.answer}</p>
                          </div>

                          {/* Explanation */}
                          {sol.explanation && (
                            <div className="p-3 bg-muted rounded-lg">
                              <h4 className="font-semibold mb-1 flex items-center gap-2">
                                <BookOpen className="h-4 w-4" />
                                Explanation
                              </h4>
                              <p className="text-sm text-muted-foreground">{sol.explanation}</p>
                            </div>
                          )}

                          {/* Related Concepts */}
                          {sol.relatedConcepts && sol.relatedConcepts.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {sol.relatedConcepts.map((concept, i) => (
                                <Badge key={i} variant="secondary">{concept}</Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
