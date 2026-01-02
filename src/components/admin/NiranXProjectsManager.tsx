import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Layers, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface Project {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  tags: string[] | null;
  link_url: string | null;
  display_order: number;
  is_visible: boolean;
}

export function NiranXProjectsManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [form, setForm] = useState({ title: '', description: '', icon: 'Rocket', tags: '', link_url: '', display_order: 0 });

  const fetchProjects = async () => {
    const { data } = await supabase.from('niranx_projects').select('*').order('display_order');
    if (data) setProjects(data);
    setIsLoading(false);
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleSubmit = async () => {
    if (!form.title) return toast.error('Title is required');

    const payload = {
      title: form.title,
      description: form.description,
      icon: form.icon,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      link_url: form.link_url,
      display_order: form.display_order,
      is_visible: true,
    };

    if (editingProject) {
      const { error } = await supabase.from('niranx_projects').update(payload).eq('id', editingProject.id);
      if (error) return toast.error('Failed to update');
      toast.success('Updated successfully');
    } else {
      const { error } = await supabase.from('niranx_projects').insert([payload]);
      if (error) return toast.error('Failed to add');
      toast.success('Added successfully');
    }

    setIsDialogOpen(false);
    setEditingProject(null);
    setForm({ title: '', description: '', icon: 'Rocket', tags: '', link_url: '', display_order: 0 });
    fetchProjects();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    const { error } = await supabase.from('niranx_projects').delete().eq('id', id);
    if (error) return toast.error('Failed to delete');
    toast.success('Deleted');
    fetchProjects();
  };

  const openEdit = (project: Project) => {
    setEditingProject(project);
    setForm({
      title: project.title,
      description: project.description || '',
      icon: project.icon || 'Rocket',
      tags: project.tags?.join(', ') || '',
      link_url: project.link_url || '',
      display_order: project.display_order,
    });
    setIsDialogOpen(true);
  };

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Layers className="w-5 h-5" /> Projects
        </h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => { setEditingProject(null); setForm({ title: '', description: '', icon: 'Rocket', tags: '', link_url: '', display_order: 0 }); }}>
              <Plus className="w-4 h-4 mr-1" /> Add Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingProject ? 'Edit Project' : 'Add Project'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Title" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} />
              <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
              <Input placeholder="Icon (Lucide icon name, e.g., Rocket)" value={form.icon} onChange={(e) => setForm(f => ({ ...f, icon: e.target.value }))} />
              <Input placeholder="Tags (comma-separated)" value={form.tags} onChange={(e) => setForm(f => ({ ...f, tags: e.target.value }))} />
              <Input placeholder="Link URL" value={form.link_url} onChange={(e) => setForm(f => ({ ...f, link_url: e.target.value }))} />
              <Input type="number" placeholder="Display Order" value={form.display_order} onChange={(e) => setForm(f => ({ ...f, display_order: parseInt(e.target.value) || 0 }))} />
              <Button onClick={handleSubmit} className="w-full">{editingProject ? 'Update' : 'Add'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Icon</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>Order</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-medium">{p.title}</TableCell>
              <TableCell className="text-muted-foreground">{p.icon}</TableCell>
              <TableCell>
                <div className="flex gap-1 flex-wrap">
                  {p.tags?.map((tag, i) => <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>)}
                </div>
              </TableCell>
              <TableCell>{p.display_order}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(p)}><Pencil className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(p.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
