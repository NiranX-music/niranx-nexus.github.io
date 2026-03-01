import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Plus, Code, ExternalLink, Trash2, Edit3, Eye, Send, Lock, Globe, Search } from "lucide-react";
import { format } from "date-fns";

interface AppCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface PersonalApp {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  html_content: string;
  css_content: string | null;
  js_content: string | null;
  category_id: string | null;
  is_public: boolean;
  created_at: string;
}

export default function PersonalAppLibrary() {
  const { user } = useAuth();
  const [apps, setApps] = useState<PersonalApp[]>([]);
  const [categories, setCategories] = useState<AppCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "", slug: "", description: "", htmlContent: "", cssContent: "", jsContent: "", categoryId: "", isPublic: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    const [appsRes, catsRes] = await Promise.all([
      supabase.from("personal_apps").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }),
      supabase.from("app_categories").select("*").order("name"),
    ]);
    if (appsRes.data) setApps(appsRes.data);
    if (catsRes.data) setCategories(catsRes.data);
    setIsLoading(false);
  };

  const handleCreate = async () => {
    if (!user || !formData.title || !formData.htmlContent) {
      toast.error("Title and HTML content are required");
      return;
    }
    const slug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50);
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("personal_apps").insert({
        user_id: user.id,
        title: formData.title,
        slug,
        description: formData.description || null,
        html_content: formData.htmlContent,
        css_content: formData.cssContent || null,
        js_content: formData.jsContent || null,
        category_id: formData.categoryId || null,
        is_public: formData.isPublic,
      });
      if (error) throw error;
      toast.success("App created!");
      setCreateOpen(false);
      setFormData({ title: "", slug: "", description: "", htmlContent: "", cssContent: "", jsContent: "", categoryId: "", isPublic: false });
      fetchData();
    } catch (e: any) {
      toast.error(e.message || "Failed to create app");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("personal_apps").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else { toast.success("Deleted"); fetchData(); }
  };

  const handleSubmitToLibrary = async (app: PersonalApp) => {
    if (!user) return;
    try {
      const { error } = await supabase.from("admin_custom_pages").insert({
        title: app.title,
        slug: `user-${app.slug}-${Date.now()}`,
        meta_description: app.description,
        html_content: app.html_content,
        css_content: app.css_content,
        js_content: app.js_content,
        created_by: user.id,
        is_published: false,
        category_id: app.category_id,
        moderation_status: "pending",
        is_personal: false,
        show_author: true,
      });
      if (error) throw error;
      toast.success("Submitted for moderation! An admin will review it.");
    } catch (e: any) {
      toast.error(e.message || "Failed to submit");
    }
  };

  const filtered = apps.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === "all" || a.category_id === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const getCategoryName = (id: string | null) => categories.find(c => c.id === id)?.name || "Uncategorized";

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text flex items-center gap-2">
            <Code className="h-8 w-8" />
            My App Library
          </h1>
          <p className="text-muted-foreground mt-1">Your personal collection of apps</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />Create App</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Personal App</DialogTitle>
              <DialogDescription>Build and save your own app</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} placeholder="My App" />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={formData.categoryId} onValueChange={v => setFormData(p => ({ ...p, categoryId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>HTML Content *</Label>
                <Textarea value={formData.htmlContent} onChange={e => setFormData(p => ({ ...p, htmlContent: e.target.value }))} rows={8} className="font-mono text-sm" placeholder="<div>Your HTML...</div>" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>CSS</Label>
                  <Textarea value={formData.cssContent} onChange={e => setFormData(p => ({ ...p, cssContent: e.target.value }))} rows={4} className="font-mono text-sm" />
                </div>
                <div className="space-y-2">
                  <Label>JavaScript</Label>
                  <Textarea value={formData.jsContent} onChange={e => setFormData(p => ({ ...p, jsContent: e.target.value }))} rows={4} className="font-mono text-sm" />
                </div>
              </div>
              <Button onClick={handleCreate} disabled={isSubmitting} className="w-full">{isSubmitting ? "Creating..." : "Create App"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search apps..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Apps Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <Code className="h-12 w-12 text-muted-foreground" />
            <h3 className="text-xl font-semibold">No Apps Yet</h3>
            <p className="text-muted-foreground">Create your first personal app!</p>
            <Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4 mr-2" />Create App</Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(app => (
            <Card key={app.id} className="group hover:shadow-lg transition-all duration-300 hover:border-primary/30">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="line-clamp-1">{app.title}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">{app.description || "No description"}</CardDescription>
                  </div>
                  <div className="flex items-center gap-1">
                    {app.is_public ? <Globe className="h-4 w-4 text-green-500" /> : <Lock className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary">{getCategoryName(app.category_id)}</Badge>
                  <Badge variant="outline">{format(new Date(app.created_at), "MMM d")}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex gap-2 flex-wrap">
                <Button size="sm" variant="default" onClick={() => window.open(`data:text/html;charset=utf-8,${encodeURIComponent(`<!DOCTYPE html><html><head><style>${app.css_content || ""}</style></head><body>${app.html_content}<script>${app.js_content || ""}</script></body></html>`)}`, "_blank")}>
                  <Eye className="h-3 w-3 mr-1" />Preview
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleSubmitToLibrary(app)}>
                  <Send className="h-3 w-3 mr-1" />Submit to Library
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(app.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
