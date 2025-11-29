import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Sparkles, Trash2, Edit, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface WhatsNew {
  id: string;
  title: string;
  description: string;
  icon?: string;
  link?: string;
  priority: number;
  is_active: boolean;
  created_at: string;
}

export default function WhatsNewManager() {
  const { user } = useAuth();
  const [items, setItems] = useState<WhatsNew[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<WhatsNew | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    icon: "",
    link: "",
    priority: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from("whats_new")
        .select("*")
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      console.error("Error fetching items:", error);
      toast.error("Failed to load What's New items");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    try {
      if (editingItem) {
        const { error } = await supabase
          .from("whats_new")
          .update(formData)
          .eq("id", editingItem.id);

        if (error) throw error;
        toast.success("Item updated successfully!");
      } else {
        const { error } = await supabase
          .from("whats_new")
          .insert([{ ...formData, created_by: user.id }]);

        if (error) throw error;
        toast.success("Item created successfully!");
      }

      resetForm();
      fetchItems();
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error("Error saving item:", error);
      toast.error("Failed to save item");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const { error } = await supabase.from("whats_new").delete().eq("id", id);

      if (error) throw error;
      toast.success("Item deleted successfully!");
      fetchItems();
    } catch (error: any) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item");
    }
  };

  const handleEdit = (item: WhatsNew) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      icon: item.icon || "",
      link: item.link || "",
      priority: item.priority,
      is_active: item.is_active,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      title: "",
      description: "",
      icon: "",
      link: "",
      priority: 0,
      is_active: true,
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">What's New Manager</h1>
          <p className="text-muted-foreground">Manage What's New items displayed to users</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit" : "Create"} What's New Item</DialogTitle>
              <DialogDescription>
                {editingItem ? "Update" : "Add"} a new item to the What's New section
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="icon">Icon (Lucide icon name)</Label>
                  <Input
                    id="icon"
                    placeholder="e.g., Sparkles"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="link">Link (optional)</Label>
                  <Input
                    id="link"
                    placeholder="/niranx/page"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority (higher = shown first)</Label>
                <Input
                  id="priority"
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingItem ? "Update" : "Create"} Item
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {items.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">No What's New items yet</p>
            </CardContent>
          </Card>
        ) : (
          items.map((item) => (
            <Card key={item.id} className={!item.is_active ? "opacity-50" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {item.icon && <Sparkles className="h-5 w-5 mt-1 text-primary" />}
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {item.title}
                        {!item.is_active && (
                          <span className="text-xs bg-muted px-2 py-1 rounded">Inactive</span>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-2">{item.description}</CardDescription>
                      {item.link && (
                        <p className="text-xs text-muted-foreground mt-2">Link: {item.link}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">Priority: {item.priority}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="outline" onClick={() => handleEdit(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="destructive" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
