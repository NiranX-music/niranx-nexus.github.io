import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, BookMarked, Lightbulb, FileText, ExternalLink, Loader2, Sparkles, Copy, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AIProviderSelector, useAIProvider } from '@/components/ai/AIProviderSelector';
import { motion } from 'framer-motion';

interface ResearchResult {
  id: string;
  type: 'summary' | 'outline' | 'questions' | 'sources';
  content: string;
  timestamp: Date;
}

export default function ResearchAssistant() {
  const { toast } = useToast();
  const { provider, model, setProvider, setModel } = useAIProvider('research-assistant');
  const [topic, setTopic] = useState('');
  const [context, setContext] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ResearchResult[]>([]);
  const [activeTab, setActiveTab] = useState('explore');

  const runResearch = async (type: 'summary' | 'outline' | 'questions' | 'sources') => {
    if (!topic.trim()) {
      toast({ title: 'Please enter a research topic', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      let prompt = '';
      switch (type) {
        case 'summary':
          prompt = `Provide a comprehensive research summary on "${topic}". Include:
1. Key concepts and definitions
2. Main findings from recent research
3. Different perspectives on the topic
4. Current debates or controversies
5. Future directions

${context ? `Context: ${context}` : ''}

Make it detailed but accessible, suitable for academic research.`;
          break;
        case 'outline':
          prompt = `Create a detailed research paper outline for the topic: "${topic}". Include:
1. Introduction with thesis statement
2. Main sections with subsections
3. Key points to address in each section
4. Suggested evidence/examples
5. Conclusion points

${context ? `Context: ${context}` : ''}

Format as a clear hierarchical outline.`;
          break;
        case 'questions':
          prompt = `Generate 15 thought-provoking research questions about "${topic}". Include:
- Exploratory questions
- Analytical questions
- Comparative questions
- Cause-effect questions
- Evaluation questions

${context ? `Context: ${context}` : ''}

Make questions specific enough to guide research but open enough for exploration.`;
          break;
        case 'sources':
          prompt = `Suggest potential research sources for studying "${topic}". Include:
1. Types of academic sources to look for
2. Specific journals or databases to search
3. Key authors or researchers in this field
4. Organizations or institutions relevant to this topic
5. Search terms and keywords to use
6. Tips for finding reliable sources

${context ? `Context: ${context}` : ''}

Be practical and specific.`;
          break;
      }

      // Prefer Perplexity for research as it has web search
      let functionName = 'perplexity-chat';
      let requestModel = 'sonar-pro';
      
      if (provider !== 'perplexity') {
        functionName = provider === 'openrouter' ? 'openrouter-chat' : 'ai-chat';
        requestModel = model;
      }

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: {
          messages: [{ role: 'user', content: prompt }],
          model: requestModel,
        },
      });

      if (error) throw error;

      const content = data?.choices?.[0]?.message?.content || data?.content || '';

      const newResult: ResearchResult = {
        id: Date.now().toString(),
        type,
        content: content.trim(),
        timestamp: new Date(),
      };

      setResults([newResult, ...results]);
      toast({ title: 'Research complete!', description: `${type} generated successfully` });
    } catch (error) {
      console.error('Research error:', error);
      toast({ title: 'Research failed', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const copyResult = async (content: string) => {
    await navigator.clipboard.writeText(content);
    toast({ title: 'Copied to clipboard!' });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'summary': return <FileText className="h-4 w-4" />;
      case 'outline': return <BookMarked className="h-4 w-4" />;
      case 'questions': return <Lightbulb className="h-4 w-4" />;
      case 'sources': return <ExternalLink className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'summary': return 'Research Summary';
      case 'outline': return 'Paper Outline';
      case 'questions': return 'Research Questions';
      case 'sources': return 'Source Suggestions';
      default: return type;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
          <Search className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Research Assistant</h1>
          <p className="text-muted-foreground">AI-powered research exploration</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Research Input */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Research Topic
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
                <Label>Topic</Label>
                <Input
                  placeholder="e.g., Climate change effects on biodiversity"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Additional Context (Optional)</Label>
                <Textarea
                  placeholder="Specific focus, academic level, constraints..."
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => runResearch('summary')}
                  disabled={isLoading}
                  className="flex flex-col h-auto py-3"
                >
                  <FileText className="h-5 w-5 mb-1" />
                  <span className="text-xs">Summary</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => runResearch('outline')}
                  disabled={isLoading}
                  className="flex flex-col h-auto py-3"
                >
                  <BookMarked className="h-5 w-5 mb-1" />
                  <span className="text-xs">Outline</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => runResearch('questions')}
                  disabled={isLoading}
                  className="flex flex-col h-auto py-3"
                >
                  <Lightbulb className="h-5 w-5 mb-1" />
                  <span className="text-xs">Questions</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => runResearch('sources')}
                  disabled={isLoading}
                  className="flex flex-col h-auto py-3"
                >
                  <ExternalLink className="h-5 w-5 mb-1" />
                  <span className="text-xs">Sources</span>
                </Button>
              </div>

              {isLoading && (
                <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Researching...</span>
                </div>
              )}
            </CardContent>
          </Card>

          {provider === 'perplexity' && (
            <Card className="bg-cyan-500/10 border-cyan-500/30">
              <CardContent className="pt-4">
                <div className="flex items-start gap-2">
                  <Search className="h-5 w-5 text-cyan-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-cyan-700 dark:text-cyan-300">
                      Perplexity Active
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Using real-time web search for up-to-date research
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Research Results ({results.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {results.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Search className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg">No research yet</p>
                  <p className="text-sm">Enter a topic and select a research type to begin</p>
                </div>
              ) : (
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-4">
                    {results.map((result, index) => (
                      <motion.div
                        key={result.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card>
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {getTypeIcon(result.type)}
                                <Badge variant="outline">{getTypeLabel(result.type)}</Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  {result.timestamp.toLocaleTimeString()}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => copyResult(result.content)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                              <pre className="whitespace-pre-wrap font-sans text-sm bg-muted p-4 rounded-lg">
                                {result.content}
                              </pre>
                            </div>
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
