import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Music, Upload, Image, Video } from "lucide-react";

interface UploadForm {
  title: string;
  artist: string;
  album?: string;
  genre?: string;
  songwriter?: string;
  producer?: string;
  release_date?: string;
  lyrics?: string;
  description?: string;
  custom_url?: string;
}

export default function UploadTrack() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<UploadForm>();
  const navigate = useNavigate();

  const uploadFile = async (file: File, bucket: string) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const onSubmit = async (data: UploadForm) => {
    if (!audioFile) {
      toast.error("Please select an audio file");
      return;
    }

    setIsUploading(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error("Please sign in to upload tracks");
        return;
      }

      // Upload audio file
      const audioUrl = await uploadFile(audioFile, "music-files");

      // Upload artwork if provided
      let artworkUrl = null;
      if (artworkFile) {
        artworkUrl = await uploadFile(artworkFile, "images");
      }

      // Upload video if provided
      let videoUrl = null;
      if (videoFile) {
        if (videoFile.size > 50 * 1024 * 1024) {
          toast.error("Video file must be less than 50MB");
          return;
        }
        videoUrl = await uploadFile(videoFile, "videos");
      }

      // Get duration of audio file
      const audio = new Audio();
      audio.src = URL.createObjectURL(audioFile);
      await new Promise(resolve => {
        audio.onloadedmetadata = resolve;
      });
      const duration = Math.floor(audio.duration);

      // Insert track into database
      const { error: insertError } = await supabase.from("tracks").insert({
        title: data.title,
        artist: data.artist,
        album: data.album,
        genre: data.genre,
        songwriter: data.songwriter,
        producer: data.producer,
        release_date: data.release_date,
        lyrics: data.lyrics,
        description: data.description,
        custom_url: data.custom_url,
        audio_url: audioUrl,
        artwork_url: artworkUrl,
        video_url: videoUrl,
        duration: duration,
        uploaded_by: session.session.user.id,
        is_approved: false, // Requires moderation
      });

      if (insertError) throw insertError;

      toast.success("Track uploaded successfully! Awaiting moderation.");
      navigate("/music/library");
    } catch (error: any) {
      console.error("Error uploading track:", error);
      toast.error("Failed to upload track");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-4xl font-bold gradient-text mb-2">Upload Track</h1>
        <p className="text-muted-foreground">
          Share your music with the community. All uploads are reviewed before publishing.
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="audio">Audio File *</Label>
            <div className="flex items-center gap-4">
              <Input
                id="audio"
                type="file"
                accept="audio/*"
                onChange={e => setAudioFile(e.target.files?.[0] || null)}
                required
              />
              {audioFile && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Music className="h-4 w-4" />
                  {audioFile.name}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Track Title *</Label>
              <Input
                id="title"
                {...register("title", { required: true })}
                placeholder="Enter track title"
              />
              {errors.title && <p className="text-sm text-red-500">Title is required</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="artist">Artist *</Label>
              <Input
                id="artist"
                {...register("artist", { required: true })}
                placeholder="Enter artist name"
              />
              {errors.artist && <p className="text-sm text-red-500">Artist is required</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="album">Album</Label>
              <Input id="album" {...register("album")} placeholder="Enter album name" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="genre">Genre</Label>
              <Input id="genre" {...register("genre")} placeholder="e.g., Pop, Rock, Jazz" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="songwriter">Songwriter</Label>
              <Input id="songwriter" {...register("songwriter")} placeholder="Enter songwriter" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="producer">Producer</Label>
              <Input id="producer" {...register("producer")} placeholder="Enter producer" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="release_date">Release Date</Label>
            <Input id="release_date" type="date" {...register("release_date")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="artwork">Artwork</Label>
            <div className="flex items-center gap-4">
              <Input
                id="artwork"
                type="file"
                accept="image/*"
                onChange={e => setArtworkFile(e.target.files?.[0] || null)}
              />
              {artworkFile && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Image className="h-4 w-4" />
                  {artworkFile.name}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="video">Preview Video (10-15 seconds, max 50MB)</Label>
            <div className="flex items-center gap-4">
              <Input
                id="video"
                type="file"
                accept="video/*"
                onChange={e => setVideoFile(e.target.files?.[0] || null)}
              />
              {videoFile && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Video className="h-4 w-4" />
                  {videoFile.name}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Tell us about this track..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lyrics">Lyrics</Label>
            <Textarea
              id="lyrics"
              {...register("lyrics")}
              placeholder="Enter track lyrics..."
              rows={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom_url">Custom URL (optional)</Label>
            <Input
              id="custom_url"
              {...register("custom_url")}
              placeholder="e.g., my-awesome-song"
            />
            <p className="text-xs text-muted-foreground">
              Request a custom URL for your track (subject to availability and approval)
            </p>
          </div>

          <Button type="submit" disabled={isUploading} className="w-full">
            {isUploading ? (
              <>
                <Upload className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Track
              </>
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}