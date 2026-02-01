import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Trash2, Plus, GripVertical, Loader2, Save, ExternalLink, FileText, X } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface SidebarPage {
  id: string;
  group_id: string | null;
  title: string;
  url: string;
  icon: string | null;
  order_index: number;
  is_enabled: boolean;
}

interface SidebarGroupEditorProps {
  groupId: string;
  groupName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export function SidebarGroupEditor({ 
  groupId, 
  groupName, 
  open, 
  onOpenChange, 
  onUpdate 
}: SidebarGroupEditorProps) {
  const [pages, setPages] = useState<SidebarPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageUrl, setNewPageUrl] = useState('');
  const [newPageIcon, setNewPageIcon] = useState('FileText');

  useEffect(() => {
    if (open && groupId) {
      loadPages();
    }
  }, [open, groupId]);

  const loadPages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sidebar_pages')
        .select('*')
        .eq('group_id', groupId)
        .order('order_index');

      if (error) throw error;
      setPages(data || []);
    } catch (error) {
      console.error('Error loading pages:', error);
      toast.error('Failed to load pages');
    } finally {
      setLoading(false);
    }
  };

  const addPage = async () => {
    if (!newPageTitle.trim() || !newPageUrl.trim()) {
      toast.error('Title and URL are required');
      return;
    }

    setSaving(true);
    try {
      const maxOrder = Math.max(...pages.map(p => p.order_index), -1);
      
      const { error } = await supabase.from('sidebar_pages').insert({
        group_id: groupId,
        title: newPageTitle,
        url: newPageUrl,
        icon: newPageIcon || 'FileText',
        order_index: maxOrder + 1,
        is_enabled: true
      });

      if (error) throw error;
      
      toast.success('Page added');
      setNewPageTitle('');
      setNewPageUrl('');
      setNewPageIcon('FileText');
      loadPages();
      onUpdate();
    } catch (error) {
      console.error('Error adding page:', error);
      toast.error('Failed to add page');
    } finally {
      setSaving(false);
    }
  };

  const removePage = async (pageId: string) => {
    try {
      const { error } = await supabase
        .from('sidebar_pages')
        .delete()
        .eq('id', pageId);

      if (error) throw error;
      
      toast.success('Page removed');
      loadPages();
      onUpdate();
    } catch (error) {
      console.error('Error removing page:', error);
      toast.error('Failed to remove page');
    }
  };

  const togglePageEnabled = async (page: SidebarPage) => {
    try {
      const { error } = await supabase
        .from('sidebar_pages')
        .update({ is_enabled: !page.is_enabled })
        .eq('id', page.id);

      if (error) throw error;
      loadPages();
      onUpdate();
    } catch (error) {
      console.error('Error toggling page:', error);
    }
  };

  const updatePageOrder = async (pageId: string, direction: 'up' | 'down') => {
    const currentIndex = pages.findIndex(p => p.id === pageId);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= pages.length) return;

    try {
      const updates = [
        { id: pages[currentIndex].id, order_index: targetIndex },
        { id: pages[targetIndex].id, order_index: currentIndex }
      ];

      for (const update of updates) {
        await supabase
          .from('sidebar_pages')
          .update({ order_index: update.order_index })
          .eq('id', update.id);
      }
      
      loadPages();
      onUpdate();
    } catch (error) {
      console.error('Error reordering:', error);
    }
  };

  const getIcon = (iconName: string | null) => {
    if (!iconName) return FileText;
    const Icon = (LucideIcons as any)[iconName];
    return Icon || FileText;
  };

  const isExternalUrl = (url: string) => {
    return url.startsWith('http://') || url.startsWith('https://');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Edit Group: {groupName}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="flex-1 space-y-4 overflow-hidden">
            {/* Current Pages */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Pages in this group ({pages.length})
              </Label>
              <ScrollArea className="h-48 border rounded-lg">
                <div className="p-2 space-y-1">
                  {pages.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      No pages in this group
                    </div>
                  ) : (
                    pages.map((page, index) => {
                      const Icon = getIcon(page.icon);
                      return (
                        <div
                          key={page.id}
                          className="flex items-center gap-2 p-2 rounded-md border bg-card hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex flex-col">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-4 w-4"
                              onClick={() => updatePageOrder(page.id, 'up')}
                              disabled={index === 0}
                            >
                              <LucideIcons.ChevronUp className="h-3 w-3" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-4 w-4"
                              onClick={() => updatePageOrder(page.id, 'down')}
                              disabled={index === pages.length - 1}
                            >
                              <LucideIcons.ChevronDown className="h-3 w-3" />
                            </Button>
                          </div>
                          <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{page.title}</div>
                            <div className="text-xs text-muted-foreground truncate flex items-center gap-1">
                              {page.url}
                              {isExternalUrl(page.url) && (
                                <ExternalLink className="h-3 w-3" />
                              )}
                            </div>
                          </div>
                          <Switch
                            checked={page.is_enabled}
                            onCheckedChange={() => togglePageEnabled(page)}
                            className="scale-75"
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => removePage(page.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Add New Page */}
            <div className="border-t pt-4">
              <Label className="text-sm font-medium mb-2 block">Add New Page</Label>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Page Title"
                    value={newPageTitle}
                    onChange={(e) => setNewPageTitle(e.target.value)}
                  />
                  <Input
                    placeholder="Icon name (e.g., Home)"
                    value={newPageIcon}
                    onChange={(e) => setNewPageIcon(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="URL path (e.g., /dashboard or https://...)"
                    value={newPageUrl}
                    onChange={(e) => setNewPageUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={addPage} disabled={saving} size="sm">
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
