import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Music, Upload, Link, Plus, HardDrive, FileAudio } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Artist {
  id: string;
  name: string;
  is_verified: boolean;
}

interface UploadForm {
  title: string;
  album?: string;
  genre?: string;
  songwriter?: string;
  producer?: string;
  release_date?: string;
  lyrics?: string;
  description?: string;
  custom_url?: string;
  audio_url: string;
  artwork_url?: string;
  video_url?: string;
  duration?: number;
}

export default function UploadTrack() {
  const [isUploading, setIsUploading] = useState(false);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [selectedArtistId, setSelectedArtistId] = useState<string>("");
  const [customArtistName, setCustomArtistName] = useState("");
  const [useCustomArtist, setUseCustomArtist] = useState(false);
  const [audioSource, setAudioSource] = useState<"url" | "local">("url");
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<UploadForm>();
  const navigate = useNavigate();

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      const { data, error } = await supabase
        .from("artists")
        .select("id, name, is_verified")
        .order("name", { ascending: true });

      if (error) throw error;
      setArtists(data || []);
    } catch (error) {
      console.error("Error fetching artists:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("audio/")) {
        toast.error("Please select an audio file");
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        toast.error("File size must be less than 50MB");
        return;
      }
      setLocalFile(file);
    }
  };

  const uploadLocalFile = async (userId: string): Promise<string | null> => {
    if (!localFile) return null;

    const fileExt = localFile.name.split(".").pop();
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from("music")
      .upload(fileName, localFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      throw new Error("Failed to upload audio file");
    }

    const { data: urlData } = supabase.storage.from("music").getPublicUrl(fileName);
    return urlData.publicUrl;
  };

  const onSubmit = async (data: UploadForm) => {
    if (audioSource === "url" && !data.audio_url) {
      toast.error("Please provide an audio URL");
      return;
    }

    if (audioSource === "local" && !localFile) {
      toast.error("Please select an audio file");
      return;
    }

    if (!selectedArtistId && !customArtistName) {
      toast.error("Please select an artist or enter a custom artist name");
      return;
    }

    setIsUploading(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error("Please sign in to upload tracks");
        setIsUploading(false);
        return;
      }

      const userId = session.session.user.id;

      // Get audio URL
      let audioUrl = data.audio_url;
      if (audioSource === "local") {
        audioUrl = await uploadLocalFile(userId) || "";
        if (!audioUrl) {
          toast.error("Failed to upload audio file");
          setIsUploading(false);
          return;
        }
      }

      // Get artist name
      let artistName = customArtistName;
      let artistId = selectedArtistId || null;
      
      if (selectedArtistId && !useCustomArtist) {
        const selectedArtist = artists.find(a => a.id === selectedArtistId);
        artistName = selectedArtist?.name || customArtistName;
      }

      // Insert track directly into database
      const trackData = {
        title: data.title,
        artist: artistName,
        artist_id: useCustomArtist ? null : artistId,
        album: data.album || null,
        genre: data.genre || null,
        songwriter: data.songwriter || null,
        producer: data.producer || null,
        release_date: data.release_date || null,
        lyrics: data.lyrics || null,
        description: data.description || null,
        custom_url: data.custom_url || null,
        audio_url: audioUrl,
        artwork_url: data.artwork_url || null,
        video_url: data.video_url || null,
        duration: data.duration || null,
        uploaded_by: userId,
        is_approved: false,
      };

      const { error: insertError } = await supabase.from("tracks").insert(trackData);

      if (insertError) {
        console.error("Database insert error:", insertError);
        toast.error(`Failed to save track: ${insertError.message}`);
        setIsUploading(false);
        return;
      }

      toast.success("Track uploaded successfully! Awaiting moderation.");
      navigate("/niranx/music/library");
    } catch (error: any) {
      console.error("Error uploading track:", error);
      toast.error(error.message || "Failed to upload track");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-4xl font-bold gradient-text mb-2">Upload Track</h1>
        <p className="text-muted-foreground">
          Share your music with the community. Upload a local file or provide a URL.
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <Label>Audio Source *</Label>
            <Tabs value={audioSource} onValueChange={(v) => setAudioSource(v as "url" | "local")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="url" className="flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  URL
                </TabsTrigger>
                <TabsTrigger value="local" className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4" />
                  Local File
                </TabsTrigger>
              </TabsList>
              <TabsContent value="url" className="mt-4">
                <div className="flex items-center gap-2">
                  <Link className="h-4 w-4 text-muted-foreground" />
                  <Input
                    {...register("audio_url")}
                    placeholder="https://example.com/audio.mp3"
                    className="flex-1"
                  />
                </div>
              </TabsContent>
              <TabsContent value="local" className="mt-4">
                <div 
                  className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {localFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileAudio className="h-8 w-8 text-primary" />
                      <div className="text-left">
                        <p className="font-medium">{localFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(localFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground">Click to select audio file</p>
                      <p className="text-xs text-muted-foreground mt-1">Max 50MB, MP3/WAV/OGG/M4A</p>
                    </>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Track Title *</Label>
              <Input
                id="title"
                {...register("title", { required: true })}
                placeholder="Enter track title"
              />
              {errors.title && <p className="text-sm text-destructive">Title is required</p>}
            </div>

            <div className="space-y-2">
              <Label>Artist *</Label>
              {!useCustomArtist ? (
                <div className="space-y-2">
                  <Select value={selectedArtistId} onValueChange={setSelectedArtistId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an artist" />
                    </SelectTrigger>
                    <SelectContent>
                      {artists.map((artist) => (
                        <SelectItem key={artist.id} value={artist.id}>
                          {artist.name} {artist.is_verified && "✓"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="p-0 h-auto text-xs"
                    onClick={() => setUseCustomArtist(true)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Or add custom artist name
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Input
                    value={customArtistName}
                    onChange={(e) => setCustomArtistName(e.target.value)}
                    placeholder="Enter artist name"
                  />
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="p-0 h-auto text-xs"
                    onClick={() => {
                      setUseCustomArtist(false);
                      setCustomArtistName("");
                    }}
                  >
                    Select from existing artists
                  </Button>
                </div>
              )}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="release_date">Release Date</Label>
              <Input id="release_date" type="date" {...register("release_date")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (seconds)</Label>
              <Input 
                id="duration" 
                type="number" 
                {...register("duration", { valueAsNumber: true })} 
                placeholder="e.g., 180" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="artwork_url">Artwork URL</Label>
            <Input
              id="artwork_url"
              {...register("artwork_url")}
              placeholder="https://example.com/artwork.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="video_url">Preview Video URL</Label>
            <Input
              id="video_url"
              {...register("video_url")}
              placeholder="https://example.com/preview.mp4"
            />
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
                <Music className="h-4 w-4 mr-2" />
                Upload Track
              </>
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}
