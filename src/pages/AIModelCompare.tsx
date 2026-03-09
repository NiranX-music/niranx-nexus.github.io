import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeftRight, Zap, Clock, Brain } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const models = [
  { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash', speed: 'Fast', tier: 'Free' },
  { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', speed: 'Medium', tier: 'Pro' },
  { id: 'openai/gpt-5-mini', name: 'GPT-5 Mini', speed: 'Fast', tier: 'Free' },
  { id: 'openai/gpt-5', name: 'GPT-5', speed: 'Medium', tier: 'Pro' },
  { id: 'google/gemini-2.5-flash-lite', name: 'Gemini Flash Lite', speed: 'Ultra Fast', tier: 'Free' },
];

interface ModelResult {
  model: string;
  response: string;
  timeMs: number;
  tokens: number;
}

export default function AIModelCompare() {
  const [prompt, setPrompt] = useState('');
  const [modelA, setModelA] = useState(models[0].id);
  const [modelB, setModelB] = useState(models[3].id);
  const [results, setResults] = useState<[ModelResult | null, ModelResult | null]>([null, null]);
  const [loading, setLoading] = useState(false);

  const runComparison = async () => {
    if (!prompt.trim()) return toast.error('Enter a prompt first');
    setLoading(true);
    setResults([null, null]);

    const runModel = async (model: string): Promise<ModelResult> => {
      const start = Date.now();
      try {
        const { data, error } = await supabase.functions.invoke('ai-gateway', {
          body: { prompt, model, max_tokens: 1024 },
        });
        if (error) throw error;
        return {
          model,
          response: data?.choices?.[0]?.message?.content || data?.message || 'No response',
          timeMs: Date.now() - start,
          tokens: data?.usage?.total_tokens || 0,
        };
      } catch {
        return { model, response: 'Error generating response', timeMs: Date.now() - start, tokens: 0 };
      }
    };

    const [a, b] = await Promise.all([runModel(modelA), runModel(modelB)]);
    setResults([a, b]);
    setLoading(false);
  };

  const getModelName = (id: string) => models.find(m => m.id === id)?.name || id;

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-6xl">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <ArrowLeftRight className="w-10 h-10 text-primary" />
          <h1 className="text-3xl font-bold font-[Orbitron]">AI Model Compare</h1>
        </div>
        <p className="text-muted-foreground">Compare responses from different AI models side-by-side</p>
      </div>

      <Card className="border-primary/20 bg-card/60 backdrop-blur-sm">
        <CardContent className="p-6 space-y-4">
          <Textarea
            placeholder="Enter your prompt to compare models..."
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            className="min-h-[100px] bg-background/50"
          />
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-1">
              <label className="text-sm text-muted-foreground">Model A</label>
              <Select value={modelA} onValueChange={setModelA}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {models.map(m => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name} <span className="text-muted-foreground text-xs ml-2">({m.speed})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <ArrowLeftRight className="w-6 h-6 text-primary shrink-0 hidden md:block" />
            <div className="flex-1 space-y-1">
              <label className="text-sm text-muted-foreground">Model B</label>
              <Select value={modelB} onValueChange={setModelB}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {models.map(m => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name} <span className="text-muted-foreground text-xs ml-2">({m.speed})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={runComparison} disabled={loading} className="shrink-0">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Comparing...</> : 'Compare'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {(results[0] || results[1] || loading) && (
        <div className="grid md:grid-cols-2 gap-6">
          {[0, 1].map(i => {
            const r = results[i];
            const name = getModelName(i === 0 ? modelA : modelB);
            return (
              <Card key={i} className="border-primary/20 bg-card/60 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    {name}
                  </CardTitle>
                  {r && (
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />{r.timeMs}ms
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Zap className="w-3 h-3 mr-1" />{r.tokens} tokens
                      </Badge>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {loading && !r ? (
                    <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
                      <Loader2 className="w-5 h-5 animate-spin" />Generating...
                    </div>
                  ) : r ? (
                    <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap text-sm leading-relaxed">
                      {r.response}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
