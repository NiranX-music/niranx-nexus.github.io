import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileCode, Plus, Globe, Eye, EyeOff, Code, Palette, Zap,
  Save, Trash2, ExternalLink
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface CustomPage {
  id: string;
  title: string;
  slug: string;
  html_content: string;
  css_content: string | null;
  js_content: string | null;
  is_published: boolean;
  show_in_sidebar: boolean;
  created_at: string;
}

export function XstellarPageCreator() {
  const { user } = useAuth();
  const [pages, setPages] = useState<CustomPage[]>([]);
  const [selectedPage, setSelectedPage] = useState<CustomPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [cssContent, setCssContent] = useState("");
  const [jsContent, setJsContent] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [showInSidebar, setShowInSidebar] = useState(false);

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("admin_custom_pages")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setPages(data || []);
    setLoading(false);
  };

  const selectPage = (page: CustomPage) => {
    setSelectedPage(page);
    setIsCreating(false);
    setTitle(page.title);
    setSlug(page.slug);
    setHtmlContent(page.html_content);
    setCssContent(page.css_content || "");
    setJsContent(page.js_content || "");
    setIsPublished(page.is_published || false);
    setShowInSidebar(page.show_in_sidebar || false);
  };

  const startCreating = () => {
    setSelectedPage(null);
    setIsCreating(true);
    setTitle("");
    setSlug("");
    setHtmlContent("<div>\n  <h1>My Page</h1>\n  <p>Content goes here</p>\n</div>");
    setCssContent("");
    setJsContent("");
    setIsPublished(false);
    setShowInSidebar(false);
  };

  const savePage = async () => {
    if (!title || !slug || !htmlContent) {
      toast({ title: "Missing fields", description: "Title, slug, and HTML are required", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const pageData = {
        title,
        slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
        html_content: htmlContent,
        css_content: cssContent || null,
        js_content: jsContent || null,
        is_published: isPublished,
        show_in_sidebar: showInSidebar,
        created_by: user?.id,
      };

      if (isCreating) {
        const { error } = await supabase.from("admin_custom_pages").insert(pageData);
        if (error) throw error;
        toast({ title: "Page created" });
      } else if (selectedPage) {
        const { error } = await supabase
          .from("admin_custom_pages")
          .update(pageData)
          .eq("id", selectedPage.id);
        if (error) throw error;
        toast({ title: "Page updated" });
      }

      await loadPages();
      setIsCreating(false);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const deletePage = async (id: string) => {
    const { error } = await supabase.from("admin_custom_pages").delete().eq("id", id);
    if (!error) {
      toast({ title: "Page deleted" });
      setSelectedPage(null);
      loadPages();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* Page list */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileCode className="h-4 w-4" /> Pages
            </CardTitle>
            <Button size="sm" variant="ghost" onClick={startCreating}>
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[60vh]">
            <div className="space-y-0.5 p-2">
              {loading ? (
                <div className="text-center py-4 text-sm text-muted-foreground">Loading...</div>
              ) : pages.length === 0 ? (
                <div className="text-center py-4 text-sm text-muted-foreground">No pages yet</div>
              ) : (
                pages.map((page) => (
                  <button
                    key={page.id}
                    onClick={() => selectPage(page)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedPage?.id === page.id ? "bg-primary/10 text-primary" : "hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{page.title}</span>
                      {page.is_published ? (
                        <Eye className="h-3 w-3 text-green-500 shrink-0" />
                      ) : (
                        <EyeOff className="h-3 w-3 text-muted-foreground shrink-0" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">/x/{page.slug}</span>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Editor */}
      <Card className="lg:col-span-3">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">
              {isCreating ? "New Page" : selectedPage ? `Editing: ${selectedPage.title}` : "Select or create a page"}
            </CardTitle>
            {(isCreating || selectedPage) && (
              <div className="flex items-center gap-2">
                {selectedPage && (
                  <>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`/x/${selectedPage.slug}`} target="_blank">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deletePage(selectedPage.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </>
                )}
                <Button size="sm" onClick={savePage} disabled={saving} className="gap-1.5">
                  <Save className="h-3.5 w-3.5" />
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {(isCreating || selectedPage) ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Page Title" className="h-9" />
                </div>
                <div>
                  <Label className="text-xs">Slug</Label>
                  <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="page-slug" className="h-9" />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch checked={isPublished} onCheckedChange={setIsPublished} />
                  <Label className="text-xs">Published</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={showInSidebar} onCheckedChange={setShowInSidebar} />
                  <Label className="text-xs">Show in Sidebar</Label>
                </div>
              </div>

              <Tabs defaultValue="html">
                <TabsList className="h-8">
                  <TabsTrigger value="html" className="text-xs gap-1"><Code className="h-3 w-3" /> HTML</TabsTrigger>
                  <TabsTrigger value="css" className="text-xs gap-1"><Palette className="h-3 w-3" /> CSS</TabsTrigger>
                  <TabsTrigger value="js" className="text-xs gap-1"><Zap className="h-3 w-3" /> JS</TabsTrigger>
                </TabsList>
                <TabsContent value="html">
                  <Textarea
                    value={htmlContent}
                    onChange={(e) => setHtmlContent(e.target.value)}
                    className="font-mono text-xs min-h-[300px] bg-muted/30"
                    placeholder="<div>Your HTML here</div>"
                  />
                </TabsContent>
                <TabsContent value="css">
                  <Textarea
                    value={cssContent}
                    onChange={(e) => setCssContent(e.target.value)}
                    className="font-mono text-xs min-h-[300px] bg-muted/30"
                    placeholder="/* Your CSS here */"
                  />
                </TabsContent>
                <TabsContent value="js">
                  <Textarea
                    value={jsContent}
                    onChange={(e) => setJsContent(e.target.value)}
                    className="font-mono text-xs min-h-[300px] bg-muted/30"
                    placeholder="// Your JavaScript here"
                  />
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground text-sm">
              Select a page from the list or click + to create a new one
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
