import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Mic, Camera, Sparkles, Loader2, X, ExternalLink, Globe, Image } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
  thumbnail?: string;
}

export function GoogleStyleSearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState<'web' | 'image'>('web');
  const [showResults, setShowResults] = useState(false);
  const [aiMode, setAiMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setShowResults(true);

    try {
      const { data, error } = await supabase.functions.invoke('google-search', {
        body: { query, searchType },
      });

      if (error) throw error;

      setResults(data.results || []);
      
      if (data.results?.length === 0) {
        toast({
          title: 'No results found',
          description: 'Try a different search term',
        });
      }
    } catch (error: any) {
      console.error('Search error:', error);
      toast({
        title: 'Search failed',
        description: error.message || 'Failed to perform search',
        variant: 'destructive',
      });
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
    if (e.key === 'Escape') {
      setShowResults(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    inputRef.current?.focus();
  };

  const handleVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        handleSearch();
      };
      recognition.start();
      toast({ title: 'Listening...', description: 'Speak your search query' });
    } else {
      toast({ title: 'Not supported', description: 'Voice search is not supported in this browser', variant: 'destructive' });
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto relative">
      {/* Main Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "relative flex items-center gap-2 px-4 py-3 rounded-full",
          "bg-muted/80 backdrop-blur-xl border border-border/50",
          "shadow-lg hover:shadow-xl transition-all duration-300",
          "focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary/50"
        )}
      >
        {/* Plus Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-primary/10"
          onClick={() => setSearchType(searchType === 'web' ? 'image' : 'web')}
        >
          {searchType === 'web' ? (
            <Plus className="h-5 w-5 text-muted-foreground" />
          ) : (
            <Image className="h-5 w-5 text-primary" />
          )}
        </Button>

        {/* Search Input */}
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search the web..."
          className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-muted-foreground/60"
        />

        {/* Clear Button */}
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-destructive/10"
            onClick={clearSearch}
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}

        {/* Voice Search */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-primary/10"
          onClick={handleVoiceSearch}
        >
          <Mic className="h-5 w-5 text-muted-foreground" />
        </Button>

        {/* Image Search */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-primary/10"
          onClick={() => setSearchType('image')}
        >
          <Camera className="h-5 w-5 text-muted-foreground" />
        </Button>

        {/* AI Mode Toggle */}
        <Button
          variant={aiMode ? "default" : "outline"}
          size="sm"
          className={cn(
            "rounded-full gap-1.5 h-8 px-3",
            aiMode && "bg-gradient-to-r from-primary to-accent"
          )}
          onClick={() => setAiMode(!aiMode)}
        >
          <Sparkles className="h-4 w-4" />
          AI Mode
        </Button>

        {/* Search Button */}
        <Button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="rounded-full h-8 w-8 p-0"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </motion.div>

      {/* Search Type Indicator */}
      <div className="flex justify-center gap-2 mt-3">
        <Badge 
          variant={searchType === 'web' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setSearchType('web')}
        >
          <Globe className="h-3 w-3 mr-1" /> Web
        </Badge>
        <Badge 
          variant={searchType === 'image' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setSearchType('image')}
        >
          <Image className="h-3 w-3 mr-1" /> Images
        </Badge>
      </div>

      {/* Results Dropdown */}
      <AnimatePresence>
        {showResults && (results.length > 0 || loading) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className="absolute top-full left-0 right-0 mt-2 z-50"
          >
            <div className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden max-h-[60vh] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {results.map((result, index) => (
                    <motion.a
                      key={index}
                      href={result.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="block p-3 rounded-xl hover:bg-muted/80 transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        {result.thumbnail && searchType === 'image' && (
                          <img
                            src={result.thumbnail}
                            alt={result.title}
                            className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-primary truncate group-hover:underline">
                              {result.title}
                            </h4>
                            <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {result.displayLink}
                          </p>
                          <p className="text-sm text-foreground/70 line-clamp-2 mt-0.5">
                            {result.snippet}
                          </p>
                        </div>
                      </div>
                    </motion.a>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {showResults && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
}
