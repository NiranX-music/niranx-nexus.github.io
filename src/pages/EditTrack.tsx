import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Music, Save, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface TrackForm {
  title: string;
  artist: string;
  album: string;
  genre: string;
  audio_url: string;
  artwork_url: string;
  video_url: string;
  lyrics: string;
  description: string;
  songwriter: string;
  producer: string;
}

export default function EditTrack() {
  const { trackId } = useParams<{ trackId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<TrackForm>({
    title: "",
    artist: "",
    album: "",
    genre: "",
    audio_url: "",
    artwork_url: "",
    video_url: "",
    lyrics: "",
    description: "",
    songwriter: "",
    producer: "",
  });

  useEffect(() => {
    if (trackId) {
      fetchTrack();
    }
  }, [trackId]);

  const fetchTrack = async () => {
    try {
      const { data, error } = await supabase
        .from("tracks")
        .select("*")
        .eq("id", trackId)
        .single();

      if (error) throw error;

      setForm({
        title: data.title || "",
        artist: data.artist || "",
        album: data.album || "",
        genre: data.genre || "",
        audio_url: data.audio_url || "",
        artwork_url: data.artwork_url || "",
        video_url: data.video_url || "",
        lyrics: data.lyrics || "",
        description: data.description || "",
        songwriter: data.songwriter || "",
        producer: data.producer || "",
      });
    } catch (error: any) {
      console.error("Error fetching track:", error);
      toast.error("Failed to load track");
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
        .from("tracks")
        .update({
          title: form.title,
          artist: form.artist,
          album: form.album,
          genre: form.genre,
          audio_url: form.audio_url,
          artwork_url: form.artwork_url,
          video_url: form.video_url || null,
          lyrics: form.lyrics || null,
          description: form.description || null,
          songwriter: form.songwriter || null,
          producer: form.producer || null,
        })
        .eq("id", trackId);

      if (error) throw error;

      toast.success("Track updated successfully!");
      navigate(`/niranx/music/track/${trackId}`);
    } catch (error: any) {
      console.error("Error updating track:", error);
      toast.error("Failed to update track");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Music className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Button
        variant="ghost"
        onClick={() => navigate(`/niranx/music/track/${trackId}`)}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Track
      </Button>

      <Card className="p-6">
        <h1 className="text-3xl font-bold mb-6">Edit Track</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="artist">Artist *</Label>
              <Input
                id="artist"
                value={form.artist}
                onChange={(e) => setForm({ ...form, artist: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="album">Album</Label>
              <Input
                id="album"
                value={form.album}
                onChange={(e) => setForm({ ...form, album: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="genre">Genre</Label>
              <Input
                id="genre"
                value={form.genre}
                onChange={(e) => setForm({ ...form, genre: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="songwriter">Songwriter</Label>
              <Input
                id="songwriter"
                value={form.songwriter}
                onChange={(e) => setForm({ ...form, songwriter: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="producer">Producer</Label>
              <Input
                id="producer"
                value={form.producer}
                onChange={(e) => setForm({ ...form, producer: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="audio_url">Audio URL *</Label>
            <Input
              id="audio_url"
              value={form.audio_url}
              onChange={(e) => setForm({ ...form, audio_url: e.target.value })}
              placeholder="https://example.com/audio.mp3"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="artwork_url">Artwork URL</Label>
            <Input
              id="artwork_url"
              value={form.artwork_url}
              onChange={(e) => setForm({ ...form, artwork_url: e.target.value })}
              placeholder="https://example.com/artwork.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="video_url">Video Preview URL</Label>
            <Input
              id="video_url"
              value={form.video_url}
              onChange={(e) => setForm({ ...form, video_url: e.target.value })}
              placeholder="https://example.com/video.mp4"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lyrics">Lyrics</Label>
            <Textarea
              id="lyrics"
              value={form.lyrics}
              onChange={(e) => setForm({ ...form, lyrics: e.target.value })}
              rows={6}
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
