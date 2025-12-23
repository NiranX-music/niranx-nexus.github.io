import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { XVibeLayout } from '../components/layout/XVibeLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, BookOpen, FileText, Eye, Edit3, Trash2, Clock, CheckCircle, 
  Send, Search, TrendingUp, BarChart3, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string | null;
  editorial_tag: string;
  status: string;
  view_count: number;
  like_count: number;
  published_at: string | null;
  created_at: string;
  song: { title: string; cover_url: string | null } | null;
}

interface EditorProfile {
  id: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  role: string;
  articles_published: number;
}

export default function XWaveEditorDashboard() {
  const navigate = useNavigate();
  const [editor, setEditor] = useState<EditorProfile | null>(null);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    checkEditorAccess();
  }, []);

  const checkEditorAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/xvibe/auth');
      return;
    }

    // Check editor profile
    const { data: editorData } = await supabase
      .from('xwave_editors')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (editorData) {
      setEditor(editorData);
      await fetchBlogs(editorData.id);
    } else {
      // Check if admin
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      const isAdmin = roles?.some(r => r.role === 'admin' || r.role === 'moderator');
      if (!isAdmin) {
        toast.error('Editor access required');
        navigate('/xvibe/home');
        return;
      }

      // Create editor profile
      const { data: newEditor } = await supabase
        .from('xwave_editors')
        .insert({
          user_id: user.id,
          name: user.email?.split('@')[0] || 'Editor',
          role: 'senior_editor'
        })
        .select()
        .single();

      if (newEditor) {
        setEditor(newEditor);
        await fetchBlogs(newEditor.id);
      }
    }

    setLoading(false);
  };

  const fetchBlogs = async (editorId: string) => {
    const { data } = await supabase
      .from('xwave_blog_posts')
      .select(`
        id, title, excerpt, editorial_tag, status, view_count, like_count, 
        published_at, created_at,
        xvibe_tracks(title, cover_url)
      `)
      .eq('editor_id', editorId)
      .order('created_at', { ascending: false });

    if (data) {
      setBlogs(data.map(b => ({
        ...b,
        song: (b as any).xvibe_tracks || null
      })));
    }
  };

  const handleDelete = async (blogId: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    await supabase.from('xwave_blog_posts').delete().eq('id', blogId);
    setBlogs(blogs.filter(b => b.id !== blogId));
    toast.success('Blog post deleted');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending_review': return <Clock className="w-4 h-4 text-yellow-400" />;
      default: return <FileText className="w-4 h-4 text-[#B3B3B3]" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string }> = {
      published: { bg: 'bg-green-500/20', text: 'text-green-400' },
      pending_review: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
      draft: { bg: 'bg-[#282828]', text: 'text-[#B3B3B3]' },
      archived: { bg: 'bg-red-500/20', text: 'text-red-400' }
    };
    const c = config[status] || config.draft;
    return <Badge className={`${c.bg} ${c.text} capitalize`}>{status.replace('_', ' ')}</Badge>;
  };

  const filteredBlogs = blogs.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && b.status === activeTab;
  });

  const stats = {
    total: blogs.length,
    published: blogs.filter(b => b.status === 'published').length,
    drafts: blogs.filter(b => b.status === 'draft').length,
    views: blogs.reduce((sum, b) => sum + b.view_count, 0)
  };

  if (loading) {
    return (
      <XVibeLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1DB954]" />
        </div>
      </XVibeLayout>
    );
  }

  return (
    <XVibeLayout>
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">XWave Editor</h1>
                <p className="text-[#B3B3B3]">Welcome back, {editor?.name}</p>
              </div>
            </div>
            <Button
              onClick={() => navigate('/xvibe/blog/new')}
              className="bg-[#1DB954] hover:bg-[#1ed760] text-black"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Blog Post
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-[#181818] border-none">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <FileText className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                    <p className="text-sm text-[#B3B3B3]">Total Posts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-[#181818] border-none">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.published}</p>
                    <p className="text-sm text-[#B3B3B3]">Published</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-[#181818] border-none">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-yellow-500/20">
                    <Edit3 className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.drafts}</p>
                    <p className="text-sm text-[#B3B3B3]">Drafts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-[#181818] border-none">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <Eye className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.views.toLocaleString()}</p>
                    <p className="text-sm text-[#B3B3B3]">Total Views</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Blog List */}
          <Card className="bg-[#181818] border-none">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle className="text-white">Your Blog Posts</CardTitle>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B3B3B3]" />
                  <Input
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-[#282828] border-none text-white"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-[#282828] mb-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="published">Published</TabsTrigger>
                  <TabsTrigger value="draft">Drafts</TabsTrigger>
                  <TabsTrigger value="pending_review">Pending</TabsTrigger>
                </TabsList>

                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {filteredBlogs.length === 0 ? (
                      <div className="text-center py-12">
                        <FileText className="w-16 h-16 text-[#B3B3B3] mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No posts yet</h3>
                        <p className="text-[#B3B3B3] mb-4">Start writing your first blog post</p>
                        <Button
                          onClick={() => navigate('/xvibe/blog/new')}
                          className="bg-[#1DB954] hover:bg-[#1ed760] text-black"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create Post
                        </Button>
                      </div>
                    ) : (
                      filteredBlogs.map((blog) => (
                        <div
                          key={blog.id}
                          className="flex items-center gap-4 p-4 bg-[#282828] rounded-lg hover:bg-[#383838] transition-colors group"
                        >
                          {/* Song Cover */}
                          <div className="w-16 h-16 rounded-lg bg-[#383838] overflow-hidden flex-shrink-0">
                            {blog.song?.cover_url ? (
                              <img src={blog.song.cover_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-[#B3B3B3]" />
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {getStatusIcon(blog.status)}
                              <h4 className="font-semibold text-white truncate">{blog.title}</h4>
                            </div>
                            <p className="text-sm text-[#B3B3B3] line-clamp-1">
                              {blog.excerpt || 'No excerpt'}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                              {getStatusBadge(blog.status)}
                              <Badge variant="outline" className="text-[#B3B3B3] capitalize text-xs">
                                {blog.editorial_tag.replace('_', ' ')}
                              </Badge>
                              {blog.song && (
                                <span className="text-xs text-[#B3B3B3]">
                                  📎 {blog.song.title}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="hidden md:flex items-center gap-4 text-sm text-[#B3B3B3]">
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {blog.view_count}
                            </span>
                            <span className="flex items-center gap-1">
                              ❤️ {blog.like_count}
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => navigate(`/xvibe/blog/${blog.id}`)}
                              className="text-white hover:bg-white/10"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDelete(blog.id)}
                              className="text-red-400 hover:bg-red-500/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </XVibeLayout>
  );
}