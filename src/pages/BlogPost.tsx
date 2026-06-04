import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Edit, Calendar, User, FileText, ScrollText, Upload, Trash2 } from 'lucide-react';
import { z } from 'zod';

interface Blog {
  id: string;
  title: string;
  content: string;
  cover_image_url?: string;
  tags: string[];
  created_at: string;
  created_by: string;
  attachments?: any;
  publisher_name?: string;
  publisher_id?: string;
}

interface EditHistory {
  id: string;
  edited_by: string;
  edited_at: string;
  previous_content: string;
  new_content: string;
}

const blogSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  content: z.string().trim().min(1, "Content is required").max(50000, "Content must be less than 50,000 characters"),
  cover_image_url: z.string().trim().url("Must be a valid URL").or(z.literal('')).optional(),
  tags: z.string().refine(
    (val) => {
      if (!val.trim()) return true;
      const tags = val.split(',').map(t => t.trim()).filter(Boolean);
      return tags.length <= 10 && tags.every(t => t.length <= 30);
    },
    { message: "Maximum 10 tags, each up to 30 characters" }
  )
});

const sanitizeContent = (content: string): string => {
  const dangerous = [/<script[^>]*>.*?<\/script>/gi, /javascript:/gi, /onerror\s*=/gi, /onclick\s*=/gi, /onload\s*=/gi];
  let sanitized = content;
  dangerous.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });
  return sanitized;
};

const BlogPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedBlog, setEditedBlog] = useState({
    title: '',
    content: '',
    cover_image_url: '',
    tags: ''
  });
  const [editHistory, setEditHistory] = useState<EditHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getUserId();
  }, []);

  useEffect(() => {
    if (id) {
      fetchBlog();
      fetchEditHistory();
    }
  }, [id]);

  const fetchBlog = async () => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setBlog(data);
      setEditedBlog({
        title: data.title,
        content: data.content,
        cover_image_url: data.cover_image_url || '',
        tags: data.tags?.join(', ') || ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load blog",
        variant: "destructive"
      });
      navigate('/niranx/blogs');
    } finally {
      setLoading(false);
    }
  };

  const fetchEditHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_edits')
        .select('*')
        .eq('blog_id', id)
        .order('edited_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setEditHistory(data || []);
    } catch (error) {
      console.error('Failed to load edit history:', error);
    }
  };

  const handleUpdateBlog = async () => {
    if (!blog) return;

    setIsEditing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Validate input
      const validation = blogSchema.safeParse({
        title: editedBlog.title,
        content: editedBlog.content,
        cover_image_url: editedBlog.cover_image_url,
        tags: editedBlog.tags
      });

      if (!validation.success) {
        toast({
          title: "Validation Error",
          description: validation.error.errors[0].message,
          variant: "destructive"
        });
        setIsEditing(false);
        return;
      }

      // Sanitize content
      const sanitizedContent = sanitizeContent(editedBlog.content);

      // Save to edit history
      await supabase
        .from('blog_edits')
        .insert({
          blog_id: blog.id,
          edited_by: user.id,
          previous_content: blog.content,
          new_content: sanitizedContent
        });

      // Update blog
      const { error } = await supabase
        .from('blogs')
        .update({
          title: editedBlog.title.trim(),
          content: sanitizedContent,
          cover_image_url: editedBlog.cover_image_url?.trim() || null,
          tags: editedBlog.tags ? editedBlog.tags.split(',').map(t => t.trim()).filter(Boolean) : []
        })
        .eq('id', blog.id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Blog updated successfully"
      });

      fetchBlog();
      fetchEditHistory();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update blog",
        variant: "destructive"
      });
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteBlog = async () => {
    if (!blog) return;
    if (!confirm("Are you sure you want to delete this blog?")) return;
    
    try {
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', blog.id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Blog deleted successfully"
      });

      navigate('/niranx/blogs');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete blog",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="min-h-screen p-4 flex items-center justify-center">Loading...</div>;
  }

  if (!blog) {
    return <div className="min-h-screen p-4 flex items-center justify-center">Blog not found</div>;
  }

  const isOwner = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id === blog.created_by;
  };

  return (
    <div className="min-h-screen p-4 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/niranx/blogs')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Blogs
        </Button>

        <div className="flex gap-2">
          {currentUserId === blog.created_by && (
            <Button variant="destructive" onClick={handleDeleteBlog}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          )}
          
          <Dialog open={showHistory} onOpenChange={setShowHistory}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <ScrollText className="w-4 h-4 mr-2" />
                History ({editHistory.length})
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit History</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {editHistory.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No edit history yet</p>
                ) : (
                  editHistory.map((edit) => (
                    <Card key={edit.id}>
                      <CardContent className="pt-4">
                        <div className="text-xs text-muted-foreground mb-2">
                          {new Date(edit.edited_at).toLocaleString()}
                        </div>
                        <div className="text-sm space-y-2">
                          <div>
                            <strong>Previous:</strong>
                            <p className="text-muted-foreground mt-1">{edit.previous_content.substring(0, 100)}...</p>
                          </div>
                          <div>
                            <strong>Updated:</strong>
                            <p className="text-muted-foreground mt-1">{edit.new_content.substring(0, 100)}...</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Edit className="w-4 h-4 mr-2" />
                Edit Blog
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Blog</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={editedBlog.title}
                    onChange={(e) => setEditedBlog({ ...editedBlog, title: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Cover Image URL</Label>
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={editedBlog.cover_image_url}
                    onChange={(e) => setEditedBlog({ ...editedBlog, cover_image_url: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Content</Label>
                  <Textarea
                    value={editedBlog.content}
                    onChange={(e) => setEditedBlog({ ...editedBlog, content: e.target.value })}
                    rows={10}
                  />
                </div>

                <div>
                  <Label>Tags (comma-separated)</Label>
                  <Input
                    value={editedBlog.tags}
                    onChange={(e) => setEditedBlog({ ...editedBlog, tags: e.target.value })}
                  />
                </div>

                <Button
                  onClick={handleUpdateBlog}
                  disabled={isEditing}
                  className="w-full"
                >
                  {isEditing ? 'Updating...' : 'Update Blog'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Blog Content */}
      <Card>
        {blog.cover_image_url && (
          <div className="h-64 overflow-hidden rounded-t-lg">
            <img
              src={blog.cover_image_url}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <CardHeader>
          <CardTitle className="text-3xl">{blog.title}</CardTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(blog.created_at).toLocaleDateString()}
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag, idx) => (
                <Badge key={idx} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="whitespace-pre-wrap">{blog.content}</p>
          </div>

          {blog.attachments && blog.attachments.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Attachments</h3>
              <div className="space-y-2">
                {blog.attachments.map((attachment: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 p-2 border rounded">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm">{attachment.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Publisher Name at Bottom */}
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <User className="w-4 h-4" />
              Published by: <span className="font-medium">{blog.publisher_name || 'Anonymous'}</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogPost;
