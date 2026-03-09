import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Save, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Developer {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar_url: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  website_url: string | null;
  email: string | null;
  sort_order: number;
  is_active: boolean;
}

const emptyDev = {
  name: '', role: '', bio: '', avatar_url: '', github_url: '', linkedin_url: '',
  website_url: '', email: '', sort_order: 0, is_active: true,
};

export function DevelopersManager() {
  const [devs, setDevs] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDev, setEditDev] = useState<Partial<Developer> & typeof emptyDev>(emptyDev);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const load = async () => {
    const { data } = await supabase.from('niranx_developers').select('*').order('sort_order');
    if (data) setDevs(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!editDev.name || !editDev.role) {
      toast.error('Name and role are required');
      return;
    }

    const payload = {
      name: editDev.name,
      role: editDev.role,
      bio: editDev.bio || '',
      avatar_url: editDev.avatar_url || null,
      github_url: editDev.github_url || null,
      linkedin_url: editDev.linkedin_url || null,
      website_url: editDev.website_url || null,
      email: editDev.email || null,
      sort_order: editDev.sort_order,
      is_active: editDev.is_active,
    };

    if (isEditing && editDev.id) {
      const { error } = await supabase.from('niranx_developers').update(payload).eq('id', editDev.id);
      if (error) { toast.error('Failed to update'); return; }
      toast.success('Developer updated');
    } else {
      const { error } = await supabase.from('niranx_developers').insert(payload);
      if (error) { toast.error('Failed to create'); return; }
      toast.success('Developer added');
    }

    setDialogOpen(false);
    setEditDev(emptyDev);
    setIsEditing(false);
    load();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('niranx_developers').delete().eq('id', id);
    toast.success('Developer removed');
    load();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Developers Manager</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => { setEditDev({ ...emptyDev, sort_order: devs.length }); setIsEditing(false); setDialogOpen(true); }} className="gap-1">
              <Plus className="h-4 w-4" /> Add Developer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Edit Developer' : 'Add Developer'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Name *</Label>
                <Input value={editDev.name} onChange={e => setEditDev(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <Label>Role *</Label>
                <Input value={editDev.role} onChange={e => setEditDev(p => ({ ...p, role: e.target.value }))} placeholder="e.g. Full Stack Developer" />
              </div>
              <div>
                <Label>Bio</Label>
                <Textarea value={editDev.bio} onChange={e => setEditDev(p => ({ ...p, bio: e.target.value }))} rows={3} />
              </div>
              <div>
                <Label>Avatar URL</Label>
                <Input value={editDev.avatar_url || ''} onChange={e => setEditDev(p => ({ ...p, avatar_url: e.target.value }))} placeholder="https://..." />
              </div>
              <div>
                <Label>GitHub URL</Label>
                <Input value={editDev.github_url || ''} onChange={e => setEditDev(p => ({ ...p, github_url: e.target.value }))} />
              </div>
              <div>
                <Label>LinkedIn URL</Label>
                <Input value={editDev.linkedin_url || ''} onChange={e => setEditDev(p => ({ ...p, linkedin_url: e.target.value }))} />
              </div>
              <div>
                <Label>Website URL</Label>
                <Input value={editDev.website_url || ''} onChange={e => setEditDev(p => ({ ...p, website_url: e.target.value }))} />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={editDev.email || ''} onChange={e => setEditDev(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div>
                <Label>Sort Order</Label>
                <Input type="number" value={editDev.sort_order} onChange={e => setEditDev(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={editDev.is_active} onCheckedChange={v => setEditDev(p => ({ ...p, is_active: v }))} />
                <Label>Active</Label>
              </div>
              <Button onClick={handleSave} className="w-full gap-1">
                <Save className="h-4 w-4" /> {isEditing ? 'Update' : 'Create'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : devs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No developers added yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devs.map(dev => (
                <TableRow key={dev.id}>
                  <TableCell className="font-medium">{dev.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{dev.role}</TableCell>
                  <TableCell>{dev.sort_order}</TableCell>
                  <TableCell>
                    <Switch checked={dev.is_active} onCheckedChange={async v => {
                      await supabase.from('niranx_developers').update({ is_active: v }).eq('id', dev.id);
                      load();
                    }} />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => { setEditDev(dev); setIsEditing(true); setDialogOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(dev.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
