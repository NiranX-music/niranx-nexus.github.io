import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, Pencil, Globe, ExternalLink, GripVertical, Save, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ExploreLink {
  id: string;
  title: string;
  description: string | null;
  url: string;
  icon: string;
  category: string;
  cover_image_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

const CATEGORIES = ["General", "Education", "Tools", "Social", "Entertainment", "Music", "AI", "Dev", "Gaming", "Creative"];

export function ExploreLinksManager() {
  const { user } = useAuth();
  const [links, setLinks] = useState<ExploreLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    url: "",
    icon: "Globe",
    category: "General",
    cover_image_url: "",
    is_active: true,
    sort_order: 0,
  });

  const fetchLinks = async () => {
    const { data, error } = await supabase
      .from("explore_links")
      .select("*")
      .order("sort_order", { ascending: true });
    if (!error && data) setLinks(data as ExploreLink[]);
    setLoading(false);
  };

  useEffect(() => { fetchLinks(); }, []);

  const resetForm = () => {
    setForm({ title: "", description: "", url: "", icon: "Globe", category: "General", cover_image_url: "", is_active: true, sort_order: 0 });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!form.title || !form.url) {
      toast({ title: "Title and URL are required", variant: "destructive" });
      return;
    }

    if (editingId) {
      const { error } = await supabase
        .from("explore_links")
        .update({ ...form, updated_at: new Date().toISOString() })
        .eq("id", editingId);
      if (error) { toast({ title: "Update failed", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Link updated" });
    } else {
      const { error } = await supabase
        .from("explore_links")
        .insert({ ...form, created_by: user?.id });
      if (error) { toast({ title: "Create failed", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Link added" });
    }
    resetForm();
    fetchLinks();
  };

  const handleEdit = (link: ExploreLink) => {
    setForm({
      title: link.title,
      description: link.description || "",
      url: link.url,
      icon: link.icon,
      category: link.category,
      cover_image_url: link.cover_image_url || "",
      is_active: link.is_active,
      sort_order: link.sort_order,
    });
    setEditingId(link.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("explore_links").delete().eq("id", id);
    if (error) { toast({ title: "Delete failed", variant: "destructive" }); return; }
    toast({ title: "Link deleted" });
    fetchLinks();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("explore_links").update({ is_active: !current }).eq("id", id);
    fetchLinks();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" /> Explore Links
        </CardTitle>
        <Button onClick={() => { resetForm(); setShowForm(true); }} size="sm" className="gap-1">
          <Plus className="h-4 w-4" /> Add Link
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Title *</Label>
                  <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="NiranX Music" />
                </div>
                <div className="space-y-1">
                  <Label>URL *</Label>
                  <Input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
                </div>
                <div className="space-y-1">
                  <Label>Description</Label>
                  <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Short description" />
                </div>
                <div className="space-y-1">
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Cover Image URL</Label>
                  <Input value={form.cover_image_url} onChange={e => setForm({ ...form, cover_image_url: e.target.value })} placeholder="https://..." />
                </div>
                <div className="space-y-1">
                  <Label>Sort Order</Label>
                  <Input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch checked={form.is_active} onCheckedChange={v => setForm({ ...form, is_active: v })} />
                  <Label>Active</Label>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={resetForm} size="sm"><X className="h-4 w-4 mr-1" /> Cancel</Button>
                  <Button onClick={handleSave} size="sm"><Save className="h-4 w-4 mr-1" /> {editingId ? "Update" : "Add"}</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <p className="text-muted-foreground text-sm">Loading...</p>
        ) : links.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">No explore links added yet. Click "Add Link" to get started.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.map(link => (
                <TableRow key={link.id}>
                  <TableCell className="font-medium">{link.title}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    <a href={link.url} target="_blank" rel="noopener" className="text-primary hover:underline flex items-center gap-1">
                      {link.url.replace(/^https?:\/\//, '').slice(0, 30)}...
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </TableCell>
                  <TableCell>{link.category}</TableCell>
                  <TableCell>
                    <Switch checked={link.is_active} onCheckedChange={() => toggleActive(link.id, link.is_active)} />
                  </TableCell>
                  <TableCell>{link.sort_order}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(link)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(link.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
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
