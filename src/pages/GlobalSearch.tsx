import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, Loader2, Globe, ExternalLink, Calendar } from 'lucide-react';

interface BlogResult {
  id: string;
  title: string;
  content: string;
  tags: string[] | null;
  created_at: string;
  cover_image_url: string | null;
  created_by: string;
}

interface WebResult {
  title: string;
  url: string;
  snippet: string;
}

const GlobalSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [blogResults, setBlogResults] = useState<BlogResult[]>([]);
  const [webResults, setWebResults] = useState<WebResult[]>([]);
  const [activeTab, setActiveTab] = useState<'site' | 'web'>('site');
  const { toast } = useToast();
  const navigate = useNavigate();

  const searchBlogs = async () => {
    if (searchTerm.length < 2) {
      setBlogResults([]);
      return;
    }

    setLoading(true);
    try {
      const { data: blogs, error } = await supabase
        .from('blogs')
        .select('*')
        .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      setBlogResults(blogs || []);
    } catch (error: any) {
      console.error('Blog search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to search blogs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const searchWeb = async () => {
    if (searchTerm.length < 2) {
      setWebResults([]);
      return;
    }

    setLoading(true);
    try {
      const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`;
      
      const simulatedResults: WebResult[] = [
        {
          title: `Search Google for "${searchTerm}"`,
          url: googleSearchUrl,
          snippet: `Click to search Google for "${searchTerm}". For real-time web results, configure the Google Custom Search API.`
        }
      ];

      setWebResults(simulatedResults);

      toast({
        title: "Web Search",
        description: "Click the result to search on Google",
      });
    } catch (error: any) {
      console.error('Web search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to perform web search",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'site') {
      searchBlogs();
    } else {
      searchWeb();
    }
  };

  const handleBlogClick = (blogId: string) => {
    navigate(`/niranx/blogs/${blogId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-7xl space-y-8">
        {/* Hero Header */}
        <div className="text-center space-y-4 py-12">
          <div className="flex justify-center items-center gap-4 mb-6">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center animate-pulse-scale">
              <Search className="w-10 h-10 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-6xl font-bold gradient-text neon-glow">Global Search</h1>
          <p className="text-2xl text-muted-foreground max-w-2xl mx-auto">
            Search across the web and discover content from our blog library
          </p>
        </div>

        {/* Search Tabs */}
        <Card className="glass-card shadow-2xl">
          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'site' | 'web')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-16 mb-8">
                <TabsTrigger value="site" className="text-lg">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Site Blogs
                </TabsTrigger>
                <TabsTrigger value="web" className="text-lg">
                  <Globe className="w-5 h-5 mr-2" />
                  Web Search
                </TabsTrigger>
              </TabsList>

              {/* Search Form */}
              <form onSubmit={handleSearch} className="mb-8">
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-muted-foreground w-6 h-6" />
                    <Input
                      type="text"
                      placeholder={activeTab === 'site' ? "Search blogs by title or content..." : "Search the web..."}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-16 h-16 text-xl backdrop-blur-sm"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="h-16 px-8 text-lg"
                    disabled={loading || searchTerm.length < 2}
                  >
                    {loading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <Search className="w-5 h-5 mr-2" />
                        Search
                      </>
                    )}
                  </Button>
                </div>
              </form>

              {/* Site Search Results */}
              <TabsContent value="site" className="space-y-4">
                {loading ? (
                  <div className="text-center py-20">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
                    <p className="text-muted-foreground mt-4 text-lg">Searching blogs...</p>
                  </div>
                ) : blogResults.length > 0 ? (
                  <>
                    <div className="mb-6">
                      <p className="text-lg text-muted-foreground">
                        Found <span className="font-bold text-primary">{blogResults.length}</span> blog posts
                      </p>
                    </div>
                    <div className="space-y-4">
                      {blogResults.map((blog) => (
                        <Card
                          key={blog.id}
                          className="glass-card hover-lift cursor-pointer transition-all"
                          onClick={() => handleBlogClick(blog.id)}
                        >
                          <CardHeader>
                            <div className="flex items-start gap-4">
                              {blog.cover_image_url && (
                                <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
                                  <img
                                    src={blog.cover_image_url}
                                    alt={blog.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-2xl mb-2 hover:text-primary transition-colors">
                                  {blog.title}
                                </CardTitle>
                                <CardDescription className="text-base line-clamp-3">
                                  {blog.content.substring(0, 250)}...
                                </CardDescription>
                                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {formatDate(blog.created_at)}
                                  </span>
                                  {blog.tags && blog.tags.length > 0 && (
                                    <div className="flex gap-2 flex-wrap">
                                      {blog.tags.map((tag, idx) => (
                                        <Badge key={idx} variant="secondary">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  </>
                ) : searchTerm.length > 0 ? (
                  <div className="text-center py-20">
                    <BookOpen className="w-20 h-20 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-2xl font-semibold mb-2">No blogs found</h3>
                    <p className="text-muted-foreground text-lg">
                      Try different keywords or check the web search
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <Search className="w-20 h-20 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-2xl font-semibold mb-2">Start searching</h3>
                    <p className="text-muted-foreground text-lg">
                      Enter at least 2 characters to search our blog library
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* Web Search Results */}
              <TabsContent value="web" className="space-y-4">
                {loading ? (
                  <div className="text-center py-20">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
                    <p className="text-muted-foreground mt-4 text-lg">Searching the web...</p>
                  </div>
                ) : webResults.length > 0 ? (
                  <>
                    <div className="mb-6">
                      <p className="text-lg text-muted-foreground">
                        Web search results for "<span className="font-bold text-primary">{searchTerm}</span>"
                      </p>
                    </div>
                    <div className="space-y-4">
                      {webResults.map((result, idx) => (
                        <Card
                          key={idx}
                          className="glass-card hover-lift cursor-pointer transition-all"
                          onClick={() => window.open(result.url, '_blank')}
                        >
                          <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-2xl mb-2 flex items-center gap-2 hover:text-primary transition-colors">
                                  <Globe className="w-6 h-6 flex-shrink-0" />
                                  {result.title}
                                </CardTitle>
                                <CardDescription className="text-base mb-3">
                                  {result.snippet}
                                </CardDescription>
                                <div className="flex items-center gap-2 text-sm text-primary">
                                  <ExternalLink className="w-4 h-4" />
                                  <span className="truncate">{result.url}</span>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  </>
                ) : searchTerm.length > 0 ? (
                  <div className="text-center py-20">
                    <Globe className="w-20 h-20 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-2xl font-semibold mb-2">No results found</h3>
                    <p className="text-muted-foreground text-lg">
                      Try different keywords or search terms
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <Search className="w-20 h-20 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-2xl font-semibold mb-2">Search the web</h3>
                    <p className="text-muted-foreground text-lg">
                      Enter at least 2 characters to search across the internet
                    </p>
                    <div className="mt-8 p-6 bg-primary/10 rounded-lg max-w-2xl mx-auto">
                      <p className="text-sm text-muted-foreground">
                        <strong>Note:</strong> Web search will redirect you to Google. For integrated web results, 
                        configure the Google Custom Search API in your Supabase Edge Function Secrets.
                      </p>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GlobalSearch;
