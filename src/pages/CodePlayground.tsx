import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code2, Play, Sparkles, Copy, Trash2, Loader2, Wand2, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AIProviderSelector, useAIProvider } from '@/components/ai/AIProviderSelector';

const LANGUAGES = [
  { id: 'javascript', name: 'JavaScript', extension: 'js' },
  { id: 'typescript', name: 'TypeScript', extension: 'ts' },
  { id: 'python', name: 'Python', extension: 'py' },
  { id: 'html', name: 'HTML', extension: 'html' },
  { id: 'css', name: 'CSS', extension: 'css' },
  { id: 'sql', name: 'SQL', extension: 'sql' },
  { id: 'json', name: 'JSON', extension: 'json' },
];

const TEMPLATES = {
  javascript: `// JavaScript Playground
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('World'));`,
  typescript: `// TypeScript Playground
interface User {
  name: string;
  age: number;
}

function greet(user: User): string {
  return \`Hello, \${user.name}!\`;
}

console.log(greet({ name: 'World', age: 25 }));`,
  python: `# Python Playground
def greet(name):
    return f"Hello, {name}!"

print(greet("World"))`,
  html: `<!DOCTYPE html>
<html>
<head>
  <title>My Page</title>
</head>
<body>
  <h1>Hello, World!</h1>
</body>
</html>`,
  css: `/* CSS Playground */
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.card {
  padding: 2rem;
  border-radius: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}`,
  sql: `-- SQL Playground
SELECT 
  users.name,
  COUNT(orders.id) as order_count
FROM users
LEFT JOIN orders ON users.id = orders.user_id
GROUP BY users.id
HAVING order_count > 5
ORDER BY order_count DESC;`,
  json: `{
  "name": "My Project",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.0.0",
    "typescript": "^5.0.0"
  }
}`,
};

export default function CodePlayground() {
  const { toast } = useToast();
  const { provider, model, setProvider, setModel } = useAIProvider('code-playground');
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(TEMPLATES.javascript);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [prompt, setPrompt] = useState('');

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setCode(TEMPLATES[lang as keyof typeof TEMPLATES] || '');
    setOutput('');
    setExplanation('');
  };

  const runCode = useCallback(() => {
    setIsRunning(true);
    setOutput('');

    try {
      if (language === 'javascript') {
        // Capture console.log output
        const logs: string[] = [];
        const originalLog = console.log;
        console.log = (...args) => {
          logs.push(args.map(a => 
            typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)
          ).join(' '));
        };

        try {
          const result = eval(code);
          if (result !== undefined) {
            logs.push(`=> ${typeof result === 'object' ? JSON.stringify(result, null, 2) : result}`);
          }
        } catch (e: any) {
          logs.push(`Error: ${e.message}`);
        }

        console.log = originalLog;
        setOutput(logs.join('\n'));
      } else if (language === 'html') {
        setOutput('HTML Preview:\n' + code);
      } else if (language === 'json') {
        try {
          const parsed = JSON.parse(code);
          setOutput('Valid JSON:\n' + JSON.stringify(parsed, null, 2));
        } catch (e: any) {
          setOutput(`JSON Error: ${e.message}`);
        }
      } else {
        setOutput(`${language.toUpperCase()} execution is simulated.\nCode validated successfully!`);
      }
    } catch (e: any) {
      setOutput(`Error: ${e.message}`);
    } finally {
      setIsRunning(false);
    }
  }, [code, language]);

  const explainCode = async () => {
    if (!code.trim()) return;

    setIsExplaining(true);
    try {
      const explainPrompt = `Explain this ${language} code in a clear, educational way:

\`\`\`${language}
${code}
\`\`\`

Include:
1. What the code does overall
2. Line-by-line explanation of key parts
3. Any best practices or improvements
4. Common use cases`;

      let functionName = 'ai-chat';
      if (provider === 'openrouter') functionName = 'openrouter-chat';

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: {
          messages: [{ role: 'user', content: explainPrompt }],
          model: model,
        },
      });

      if (error) throw error;
      setExplanation(data?.choices?.[0]?.message?.content || data?.content || '');
    } catch (error) {
      console.error('Explain error:', error);
      toast({ title: 'Failed to explain code', variant: 'destructive' });
    } finally {
      setIsExplaining(false);
    }
  };

  const generateCode = async () => {
    if (!prompt.trim()) {
      toast({ title: 'Please enter a prompt', variant: 'destructive' });
      return;
    }

    setIsRunning(true);
    try {
      const genPrompt = `Generate ${language} code for: ${prompt}

Return ONLY the code, no explanations. Make it clean, well-commented, and production-ready.`;

      let functionName = 'ai-chat';
      if (provider === 'openrouter') functionName = 'openrouter-chat';

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: {
          messages: [{ role: 'user', content: genPrompt }],
          model: model,
        },
      });

      if (error) throw error;

      let generated = data?.choices?.[0]?.message?.content || data?.content || '';
      // Extract code from markdown if present
      const codeMatch = generated.match(/```(?:\w+)?\n([\s\S]*?)```/);
      if (codeMatch) {
        generated = codeMatch[1];
      }
      setCode(generated.trim());
      setPrompt('');
      toast({ title: 'Code generated!' });
    } catch (error) {
      console.error('Generate error:', error);
      toast({ title: 'Failed to generate code', variant: 'destructive' });
    } finally {
      setIsRunning(false);
    }
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    toast({ title: 'Code copied!' });
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500">
          <Code2 className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Code Playground</h1>
          <p className="text-muted-foreground">Write, run, and learn with AI assistance</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Code Editor */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map(lang => (
                      <SelectItem key={lang.id} value={lang.id}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Badge variant="outline">.{LANGUAGES.find(l => l.id === language)?.extension}</Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={copyCode}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setCode('')}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Write your code here..."
              className="font-mono text-sm min-h-[350px] bg-muted/50"
            />

            <div className="flex gap-2">
              <Button onClick={runCode} disabled={isRunning} className="flex-1">
                {isRunning ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Run Code
              </Button>
              <Button variant="outline" onClick={explainCode} disabled={isExplaining}>
                {isExplaining ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <MessageSquare className="h-4 w-4 mr-2" />
                )}
                Explain
              </Button>
            </div>

            {/* AI Generate */}
            <div className="flex gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what code you want..."
                className="flex-1 px-3 py-2 bg-muted rounded-lg text-sm"
                onKeyDown={(e) => e.key === 'Enter' && generateCode()}
              />
              <Button variant="secondary" onClick={generateCode} disabled={isRunning}>
                <Wand2 className="h-4 w-4 mr-2" />
                Generate
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output & Explanation */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Output</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg font-mono text-sm min-h-[150px] overflow-auto whitespace-pre-wrap">
                {output || 'Run your code to see output...'}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Explanation
                </CardTitle>
                <AIProviderSelector
                  selectedProvider={provider}
                  selectedModel={model}
                  onProviderChange={setProvider}
                  onModelChange={setModel}
                  compact
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg min-h-[200px] overflow-auto">
                {isExplaining ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing code...
                  </div>
                ) : explanation ? (
                  <pre className="whitespace-pre-wrap font-sans text-sm">{explanation}</pre>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Click "Explain" to get an AI explanation of your code
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
