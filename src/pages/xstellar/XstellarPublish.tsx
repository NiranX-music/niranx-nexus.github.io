import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Globe, ExternalLink, Eye, EyeOff, Copy, Link } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface PublishedPage {
  id: string;
  title: string;
  slug: string;
  is_published: boolean;
  created_at: string;
}

export function XstellarPublish() {
  const [pages, setPages] = useState<PublishedPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    const { data } = await supabase
      .from("admin_custom_pages")
      .select("id, title, slug, is_published, created_at")
      .order("created_at", { ascending: false });
    setPages(data || []);
    setLoading(false);
  };

  const togglePublish = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("admin_custom_pages")
      .update({ is_published: !currentStatus })
      .eq("id", id);
    if (!error) {
      toast({ title: !currentStatus ? "Page published" : "Page unpublished" });
      loadPages();
    }
  };

  const copyUrl = (slug: string) => {
    const url = `${window.location.origin}/x/${slug}`;
    navigator.clipboard.writeText(url);
    toast({ title: "URL copied" });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Globe className="h-4 w-4" /> Published Pages
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-sm text-muted-foreground">Loading...</div>
          ) : pages.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">No pages created yet. Use the Page Creator tab to build pages.</div>
          ) : (
            <div className="space-y-3">
              {pages.map((page) => (
                <div key={page.id} className="flex items-center justify-between border rounded-lg p-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{page.title}</span>
                      <Badge variant={page.is_published ? "default" : "secondary"} className="text-[10px]">
                        {page.is_published ? "Live" : "Draft"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Link className="h-3 w-3" />
                      <span>/x/{page.slug}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => copyUrl(page.slug)}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    {page.is_published && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`/x/${page.slug}`} target="_blank">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    )}
                    <Switch
                      checked={page.is_published}
                      onCheckedChange={() => togglePublish(page.id, page.is_published)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
