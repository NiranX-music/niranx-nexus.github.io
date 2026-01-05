import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Lightbulb, Sparkles, Copy, Download, Loader2, BookOpen, Zap, List, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AIProviderSelector, useAIProvider } from '@/components/ai/AIProviderSelector';
import { motion } from 'framer-motion';

interface Explanation {
  id: string;
  concept: string;
  explanation: string;
  examples?: string[];
  analogies?: string[];
  keyPoints?: string[];
  timestamp: Date;
}

export default function ConceptExplainer() {
  const { toast } = useToast();
  const { provider, model, setProvider, setModel } = useAIProvider('concept-explainer');
  const [concept, setConcept] = useState('');
  const [context, setContext] = useState('');
  const [level, setLevel] = useState<'simple' | 'detailed' | 'expert'>('detailed');
  const [isLoading, setIsLoading] = useState(false);
  const [explanations, setExplanations] = useState<Explanation[]>([]);
  const [activeTab, setActiveTab] = useState('explain');

  const explainConcept = async () => {
    if (!concept.trim()) {
      toast({ title: 'Please enter a concept', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      let levelPrompt = '';
      switch (level) {
        case 'simple':
          levelPrompt = 'Explain like I\'m 10 years old. Use very simple words and everyday analogies.';
          break;
        case 'detailed':
          levelPrompt = 'Provide a comprehensive explanation suitable for a high school or college student.';
          break;
        case 'expert':
          levelPrompt = 'Provide an in-depth, technical explanation suitable for someone in the field.';
          break;
      }

      const prompt = `Explain the concept: "${concept}"

${levelPrompt}
${context ? `Context: ${context}` : ''}

Return JSON:
{
  "explanation": "Clear explanation of the concept",
  "examples": ["Real-world example 1", "Example 2"],
  "analogies": ["Analogy to help understand"],
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3"]
}

Make the explanation engaging and memorable.`;

      let functionName = 'ai-chat';
      if (provider === 'openrouter') functionName = 'openrouter-chat';
      else if (provider === 'perplexity') functionName = 'perplexity-chat';

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: {
          messages: [{ role: 'user', content: prompt }],
          model: provider === 'perplexity' ? 'sonar-pro' : model,
        },
      });

      if (error) throw error;

      const content = data?.choices?.[0]?.message?.content || data?.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      let explanationData;
      if (jsonMatch) {
        explanationData = JSON.parse(jsonMatch[0]);
      } else {
        explanationData = { explanation: content };
      }

      const newExplanation: Explanation = {
        id: Date.now().toString(),
        concept: concept.trim(),
        explanation: explanationData.explanation,
        examples: explanationData.examples,
        analogies: explanationData.analogies,
        keyPoints: explanationData.keyPoints,
        timestamp: new Date(),
      };

      setExplanations([newExplanation, ...explanations]);
      setConcept('');
      setContext('');
      toast({ title: 'Concept explained!' });
    } catch (error) {
      console.error('Explain error:', error);
      toast({ title: 'Failed to explain concept', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const askFollowUp = async (originalConcept: string, question: string) => {
    if (!question.trim()) return;

    setIsLoading(true);
    try {
      const prompt = `Follow-up question about "${originalConcept}":

${question}

Provide a clear, helpful answer that builds on the original concept.`;

      let functionName = 'ai-chat';
      if (provider === 'openrouter') functionName = 'openrouter-chat';

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: {
          messages: [{ role: 'user', content: prompt }],
          model: model,
        },
      });

      if (error) throw error;

      const answer = data?.choices?.[0]?.message?.content || data?.content || '';
      
      const followUp: Explanation = {
        id: Date.now().toString(),
        concept: `Q: ${question}`,
        explanation: answer,
        timestamp: new Date(),
      };

      setExplanations([followUp, ...explanations]);
      toast({ title: 'Question answered!' });
    } catch (error) {
      console.error('Follow-up error:', error);
      toast({ title: 'Failed to answer question', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const copyExplanation = async (exp: Explanation) => {
    const text = `${exp.concept}\n\n${exp.explanation}\n\n${exp.keyPoints ? 'Key Points:\n' + exp.keyPoints.map(p => `• ${p}`).join('\n') : ''}`;
    await navigator.clipboard.writeText(text);
    toast({ title: 'Copied!' });
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500">
          <Lightbulb className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Concept Explainer</h1>
          <p className="text-muted-foreground">Understand any concept with AI explanations</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Input Section */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Explain a Concept
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
                <Label>Concept to Explain</Label>
                <Input
                  placeholder="e.g., Quantum Entanglement, Recursion, Supply and Demand..."
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Additional Context (Optional)</Label>
                <Textarea
                  placeholder="Any specific aspects you want to understand..."
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Explanation Level</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(['simple', 'detailed', 'expert'] as const).map((l) => (
                    <Button
                      key={l}
                      variant={level === l ? 'default' : 'outline'}
                      onClick={() => setLevel(l)}
                      className="capitalize"
                    >
                      {l}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {level === 'simple' && 'Like explaining to a 10 year old'}
                  {level === 'detailed' && 'Good for students'}
                  {level === 'expert' && 'Technical & in-depth'}
                </p>
              </div>

              <Button onClick={explainConcept} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Explaining...
                  </>
                ) : (
                  <>
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Explain
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Quick Topics */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Popular Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {[
                  'Photosynthesis',
                  'Machine Learning',
                  'DNA Replication',
                  'Compound Interest',
                  'Newton\'s Laws',
                  'Blockchain',
                  'Evolution',
                  'Inflation',
                ].map((topic) => (
                  <Badge
                    key={topic}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    onClick={() => setConcept(topic)}
                  >
                    {topic}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Explanations */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Explanations ({explanations.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {explanations.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Lightbulb className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg">No explanations yet</p>
                  <p className="text-sm">Enter a concept to get started</p>
                </div>
              ) : (
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-6">
                    {explanations.map((exp, index) => (
                      <motion.div
                        key={exp.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card>
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                              <Badge variant="secondary" className="text-sm">
                                {exp.concept}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => copyExplanation(exp)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <BookOpen className="h-4 w-4" />
                                Explanation
                              </h4>
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                {exp.explanation}
                              </p>
                            </div>

                            {exp.keyPoints && exp.keyPoints.length > 0 && (
                              <div>
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                  <List className="h-4 w-4" />
                                  Key Points
                                </h4>
                                <ul className="space-y-1">
                                  {exp.keyPoints.map((point, i) => (
                                    <li key={i} className="text-sm flex items-start gap-2">
                                      <Zap className="h-3 w-3 mt-1 text-primary flex-shrink-0" />
                                      {point}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {exp.examples && exp.examples.length > 0 && (
                              <div>
                                <h4 className="font-semibold mb-2">Examples</h4>
                                <div className="space-y-2">
                                  {exp.examples.map((example, i) => (
                                    <p key={i} className="text-sm bg-muted p-2 rounded-lg">
                                      {example}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            )}

                            {exp.analogies && exp.analogies.length > 0 && (
                              <div>
                                <h4 className="font-semibold mb-2">💡 Analogies</h4>
                                <div className="space-y-2">
                                  {exp.analogies.map((analogy, i) => (
                                    <p key={i} className="text-sm italic bg-yellow-500/10 p-2 rounded-lg">
                                      {analogy}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
