import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Play, Heart, Share, Music2, User } from "lucide-react";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import { toast } from "sonner";

interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  audio_url: string;
  artwork_url?: string;
  cover_url?: string;
  video_url?: string;
  lyrics?: string;
  description?: string;
  duration?: number;
  genre?: string;
  songwriter?: string;
  producer?: string;
  release_date?: string;
  play_count?: number;
  artist_id?: string;
}

interface RecommendedTrack {
  id: string;
  title: string;
  artist: string;
  cover_url?: string;
  artwork_url?: string;
}

export default function TrackDetail() {
  const { trackId } = useParams<{ trackId: string }>();
  const [track, setTrack] = useState<Track | null>(null);
  const [recommended, setRecommended] = useState<RecommendedTrack[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { playTrack } = useMusicPlayer();
  const navigate = useNavigate();

  useEffect(() => {
    if (trackId) {
      fetchTrack();
      fetchRecommended();
      checkIfLiked();
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
      setTrack(data);
    } catch (error: any) {
      console.error("Error fetching track:", error);
      toast.error("Failed to load track");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecommended = async () => {
    try {
      const { data, error } = await supabase
        .from("tracks")
        .select("id, title, artist, cover_url, artwork_url")
        .eq("is_approved", true)
        .neq("id", trackId)
        .limit(5);

      if (error) throw error;
      setRecommended(data || []);
    } catch (error: any) {
      console.error("Error fetching recommended tracks:", error);
    }
  };

  const checkIfLiked = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;

      const { data, error } = await supabase
        .from("liked_tracks")
        .select("id")
        .eq("user_id", session.session.user.id)
        .eq("track_id", trackId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      setIsLiked(!!data);
    } catch (error: any) {
      console.error("Error checking like status:", error);
    }
  };

  const handlePlay = async () => {
    if (!track) return;

    playTrack({
      id: track.id,
      name: track.title,
      url: track.audio_url,
      artist: track.artist,
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

  const toggleLike = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error("Please sign in to like tracks");
        return;
      }

      if (isLiked) {
        await supabase
          .from("liked_tracks")
          .delete()
          .eq("track_id", trackId)
          .eq("user_id", session.session.user.id);
        setIsLiked(false);
        toast.success("Removed from liked songs");
      } else {
        await supabase.from("liked_tracks").insert({
          track_id: trackId,
          user_id: session.session.user.id,
        });
        setIsLiked(true);
        toast.success("Added to liked songs");
      }
    } catch (error: any) {
      console.error("Error toggling like:", error);
      toast.error("Failed to update liked songs");
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Music2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!track) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-12 text-center">
          <Music2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Track Not Found</h2>
          <p className="text-muted-foreground mb-4">
            This track doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/music/library")}>Browse Library</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <img
              src={track.artwork_url || track.cover_url || "/placeholder.svg"}
              alt={track.title}
              className="w-full aspect-square object-cover rounded-lg shadow-lg"
            />
          </div>

          <div className="md:col-span-2 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Song</p>
              <h1 className="text-5xl font-bold mb-4">{track.title}</h1>
              <div className="flex items-center gap-2 mb-4">
                {track.artist_id && (
                  <Button
                    variant="link"
                    onClick={() => navigate(`/music/artist/${track.artist_id}`)}
                    className="p-0 h-auto"
                  >
                    <User className="h-4 w-4 mr-1" />
                    {track.artist}
                  </Button>
                )}
                {!track.artist_id && <p className="text-lg text-muted-foreground">{track.artist}</p>}
              </div>
              {track.album && (
                <p className="text-muted-foreground">Album: {track.album}</p>
              )}
              {track.genre && (
                <p className="text-muted-foreground">Genre: {track.genre}</p>
              )}
              {track.play_count !== undefined && (
                <p className="text-sm text-muted-foreground mt-2">
                  {track.play_count.toLocaleString()} plays
                </p>
              )}
            </div>

            <div className="flex items-center gap-4">
              <Button size="lg" onClick={handlePlay}>
                <Play className="h-5 w-5 mr-2" />
                Play
              </Button>
              <Button size="lg" variant="outline" onClick={toggleLike}>
                <Heart className={`h-5 w-5 ${isLiked ? "fill-current text-red-500" : ""}`} />
              </Button>
              <Button size="lg" variant="outline" onClick={handleShare}>
                <Share className="h-5 w-5" />
              </Button>
            </div>

            {track.video_url && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Preview</h3>
                <video
                  src={track.video_url}
                  controls
                  className="w-full rounded-lg"
                  style={{ maxHeight: "300px" }}
                />
              </div>
            )}

            {track.description && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">About</h3>
                <p className="text-muted-foreground">{track.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mt-6">
              {track.songwriter && (
                <div>
                  <p className="text-sm text-muted-foreground">Songwriter</p>
                  <p className="font-medium">{track.songwriter}</p>
                </div>
              )}
              {track.producer && (
                <div>
                  <p className="text-sm text-muted-foreground">Producer</p>
                  <p className="font-medium">{track.producer}</p>
                </div>
              )}
              {track.release_date && (
                <div>
                  <p className="text-sm text-muted-foreground">Release Date</p>
                  <p className="font-medium">
                    {new Date(track.release_date).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {track.lyrics && (
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Lyrics</h2>
          <pre className="whitespace-pre-wrap font-sans text-muted-foreground">
            {track.lyrics}
          </pre>
        </Card>
      )}

      {recommended.length > 0 && (
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Recommended</h2>
          <Separator className="mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {recommended.map(rec => (
              <Card
                key={rec.id}
                className="cursor-pointer hover:bg-accent/50 transition-colors overflow-hidden"
                onClick={() => navigate(`/music/track/${rec.id}`)}
              >
                <img
                  src={rec.artwork_url || rec.cover_url || "/placeholder.svg"}
                  alt={rec.title}
                  className="w-full aspect-square object-cover"
                />
                <div className="p-3">
                  <p className="font-medium text-sm truncate">{rec.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{rec.artist}</p>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}