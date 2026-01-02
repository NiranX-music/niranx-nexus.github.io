import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Folder, Link2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface Category {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  display_order: number;
}

interface NexusLink {
  id: string;
  category_id: string | null;
  name: string;
  url: string;
  description: string | null;
  image_url: string | null;
  tile_color: string | null;
  effect_type: string | null;
  special_comment: string | null;
  comment_color: string | null;
  display_order: number;
}

export function NiranXNexusManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [links, setLinks] = useState<NexusLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'categories' | 'links'>('categories');
  
  // Category form
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catForm, setCatForm] = useState({ name: '', description: '', icon: 'Folder', display_order: 0 });

  // Link form
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<NexusLink | null>(null);
  const [linkForm, setLinkForm] = useState({
    category_id: '', name: '', url: '', description: '', image_url: '',
    tile_color: '', effect_type: 'translucent', special_comment: '', comment_color: '', display_order: 0
  });

  const fetchData = async () => {
    const [catsRes, linksRes] = await Promise.all([
      supabase.from('nexus_categories').select('*').order('display_order'),
      supabase.from('nexus_links').select('*').order('display_order'),
    ]);
    if (catsRes.data) setCategories(catsRes.data);
    if (linksRes.data) setLinks(linksRes.data);
    setIsLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // Category handlers
  const handleCatSubmit = async () => {
    if (!catForm.name) return toast.error('Name is required');
    const payload = { ...catForm, is_visible: true };

    if (editingCat) {
      const { error } = await supabase.from('nexus_categories').update(payload).eq('id', editingCat.id);
      if (error) return toast.error('Failed to update');
    } else {
      const { error } = await supabase.from('nexus_categories').insert([payload]);
      if (error) return toast.error('Failed to add');
    }
    toast.success('Saved');
    setCatDialogOpen(false);
    setEditingCat(null);
    setCatForm({ name: '', description: '', icon: 'Folder', display_order: 0 });
    fetchData();
  };

  const deleteCat = async (id: string) => {
    if (!confirm('Delete this category and all its links?')) return;
    await supabase.from('nexus_categories').delete().eq('id', id);
    toast.success('Deleted');
    fetchData();
  };

  // Link handlers
  const handleLinkSubmit = async () => {
    if (!linkForm.name || !linkForm.url) return toast.error('Name and URL are required');
    const payload = { ...linkForm, is_visible: true, category_id: linkForm.category_id || null };

    if (editingLink) {
      const { error } = await supabase.from('nexus_links').update(payload).eq('id', editingLink.id);
      if (error) return toast.error('Failed to update');
    } else {
      const { error } = await supabase.from('nexus_links').insert([payload]);
      if (error) return toast.error('Failed to add');
    }
    toast.success('Saved');
    setLinkDialogOpen(false);
    setEditingLink(null);
    setLinkForm({ category_id: '', name: '', url: '', description: '', image_url: '', tile_color: '', effect_type: 'translucent', special_comment: '', comment_color: '', display_order: 0 });
    fetchData();
  };

  const deleteLink = async (id: string) => {
    if (!confirm('Delete this link?')) return;
    await supabase.from('nexus_links').delete().eq('id', id);
    toast.success('Deleted');
    fetchData();
  };

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        <Button variant={activeTab === 'categories' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab('categories')}>
          <Folder className="w-4 h-4 mr-1" /> Categories
        </Button>
        <Button variant={activeTab === 'links' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab('links')}>
          <Link2 className="w-4 h-4 mr-1" /> Links
        </Button>
      </div>

      {activeTab === 'categories' && (
        <>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Nexus Categories</h3>
            <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={() => { setEditingCat(null); setCatForm({ name: '', description: '', icon: 'Folder', display_order: 0 }); }}>
                  <Plus className="w-4 h-4 mr-1" /> Add Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{editingCat ? 'Edit' : 'Add'} Category</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <Input placeholder="Name" value={catForm.name} onChange={(e) => setCatForm(f => ({ ...f, name: e.target.value }))} />
                  <Input placeholder="Description" value={catForm.description} onChange={(e) => setCatForm(f => ({ ...f, description: e.target.value }))} />
                  <Input placeholder="Icon (Lucide name)" value={catForm.icon} onChange={(e) => setCatForm(f => ({ ...f, icon: e.target.value }))} />
                  <Input type="number" placeholder="Order" value={catForm.display_order} onChange={(e) => setCatForm(f => ({ ...f, display_order: parseInt(e.target.value) || 0 }))} />
                  <Button onClick={handleCatSubmit} className="w-full">Save</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Icon</TableHead>
                <TableHead>Order</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.icon}</TableCell>
                  <TableCell>{c.display_order}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => { setEditingCat(c); setCatForm({ name: c.name, description: c.description || '', icon: c.icon || 'Folder', display_order: c.display_order }); setCatDialogOpen(true); }}><Pencil className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => deleteCat(c.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}

      {activeTab === 'links' && (
        <>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Nexus Links</h3>
            <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={() => { setEditingLink(null); setLinkForm({ category_id: '', name: '', url: '', description: '', image_url: '', tile_color: '', effect_type: 'translucent', special_comment: '', comment_color: '', display_order: 0 }); }}>
                  <Plus className="w-4 h-4 mr-1" /> Add Link
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>{editingLink ? 'Edit' : 'Add'} Link</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <Select value={linkForm.category_id} onValueChange={(v) => setLinkForm(f => ({ ...f, category_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input placeholder="Name" value={linkForm.name} onChange={(e) => setLinkForm(f => ({ ...f, name: e.target.value }))} />
                  <Input placeholder="URL" value={linkForm.url} onChange={(e) => setLinkForm(f => ({ ...f, url: e.target.value }))} />
                  <Textarea placeholder="Description" value={linkForm.description} onChange={(e) => setLinkForm(f => ({ ...f, description: e.target.value }))} />
                  <Input placeholder="Image URL" value={linkForm.image_url} onChange={(e) => setLinkForm(f => ({ ...f, image_url: e.target.value }))} />
                  <Input placeholder="Tile Color (e.g., #ff0000)" value={linkForm.tile_color} onChange={(e) => setLinkForm(f => ({ ...f, tile_color: e.target.value }))} />
                  <Select value={linkForm.effect_type} onValueChange={(v) => setLinkForm(f => ({ ...f, effect_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="translucent">Translucent</SelectItem>
                      <SelectItem value="opaque">Opaque</SelectItem>
                      <SelectItem value="transparent">Transparent</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input placeholder="Special Comment" value={linkForm.special_comment} onChange={(e) => setLinkForm(f => ({ ...f, special_comment: e.target.value }))} />
                  <Input placeholder="Comment Color" value={linkForm.comment_color} onChange={(e) => setLinkForm(f => ({ ...f, comment_color: e.target.value }))} />
                  <Input type="number" placeholder="Order" value={linkForm.display_order} onChange={(e) => setLinkForm(f => ({ ...f, display_order: parseInt(e.target.value) || 0 }))} />
                  <Button onClick={handleLinkSubmit} className="w-full">Save</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Order</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">{l.name}</TableCell>
                  <TableCell>{categories.find(c => c.id === l.category_id)?.name || '-'}</TableCell>
                  <TableCell className="truncate max-w-32">{l.url}</TableCell>
                  <TableCell>{l.display_order}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => {
                        setEditingLink(l);
                        setLinkForm({
                          category_id: l.category_id || '',
                          name: l.name,
                          url: l.url,
                          description: l.description || '',
                          image_url: l.image_url || '',
                          tile_color: l.tile_color || '',
                          effect_type: l.effect_type || 'translucent',
                          special_comment: l.special_comment || '',
                          comment_color: l.comment_color || '',
                          display_order: l.display_order,
                        });
                        setLinkDialogOpen(true);
                      }}><Pencil className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => deleteLink(l.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}
    </div>
  );
}
