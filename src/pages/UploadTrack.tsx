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
import { useNavigate, useLocation } from "react-router-dom";
import { Music, Upload, Link, Plus, HardDrive, FileAudio, X, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Artist {
  id: string;
  name: string;
  is_verified: boolean;
}

interface SelectedArtist {
  id: string;
  name: string;
  role: "primary" | "featured" | "producer";
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

interface LocationState {
  prefilledUrl?: string;
  prefilledTitle?: string;
}

export default function UploadTrack() {
  const location = useLocation();
  const state = location.state as LocationState | null;
  const [isUploading, setIsUploading] = useState(false);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [selectedArtists, setSelectedArtists] = useState<SelectedArtist[]>([]);
  const [currentArtistId, setCurrentArtistId] = useState<string>("");
  const [currentRole, setCurrentRole] = useState<"primary" | "featured" | "producer">("primary");
  const [customArtistName, setCustomArtistName] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [audioSource, setAudioSource] = useState<"url" | "local">(state?.prefilledUrl ? "url" : "url");
  const [localFile, setLocalFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<UploadForm>({
    defaultValues: {
      audio_url: state?.prefilledUrl || "",
      title: state?.prefilledTitle || "",
    }
  });
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

  const addArtist = () => {
    if (showCustomInput && customArtistName) {
      const newArtist: SelectedArtist = {
        id: `custom-${Date.now()}`,
        name: customArtistName,
        role: currentRole,
      };
      setSelectedArtists([...selectedArtists, newArtist]);
      setCustomArtistName("");
      setShowCustomInput(false);
    } else if (currentArtistId) {
      const artist = artists.find(a => a.id === currentArtistId);
      if (artist && !selectedArtists.find(sa => sa.id === artist.id)) {
        setSelectedArtists([...selectedArtists, { id: artist.id, name: artist.name, role: currentRole }]);
      }
      setCurrentArtistId("");
    }
    setCurrentRole("primary");
  };

  const removeArtist = (id: string) => {
    setSelectedArtists(selectedArtists.filter(a => a.id !== id));
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

    const { error } = await supabase.storage
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

    if (selectedArtists.length === 0) {
      toast.error("Please add at least one artist");
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

      let audioUrl = data.audio_url;
      if (audioSource === "local") {
        audioUrl = await uploadLocalFile(userId) || "";
        if (!audioUrl) {
          toast.error("Failed to upload audio file");
          setIsUploading(false);
          return;
        }
      }

      // Build artist display name (e.g., "Artist1, Artist2 ft. Artist3")
      const primaryArtists = selectedArtists.filter(a => a.role === "primary").map(a => a.name);
      const featuredArtists = selectedArtists.filter(a => a.role === "featured").map(a => a.name);
      let artistDisplayName = primaryArtists.join(", ");
      if (featuredArtists.length > 0) {
        artistDisplayName += ` ft. ${featuredArtists.join(", ")}`;
      }

      const primaryArtist = selectedArtists.find(a => a.role === "primary" && !a.id.startsWith("custom-"));

      const trackData = {
        title: data.title,
        artist: artistDisplayName,
        artist_id: primaryArtist?.id || null,
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

      const { data: newTrack, error: insertError } = await supabase
        .from("tracks")
        .insert(trackData)
        .select()
        .single();

      if (insertError) {
        console.error("Database insert error:", insertError);
        toast.error(`Failed to save track: ${insertError.message}`);
        setIsUploading(false);
        return;
      }

      // Insert track_artists entries for non-custom artists
      const trackArtistsData = selectedArtists
        .filter(a => !a.id.startsWith("custom-"))
        .map(a => ({
          track_id: newTrack.id,
          artist_id: a.id,
          artist_name: a.name,
          role: a.role,
        }));

      if (trackArtistsData.length > 0) {
        const { error: trackArtistsError } = await (supabase as any)
          .from("track_artists")
          .insert(trackArtistsData);

        if (trackArtistsError) {
          console.error("Error linking artists:", trackArtistsError);
        }
      }

      toast.success("Track uploaded successfully to Xvibe! Awaiting moderation.");
      navigate("/music/library");
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
        <h1 className="text-4xl font-bold gradient-text mb-2">Upload to Xvibe</h1>
        <p className="text-muted-foreground">
          Share your music with the Xvibe community. Upload a local file or provide a URL.
        </p>
      </div>

      {state?.prefilledUrl && (
        <Alert className="mb-6">
          <Music className="h-4 w-4" />
          <AlertDescription>
            Publishing from Listed Songs. Edit details below and submit for moderation.
          </AlertDescription>
        </Alert>
      )}

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

          <div className="space-y-2">
            <Label htmlFor="title">Track Title *</Label>
            <Input
              id="title"
              {...register("title", { required: true })}
              placeholder="Enter track title"
            />
            {errors.title && <p className="text-sm text-destructive">Title is required</p>}
          </div>

          {/* Multiple Artists Selection */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Artists *
            </Label>
            
            {selectedArtists.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
                {selectedArtists.map((artist) => (
                  <Badge key={artist.id} variant="secondary" className="flex items-center gap-1 py-1">
                    {artist.name}
                    <span className="text-xs opacity-70">({artist.role})</span>
                    <button type="button" onClick={() => removeArtist(artist.id)} className="ml-1 hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              {!showCustomInput ? (
                <Select value={currentArtistId} onValueChange={setCurrentArtistId}>
                  <SelectTrigger className="flex-1">
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
              ) : (
                <Input
                  value={customArtistName}
                  onChange={(e) => setCustomArtistName(e.target.value)}
                  placeholder="Enter custom artist name"
                  className="flex-1"
                />
              )}
              
              <Select value={currentRole} onValueChange={(v) => setCurrentRole(v as any)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">Primary</SelectItem>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="producer">Producer</SelectItem>
                </SelectContent>
              </Select>

              <Button type="button" onClick={addArtist} variant="outline" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Button
              type="button"
              variant="link"
              size="sm"
              className="p-0 h-auto text-xs"
              onClick={() => setShowCustomInput(!showCustomInput)}
            >
              {showCustomInput ? "Select from existing artists" : "Or add custom artist name"}
            </Button>
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
