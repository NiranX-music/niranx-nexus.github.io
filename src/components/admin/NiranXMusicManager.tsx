import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Music, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MusicRelease {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  link_url: string | null;
  display_order: number;
  is_visible: boolean;
}

export function NiranXMusicManager() {
  const [releases, setReleases] = useState<MusicRelease[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRelease, setEditingRelease] = useState<MusicRelease | null>(null);
  const [form, setForm] = useState({ title: '', description: '', cover_url: '', link_url: '', display_order: 0 });

  const fetchReleases = async () => {
    const { data } = await supabase.from('niranx_music_releases').select('*').order('display_order');
    if (data) setReleases(data);
    setIsLoading(false);
  };

  useEffect(() => { fetchReleases(); }, []);

  const handleSubmit = async () => {
    if (!form.title) return toast.error('Title is required');

    const payload = { ...form, is_visible: true };

    if (editingRelease) {
      const { error } = await supabase.from('niranx_music_releases').update(payload).eq('id', editingRelease.id);
      if (error) return toast.error('Failed to update');
      toast.success('Updated successfully');
    } else {
      const { error } = await supabase.from('niranx_music_releases').insert([payload]);
      if (error) return toast.error('Failed to add');
      toast.success('Added successfully');
    }

    setIsDialogOpen(false);
    setEditingRelease(null);
    setForm({ title: '', description: '', cover_url: '', link_url: '', display_order: 0 });
    fetchReleases();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this release?')) return;
    const { error } = await supabase.from('niranx_music_releases').delete().eq('id', id);
    if (error) return toast.error('Failed to delete');
    toast.success('Deleted');
    fetchReleases();
  };

  const openEdit = (release: MusicRelease) => {
    setEditingRelease(release);
    setForm({
      title: release.title,
      description: release.description || '',
      cover_url: release.cover_url || '',
      link_url: release.link_url || '',
      display_order: release.display_order,
    });
    setIsDialogOpen(true);
  };

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Music className="w-5 h-5" /> Music Releases
        </h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => { setEditingRelease(null); setForm({ title: '', description: '', cover_url: '', link_url: '', display_order: 0 }); }}>
              <Plus className="w-4 h-4 mr-1" /> Add Release
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingRelease ? 'Edit Release' : 'Add Release'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Title" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} />
              <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
              <Input placeholder="Cover URL" value={form.cover_url} onChange={(e) => setForm(f => ({ ...f, cover_url: e.target.value }))} />
              <Input placeholder="Link URL (Spotify, etc.)" value={form.link_url} onChange={(e) => setForm(f => ({ ...f, link_url: e.target.value }))} />
              <Input type="number" placeholder="Display Order" value={form.display_order} onChange={(e) => setForm(f => ({ ...f, display_order: parseInt(e.target.value) || 0 }))} />
              <Button onClick={handleSubmit} className="w-full">{editingRelease ? 'Update' : 'Add'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Order</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {releases.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">{r.title}</TableCell>
              <TableCell className="text-muted-foreground truncate max-w-48">{r.description}</TableCell>
              <TableCell>{r.display_order}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(r)}><Pencil className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(r.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
