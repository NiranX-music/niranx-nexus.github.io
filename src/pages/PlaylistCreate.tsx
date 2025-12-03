import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ListMusic, Upload, X } from "lucide-react";
import { toast } from "sonner";

export default function PlaylistCreate() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setCoverImage(null);
    setCoverPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Please enter a playlist name");
      return;
    }

    setIsLoading(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error("Please sign in to create a playlist");
        return;
      }

      let coverUrl = null;

      // Upload cover image if provided
      if (coverImage) {
        const fileExt = coverImage.name.split(".").pop();
        const fileName = `${session.session.user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("playlist-covers")
          .upload(fileName, coverImage);

        if (uploadError) {
          console.error("Upload error:", uploadError);
        } else {
          const { data: urlData } = supabase.storage
            .from("playlist-covers")
            .getPublicUrl(fileName);
          coverUrl = urlData.publicUrl;
        }
      }

      // Create playlist
      const { data: playlist, error } = await supabase
        .from("playlists")
        .insert({
          name: name.trim(),
          description: description.trim() || null,
          cover_image_url: coverUrl,
          user_id: session.session.user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Playlist created successfully!");
      navigate(`/niranx/music/playlist/${playlist.id}`);
    } catch (error: any) {
      console.error("Error creating playlist:", error);
      toast.error("Failed to create playlist");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListMusic className="h-6 w-6" />
            Create New Playlist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Cover Image */}
            <div className="flex gap-6">
              <div className="relative">
                {coverPreview ? (
                  <div className="relative">
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      className="w-48 h-48 object-cover rounded-lg shadow-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="w-48 h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">Add Cover</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>

              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Playlist Name *</Label>
                  <Input
                    id="name"
                    placeholder="My Awesome Playlist"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Add an optional description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Playlist"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}