import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Music, Play, Heart, Plus, MoreVertical, Search, Disc, Trash2, ListMusic } from "lucide-react";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  audio_url: string;
  cover_url?: string;
  duration?: number;
  genre?: string;
  artist_id?: string;
  artwork_url?: string;
}

interface Playlist {
  id: string;
  name: string;
  description?: string;
  cover_image_url?: string;
  track_count?: number;
}

interface Album {
  id: string;
  title: string;
  artist_name: string;
  cover_url?: string;
}

export default function MusicLibrary() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [likedTracks, setLikedTracks] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { playTrack } = useMusicPlayer();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTracks();
    fetchPlaylists();
    fetchAlbums();
    fetchLikedTracks();
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setCurrentUserId(session?.user?.id || null);
  };

  const fetchAlbums = async () => {
    try {
      const { data, error } = await supabase
        .from("albums")
        .select("id, title, artist_name, cover_url")
        .eq("is_approved", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAlbums(data || []);
    } catch (error: any) {
      console.error("Error fetching albums:", error);
    }
  };

  const fetchTracks = async () => {
    try {
      const { data, error } = await supabase
        .from("tracks")
        .select("*")
        .eq("is_approved", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTracks(data || []);
    } catch (error: any) {
      console.error("Error fetching tracks:", error);
      toast.error("Failed to load tracks");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlaylists = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;

      const { data, error } = await supabase
        .from("playlists")
        .select("*, playlist_tracks(count)")
        .eq("user_id", session.session.user.id);

      if (error) throw error;
      setPlaylists(data || []);
    } catch (error: any) {
      console.error("Error fetching playlists:", error);
    }
  };

  const fetchLikedTracks = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;

      const { data, error } = await supabase
        .from("liked_tracks")
        .select("track_id")
        .eq("user_id", session.session.user.id);

      if (error) throw error;
      setLikedTracks(new Set(data?.map(d => d.track_id) || []));
    } catch (error: any) {
      console.error("Error fetching liked tracks:", error);
    }
  };

  const handlePlayTrack = async (track: Track) => {
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

  const toggleLike = async (trackId: string) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error("Please sign in to like tracks");
        return;
      }

      if (likedTracks.has(trackId)) {
        await supabase
          .from("liked_tracks")
          .delete()
          .eq("track_id", trackId)
          .eq("user_id", session.session.user.id);
        setLikedTracks(prev => {
          const newSet = new Set(prev);
          newSet.delete(trackId);
          return newSet;
        });
        toast.success("Removed from liked songs");
      } else {
        await supabase.from("liked_tracks").insert({
          track_id: trackId,
          user_id: session.session.user.id,
        });
        setLikedTracks(prev => new Set(prev).add(trackId));
        toast.success("Added to liked songs");
      }
    } catch (error: any) {
      console.error("Error toggling like:", error);
      toast.error("Failed to update liked songs");
    }
  };

  const addToPlaylist = async (trackId: string, playlistId: string) => {
    try {
      const { data: existingTracks } = await supabase
        .from("playlist_tracks")
        .select("position")
        .eq("playlist_id", playlistId)
        .order("position", { ascending: false })
        .limit(1);

      const nextPosition = existingTracks?.length ? existingTracks[0].position + 1 : 0;

      await supabase.from("playlist_tracks").insert({
        playlist_id: playlistId,
        track_id: trackId,
        position: nextPosition,
      });

      toast.success("Added to playlist");
    } catch (error: any) {
      console.error("Error adding to playlist:", error);
      toast.error("Failed to add to playlist");
    }
  };

  const deleteTrack = async (trackId: string) => {
    try {
      const { error } = await supabase
        .from("tracks")
        .delete()
        .eq("id", trackId);

      if (error) throw error;
      
      setTracks(tracks.filter(t => t.id !== trackId));
      toast.success("Track deleted successfully");
    } catch (error: any) {
      console.error("Error deleting track:", error);
      toast.error("Failed to delete track");
    }
  };

  const filteredTracks = tracks.filter(
    track =>
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.album?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Music className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Xvibe Library</h1>
          <p className="text-muted-foreground">Discover and play your favorite tracks on Xvibe</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => navigate("/niranx/music/listed-songs")}>
            <ListMusic className="h-4 w-4 mr-2" />
            Listed Songs
          </Button>
          <Button variant="outline" onClick={() => navigate("/niranx/music/artist/create")}>
            <Plus className="h-4 w-4 mr-2" />
            Add Artist
          </Button>
          <Button variant="outline" onClick={() => navigate("/niranx/music/album/create")}>
            <Disc className="h-4 w-4 mr-2" />
            Create Album
          </Button>
          <Button onClick={() => navigate("/niranx/music/upload")}>
            <Plus className="h-4 w-4 mr-2" />
            Upload Track
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tracks, artists, albums..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="tracks" className="w-full">
        <TabsList>
          <TabsTrigger value="tracks">All Tracks</TabsTrigger>
          <TabsTrigger value="albums">Albums</TabsTrigger>
          <TabsTrigger value="playlists">Playlists</TabsTrigger>
          <TabsTrigger value="liked">Liked Songs</TabsTrigger>
        </TabsList>

        <TabsContent value="tracks" className="space-y-4 mt-6">
          <div className="grid gap-2">
            {filteredTracks.map((track, index) => (
              <Card
                key={track.id}
                className="p-4 hover:bg-accent/50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground w-8 text-center">{index + 1}</span>
                  <img
                    src={track.artwork_url || track.cover_url || "/placeholder.svg"}
                    alt={track.title}
                    className="h-12 w-12 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{track.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                  </div>
                  <p className="text-sm text-muted-foreground hidden md:block">{track.album}</p>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => toggleLike(track.id)}
                    className={likedTracks.has(track.id) ? "text-red-500" : ""}
                  >
                    <Heart className={`h-4 w-4 ${likedTracks.has(track.id) ? "fill-current" : ""}`} />
                  </Button>
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/niranx/music/track/${track.id}`)}>
                        View Track Details
                      </DropdownMenuItem>
                      {track.artist_id && (
                        <DropdownMenuItem onClick={() => navigate(`/niranx/music/artist/${track.artist_id}`)}>
                          Go to Artist
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Add to Queue</DropdownMenuItem>
                      {playlists.length > 0 && (
                        <>
                          <DropdownMenuSeparator />
                          {playlists.map(playlist => (
                            <DropdownMenuItem
                              key={playlist.id}
                              onClick={() => addToPlaylist(track.id, playlist.id)}
                            >
                          Add to {playlist.name}
                            </DropdownMenuItem>
                          ))}
                        </>
                      )}
                      {currentUserId && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => deleteTrack(track.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Track
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="albums" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Card
              className="p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-accent/50 transition-colors min-h-[200px]"
              onClick={() => navigate("/niranx/music/album/create")}
            >
              <Plus className="h-12 w-12 mb-2 text-muted-foreground" />
              <p className="font-medium">Create Album</p>
            </Card>
            {albums.map(album => (
              <Card
                key={album.id}
                className="cursor-pointer hover:bg-accent/50 transition-colors overflow-hidden"
                onClick={() => navigate(`/niranx/music/album/${album.id}`)}
              >
                <img
                  src={album.cover_url || "/placeholder.svg"}
                  alt={album.title}
                  className="w-full aspect-square object-cover"
                />
                <div className="p-4">
                  <p className="font-medium truncate">{album.title}</p>
                  <p className="text-sm text-muted-foreground truncate">{album.artist_name}</p>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="playlists" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Card
              className="p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-accent/50 transition-colors min-h-[200px]"
              onClick={() => navigate("/niranx/music/playlists/create")}
            >
              <Plus className="h-12 w-12 mb-2 text-muted-foreground" />
              <p className="font-medium">Create Playlist</p>
            </Card>
            {playlists.map(playlist => (
              <Card
                key={playlist.id}
                className="cursor-pointer hover:bg-accent/50 transition-colors overflow-hidden"
                onClick={() => navigate(`/niranx/music/playlist/${playlist.id}`)}
              >
                <img
                  src={playlist.cover_image_url || "/placeholder.svg"}
                  alt={playlist.name}
                  className="w-full aspect-square object-cover"
                />
                <div className="p-4">
                  <p className="font-medium truncate">{playlist.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {playlist.track_count || 0} tracks
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="liked" className="mt-6">
          <div className="grid gap-2">
            {filteredTracks
              .filter(track => likedTracks.has(track.id))
              .map((track, index) => (
                <Card
                  key={track.id}
                  className="p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground w-8 text-center">{index + 1}</span>
                    <img
                      src={track.artwork_url || track.cover_url || "/placeholder.svg"}
                      alt={track.title}
                      className="h-12 w-12 rounded object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{track.title}</p>
                      <p className="text-sm text-muted-foreground">{track.artist}</p>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => handlePlayTrack(track)}>
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}