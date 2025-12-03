import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Play, Pause, Clock, MoreHorizontal, Heart, Shuffle, Search, Trash2 } from "lucide-react";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  audio_url: string;
  cover_url?: string;
  artwork_url?: string;
  duration?: number;
}

interface Playlist {
  id: string;
  name: string;
  description?: string;
  cover_image_url?: string;
  user_id: string;
}

export default function PlaylistPage() {
  const { playlistId } = useParams<{ playlistId: string }>();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const { playTrack, currentTrack, isPlaying, togglePlayPause, addToQueue } = useMusicPlayer();
  const navigate = useNavigate();

  useEffect(() => {
    if (playlistId) {
      fetchPlaylist();
      fetchTracks();
    }
  }, [playlistId]);

  const fetchPlaylist = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      const { data, error } = await supabase
        .from("playlists")
        .select("*")
        .eq("id", playlistId)
        .single();

      if (error) throw error;
      setPlaylist(data);
      setIsOwner(session.session?.user.id === data.user_id);
    } catch (error: any) {
      console.error("Error fetching playlist:", error);
      toast.error("Playlist not found");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTracks = async () => {
    try {
      const { data, error } = await supabase
        .from("playlist_tracks")
        .select("position, tracks(*)")
        .eq("playlist_id", playlistId)
        .order("position", { ascending: true });

      if (error) throw error;
      setTracks(data?.map((pt: any) => pt.tracks).filter(Boolean) || []);
    } catch (error: any) {
      console.error("Error fetching tracks:", error);
    }
  };

  const handlePlayTrack = (track: Track) => {
    playTrack({
      id: track.id,
      name: track.title,
      url: track.audio_url,
      artist: track.artist,
      album: track.album,
      duration: track.duration,
    });
  };

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      handlePlayTrack(tracks[0]);
      tracks.slice(1).forEach((track) => {
        addToQueue({
          id: track.id,
          name: track.title,
          url: track.audio_url,
          artist: track.artist,
          album: track.album,
          duration: track.duration,
        });
      });
    }
  };

  const removeFromPlaylist = async (trackId: string) => {
    try {
      await supabase
        .from("playlist_tracks")
        .delete()
        .eq("playlist_id", playlistId)
        .eq("track_id", trackId);
      
      setTracks(tracks.filter(t => t.id !== trackId));
      toast.success("Removed from playlist");
    } catch (error) {
      toast.error("Failed to remove track");
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const totalDuration = tracks.reduce((acc, t) => acc + (t.duration || 0), 0);

  const filteredTracks = tracks.filter(
    (track) =>
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Playlist Not Found</h2>
        <Button onClick={() => navigate("/niranx/music-hub")}>Back to Music</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/20 to-background pb-32">
      {/* Header */}
      <div className="p-8">
        <div className="flex items-end gap-6">
          <img
            src={playlist.cover_image_url || "/placeholder.svg"}
            alt={playlist.name}
            className="w-56 h-56 object-cover shadow-2xl rounded"
          />
          <div className="space-y-2">
            <p className="text-sm font-medium">Playlist</p>
            <h1 className="text-5xl font-black">{playlist.name}</h1>
            {playlist.description && (
              <p className="text-muted-foreground">{playlist.description}</p>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{tracks.length} songs</span>
              <span>•</span>
              <span>{Math.floor(totalDuration / 60)} min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-8 flex items-center gap-4 mb-6">
        <Button
          size="lg"
          className="rounded-full w-14 h-14 bg-primary hover:scale-105 transition-transform"
          onClick={handlePlayAll}
        >
          <Play className="h-6 w-6 fill-current ml-1" />
        </Button>
        <Button variant="ghost" size="icon" className="h-10 w-10">
          <Shuffle className="h-6 w-6" />
        </Button>
        <Button variant="ghost" size="icon" className="h-10 w-10">
          <Heart className="h-6 w-6" />
        </Button>
        <Button variant="ghost" size="icon" className="h-10 w-10">
          <MoreHorizontal className="h-6 w-6" />
        </Button>
      </div>

      {/* Search */}
      <div className="px-8 mb-4">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search in playlist"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Track List Header */}
      <div className="px-8">
        <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-4 px-4 py-2 text-sm text-muted-foreground border-b border-border">
          <span className="w-8 text-center">#</span>
          <span>Title</span>
          <span>Album</span>
          <Clock className="h-4 w-4" />
        </div>

        {/* Track List */}
        <div className="mt-2">
          {filteredTracks.map((track, index) => {
            const isCurrentTrack = currentTrack?.id === track.id;
            return (
              <div
                key={track.id}
                className={`grid grid-cols-[auto_1fr_1fr_auto] gap-4 px-4 py-2 rounded-md group hover:bg-accent/50 cursor-pointer ${
                  isCurrentTrack ? "bg-accent/30" : ""
                }`}
                onClick={() => handlePlayTrack(track)}
              >
                <span className="w-8 text-center text-muted-foreground group-hover:hidden">
                  {index + 1}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 hidden group-hover:flex"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isCurrentTrack) {
                      togglePlayPause();
                    } else {
                      handlePlayTrack(track);
                    }
                  }}
                >
                  {isCurrentTrack && isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={track.artwork_url || track.cover_url || "/placeholder.svg"}
                    alt={track.title}
                    className="h-10 w-10 rounded object-cover"
                  />
                  <div className="min-w-0">
                    <p className={`font-medium truncate ${isCurrentTrack ? "text-primary" : ""}`}>
                      {track.title}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                  </div>
                </div>
                
                <span className="text-muted-foreground truncate self-center">
                  {track.album || "-"}
                </span>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {formatDuration(track.duration)}
                  </span>
                  {isOwner && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/niranx/music/track/${track.id}`)}>
                          View Track
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => removeFromPlaylist(track.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove from Playlist
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {tracks.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg mb-4">This playlist is empty</p>
            <Button onClick={() => navigate("/niranx/music/library")}>
              Browse Music Library
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}