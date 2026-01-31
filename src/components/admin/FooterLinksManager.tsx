import { useEffect, useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Trash2, GripVertical, ExternalLink, Pencil, Loader2, Link as LinkIcon } from 'lucide-react';

interface FooterLink {
  id: string;
  title: string;
  url: string;
  category: string;
  icon: string | null;
  display_order: number;
  is_active: boolean;
}

const categories = [
  { value: 'company', label: 'Company' },
  { value: 'support', label: 'Support' },
  { value: 'legal', label: 'Legal' },
  { value: 'social', label: 'Social' },
  { value: 'general', label: 'General' },
];

const commonIcons = [
  'Shield', 'FileText', 'HelpCircle', 'Mail', 'Info', 'Briefcase',
  'Github', 'Twitter', 'MessageCircle', 'Youtube', 'Instagram', 'Linkedin',
  'Facebook', 'Globe', 'Phone', 'MapPin', 'Book', 'Users', 'Heart', 'Star'
];

export function FooterLinksManager() {
  const { user } = useAuth();
  const [links, setLinks] = useState<FooterLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingLink, setEditingLink] = useState<FooterLink | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    category: 'general',
    icon: '',
    is_active: true,
  });

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    const { data, error } = await supabase
      .from('niranx_footer_links')
      .select('*')
      .order('category')
      .order('display_order');

    if (error) {
      toast.error('Failed to load footer links');
      return;
    }

    setLinks(data || []);
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.url) {
      toast.error('Title and URL are required');
      return;
    }

    setIsSaving(true);

    try {
      if (editingLink) {
        const { error } = await supabase
          .from('niranx_footer_links')
          .update({
            title: formData.title,
            url: formData.url,
            category: formData.category,
            icon: formData.icon || null,
            is_active: formData.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingLink.id);

        if (error) throw error;
        toast.success('Link updated successfully');
      } else {
        const maxOrder = Math.max(...links.filter(l => l.category === formData.category).map(l => l.display_order), 0);
        
        const { error } = await supabase
          .from('niranx_footer_links')
          .insert({
            title: formData.title,
            url: formData.url,
            category: formData.category,
            icon: formData.icon || null,
            is_active: formData.is_active,
            display_order: maxOrder + 1,
            created_by: user?.id,
          });

        if (error) throw error;
        toast.success('Link added successfully');
      }

      setIsDialogOpen(false);
      setEditingLink(null);
      setFormData({ title: '', url: '', category: 'general', icon: '', is_active: true });
      fetchLinks();
    } catch (error) {
      toast.error('Failed to save link');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('niranx_footer_links')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete link');
      return;
    }

    toast.success('Link deleted');
    fetchLinks();
  };

  const handleReorder = async (category: string, newOrder: FooterLink[]) => {
    const categoryLinks = newOrder.filter(l => l.category === category);
    setLinks(prev => [
      ...prev.filter(l => l.category !== category),
      ...categoryLinks,
    ]);

    for (let i = 0; i < categoryLinks.length; i++) {
      await supabase
        .from('niranx_footer_links')
        .update({ display_order: i + 1 })
        .eq('id', categoryLinks[i].id);
    }
  };

  const openEditDialog = (link: FooterLink) => {
    setEditingLink(link);
    setFormData({
      title: link.title,
      url: link.url,
      category: link.category,
      icon: link.icon || '',
      is_active: link.is_active,
    });
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingLink(null);
    setFormData({ title: '', url: '', category: 'general', icon: '', is_active: true });
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const groupedLinks = links.reduce((acc: Record<string, FooterLink[]>, link) => {
    if (!acc[link.category]) acc[link.category] = [];
    acc[link.category].push(link);
    return acc;
  }, {});

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5" />
              Footer Links Manager
            </CardTitle>
            <CardDescription>Manage footer links displayed on the landing page</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Add Link
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingLink ? 'Edit Link' : 'Add New Link'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={formData.title}
                    onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
                    placeholder="e.g., Privacy Policy"
                  />
                </div>

                <div className="space-y-2">
                  <Label>URL</Label>
                  <Input
                    value={formData.url}
                    onChange={e => setFormData(f => ({ ...f, url: e.target.value }))}
                    placeholder="e.g., /privacy or https://..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={value => setFormData(f => ({ ...f, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Icon (Lucide icon name)</Label>
                  <Select
                    value={formData.icon}
                    onValueChange={value => setFormData(f => ({ ...f, icon: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an icon" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No icon</SelectItem>
                      {commonIcons.map(icon => (
                        <SelectItem key={icon} value={icon}>
                          {icon}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  {editingLink ? 'Update Link' : 'Add Link'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {categories.map(category => {
            const categoryLinks = groupedLinks[category.value] || [];
            if (categoryLinks.length === 0) return null;

            return (
              <div key={category.value} className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                  {category.label}
                </h4>
                <Reorder.Group
                  axis="y"
                  values={categoryLinks}
                  onReorder={(newOrder) => handleReorder(category.value, newOrder)}
                  className="space-y-2"
                >
                  {categoryLinks.map(link => (
                    <Reorder.Item
                      key={link.id}
                      value={link}
                      className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg cursor-grab active:cursor-grabbing"
                    >
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{link.title}</p>
                        <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                          {link.url.startsWith('http') && <ExternalLink className="w-3 h-3" />}
                          {link.url}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${link.is_active ? 'bg-green-500' : 'bg-muted-foreground'}`} />
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(link)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(link.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
