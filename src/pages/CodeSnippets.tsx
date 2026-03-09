import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Copy, Code, Plus, Star, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

interface Snippet {
  title: string;
  code: string;
  language: string;
  tags: string[];
  author: string;
  stars: number;
}

const defaultSnippets: Snippet[] = [
  { title: 'React useDebounce Hook', code: `const useDebounce = (value, delay = 300) => {\n  const [debounced, setDebounced] = useState(value);\n  useEffect(() => {\n    const timer = setTimeout(() => setDebounced(value), delay);\n    return () => clearTimeout(timer);\n  }, [value, delay]);\n  return debounced;\n};`, language: 'TypeScript', tags: ['React', 'Hooks', 'Performance'], author: 'System', stars: 24 },
  { title: 'Fetch with Retry', code: `async function fetchWithRetry(url, retries = 3) {\n  for (let i = 0; i < retries; i++) {\n    try {\n      const res = await fetch(url);\n      if (res.ok) return await res.json();\n    } catch (e) {\n      if (i === retries - 1) throw e;\n      await new Promise(r => setTimeout(r, 1000 * (i + 1)));\n    }\n  }\n}`, language: 'JavaScript', tags: ['API', 'Error Handling'], author: 'System', stars: 18 },
  { title: 'Tailwind Dark Mode Toggle', code: `const ThemeToggle = () => {\n  const [dark, setDark] = useState(false);\n  useEffect(() => {\n    document.documentElement.classList.toggle('dark', dark);\n  }, [dark]);\n  return <button onClick={() => setDark(!dark)}>{dark ? '☀️' : '🌙'}</button>;\n};`, language: 'TSX', tags: ['Tailwind', 'Theme', 'UI'], author: 'System', stars: 31 },
  { title: 'Array Shuffle (Fisher-Yates)', code: `function shuffle<T>(array: T[]): T[] {\n  const arr = [...array];\n  for (let i = arr.length - 1; i > 0; i--) {\n    const j = Math.floor(Math.random() * (i + 1));\n    [arr[i], arr[j]] = [arr[j], arr[i]];\n  }\n  return arr;\n}`, language: 'TypeScript', tags: ['Algorithm', 'Utility'], author: 'System', stars: 15 },
  { title: 'Supabase Auth Helper', code: `const useUser = () => {\n  const [user, setUser] = useState(null);\n  useEffect(() => {\n    supabase.auth.getUser().then(({ data }) => setUser(data.user));\n    const { data: listener } = supabase.auth.onAuthStateChange(\n      (_, session) => setUser(session?.user ?? null)\n    );\n    return () => listener.subscription.unsubscribe();\n  }, []);\n  return user;\n};`, language: 'TypeScript', tags: ['Supabase', 'Auth', 'React'], author: 'System', stars: 22 },
  { title: 'CSS Glass Card', code: `.glass-card {\n  background: rgba(255, 255, 255, 0.05);\n  backdrop-filter: blur(20px);\n  border: 1px solid rgba(255, 255, 255, 0.1);\n  border-radius: 1rem;\n  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);\n}`, language: 'CSS', tags: ['Glassmorphism', 'UI', 'Design'], author: 'System', stars: 27 },
];

const languages = ['All', ...Array.from(new Set(defaultSnippets.map(s => s.language)))];

export default function CodeSnippets() {
  const [search, setSearch] = useState('');
  const [lang, setLang] = useState('All');

  const filtered = defaultSnippets.filter(s =>
    (lang === 'All' || s.language === lang) &&
    (s.title.toLowerCase().includes(search.toLowerCase()) || s.tags.some(t => t.toLowerCase().includes(search.toLowerCase())))
  );

  const copy = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied!');
  };

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-5xl">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <Code className="w-10 h-10 text-primary" />
          <h1 className="text-3xl font-bold font-[Orbitron]">Code Snippets</h1>
        </div>
        <p className="text-muted-foreground">Reusable code snippets for common patterns</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search snippets..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Tabs value={lang} onValueChange={setLang}>
          <TabsList>
            {languages.map(l => <TabsTrigger key={l} value={l}>{l}</TabsTrigger>)}
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-4">
        {filtered.map((s, i) => (
          <Card key={i} className="border-primary/20 bg-card/60 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Code className="w-4 h-4 text-primary" />{s.title}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{s.language}</Badge>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />{s.stars}
                  </span>
                </div>
              </div>
              <div className="flex gap-1.5 mt-1">
                {s.tags.map(t => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="bg-background/80 border border-border/50 rounded-lg p-4 overflow-x-auto text-sm font-mono">
                  <code>{s.code}</code>
                </pre>
                <Button size="sm" variant="ghost" className="absolute top-2 right-2" onClick={() => copy(s.code)}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
