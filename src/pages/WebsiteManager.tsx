import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Globe, Trash2, ExternalLink, Plus } from 'lucide-react';
import { z } from 'zod';

const websiteSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  url: z.string().url("Invalid URL"),
  description: z.string().max(500).optional(),
  category: z.string().max(50).optional(),
});

interface Website {
  id: string;
  title: string;
  url: string;
  description: string | null;
  category: string | null;
  added_by: string | null;
  created_at: string;
}

const WebsiteManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    category: ''
  });

  useEffect(() => {
    fetchWebsites();
  }, []);

  const fetchWebsites = async () => {
    try {
      const { data, error } = await supabase
        .from('link_archive')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWebsites(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);

    try {
      const validated = websiteSchema.parse(formData);

      const { error } = await supabase
        .from('link_archive')
        .insert([{
          title: validated.title,
          url: validated.url,
          description: validated.description || null,
          category: validated.category || null,
          added_by: user?.id,
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Website added successfully!",
      });

      setFormData({ title: '', url: '', description: '', category: '' });
      setShowForm(false);
      fetchWebsites();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add website",
        variant: "destructive",
      });
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('link_archive')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Website removed successfully!",
      });

      fetchWebsites();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 animate-fade-in">
      {/* Header with 3D effect */}
      <div className="card-3d">
        <Card className="glass-card border-2 border-primary/20 shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <CardTitle className="text-3xl font-bold gradient-text flex items-center gap-3">
                  <Globe className="w-8 h-8 animate-pulse-scale" />
                  External Website Manager
                </CardTitle>
                <CardDescription className="text-lg">
                  Share useful websites with the entire community
                </CardDescription>
              </div>
              <Button
                onClick={() => setShowForm(!showForm)}
                className="btn-3d hover-lift"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Website
              </Button>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Add Website Form */}
      {showForm && (
        <Card className="glass-card border-primary/30 transform-3d animate-scale-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Add New Website
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Khan Academy"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="backdrop-blur-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="url">URL *</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  required
                  className="backdrop-blur-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="e.g., Education, Tools, Reference"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="backdrop-blur-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Brief description of the website"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="backdrop-blur-sm"
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={adding} className="flex-1 btn-3d">
                  {adding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Website
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Websites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {websites.map((website) => (
          <Card 
            key={website.id} 
            className="widget hover-lift card-3d group relative overflow-hidden"
          >
            {/* 3D Background effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <CardHeader className="relative z-10">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2 gradient-text">
                    {website.title}
                  </CardTitle>
                  {website.category && (
                    <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary border border-primary/20">
                      {website.category}
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(website.id)}
                  className="hover:bg-destructive/20 hover:text-destructive transform hover:scale-110 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="relative z-10 space-y-4">
              {website.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {website.description}
                </p>
              )}
              
              <Button
                asChild
                className="w-full btn-3d group/btn"
              >
                <a
                  href={website.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  Visit Website
                  <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </a>
              </Button>
              
              <p className="text-xs text-muted-foreground text-center">
                Added {new Date(website.created_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {websites.length === 0 && (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Globe className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
            <p className="text-lg text-muted-foreground">No websites added yet</p>
            <p className="text-sm text-muted-foreground">Be the first to share a useful website!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WebsiteManager;
