import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ContentBlock, DiscoverPage } from "@/types/discover";
import { BlockEditor } from "@/components/discover/BlockEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Loader2, Eye } from "lucide-react";
import { toast } from "sonner";

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").slice(0, 80);

export default function DiscoverEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isNew = !id;

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [parentId, setParentId] = useState<string>("");
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [isPublished, setIsPublished] = useState(false);
  const [allPages, setAllPages] = useState<DiscoverPage[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);

  useEffect(() => {
    (async () => {
      const { data: list } = await supabase.from("discover_pages").select("*");
      setAllPages((list as DiscoverPage[]) || []);
      if (!isNew && id) {
        const { data } = await supabase.from("discover_pages").select("*").eq("id", id).maybeSingle();
        if (data) {
          const p = data as DiscoverPage;
          setTitle(p.title); setSlug(p.slug); setDescription(p.description || "");
          setTags(p.tags.join(", ")); setCoverImage(p.cover_image_url || "");
          setParentId(p.parent_id || ""); setBlocks(p.content as ContentBlock[]);
          setIsPublished(p.is_published);
        }
        setLoading(false);
      }
    })();
  }, [id, isNew]);

  useEffect(() => {
    if (isNew && title && !slug) setSlug(slugify(title));
  }, [title, isNew, slug]);

  const save = async (publish?: boolean) => {
    if (!title.trim() || !slug.trim()) { toast.error("Title and slug required"); return; }
    if (!user) return;
    setSaving(true);
    const willPublish = publish !== undefined ? publish : isPublished;
    const payload = {
      title: title.trim(),
      slug: slugify(slug),
      description: description.trim() || null,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      cover_image_url: coverImage.trim() || null,
      parent_id: parentId || null,
      content: blocks as any,
      is_published: willPublish,
      author_id: user.id,
      author_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Admin",
      published_at: willPublish ? new Date().toISOString() : null,
    };

    const { data, error } = isNew
      ? await supabase.from("discover_pages").insert(payload).select().single()
      : await supabase.from("discover_pages").update(payload).eq("id", id!).select().single();

    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(isNew ? "Page created" : "Saved");
    setIsPublished(willPublish);
    if (isNew && data) navigate(`/admin/discover/edit/${(data as any).id}`);
  };

  if (loading) return <div className="p-10 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 pb-32">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => navigate("/admin/discover")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <div className="flex gap-2">
          {!isNew && (
            <Button variant="outline" onClick={() => window.open(`/discover/${slug}`, "_blank")}>
              <Eye className="h-4 w-4 mr-2" /> Preview
            </Button>
          )}
          <Button variant="outline" onClick={() => save(false)} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Save Draft
          </Button>
          <Button onClick={() => save(true)} disabled={saving}>
            <Save className="h-4 w-4 mr-2" /> Publish
          </Button>
        </div>
      </div>

      <div className="grid gap-4 mb-6">
        <div>
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Page title" className="text-lg" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Slug (URL)</Label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="my-awesome-page" />
          </div>
          <div>
            <Label>Tags (comma separated)</Label>
            <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="ai, tutorial, design" />
          </div>
        </div>
        <div>
          <Label>Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Short summary for SEO and feed" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Cover Image URL</Label>
            <Input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="https://..." />
          </div>
          <div>
            <Label>Parent Page (for nesting)</Label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">— None (top level) —</option>
              {allPages.filter((p) => p.id !== id).map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={isPublished} onCheckedChange={setIsPublished} />
          <Label>Published</Label>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Content Blocks</h3>
        <BlockEditor blocks={blocks} onChange={setBlocks} />
      </div>
    </div>
  );
}
