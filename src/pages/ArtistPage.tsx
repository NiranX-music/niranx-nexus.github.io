import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Play, User, Music, Edit } from "lucide-react";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import { toast } from "sonner";

interface Artist {
  id: string;
  name: string;
  bio?: string;
  avatar_url?: string;
  is_verified: boolean;
}

interface Track {
  id: string;
  title: string;
  album?: string;
  audio_url: string;
  cover_url?: string;
  artwork_url?: string;
  duration?: number;
  play_count?: number;
}

export default function ArtistPage() {
  const { artistId } = useParams<{ artistId: string }>();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [popularTracks, setPopularTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { playTrack } = useMusicPlayer();
  const navigate = useNavigate();

  useEffect(() => {
    if (artistId) {
      fetchArtist();
      fetchTracks();
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
      setArtist(data);
    } catch (error: any) {
      console.error("Error fetching artist:", error);
      toast.error("Failed to load artist");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTracks = async () => {
    try {
      const { data, error } = await supabase
        .from("tracks")
        .select("*")
        .eq("artist_id", artistId)
        .eq("is_approved", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTracks(data || []);

      // Get popular tracks (sorted by play count)
      const popular = [...(data || [])].sort((a, b) => (b.play_count || 0) - (a.play_count || 0)).slice(0, 5);
      setPopularTracks(popular);
    } catch (error: any) {
      console.error("Error fetching tracks:", error);
    }
  };

  const handlePlayTrack = async (track: Track) => {
    playTrack({
      id: track.id,
      name: track.title,
      url: track.audio_url,
      artist: artist?.name || "",
      album: track.album,
      duration: track.duration,
    });

    // Record play
    try {
      const { data: session } = await supabase.auth.getSession();
      if (session.session) {
        await supabase.from("track_plays").insert({
          track_id: track.id,
          user_id: session.session.user.id,
        });
      }
    } catch (error) {
      console.error("Error recording play:", error);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <User className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-12 text-center">
          <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Artist Not Found</h2>
          <p className="text-muted-foreground mb-4">
            This artist doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/niranx/music/library")}>Browse Library</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32">
      {/* Hero Header with gradient */}
      <div 
        className="relative h-80 bg-gradient-to-b from-primary/40 to-background"
        style={{
          backgroundImage: artist.avatar_url ? `linear-gradient(to bottom, rgba(0,0,0,0.3), hsl(var(--background))), url(${artist.avatar_url})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute bottom-0 left-0 right-0 p-8 flex items-end gap-6">
          <img
            src={artist.avatar_url || "/placeholder.svg"}
            alt={artist.name}
            className="w-48 h-48 object-cover rounded-full shadow-2xl border-4 border-background"
          />
          <div className="space-y-2 pb-4">
            {artist.is_verified && (
              <div className="flex items-center gap-1 text-sm">
                <span className="bg-blue-500 rounded-full p-0.5">✓</span>
                <span>Verified Artist</span>
              </div>
            )}
            <h1 className="text-6xl font-black">{artist.name}</h1>
            <p className="text-muted-foreground">
              {tracks.reduce((acc, t) => acc + (t.play_count || 0), 0).toLocaleString()} monthly listeners
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-8 py-6 flex items-center gap-4">
        <Button
          size="lg"
          className="rounded-full w-14 h-14 bg-primary hover:scale-105 transition-transform"
          onClick={() => popularTracks.length > 0 && handlePlayTrack(popularTracks[0])}
        >
          <Play className="h-6 w-6 fill-current ml-1" />
        </Button>
        <Button variant="outline" className="rounded-full">Following</Button>
        <Button variant="ghost" size="icon"><Music className="h-5 w-5" /></Button>
        <Button 
          variant="outline" 
          onClick={() => navigate(`/niranx/music/artist/${artistId}/edit`)}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Artist
        </Button>
      </div>

      {popularTracks.length > 0 && (
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Popular Tracks</h2>
          <Separator className="mb-4" />
          <div className="space-y-2">
            {popularTracks.map((track, index) => (
              <Card
                key={track.id}
                className="p-4 hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground w-8 text-center font-bold">{index + 1}</span>
                  <img
                    src={track.artwork_url || track.cover_url || "/placeholder.svg"}
                    alt={track.title}
                    className="h-12 w-12 rounded object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{track.title}</p>
                    {track.album && <p className="text-sm text-muted-foreground">{track.album}</p>}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {(track.play_count || 0).toLocaleString()} plays
                  </p>
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {formatDuration(track.duration)}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handlePlayTrack(track)}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">All Tracks</h2>
        <Separator className="mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {tracks.map(track => (
            <Card
              key={track.id}
              className="cursor-pointer hover:bg-accent/50 transition-colors overflow-hidden"
              onClick={() => navigate(`/niranx/music/track/${track.id}`)}
            >
              <img
                src={track.artwork_url || track.cover_url || "/placeholder.svg"}
                alt={track.title}
                className="w-full aspect-square object-cover"
              />
              <div className="p-3">
                <p className="font-medium text-sm truncate">{track.title}</p>
                {track.album && (
                  <p className="text-xs text-muted-foreground truncate">{track.album}</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
}