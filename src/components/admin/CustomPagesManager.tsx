import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Globe, Plus, Pencil, Trash2, Eye, Copy, 
  ExternalLink, Code, FileText, CheckCircle, XCircle, Loader2, Folder 
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CustomPage {
  id: string;
  title: string;
  slug: string;
  html_content: string;
  css_content: string | null;
  js_content: string | null;
  meta_description: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

interface SidebarGroup {
  id: string;
  name: string;
  icon: string | null;
  is_enabled: boolean;
}

export function CustomPagesManager() {
  const [pages, setPages] = useState<CustomPage[]>([]);
  const [sidebarGroups, setSidebarGroups] = useState<SidebarGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingPage, setEditingPage] = useState<CustomPage | null>(null);
  const [previewPage, setPreviewPage] = useState<CustomPage | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    html_content: '',
    css_content: '',
    js_content: '',
    meta_description: '',
    is_published: false,
    sidebar_group_id: '',
  });

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    setLoading(true);
    try {
      const [pagesRes, groupsRes] = await Promise.all([
        supabase
          .from('admin_custom_pages')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('sidebar_groups')
          .select('id, name, icon, is_enabled')
          .order('order_index')
      ]);

      if (pagesRes.error) throw pagesRes.error;
      if (groupsRes.error) throw groupsRes.error;
      
      setPages(pagesRes.data || []);
      setSidebarGroups(groupsRes.data || []);
    } catch (error: any) {
      console.error('Error loading pages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load custom pages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingPage(null);
    setFormData({
      title: '',
      slug: '',
      html_content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Title</title>
</head>
<body>
  <h1>Hello World</h1>
  <p>Your content here...</p>
</body>
</html>`,
      css_content: '',
      js_content: '',
      meta_description: '',
      is_published: false,
      sidebar_group_id: '',
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = async (page: CustomPage) => {
    setEditingPage(page);
    
    // Check if page is linked to a sidebar group
    const { data: sidebarPage } = await supabase
      .from('sidebar_pages')
      .select('group_id')
      .eq('url', `/p/${page.slug}`)
      .maybeSingle();
    
    setFormData({
      title: page.title,
      slug: page.slug,
      html_content: page.html_content,
      css_content: page.css_content || '',
      js_content: page.js_content || '',
      meta_description: page.meta_description || '',
      is_published: page.is_published,
      sidebar_group_id: sidebarPage?.group_id || '',
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.slug || !formData.html_content) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(formData.slug)) {
      toast({
        title: 'Invalid Slug',
        description: 'Slug can only contain lowercase letters, numbers, and hyphens',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const user = (await supabase.auth.getUser()).data.user;
      const pageUrl = `/p/${formData.slug}`;

      if (editingPage) {
        const { error } = await supabase
          .from('admin_custom_pages')
          .update({
            title: formData.title,
            slug: formData.slug,
            html_content: formData.html_content,
            css_content: formData.css_content || null,
            js_content: formData.js_content || null,
            meta_description: formData.meta_description || null,
            is_published: formData.is_published,
          })
          .eq('id', editingPage.id);

        if (error) throw error;
        
        // Update sidebar page linkage
        await updateSidebarLink(pageUrl, formData.title, formData.sidebar_group_id);
        
        toast({ title: 'Page updated successfully' });
      } else {
        const { error } = await supabase
          .from('admin_custom_pages')
          .insert({
            title: formData.title,
            slug: formData.slug,
            html_content: formData.html_content,
            css_content: formData.css_content || null,
            js_content: formData.js_content || null,
            meta_description: formData.meta_description || null,
            is_published: formData.is_published,
            created_by: user?.id,
          });

        if (error) throw error;
        
        // Add to sidebar if group selected
        if (formData.sidebar_group_id) {
          await addToSidebar(pageUrl, formData.title, formData.sidebar_group_id);
        }
        
        toast({ title: 'Page created successfully' });
      }

      setIsDialogOpen(false);
      loadPages();
    } catch (error: any) {
      console.error('Error saving page:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save page',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addToSidebar = async (url: string, title: string, groupId: string) => {
    try {
      // Get max order index for the group
      const { data: existingPages } = await supabase
        .from('sidebar_pages')
        .select('order_index')
        .eq('group_id', groupId)
        .order('order_index', { ascending: false })
        .limit(1);
      
      const maxOrder = existingPages?.[0]?.order_index ?? -1;
      
      await supabase.from('sidebar_pages').insert({
        group_id: groupId,
        title: title,
        url: url,
        icon: 'Globe',
        order_index: maxOrder + 1,
        is_enabled: true
      });
    } catch (error) {
      console.error('Error adding to sidebar:', error);
    }
  };

  const updateSidebarLink = async (url: string, title: string, groupId: string) => {
    try {
      // Check if page already exists in sidebar
      const { data: existing } = await supabase
        .from('sidebar_pages')
        .select('id, group_id')
        .eq('url', url)
        .maybeSingle();
      
      if (existing) {
        if (groupId) {
          // Update existing link
          await supabase
            .from('sidebar_pages')
            .update({ group_id: groupId, title: title })
            .eq('id', existing.id);
        } else {
          // Remove from sidebar if no group selected
          await supabase
            .from('sidebar_pages')
            .delete()
            .eq('id', existing.id);
        }
      } else if (groupId) {
        // Add new link
        await addToSidebar(url, title, groupId);
      }
    } catch (error) {
      console.error('Error updating sidebar link:', error);
    }
  };

  const handleDelete = async (page: CustomPage) => {
    if (!confirm(`Are you sure you want to delete "${page.title}"?`)) return;

    try {
      const { error } = await supabase
        .from('admin_custom_pages')
        .delete()
        .eq('id', page.id);

      if (error) throw error;
      toast({ title: 'Page deleted successfully' });
      loadPages();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to delete page',
        variant: 'destructive',
      });
    }
  };

  const togglePublish = async (page: CustomPage) => {
    try {
      const { error } = await supabase
        .from('admin_custom_pages')
        .update({ is_published: !page.is_published })
        .eq('id', page.id);

      if (error) throw error;
      toast({
        title: page.is_published ? 'Page unpublished' : 'Page published',
      });
      loadPages();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update page status',
        variant: 'destructive',
      });
    }
  };

  const copyUrl = (slug: string) => {
    const url = `${window.location.origin}/p/${slug}`;
    navigator.clipboard.writeText(url);
    toast({ title: 'URL copied to clipboard' });
  };

  const openPreview = (page: CustomPage) => {
    setPreviewPage(page);
    setIsPreviewOpen(true);
  };

  const getPreviewContent = () => {
    if (!previewPage) return '';
    let content = previewPage.html_content;
    
    if (previewPage.css_content) {
      content = content.replace('</head>', `<style>${previewPage.css_content}</style></head>`);
    }
    
    if (previewPage.js_content) {
      content = content.replace('</body>', `<script>${previewPage.js_content}</script></body>`);
    }
    
    return content;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Custom Pages
              </CardTitle>
              <CardDescription>
                Create and manage custom HTML pages with unique URLs
              </CardDescription>
            </div>
            <Button onClick={openCreateDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Page
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>URL Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                      Loading pages...
                    </TableCell>
                  </TableRow>
                ) : pages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No custom pages yet. Click "Create Page" to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  pages.map((page) => (
                    <TableRow key={page.id}>
                      <TableCell className="font-medium">{page.title}</TableCell>
                      <TableCell>
                        <code className="text-sm bg-muted px-2 py-1 rounded">/p/{page.slug}</code>
                      </TableCell>
                      <TableCell>
                        {page.is_published ? (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Published
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            Draft
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(page.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openPreview(page)}
                            title="Preview"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyUrl(page.slug)}
                            title="Copy URL"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(page)}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(page)}
                            title="Delete"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPage ? 'Edit Page' : 'Create New Page'}
            </DialogTitle>
            <DialogDescription>
              Create a custom HTML page that will be accessible at /p/your-slug
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Page Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="My Custom Page"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug *</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">/p/</span>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    placeholder="my-custom-page"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="meta_description">Meta Description</Label>
                <Input
                  id="meta_description"
                  value={formData.meta_description}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  placeholder="Brief description for search engines..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sidebar_group">Add to Sidebar Group</Label>
                <Select
                  value={formData.sidebar_group_id}
                  onValueChange={(value) => setFormData({ ...formData, sidebar_group_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a group (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None (Don't add to sidebar)</SelectItem>
                    {sidebarGroups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        <div className="flex items-center gap-2">
                          <Folder className="h-4 w-4" />
                          {group.name}
                          {!group.is_enabled && (
                            <Badge variant="outline" className="text-xs">Disabled</Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Tabs defaultValue="html" className="w-full">
              <TabsList>
                <TabsTrigger value="html" className="gap-1">
                  <FileText className="h-4 w-4" />
                  HTML *
                </TabsTrigger>
                <TabsTrigger value="css" className="gap-1">
                  <Code className="h-4 w-4" />
                  CSS
                </TabsTrigger>
                <TabsTrigger value="js" className="gap-1">
                  <Code className="h-4 w-4" />
                  JavaScript
                </TabsTrigger>
              </TabsList>
              <TabsContent value="html">
                <Textarea
                  value={formData.html_content}
                  onChange={(e) => setFormData({ ...formData, html_content: e.target.value })}
                  placeholder="<!DOCTYPE html>..."
                  className="font-mono text-sm min-h-[300px]"
                />
              </TabsContent>
              <TabsContent value="css">
                <Textarea
                  value={formData.css_content}
                  onChange={(e) => setFormData({ ...formData, css_content: e.target.value })}
                  placeholder="/* Your CSS styles */"
                  className="font-mono text-sm min-h-[300px]"
                />
              </TabsContent>
              <TabsContent value="js">
                <Textarea
                  value={formData.js_content}
                  onChange={(e) => setFormData({ ...formData, js_content: e.target.value })}
                  placeholder="// Your JavaScript code"
                  className="font-mono text-sm min-h-[300px]"
                />
              </TabsContent>
            </Tabs>

            <div className="flex items-center gap-2">
              <Switch
                id="published"
                checked={formData.is_published}
                onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
              />
              <Label htmlFor="published">Publish immediately</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingPage ? 'Save Changes' : 'Create Page'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Preview: {previewPage?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="border rounded-lg overflow-hidden bg-white">
            <iframe
              srcDoc={getPreviewContent()}
              className="w-full h-[60vh]"
              title="Page Preview"
              sandbox="allow-scripts"
            />
          </div>
          <DialogFooter>
            {previewPage?.is_published && (
              <Button
                variant="outline"
                onClick={() => window.open(`/p/${previewPage.slug}`, '_blank')}
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open Live Page
              </Button>
            )}
            <Button onClick={() => setIsPreviewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
