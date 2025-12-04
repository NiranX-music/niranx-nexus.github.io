import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Disc, Save, ArrowLeft, Plus, X, Upload, Music, Users } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface TrackEntry {
  id: string;
  title: string;
  file: File | null;
  audioUrl: string;
}

interface Artist {
  id: string;
  name: string;
  is_verified?: boolean;
}

interface SelectedArtist {
  id: string;
  name: string;
  role: "primary" | "featured" | "producer";
}

export default function CreateAlbum() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [selectedArtists, setSelectedArtists] = useState<SelectedArtist[]>([]);
  const [currentArtistId, setCurrentArtistId] = useState<string>("");
  const [currentRole, setCurrentRole] = useState<"primary" | "featured" | "producer">("primary");
  const [customArtistName, setCustomArtistName] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [tracks, setTracks] = useState<TrackEntry[]>([
    { id: crypto.randomUUID(), title: "", file: null, audioUrl: "" }
  ]);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");
  
  const [form, setForm] = useState({
    title: "",
    genre: "",
    description: "",
    release_date: "",
  });

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const { data } = await supabase
      .from("artists")
      .select("id, name, is_verified")
      .or(`is_verified.eq.true,created_by.eq.${userData.user?.id}`);
    setArtists(data || []);
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

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const addTrack = () => {
    setTracks([...tracks, { id: crypto.randomUUID(), title: "", file: null, audioUrl: "" }]);
  };

  const removeTrack = (id: string) => {
    if (tracks.length > 1) {
      setTracks(tracks.filter(t => t.id !== id));
    }
  };

  const updateTrack = (id: string, field: keyof TrackEntry, value: any) => {
    setTracks(tracks.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const handleTrackFileChange = (id: string, file: File | null) => {
    if (file) {
      updateTrack(id, "file", file);
      if (!tracks.find(t => t.id === id)?.title) {
        updateTrack(id, "title", file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedArtists.length === 0) {
      toast.error("Please add at least one artist");
      return;
    }

    setIsSaving(true);

    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError || !session) {
        toast.error("Please sign in to create an album");
        return;
      }

      // Upload cover image
      let coverUrl = "";
      if (coverFile) {
        const coverPath = `albums/${session.user.id}/${Date.now()}-${coverFile.name}`;
        const { error: coverError } = await supabase.storage
          .from("music")
          .upload(coverPath, coverFile);
        if (coverError) throw coverError;
        const { data: { publicUrl } } = supabase.storage.from("music").getPublicUrl(coverPath);
        coverUrl = publicUrl;
      }

      // Build artist display name
      const primaryArtists = selectedArtists.filter(a => a.role === "primary").map(a => a.name);
      const featuredArtists = selectedArtists.filter(a => a.role === "featured").map(a => a.name);
      let artistDisplayName = primaryArtists.join(", ");
      if (featuredArtists.length > 0) {
        artistDisplayName += ` ft. ${featuredArtists.join(", ")}`;
      }

      const primaryArtist = selectedArtists.find(a => a.role === "primary" && !a.id.startsWith("custom-"));

      // Create album
      const { data: album, error: albumError } = await supabase
        .from("albums")
        .insert({
          title: form.title,
          artist_id: primaryArtist?.id || null,
          artist_name: artistDisplayName,
          cover_url: coverUrl,
          genre: form.genre || null,
          description: form.description || null,
          release_date: form.release_date || null,
          created_by: session.user.id,
        })
        .select()
        .single();

      if (albumError) throw albumError;

      // Insert album_artists entries for non-custom artists
      const albumArtistsData = selectedArtists
        .filter(a => !a.id.startsWith("custom-"))
        .map(a => ({
          album_id: album.id,
          artist_id: a.id,
          artist_name: a.name,
          role: a.role,
        }));

      if (albumArtistsData.length > 0) {
        const { error: albumArtistsError } = await (supabase as any)
          .from("album_artists")
          .insert(albumArtistsData);

        if (albumArtistsError) {
          console.error("Error linking album artists:", albumArtistsError);
        }
      }

      // Upload and create tracks
      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        if (!track.title) continue;

        let audioUrl = track.audioUrl;
        
        // Upload audio file if provided
        if (track.file) {
          const audioPath = `tracks/${session.user.id}/${Date.now()}-${track.file.name}`;
          const { error: audioError } = await supabase.storage
            .from("music")
            .upload(audioPath, track.file);
          if (audioError) throw audioError;
          const { data: { publicUrl } } = supabase.storage.from("music").getPublicUrl(audioPath);
          audioUrl = publicUrl;
        }

        if (!audioUrl) continue;

        // Create track
        const { data: newTrack, error: trackError } = await supabase
          .from("tracks")
          .insert({
            title: track.title,
            artist: artistDisplayName,
            artist_id: primaryArtist?.id || null,
            album: form.title,
            album_id: album.id,
            audio_url: audioUrl,
            artwork_url: coverUrl,
            genre: form.genre || null,
            uploaded_by: session.user.id,
          })
          .select()
          .single();

        if (trackError) throw trackError;

        // Link track to album
        await supabase.from("album_tracks").insert({
          album_id: album.id,
          track_id: newTrack.id,
          track_number: i + 1,
        });

        // Insert track_artists entries
        const trackArtistsData = selectedArtists
          .filter(a => !a.id.startsWith("custom-"))
          .map(a => ({
            track_id: newTrack.id,
            artist_id: a.id,
            artist_name: a.name,
            role: a.role,
          }));

        if (trackArtistsData.length > 0) {
          await (supabase as any).from("track_artists").insert(trackArtistsData);
        }
      }

      toast.success("Album created successfully! It will be visible after approval.");
      navigate("/niranx/music/library");
    } catch (error: any) {
      console.error("Error creating album:", error);
      toast.error(error.message || "Failed to create album");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-3xl">
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
          <Disc className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Create Album</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Album Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Enter album title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="genre">Genre</Label>
              <Input
                id="genre"
                value={form.genre}
                onChange={(e) => setForm({ ...form, genre: e.target.value })}
                placeholder="e.g., Pop, Rock, Hip-Hop"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="release_date">Release Date</Label>
              <Input
                id="release_date"
                type="date"
                value={form.release_date}
                onChange={(e) => setForm({ ...form, release_date: e.target.value })}
              />
            </div>
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

          <div className="space-y-2">
            <Label>Album Cover</Label>
            <div 
              className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => coverInputRef.current?.click()}
            >
              {coverPreview ? (
                <img src={coverPreview} alt="Cover" className="h-32 w-32 mx-auto rounded object-cover" />
              ) : (
                <>
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to upload cover image</p>
                </>
              )}
            </div>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              className="hidden"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Tell us about this album..."
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Tracks *</Label>
              <Button type="button" variant="outline" size="sm" onClick={addTrack}>
                <Plus className="h-4 w-4 mr-1" />
                Add Track
              </Button>
            </div>

            {tracks.map((track, index) => (
              <Card key={track.id} className="p-4">
                <div className="flex items-start gap-4">
                  <span className="text-muted-foreground font-medium w-6 text-center pt-2">
                    {index + 1}
                  </span>
                  <div className="flex-1 space-y-3">
                    <Input
                      placeholder="Track title"
                      value={track.title}
                      onChange={(e) => updateTrack(track.id, "title", e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Input
                        placeholder="Audio URL (or upload file)"
                        value={track.audioUrl}
                        onChange={(e) => updateTrack(track.id, "audioUrl", e.target.value)}
                        className="flex-1"
                      />
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={(e) => handleTrackFileChange(track.id, e.target.files?.[0] || null)}
                          className="hidden"
                        />
                        <Button type="button" variant="outline" size="icon" asChild>
                          <span>
                            <Music className="h-4 w-4" />
                          </span>
                        </Button>
                      </label>
                    </div>
                    {track.file && (
                      <p className="text-xs text-muted-foreground">File: {track.file.name}</p>
                    )}
                  </div>
                  {tracks.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTrack(track.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <Button type="submit" className="w-full" disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Creating..." : "Create Album"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
