import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { icons, Plus, Trash2, Save, GripVertical, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LauncherApp {
  id: string;
  name: string;
  icon: string;
  url: string;
  description: string | null;
  color: string | null;
  sort_order: number;
  is_active: boolean;
  category: string | null;
}

const POPULAR_ICONS = [
  'Globe', 'Music', 'Briefcase', 'Disc3', 'Sparkles', 'MessageSquare',
  'Zap', 'Camera', 'Video', 'BookOpen', 'Code', 'Gamepad2',
  'Palette', 'Shield', 'Cloud', 'Mail', 'FileText', 'Users',
  'Heart', 'Star', 'Compass', 'Layers', 'Radio', 'Headphones',
  'Mic', 'PenTool', 'Image', 'Film', 'Monitor', 'Smartphone',
];

const COLOR_PRESETS = [
  { label: 'Primary', value: 'from-primary/20 to-accent/20' },
  { label: 'Blue', value: 'from-blue-500/20 to-cyan-500/20' },
  { label: 'Purple', value: 'from-violet-500/20 to-purple-500/20' },
  { label: 'Pink', value: 'from-fuchsia-500/20 to-pink-500/20' },
  { label: 'Green', value: 'from-green-500/20 to-emerald-500/20' },
  { label: 'Orange', value: 'from-amber-500/20 to-orange-500/20' },
  { label: 'Cyan', value: 'from-cyan-500/20 to-fuchsia-500/20' },
  { label: 'Red', value: 'from-red-500/20 to-rose-500/20' },
];

const CATEGORY_OPTIONS = ['general', 'tools', 'social', 'entertainment', 'education', 'productivity'];

const emptyApp = { name: '', icon: 'Globe', url: '', description: '', color: 'from-primary/20 to-accent/20', sort_order: 0, is_active: true, category: 'general' };

export function LauncherAppsManager() {
  const [apps, setApps] = useState<LauncherApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [editApp, setEditApp] = useState<Partial<LauncherApp> & typeof emptyApp>(emptyApp);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from('niranx_launcher_apps')
      .select('*')
      .order('sort_order');
    if (data) setApps(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!editApp.name || !editApp.url) {
      toast.error('Name and URL are required');
      return;
    }

    if (isEditing && editApp.id) {
      const { error } = await supabase
        .from('niranx_launcher_apps')
        .update({
          name: editApp.name,
          icon: editApp.icon,
          url: editApp.url,
          description: editApp.description || null,
          color: editApp.color,
          sort_order: editApp.sort_order,
          is_active: editApp.is_active,
          category: editApp.category || 'general',
          updated_at: new Date().toISOString(),
        })
        .eq('id', editApp.id);
      if (error) { toast.error('Failed to update'); return; }
      toast.success('App updated');
    } else {
      const { error } = await supabase
        .from('niranx_launcher_apps')
        .insert({
          name: editApp.name,
          icon: editApp.icon,
          url: editApp.url,
          description: editApp.description || null,
          color: editApp.color,
          sort_order: editApp.sort_order,
          is_active: editApp.is_active,
          category: editApp.category || 'general',
        });
      if (error) { toast.error('Failed to create'); return; }
      toast.success('App created');
    }

    setDialogOpen(false);
    setEditApp(emptyApp);
    setIsEditing(false);
    load();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('niranx_launcher_apps').delete().eq('id', id);
    if (error) { toast.error('Failed to delete'); return; }
    toast.success('App deleted');
    load();
  };

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from('niranx_launcher_apps').update({ is_active: active }).eq('id', id);
    load();
  };

  const openEdit = (app: LauncherApp) => {
    setEditApp(app);
    setIsEditing(true);
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditApp({ ...emptyApp, sort_order: apps.length });
    setIsEditing(false);
    setDialogOpen(true);
  };

  const getIcon = (name: string) => {
    const Icon = (icons as Record<string, any>)[name];
    return Icon || icons.Globe;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">App Launcher Manager</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openCreate} className="gap-1">
              <Plus className="h-4 w-4" /> Add App
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Edit App' : 'Add New App'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input value={editApp.name} onChange={e => setEditApp(p => ({ ...p, name: e.target.value }))} placeholder="App Name" />
              </div>
              <div>
                <Label>URL / Route</Label>
                <Input value={editApp.url} onChange={e => setEditApp(p => ({ ...p, url: e.target.value }))} placeholder="/xoffice or https://..." />
              </div>
              <div>
                <Label>Description</Label>
                <Input value={editApp.description || ''} onChange={e => setEditApp(p => ({ ...p, description: e.target.value }))} placeholder="Short description" />
              </div>
              <div>
                <Label>Icon</Label>
                <div className="grid grid-cols-6 gap-2 mt-1 max-h-40 overflow-y-auto border border-border rounded-lg p-2">
                  {POPULAR_ICONS.map(name => {
                    const I = getIcon(name);
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setEditApp(p => ({ ...p, icon: name }))}
                        className={`flex flex-col items-center gap-0.5 p-2 rounded-lg text-xs transition-colors ${editApp.icon === name ? 'bg-primary/20 text-primary ring-1 ring-primary/50' : 'hover:bg-muted/50 text-muted-foreground'}`}
                      >
                        <I className="h-5 w-5" />
                        <span className="truncate w-full text-center text-[9px]">{name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <Label>Color Theme</Label>
                <Select value={editApp.color || ''} onValueChange={v => setEditApp(p => ({ ...p, color: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COLOR_PRESETS.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Select value={editApp.category || 'general'} onValueChange={v => setEditApp(p => ({ ...p, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map(c => (
                      <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Sort Order</Label>
                <Input type="number" value={editApp.sort_order} onChange={e => setEditApp(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))} />
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
          <p className="text-muted-foreground text-sm">Loading...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Icon</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apps.map(app => {
                const Icon = getIcon(app.icon);
                return (
                  <TableRow key={app.id}>
                    <TableCell>
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${app.color} flex items-center justify-center`}>
                        <Icon className="h-4 w-4" />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{app.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{app.url}</TableCell>
                    <TableCell>{app.sort_order}</TableCell>
                    <TableCell>
                      <Switch checked={app.is_active} onCheckedChange={v => toggleActive(app.id, v)} />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(app)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(app.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
