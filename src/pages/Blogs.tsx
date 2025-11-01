import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Plus, Calendar, User, FileText, Upload, Image, Search } from 'lucide-react';

interface Blog {
  id: string;
  title: string;
  content: string;
  cover_image_url?: string;
  tags: string[];
  created_at: string;
  created_by: string;
  publisher_name?: string;
  publisher_id?: string;
}

const Blogs = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<"all" | "my">("all");
  const [newBlog, setNewBlog] = useState({
    title: '',
    content: '',
    cover_image_url: '',
    tags: ''
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBlogs(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load blogs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBlog = async () => {
    if (!newBlog.title || !newBlog.content) {
      toast({
        title: "Error",
        description: "Title and content are required",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get publisher info
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('user_id', user.id)
        .single();

      const { data, error } = await supabase
        .from('blogs')
        .insert({
          title: newBlog.title,
          content: newBlog.content,
          cover_image_url: newBlog.cover_image_url || null,
          tags: newBlog.tags ? newBlog.tags.split(',').map(t => t.trim()) : [],
          created_by: user.id,
          publisher_id: user.id,
          publisher_name: profile?.username || 'Anonymous',
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Blog created successfully"
      });

      setNewBlog({ title: '', content: '', cover_image_url: '', tags: '' });
      fetchBlogs();
      navigate(`/niranx/blogs/${data.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create blog",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteBlog = async (blogId: string) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;
    
    try {
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', blogId);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Blog deleted successfully"
      });

      fetchBlogs();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete blog",
        variant: "destructive"
      });
    }
  };

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getUserId();
  }, []);

  const filteredBlogs = blogs.filter(blog => {
    const matchesView = view === "all" || (currentUserId && blog.created_by === currentUserId);
    
    const matchesSearch = 
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (blog.tags && blog.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    return matchesView && matchesSearch;
  });

  return (
    <div className="min-h-screen p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Blogs</h1>
            <p className="text-muted-foreground">Share and collaborate on blog posts</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant={view === "all" ? "default" : "outline"} onClick={() => setView("all")}>
            All Blogs
          </Button>
          <Button variant={view === "my" ? "default" : "outline"} onClick={() => setView("my")}>
            My Blogs
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Blog
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Blog</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  placeholder="Enter blog title..."
                  value={newBlog.title}
                  onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
                />
              </div>

              <div>
                <Label>Cover Image URL (optional)</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={newBlog.cover_image_url}
                    onChange={(e) => setNewBlog({ ...newBlog, cover_image_url: e.target.value })}
                  />
                  <Button variant="outline" size="icon">
                    <Image className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label>Content</Label>
                <Textarea
                  placeholder="Write your blog content..."
                  value={newBlog.content}
                  onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
                  rows={10}
                />
              </div>

              <div>
                <Label>Tags (comma-separated)</Label>
                <Input
                  placeholder="technology, education, study tips"
                  value={newBlog.tags}
                  onChange={(e) => setNewBlog({ ...newBlog, tags: e.target.value })}
                />
              </div>

              <Button
                onClick={handleCreateBlog}
                disabled={isCreating}
                className="w-full"
              >
                {isCreating ? 'Creating...' : 'Create Blog'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search blogs by title, content, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Blogs Grid */}
      {loading ? (
        <div className="text-center py-8">Loading blogs...</div>
      ) : filteredBlogs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? 'No blogs found matching your search.' : 'No blogs yet. Create the first one!'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map((blog) => (
            <Card
              key={blog.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/niranx/blogs/${blog.id}`)}
            >
              {blog.cover_image_url && (
                <div className="h-48 overflow-hidden rounded-t-lg">
                  <img
                    src={blog.cover_image_url}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle className="line-clamp-2">{blog.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground line-clamp-3">
                  {blog.content.substring(0, 150)}...
                </p>
                
                {blog.tags && blog.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {blog.tags.slice(0, 3).map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(blog.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                {blog.publisher_name && (
                  <div className="text-xs text-muted-foreground mt-2">
                    By: {blog.publisher_name}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Blogs;
