import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ExternalLink, Loader2, Globe, Image, FileText, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
  thumbnail?: string;
}

export function GoogleSearchWidget() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState<'web' | 'image'>('web');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);

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
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Globe className="h-5 w-5 text-primary" />
          Google Search
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search the web..."
              className="pl-10 pr-10"
            />
            {query && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button onClick={handleSearch} disabled={loading || !query.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
          </Button>
        </div>

        {/* Search Type Tabs */}
        <Tabs value={searchType} onValueChange={(v) => setSearchType(v as 'web' | 'image')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="web" className="gap-2">
              <FileText className="h-4 w-4" />
              Web
            </TabsTrigger>
            <TabsTrigger value="image" className="gap-2">
              <Image className="h-4 w-4" />
              Images
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Results */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-8"
            >
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </motion.div>
          ) : results.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3 max-h-[400px] overflow-y-auto pr-2"
            >
              {results.map((result, index) => (
                <motion.a
                  key={index}
                  href={result.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="block p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    {result.thumbnail && searchType === 'image' && (
                      <img
                        src={result.thumbnail}
                        alt={result.title}
                        className="w-16 h-16 rounded object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-primary truncate group-hover:underline">
                          {result.title}
                        </h4>
                        <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {result.displayLink}
                      </p>
                      <p className="text-sm text-foreground/80 line-clamp-2 mt-1">
                        {result.snippet}
                      </p>
                    </div>
                  </div>
                </motion.a>
              ))}
            </motion.div>
          ) : hasSearched && !loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-muted-foreground"
            >
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No results found</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-muted-foreground"
            >
              <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Search the web with Google</p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
