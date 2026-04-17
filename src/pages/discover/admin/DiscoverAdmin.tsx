import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DiscoverPage } from "@/types/discover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Eye, EyeOff, FileText, Layout } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function DiscoverAdmin() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pages, setPages] = useState<DiscoverPage[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("discover_pages").select("*").order("updated_at", { ascending: false });
    setPages((data as DiscoverPage[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const togglePublish = async (p: DiscoverPage) => {
    const next = !p.is_published;
    const { error } = await supabase
      .from("discover_pages")
      .update({ is_published: next, published_at: next ? new Date().toISOString() : p.published_at })
      .eq("id", p.id);
    if (error) toast.error("Failed");
    else { toast.success(next ? "Published" : "Unpublished"); load(); }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this page? This is permanent.")) return;
    const { error } = await supabase.from("discover_pages").delete().eq("id", id);
    if (error) toast.error("Delete failed");
    else { toast.success("Deleted"); load(); }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-7 w-7 text-primary" /> Discover Pages
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage articles, docs, and knowledge pages</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/admin/landing-templates")}>
            <Layout className="h-4 w-4 mr-2" /> Landing Templates
          </Button>
          <Button onClick={() => navigate("/admin/discover/new")}>
            <Plus className="h-4 w-4 mr-2" /> New Page
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-muted/30 rounded-xl animate-pulse" />)}
        </div>
      ) : pages.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-2xl">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground mb-4">No pages yet</p>
          <Button onClick={() => navigate("/admin/discover/new")}><Plus className="h-4 w-4 mr-2" />Create first page</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {pages.map((p) => (
            <div key={p.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/40 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold truncate">{p.title}</h3>
                  <Badge variant={p.is_published ? "default" : "secondary"} className="text-[10px]">
                    {p.is_published ? "Published" : "Draft"}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <code className="text-primary">/{p.slug}</code>
                  <span>· {formatDistanceToNow(new Date(p.updated_at), { addSuffix: true })}</span>
                  <span>· {p.tags.length} tags</span>
                  <span>· {p.view_count} views</span>
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => togglePublish(p)}>
                {p.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => navigate(`/admin/discover/edit/${p.id}`)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(p.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
