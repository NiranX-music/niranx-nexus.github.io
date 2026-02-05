import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Image, Video, Map, Newspaper, ShoppingBag, Sparkles, 
  Globe, ExternalLink, Loader2, ArrowLeft, Clock, TrendingUp,
  Play, MapPin, Store
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
  thumbnail?: string;
  type?: string;
}

interface AIReview {
  summary: string;
  keyPoints: string[];
  sources: string[];
  loading: boolean;
}

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(false);
  const [webResults, setWebResults] = useState<SearchResult[]>([]);
  const [imageResults, setImageResults] = useState<SearchResult[]>([]);
  const [videoResults, setVideoResults] = useState<SearchResult[]>([]);
  const [aiReview, setAiReview] = useState<AIReview>({
    summary: '',
    keyPoints: [],
    sources: [],
    loading: false,
  });

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setAiReview(prev => ({ ...prev, loading: true }));

    try {
      // Perform web search
      const { data: webData, error: webError } = await supabase.functions.invoke('google-search', {
        body: { query: searchQuery, searchType: 'web' },
      });

      if (!webError && webData?.results) {
        setWebResults(webData.results);
        // Extract video results
        const videos = webData.results.filter((r: SearchResult) => 
          r.link?.includes('youtube.com') || r.link?.includes('vimeo.com') || r.displayLink?.includes('video')
        );
        setVideoResults(videos.length > 0 ? videos : generateVideoPlaceholders(searchQuery));
      } else {
        setWebResults(generateFallbackResults(searchQuery));
      }

      // Perform image search
      const { data: imageData } = await supabase.functions.invoke('google-search', {
        body: { query: searchQuery, searchType: 'image' },
      });

      if (imageData?.results) {
        setImageResults(imageData.results);
      }

      // Get AI review from Bytez
      await getAIReview(searchQuery);

    } catch (error) {
      console.error('Search error:', error);
      setWebResults(generateFallbackResults(searchQuery));
    } finally {
      setLoading(false);
    }
  };

  const getAIReview = async (searchQuery: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('bytez-ai', {
        body: {
          messages: [
            {
              role: 'system',
              content: 'You are a helpful search assistant. Provide a brief, informative summary about the search topic. Include 3-5 key points and be concise.'
            },
            {
              role: 'user',
              content: `Provide a brief informative summary about: "${searchQuery}". Include key facts and points.`
            }
          ],
          model: 'google/gemini-2.5-flash'
        }
      });

      if (!error && data?.content) {
        const content = data.content;
        // Parse the AI response
        const lines = content.split('\n').filter((l: string) => l.trim());
        const keyPoints = lines.filter((l: string) => l.startsWith('-') || l.startsWith('•')).slice(0, 5);
        const summary = lines.filter((l: string) => !l.startsWith('-') && !l.startsWith('•')).join(' ').slice(0, 500);

        setAiReview({
          summary: summary || content.slice(0, 400),
          keyPoints: keyPoints.length > 0 ? keyPoints.map((p: string) => p.replace(/^[-•]\s*/, '')) : [],
          sources: ['AI-powered analysis'],
          loading: false,
        });
      }
    } catch (error) {
      console.error('AI Review error:', error);
      setAiReview({
        summary: `Here's what we found about "${searchQuery}". Browse the results below for more detailed information.`,
        keyPoints: [],
        sources: [],
        loading: false,
      });
    }
  };

  const generateFallbackResults = (q: string): SearchResult[] => [
    {
      title: `Search Google for: "${q}"`,
      link: `https://www.google.com/search?q=${encodeURIComponent(q)}`,
      snippet: 'Search directly on Google for comprehensive results.',
      displayLink: 'google.com',
    },
    {
      title: `Search Wikipedia for: "${q}"`,
      link: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(q)}`,
      snippet: 'Find encyclopedia articles on Wikipedia.',
      displayLink: 'wikipedia.org',
    },
    {
      title: `Search YouTube for: "${q}"`,
      link: `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
      snippet: 'Watch videos related to your search.',
      displayLink: 'youtube.com',
    },
  ];

  const generateVideoPlaceholders = (q: string): SearchResult[] => [
    {
      title: `Videos about "${q}" on YouTube`,
      link: `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
      snippet: 'Find videos on YouTube',
      displayLink: 'youtube.com',
      type: 'video',
    },
    {
      title: `${q} - Vimeo`,
      link: `https://vimeo.com/search?q=${encodeURIComponent(q)}`,
      snippet: 'High-quality videos on Vimeo',
      displayLink: 'vimeo.com',
      type: 'video',
    },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search-results?q=${encodeURIComponent(query)}`);
      performSearch(query);
    }
  };

  const tabs = [
    { id: 'all', label: 'All', icon: Globe },
    { id: 'images', label: 'Images', icon: Image },
    { id: 'videos', label: 'Videos', icon: Video },
    { id: 'maps', label: 'Maps', icon: Map },
    { id: 'news', label: 'News', icon: Newspaper },
    { id: 'shopping', label: 'Shopping', icon: ShoppingBag },
    { id: 'ai', label: 'AI Review', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Search Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
              <div className="relative flex items-center">
                <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search..."
                  className="pl-12 pr-4 h-12 rounded-full bg-muted/50 border-border/50"
                />
                <Button 
                  type="submit" 
                  className="absolute right-2 rounded-full h-8 w-8 p-0"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>
            </form>
          </div>

          {/* Tabs */}
          <ScrollArea className="w-full mt-4">
            <div className="flex gap-1">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "gap-2 rounded-full whitespace-nowrap",
                    activeTab === tab.id && tab.id === 'ai' && "bg-gradient-to-r from-primary to-accent"
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Results Content */}
      <div className="container mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* All Results */}
              {activeTab === 'all' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main Results */}
                  <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Top Search Results
                    </h2>
                    {webResults.map((result, index) => (
                      <ResultCard key={index} result={result} index={index} />
                    ))}
                  </div>

                  {/* AI Summary Sidebar */}
                  <div className="space-y-4">
                    <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-primary" />
                          AI Overview
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {aiReview.loading ? (
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <Skeleton className="h-4 w-4/6" />
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <p className="text-sm text-foreground/80">{aiReview.summary}</p>
                            {aiReview.keyPoints.length > 0 && (
                              <div className="space-y-1">
                                {aiReview.keyPoints.map((point, i) => (
                                  <div key={i} className="flex items-start gap-2 text-sm">
                                    <span className="text-primary">•</span>
                                    <span>{point}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            <Badge variant="secondary" className="text-xs">
                              Powered by Bytez AI
                            </Badge>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Quick Links */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Related Searches</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {[`${initialQuery} tutorial`, `${initialQuery} examples`, `best ${initialQuery}`].map((rel, i) => (
                          <Button
                            key={i}
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-sm"
                            onClick={() => {
                              setQuery(rel);
                              navigate(`/search-results?q=${encodeURIComponent(rel)}`);
                              performSearch(rel);
                            }}
                          >
                            <Search className="h-3 w-3 mr-2" />
                            {rel}
                          </Button>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Images Tab */}
              {activeTab === 'images' && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Image className="h-5 w-5 text-primary" />
                    Images
                  </h2>
                  {imageResults.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {imageResults.map((img, index) => (
                        <motion.a
                          key={index}
                          href={img.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="group relative aspect-square rounded-xl overflow-hidden bg-muted"
                        >
                          {img.thumbnail ? (
                            <img
                              src={img.thumbnail}
                              alt={img.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Image className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                            <p className="text-white text-xs truncate">{img.title}</p>
                          </div>
                        </motion.a>
                      ))}
                    </div>
                  ) : (
                    <Card className="p-8 text-center">
                      <Image className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No images found</p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => window.open(`https://images.google.com/search?q=${encodeURIComponent(initialQuery)}`, '_blank')}
                      >
                        Search on Google Images
                      </Button>
                    </Card>
                  )}
                </div>
              )}

              {/* Videos Tab */}
              {activeTab === 'videos' && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Video className="h-5 w-5 text-primary" />
                    Videos
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {videoResults.map((video, index) => (
                      <motion.a
                        key={index}
                        href={video.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group"
                      >
                        <Card className="overflow-hidden hover:border-primary/50 transition-colors">
                          <div className="aspect-video bg-gradient-to-br from-red-500/20 to-red-600/20 flex items-center justify-center relative">
                            <Play className="h-12 w-12 text-red-500 group-hover:scale-110 transition-transform" />
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-medium truncate group-hover:text-primary transition-colors">
                              {video.title}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">{video.displayLink}</p>
                          </CardContent>
                        </Card>
                      </motion.a>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(initialQuery)}`, '_blank')}
                  >
                    View more on YouTube
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}

              {/* Maps Tab */}
              {activeTab === 'maps' && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Map className="h-5 w-5 text-primary" />
                    Maps
                  </h2>
                  <Card className="overflow-hidden">
                    <div className="aspect-video bg-muted relative">
                      <iframe
                        src={`https://www.google.com/maps/embed/v1/search?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(initialQuery)}`}
                        className="w-full h-full border-0"
                        allowFullScreen
                        loading="lazy"
                        title="Map results"
                      />
                    </div>
                    <CardContent className="p-4">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(initialQuery)}`, '_blank')}
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        Open in Google Maps
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* News Tab */}
              {activeTab === 'news' && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Newspaper className="h-5 w-5 text-primary" />
                    News
                  </h2>
                  <div className="grid gap-4">
                    {webResults.filter(r => 
                      r.displayLink?.includes('news') || 
                      r.displayLink?.includes('bbc') || 
                      r.displayLink?.includes('cnn') ||
                      r.displayLink?.includes('times')
                    ).length > 0 ? (
                      webResults.filter(r => 
                        r.displayLink?.includes('news') || 
                        r.displayLink?.includes('bbc') || 
                        r.displayLink?.includes('cnn') ||
                        r.displayLink?.includes('times')
                      ).map((news, index) => (
                        <ResultCard key={index} result={news} index={index} />
                      ))
                    ) : (
                      <>
                        <Card className="p-4">
                          <p className="text-sm text-muted-foreground mb-4">Browse news from these sources:</p>
                          <div className="flex flex-wrap gap-2">
                            {[
                              { name: 'Google News', url: `https://news.google.com/search?q=${encodeURIComponent(initialQuery)}` },
                              { name: 'BBC', url: `https://www.bbc.co.uk/search?q=${encodeURIComponent(initialQuery)}` },
                              { name: 'CNN', url: `https://www.cnn.com/search?q=${encodeURIComponent(initialQuery)}` },
                            ].map((source) => (
                              <Button
                                key={source.name}
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(source.url, '_blank')}
                              >
                                {source.name}
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </Button>
                            ))}
                          </div>
                        </Card>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Shopping Tab */}
              {activeTab === 'shopping' && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                    Shopping
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[
                      { name: 'Amazon', url: `https://www.amazon.com/s?k=${encodeURIComponent(initialQuery)}`, color: 'from-orange-500/20 to-yellow-500/20' },
                      { name: 'eBay', url: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(initialQuery)}`, color: 'from-blue-500/20 to-red-500/20' },
                      { name: 'Google Shopping', url: `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(initialQuery)}`, color: 'from-blue-500/20 to-green-500/20' },
                      { name: 'Flipkart', url: `https://www.flipkart.com/search?q=${encodeURIComponent(initialQuery)}`, color: 'from-yellow-500/20 to-blue-500/20' },
                    ].map((store) => (
                      <motion.a
                        key={store.name}
                        href={store.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.02 }}
                        className="block"
                      >
                        <Card className="p-6 text-center hover:border-primary/50 transition-colors">
                          <div className={cn("w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br flex items-center justify-center", store.color)}>
                            <Store className="h-6 w-6" />
                          </div>
                          <h3 className="font-medium">{store.name}</h3>
                          <p className="text-xs text-muted-foreground mt-1">Shop now</p>
                        </Card>
                      </motion.a>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Review Tab */}
              {activeTab === 'ai' && (
                <div className="max-w-3xl mx-auto space-y-6">
                  <Card className="bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent">
                          <Sparkles className="h-6 w-6 text-white" />
                        </div>
                        AI Search Review
                        <Badge variant="secondary">Powered by Bytez AI</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {aiReview.loading ? (
                        <div className="space-y-4">
                          <Skeleton className="h-6 w-full" />
                          <Skeleton className="h-6 w-5/6" />
                          <Skeleton className="h-6 w-4/6" />
                          <Skeleton className="h-6 w-full" />
                        </div>
                      ) : (
                        <>
                          <div>
                            <h3 className="font-semibold mb-2 text-lg">Summary</h3>
                            <p className="text-foreground/80 leading-relaxed">{aiReview.summary}</p>
                          </div>

                          {aiReview.keyPoints.length > 0 && (
                            <div>
                              <h3 className="font-semibold mb-3">Key Points</h3>
                              <ul className="space-y-2">
                                {aiReview.keyPoints.map((point, i) => (
                                  <motion.li
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-start gap-3"
                                  >
                                    <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm flex-shrink-0">
                                      {i + 1}
                                    </span>
                                    <span>{point}</span>
                                  </motion.li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="pt-4 border-t border-border/50">
                            <p className="text-xs text-muted-foreground flex items-center gap-2">
                              <Clock className="h-3 w-3" />
                              AI-generated summary based on your search query
                            </p>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate(`/bytez-ai?q=${encodeURIComponent(initialQuery)}`)}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Continue conversation with Bytez AI
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ResultCard({ result, index }: { result: SearchResult; index: number }) {
  return (
    <motion.a
      href={result.link}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="block group"
    >
      <Card className="p-4 hover:border-primary/50 hover:bg-muted/30 transition-all">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <Globe className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-primary truncate group-hover:underline">
                {result.title}
              </h3>
              <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-xs text-muted-foreground">{result.displayLink}</p>
            <p className="text-sm text-foreground/70 mt-1 line-clamp-2">{result.snippet}</p>
          </div>
        </div>
      </Card>
    </motion.a>
  );
}
