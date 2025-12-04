import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Save, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface ArtistForm {
  name: string;
  bio: string;
  avatar_url: string;
  custom_url: string;
}

export default function CreateArtist() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<ArtistForm>({
    name: "",
    bio: "",
    avatar_url: "",
    custom_url: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session) {
        toast.error("Please sign in to create an artist");
        setIsSaving(false);
        return;
      }

      const { data, error } = await supabase
        .from("artists")
        .insert({
          name: form.name,
          bio: form.bio || null,
          avatar_url: form.avatar_url || null,
          custom_url: form.custom_url || null,
          created_by: session.user.id,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating artist:", error);
        toast.error(error.message || "Failed to create artist");
        return;
      }

      toast.success("Artist created successfully! It will be visible after verification.");
      navigate(`/niranx/music/artist/${data.id}`);
    } catch (error: any) {
      console.error("Error creating artist:", error);
      toast.error(error.message || "Failed to create artist");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Button
        variant="ghost"
        onClick={() => navigate("/niranx/music/library")}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Library
      </Button>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Add New Artist</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Artist Name *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Enter artist name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar_url">Avatar URL</Label>
            <Input
              id="avatar_url"
              value={form.avatar_url}
              onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom_url">Custom URL Slug</Label>
            <Input
              id="custom_url"
              value={form.custom_url}
              onChange={(e) => setForm({ ...form, custom_url: e.target.value })}
              placeholder="artist-name"
            />
            <p className="text-xs text-muted-foreground">
              Optional: Custom URL for the artist page (e.g., "taylor-swift")
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biography</Label>
            <Textarea
              id="bio"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Tell us about the artist..."
              rows={5}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Creating..." : "Create Artist"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
