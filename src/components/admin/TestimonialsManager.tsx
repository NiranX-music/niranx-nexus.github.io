import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Trash2, Pencil, Loader2, MessageSquare, Star } from 'lucide-react';

interface Testimonial {
  id: string;
  author_name: string;
  author_title: string | null;
  author_avatar: string | null;
  content: string;
  rating: number;
  display_order: number;
  is_active: boolean;
}

export function TestimonialsManager() {
  const { user } = useAuth();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    author_name: '',
    author_title: '',
    author_avatar: '',
    content: '',
    rating: 5,
    is_active: true,
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    const { data, error } = await supabase
      .from('niranx_testimonials')
      .select('*')
      .order('display_order');

    if (error) {
      toast.error('Failed to load testimonials');
      return;
    }

    setTestimonials(data || []);
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!formData.author_name || !formData.content) {
      toast.error('Author name and content are required');
      return;
    }

    setIsSaving(true);

    try {
      if (editingTestimonial) {
        const { error } = await supabase
          .from('niranx_testimonials')
          .update({
            author_name: formData.author_name,
            author_title: formData.author_title || null,
            author_avatar: formData.author_avatar || null,
            content: formData.content,
            rating: formData.rating,
            is_active: formData.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingTestimonial.id);

        if (error) throw error;
        toast.success('Testimonial updated successfully');
      } else {
        const maxOrder = Math.max(...testimonials.map(t => t.display_order), 0);

        const { error } = await supabase
          .from('niranx_testimonials')
          .insert({
            author_name: formData.author_name,
            author_title: formData.author_title || null,
            author_avatar: formData.author_avatar || null,
            content: formData.content,
            rating: formData.rating,
            is_active: formData.is_active,
            display_order: maxOrder + 1,
            created_by: user?.id,
          });

        if (error) throw error;
        toast.success('Testimonial added successfully');
      }

      setIsDialogOpen(false);
      setEditingTestimonial(null);
      setFormData({ author_name: '', author_title: '', author_avatar: '', content: '', rating: 5, is_active: true });
      fetchTestimonials();
    } catch (error) {
      toast.error('Failed to save testimonial');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('niranx_testimonials')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete testimonial');
      return;
    }

    toast.success('Testimonial deleted');
    fetchTestimonials();
  };

  const openEditDialog = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      author_name: testimonial.author_name,
      author_title: testimonial.author_title || '',
      author_avatar: testimonial.author_avatar || '',
      content: testimonial.content,
      rating: testimonial.rating,
      is_active: testimonial.is_active,
    });
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingTestimonial(null);
    setFormData({ author_name: '', author_title: '', author_avatar: '', content: '', rating: 5, is_active: true });
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Testimonials Manager
            </CardTitle>
            <CardDescription>Manage testimonials displayed on the landing page</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Add Testimonial
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Author Name *</Label>
                  <Input
                    value={formData.author_name}
                    onChange={e => setFormData(f => ({ ...f, author_name: e.target.value }))}
                    placeholder="e.g., John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Author Title</Label>
                  <Input
                    value={formData.author_title}
                    onChange={e => setFormData(f => ({ ...f, author_title: e.target.value }))}
                    placeholder="e.g., Software Developer"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Avatar URL</Label>
                  <Input
                    value={formData.author_avatar}
                    onChange={e => setFormData(f => ({ ...f, author_avatar: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Content *</Label>
                  <Textarea
                    value={formData.content}
                    onChange={e => setFormData(f => ({ ...f, content: e.target.value }))}
                    placeholder="What they said about NiranX..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Rating</Label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData(f => ({ ...f, rating: star }))}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-6 h-6 transition-colors ${
                            star <= formData.rating
                              ? 'fill-warning text-warning'
                              : 'text-muted-foreground'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label>Active</Label>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={checked => setFormData(f => ({ ...f, is_active: checked }))}
                  />
                </div>

                <Button onClick={handleSave} disabled={isSaving} className="w-full">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {editingTestimonial ? 'Update Testimonial' : 'Add Testimonial'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {testimonials.map(testimonial => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-muted/50 rounded-lg"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold">
                    {testimonial.author_avatar ? (
                      <img
                        src={testimonial.author_avatar}
                        alt={testimonial.author_name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      testimonial.author_name.charAt(0)
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{testimonial.author_name}</p>
                    {testimonial.author_title && (
                      <p className="text-xs text-muted-foreground">{testimonial.author_title}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${testimonial.is_active ? 'bg-green-500' : 'bg-muted-foreground'}`} />
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(testimonial)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(testimonial.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">"{testimonial.content}"</p>
              <div className="flex items-center gap-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-warning text-warning" />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
