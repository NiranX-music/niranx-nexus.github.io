import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Play, User, Music } from "lucide-react";
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
          <Button onClick={() => navigate("/music/library")}>Browse Library</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <img
              src={artist.avatar_url || "/placeholder.svg"}
              alt={artist.name}
              className="w-full aspect-square object-cover rounded-full shadow-lg"
            />
          </div>

          <div className="md:col-span-3 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Artist</p>
              <h1 className="text-5xl font-bold mb-2">{artist.name}</h1>
              {artist.is_verified && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-500/20 text-blue-500">
                  Verified Artist
                </span>
              )}
            </div>

            {artist.bio && (
              <p className="text-muted-foreground text-lg">{artist.bio}</p>
            )}

            <div className="flex items-center gap-4 pt-4">
              <div>
                <p className="text-2xl font-bold">{tracks.length}</p>
                <p className="text-sm text-muted-foreground">Tracks</p>
              </div>
              <Separator orientation="vertical" className="h-12" />
              <div>
                <p className="text-2xl font-bold">
                  {tracks.reduce((acc, t) => acc + (t.play_count || 0), 0).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Total Plays</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

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
              onClick={() => navigate(`/music/track/${track.id}`)}
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