import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, ArrowLeft, LayoutDashboard, Loader2, FolderTree, FileText, Layers } from "lucide-react";
import { Link } from "react-router-dom";

interface Category {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  description: string | null;
  order_index: number;
  is_enabled: boolean;
}

interface Group {
  id: string;
  name: string;
  icon: string | null;
  order_index: number;
  is_enabled: boolean;
  is_default: boolean;
  category_id: string | null;
}

interface Page {
  id: string;
  group_id: string | null;
  title: string;
  url: string;
  icon: string | null;
  order_index: number;
  is_enabled: boolean;
}

export default function SidebarEditor() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  // drafts
  const [newCat, setNewCat] = useState({ name: "", icon: "Folder", color: "", description: "" });
  const [newGroup, setNewGroup] = useState({ name: "", icon: "Folder", category_id: "" });
  const [newPage, setNewPage] = useState({ title: "", url: "/", icon: "FileText", group_id: "" });

  const load = async () => {
    setLoading(true);
    const [c, g, p] = await Promise.all([
      supabase.from("sidebar_categories").select("*").order("order_index"),
      supabase.from("sidebar_groups").select("*").order("order_index"),
      supabase.from("sidebar_pages").select("*").order("order_index"),
    ]);
    if (c.data) setCategories(c.data as Category[]);
    if (g.data) setGroups(g.data as Group[]);
    if (p.data) setPages(p.data as Page[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  // CATEGORY OPS
  const addCategory = async () => {
    if (!newCat.name) return toast.error("Name required");
    const { error } = await supabase.from("sidebar_categories").insert({
      name: newCat.name,
      icon: newCat.icon || null,
      color: newCat.color || null,
      description: newCat.description || null,
      order_index: categories.length,
      is_enabled: true,
    });
    if (error) return toast.error(error.message);
    setNewCat({ name: "", icon: "Folder", color: "", description: "" });
    toast.success("Category added");
    load();
  };
  const updateCategory = async (id: string, patch: Partial<Category>) => {
    const { error } = await supabase.from("sidebar_categories").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };
  const deleteCategory = async (id: string) => {
    if (!confirm("Delete category? Groups inside will be unlinked.")) return;
    const { error } = await supabase.from("sidebar_categories").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  // GROUP OPS
  const addGroup = async () => {
    if (!newGroup.name) return toast.error("Name required");
    const { error } = await supabase.from("sidebar_groups").insert({
      name: newGroup.name,
      icon: newGroup.icon || null,
      category_id: newGroup.category_id || null,
      order_index: groups.length,
      is_enabled: true,
      is_default: false,
    });
    if (error) return toast.error(error.message);
    setNewGroup({ name: "", icon: "Folder", category_id: "" });
    toast.success("Group added");
    load();
  };
  const updateGroup = async (id: string, patch: Partial<Group>) => {
    const { error } = await supabase.from("sidebar_groups").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    setGroups((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)));
  };
  const deleteGroup = async (id: string) => {
    if (!confirm("Delete group? Pages will be unlinked.")) return;
    const { error } = await supabase.from("sidebar_groups").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  // PAGE OPS
  const addPage = async () => {
    if (!newPage.title || !newPage.url) return toast.error("Title and URL required");
    const { error } = await supabase.from("sidebar_pages").insert({
      title: newPage.title,
      url: newPage.url,
      icon: newPage.icon || null,
      group_id: newPage.group_id || null,
      order_index: pages.length,
      is_enabled: true,
    });
    if (error) return toast.error(error.message);
    setNewPage({ title: "", url: "/", icon: "FileText", group_id: "" });
    toast.success("Page added");
    load();
  };
  const updatePage = async (id: string, patch: Partial<Page>) => {
    const { error } = await supabase.from("sidebar_pages").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };
  const deletePage = async (id: string) => {
    if (!confirm("Delete page?")) return;
    const { error } = await supabase.from("sidebar_pages").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  return (
    <div className="container max-w-6xl py-8 space-y-6">
      <div>
        <Link to="/admin" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-2">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Admin
        </Link>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <LayoutDashboard className="h-7 w-7 text-primary" /> Sidebar Editor
        </h1>
        <p className="text-muted-foreground">Manage categories, groups, and pages displayed in the app sidebar.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <Tabs defaultValue="categories" className="w-full">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="categories"><Layers className="h-4 w-4 mr-1" /> Categories</TabsTrigger>
            <TabsTrigger value="groups"><FolderTree className="h-4 w-4 mr-1" /> Groups</TabsTrigger>
            <TabsTrigger value="pages"><FileText className="h-4 w-4 mr-1" /> Pages</TabsTrigger>
          </TabsList>

          {/* CATEGORIES */}
          <TabsContent value="categories" className="space-y-4 mt-4">
            <Card className="p-5 border-primary/20">
              <h3 className="font-semibold mb-3">New Category</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Input placeholder="Name" value={newCat.name} onChange={(e) => setNewCat({ ...newCat, name: e.target.value })} />
                <Input placeholder="Icon (lucide)" value={newCat.icon} onChange={(e) => setNewCat({ ...newCat, icon: e.target.value })} />
                <Input placeholder="Color (hex/hsl)" value={newCat.color} onChange={(e) => setNewCat({ ...newCat, color: e.target.value })} />
                <Textarea placeholder="Description" value={newCat.description} onChange={(e) => setNewCat({ ...newCat, description: e.target.value })} />
              </div>
              <Button className="mt-3" onClick={addCategory}><Plus className="h-4 w-4 mr-2" /> Add</Button>
            </Card>
            {categories.map((c) => (
              <Card key={c.id} className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Input value={c.name} onChange={(e) => updateCategory(c.id, { name: e.target.value })} />
                  <Input value={c.icon || ""} placeholder="Icon" onChange={(e) => updateCategory(c.id, { icon: e.target.value })} />
                  <Input value={c.color || ""} placeholder="Color" onChange={(e) => updateCategory(c.id, { color: e.target.value })} />
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <Switch checked={c.is_enabled} onCheckedChange={(v) => updateCategory(c.id, { is_enabled: v })} />
                    <Label className="text-xs">Enabled</Label>
                  </div>
                  <Button size="sm" variant="destructive" onClick={() => deleteCategory(c.id)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </Card>
            ))}
          </TabsContent>

          {/* GROUPS */}
          <TabsContent value="groups" className="space-y-4 mt-4">
            <Card className="p-5 border-primary/20">
              <h3 className="font-semibold mb-3">New Group</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input placeholder="Name" value={newGroup.name} onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })} />
                <Input placeholder="Icon (lucide)" value={newGroup.icon} onChange={(e) => setNewGroup({ ...newGroup, icon: e.target.value })} />
                <Select value={newGroup.category_id} onValueChange={(v) => setNewGroup({ ...newGroup, category_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Category (optional)" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button className="mt-3" onClick={addGroup}><Plus className="h-4 w-4 mr-2" /> Add</Button>
            </Card>
            {groups.map((g) => (
              <Card key={g.id} className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Input value={g.name} onChange={(e) => updateGroup(g.id, { name: e.target.value })} />
                  <Input value={g.icon || ""} placeholder="Icon" onChange={(e) => updateGroup(g.id, { icon: e.target.value })} />
                  <Select value={g.category_id || ""} onValueChange={(v) => updateGroup(g.id, { category_id: v || null })}>
                    <SelectTrigger><SelectValue placeholder="No category" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <Switch checked={g.is_enabled} onCheckedChange={(v) => updateGroup(g.id, { is_enabled: v })} />
                    <Label className="text-xs">Enabled</Label>
                  </div>
                  <Button size="sm" variant="destructive" disabled={g.is_default} onClick={() => deleteGroup(g.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </Card>
            ))}
          </TabsContent>

          {/* PAGES */}
          <TabsContent value="pages" className="space-y-4 mt-4">
            <Card className="p-5 border-primary/20">
              <h3 className="font-semibold mb-3">New Page</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Input placeholder="Title" value={newPage.title} onChange={(e) => setNewPage({ ...newPage, title: e.target.value })} />
                <Input placeholder="URL" value={newPage.url} onChange={(e) => setNewPage({ ...newPage, url: e.target.value })} />
                <Input placeholder="Icon (lucide)" value={newPage.icon} onChange={(e) => setNewPage({ ...newPage, icon: e.target.value })} />
                <Select value={newPage.group_id} onValueChange={(v) => setNewPage({ ...newPage, group_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Group (optional)" /></SelectTrigger>
                  <SelectContent>
                    {groups.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button className="mt-3" onClick={addPage}><Plus className="h-4 w-4 mr-2" /> Add</Button>
            </Card>
            {pages.map((p) => (
              <Card key={p.id} className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Input value={p.title} onChange={(e) => updatePage(p.id, { title: e.target.value })} />
                  <Input value={p.url} onChange={(e) => updatePage(p.id, { url: e.target.value })} />
                  <Input value={p.icon || ""} placeholder="Icon" onChange={(e) => updatePage(p.id, { icon: e.target.value })} />
                  <Select value={p.group_id || ""} onValueChange={(v) => updatePage(p.id, { group_id: v || null })}>
                    <SelectTrigger><SelectValue placeholder="No group" /></SelectTrigger>
                    <SelectContent>
                      {groups.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <Switch checked={p.is_enabled} onCheckedChange={(v) => updatePage(p.id, { is_enabled: v })} />
                    <Label className="text-xs">Enabled</Label>
                  </div>
                  <Button size="sm" variant="destructive" onClick={() => deletePage(p.id)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
