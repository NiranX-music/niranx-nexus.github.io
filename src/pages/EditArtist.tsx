import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

export default function EditArtist() {
  const { artistId } = useParams<{ artistId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<ArtistForm>({
    name: "",
    bio: "",
    avatar_url: "",
    custom_url: "",
  });

  useEffect(() => {
    if (artistId) {
      fetchArtist();
    }
  }, [artistId]);

  const fetchArtist = async () => {
    try {
      const { data, error } = await supabase
        .from("artists")
        .select("*")
        .eq("id", artistId)
        .single();

      if (error) throw error;

      setForm({
        name: data.name || "",
        bio: data.bio || "",
        avatar_url: data.avatar_url || "",
        custom_url: data.custom_url || "",
      });
    } catch (error: any) {
      console.error("Error fetching artist:", error);
      toast.error("Failed to load artist");
      navigate("/niranx/music/library");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("artists")
        .update({
          name: form.name,
          bio: form.bio || null,
          avatar_url: form.avatar_url || null,
          custom_url: form.custom_url || null,
        })
        .eq("id", artistId);

      if (error) throw error;

      toast.success("Artist updated successfully!");
      navigate(`/niranx/music/artist/${artistId}`);
    } catch (error: any) {
      console.error("Error updating artist:", error);
      toast.error("Failed to update artist");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <User className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Button
        variant="ghost"
        onClick={() => navigate(`/niranx/music/artist/${artistId}`)}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Artist
      </Button>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Edit Artist</h1>
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
            {form.avatar_url && (
              <img
                src={form.avatar_url}
                alt="Preview"
                className="h-20 w-20 rounded-full object-cover mt-2"
              />
            )}
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
              Custom URL for the artist page (e.g., "taylor-swift")
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
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
