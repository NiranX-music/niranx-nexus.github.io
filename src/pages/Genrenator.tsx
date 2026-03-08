import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Music, RefreshCw, Sparkles, BookOpen, Copy, Shuffle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

const API = 'https://binaryjazz.us/wp-json/genrenator/v1';

const Genrenator = () => {
  const [genres, setGenres] = useState<string[]>([]);
  const [stories, setStories] = useState<string[]>([]);
  const [count, setCount] = useState(5);
  const [loadingGenres, setLoadingGenres] = useState(false);
  const [loadingStories, setLoadingStories] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const { toast } = useToast();

  const fetchGenres = useCallback(async () => {
    setLoadingGenres(true);
    try {
      const res = await fetch(`${API}/genre/${count}`);
      const data = await res.json();
      const arr = Array.isArray(data) ? data : [data];
      setGenres(arr);
      setHistory(prev => [...new Set([...arr, ...prev])].slice(0, 50));
    } catch {
      toast({ title: 'Error fetching genres', variant: 'destructive' });
    } finally {
      setLoadingGenres(false);
    }
  }, [count, toast]);

  const fetchStories = useCallback(async () => {
    setLoadingStories(true);
    try {
      const res = await fetch(`${API}/story/${count}`);
      const data = await res.json();
      setStories(Array.isArray(data) ? data : [data]);
    } catch {
      toast({ title: 'Error fetching stories', variant: 'destructive' });
    } finally {
      setLoadingStories(false);
    }
  }, [count, toast]);

  const copyGenre = (g: string) => {
    navigator.clipboard.writeText(g);
    toast({ title: 'Copied!', description: g });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <div className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-background to-accent/10" />
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 50%)',
          backgroundSize: '20px 20px'
        }} />
        <div className="relative max-w-4xl mx-auto px-4 py-14 text-center space-y-4">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-card/60 backdrop-blur text-xs text-muted-foreground mb-3">
              <Music className="w-3.5 h-3.5" /> Binary Jazz Genrenator API
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Genre</span>nator
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto mt-2">
              AI-powered random music genre generator — discover genres that don't exist yet
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Controls */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shuffle className="w-4 h-4 text-primary" /> Generate
            </CardTitle>
            <CardDescription>Pick how many results to fetch (1–10)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground w-16">Count: {count}</span>
              <Slider value={[count]} onValueChange={v => setCount(v[0])} min={1} max={10} step={1} className="flex-1" />
            </div>
            <div className="flex gap-3 flex-wrap">
              <Button onClick={fetchGenres} disabled={loadingGenres} className="gap-2">
                {loadingGenres ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Generate Genres
              </Button>
              <Button onClick={fetchStories} disabled={loadingStories} variant="secondary" className="gap-2">
                {loadingStories ? <RefreshCw className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
                Generate Stories
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Genres */}
        <AnimatePresence mode="wait">
          {genres.length > 0 && (
            <motion.div key="genres" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Music className="w-5 h-5 text-primary" /> Generated Genres
                <Badge variant="outline">{genres.length}</Badge>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {genres.map((g, i) => (
                  <motion.div key={`${g}-${i}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                    <Card className="group hover:border-primary/40 transition-colors cursor-pointer" onClick={() => copyGenre(g)}>
                      <CardContent className="pt-4 pb-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Music className="w-5 h-5 text-primary" />
                          </div>
                          <span className="font-semibold text-sm text-foreground truncate">{g}</span>
                        </div>
                        <Copy className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stories */}
        <AnimatePresence mode="wait">
          {stories.length > 0 && (
            <motion.div key="stories" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" /> Genre Stories
                <Badge variant="outline">{stories.length}</Badge>
              </h2>
              <div className="space-y-3">
                {stories.map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 }}>
                    <Card className="hover:border-primary/30 transition-colors">
                      <CardContent className="pt-5 pb-5">
                        <p className="text-sm text-foreground leading-relaxed">{s}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History */}
        {history.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Genre History</CardTitle>
              <CardDescription>All genres generated this session</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {history.map((g, i) => (
                  <Badge
                    key={`${g}-${i}`}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary/20 transition-colors"
                    onClick={() => copyGenre(g)}
                  >
                    {g}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {genres.length === 0 && stories.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <Music className="w-14 h-14 mx-auto mb-4 opacity-20" />
            <p className="font-medium text-lg">No genres generated yet</p>
            <p className="text-sm mt-1">Hit "Generate Genres" to discover bizarre new music genres</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Genrenator;
