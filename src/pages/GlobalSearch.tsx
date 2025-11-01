import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, FileText, Calendar, Music, Loader2 } from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'blog' | 'material' | 'task' | 'note';
  title: string;
  description: string;
  metadata?: any;
  url: string;
}

const GlobalSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (searchTerm.length > 2) {
      performSearch();
    } else {
      setResults([]);
    }
  }, [searchTerm]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const searchResults: SearchResult[] = [];

      // Search Blogs
      const { data: blogs, error: blogsError } = await supabase
        .from('blogs')
        .select('*')
        .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
        .limit(10);

      if (!blogsError && blogs) {
        blogs.forEach(blog => {
          searchResults.push({
            id: blog.id,
            type: 'blog',
            title: blog.title,
            description: blog.content.substring(0, 150) + '...',
            metadata: { tags: blog.tags, created_at: blog.created_at },
            url: `/niranx/blogs/${blog.id}`
          });
        });
      }

      // Search Study Materials (only user's own materials)
      if (user) {
        const { data: materials, error: materialsError } = await supabase
          .from('study_materials')
          .select('*')
          .eq('user_id', user.id)
          .or(`name.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
          .limit(10);

        if (!materialsError && materials) {
          materials.forEach(material => {
            searchResults.push({
              id: material.id,
              type: 'material',
              title: material.name,
              description: `${material.type} - ${material.category || 'Uncategorized'}`,
              metadata: { type: material.type, size: material.size },
              url: material.url
            });
          });
        }
      }

      // Search Tasks
      if (user) {
        const { data: tasks, error: tasksError } = await supabase
          .from('schedule_tasks')
          .select('*')
          .eq('user_id', user.id)
          .or(`task_name.ilike.%${searchTerm}%,subject.ilike.%${searchTerm}%,topic.ilike.%${searchTerm}%`)
          .limit(10);

        if (!tasksError && tasks) {
          tasks.forEach(task => {
            searchResults.push({
              id: task.id,
              type: 'task',
              title: task.task_name,
              description: `${task.subject} - ${task.topic || 'No topic'}`,
              metadata: { day: task.day_of_week, status: task.status },
              url: '/niranx/scheduler'
            });
          });
        }
      }

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to perform search",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'blog': return <BookOpen className="w-4 h-4" />;
      case 'material': return <FileText className="w-4 h-4" />;
      case 'task': return <Calendar className="w-4 h-4" />;
      case 'note': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const filteredResults = activeTab === 'all' 
    ? results 
    : results.filter(r => r.type === activeTab);

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'material') {
      window.open(result.url, '_blank');
    } else {
      navigate(result.url);
    }
  };

  return (
    <div className="min-h-screen p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Search className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Global Search</h1>
        </div>
        <p className="text-muted-foreground">
          Search across blogs, study materials, tasks, and more
        </p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search for anything..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 text-lg"
              autoFocus
            />
            {loading && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary animate-spin" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {searchTerm.length > 2 && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">
              All ({results.length})
            </TabsTrigger>
            <TabsTrigger value="blog">
              Blogs ({results.filter(r => r.type === 'blog').length})
            </TabsTrigger>
            <TabsTrigger value="material">
              Materials ({results.filter(r => r.type === 'material').length})
            </TabsTrigger>
            <TabsTrigger value="task">
              Tasks ({results.filter(r => r.type === 'task').length})
            </TabsTrigger>
            <TabsTrigger value="note">
              Notes ({results.filter(r => r.type === 'note').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4 mt-6">
            {filteredResults.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {loading ? 'Searching...' : 'No results found. Try different keywords.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredResults.map((result) => (
                <Card
                  key={`${result.type}-${result.id}`}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleResultClick(result)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      {getTypeIcon(result.type)}
                      <span className="flex-1">{result.title}</span>
                      <Badge variant="outline" className="capitalize">
                        {result.type}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{result.description}</p>
                    
                    {result.metadata && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {result.metadata.tags && result.metadata.tags.map((tag: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {result.metadata.created_at && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(result.metadata.created_at).toLocaleDateString()}
                          </span>
                        )}
                        {result.metadata.status && (
                          <Badge variant="outline" className="text-xs capitalize">
                            {result.metadata.status}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      )}

      {searchTerm.length > 0 && searchTerm.length <= 2 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Type at least 3 characters to search</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GlobalSearch;
