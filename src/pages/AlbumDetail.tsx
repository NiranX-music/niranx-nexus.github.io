import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Play, Heart, Share, Disc, Edit, Trash2, Music } from "lucide-react";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
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

interface Album {
  id: string;
  title: string;
  artist_name: string;
  artist_id?: string;
  cover_url?: string;
  release_date?: string;
  genre?: string;
  description?: string;
  created_by?: string;
}

interface Track {
  id: string;
  title: string;
  artist: string;
  audio_url: string;
  duration?: number;
  track_number: number;
}

export default function AlbumDetail() {
  const { albumId } = useParams<{ albumId: string }>();
  const [album, setAlbum] = useState<Album | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { playTrack, addToQueue } = useMusicPlayer();
  const navigate = useNavigate();

  useEffect(() => {
    if (albumId) {
      fetchAlbum();
      fetchTracks();
      checkOwnership();
    }
  }, [albumId]);

  const fetchAlbum = async () => {
    try {
      const { data, error } = await supabase
        .from("albums")
        .select("*")
        .eq("id", albumId)
        .single();

      if (error) throw error;
      setAlbum(data);
    } catch (error: any) {
      console.error("Error fetching album:", error);
      toast.error("Failed to load album");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTracks = async () => {
    try {
      const { data, error } = await supabase
        .from("album_tracks")
        .select(`
          track_number,
          tracks:track_id (
            id, title, artist, audio_url, duration
          )
        `)
        .eq("album_id", albumId)
        .order("track_number");

      if (error) throw error;
      
      const formattedTracks = data?.map(item => ({
        ...(item.tracks as any),
        track_number: item.track_number
      })) || [];
      
      setTracks(formattedTracks);
    } catch (error: any) {
      console.error("Error fetching tracks:", error);
    }
  };

  const checkOwnership = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data } = await supabase
        .from("albums")
        .select("created_by")
        .eq("id", albumId)
        .single();
      setIsOwner(data?.created_by === session.user.id);
    }
  };

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      playTrack({
        id: tracks[0].id,
        name: tracks[0].title,
        url: tracks[0].audio_url,
        artist: tracks[0].artist,
        album: album?.title,
        duration: tracks[0].duration,
      });
      
      tracks.slice(1).forEach(track => {
        addToQueue({
          id: track.id,
          name: track.title,
          url: track.audio_url,
          artist: track.artist,
          album: album?.title,
          duration: track.duration,
        });
      });
    }
  };

  const handlePlayTrack = (track: Track) => {
    playTrack({
      id: track.id,
      name: track.title,
      url: track.audio_url,
      artist: track.artist,
      album: album?.title,
      duration: track.duration,
    });
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Delete album (tracks and album_tracks will cascade)
      const { error } = await supabase
        .from("albums")
        .delete()
        .eq("id", albumId);

      if (error) throw error;

      toast.success("Album deleted successfully");
      navigate("/music/library");
    } catch (error: any) {
      console.error("Error deleting album:", error);
      toast.error("Failed to delete album");
    } finally {
      setIsDeleting(false);
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
        <Disc className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!album) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-12 text-center">
          <Disc className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Album Not Found</h2>
          <p className="text-muted-foreground mb-4">
            This album doesn't exist or has been removed.
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
              src={album.cover_url || "/placeholder.svg"}
              alt={album.title}
              className="w-full aspect-square object-cover rounded-lg shadow-lg"
            />
          </div>

          <div className="md:col-span-2 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Album</p>
              <h1 className="text-5xl font-bold mb-4">{album.title}</h1>
              <p className="text-lg text-muted-foreground mb-2">{album.artist_name}</p>
              {album.genre && <p className="text-muted-foreground">Genre: {album.genre}</p>}
              {album.release_date && (
                <p className="text-muted-foreground">
                  Released: {new Date(album.release_date).toLocaleDateString()}
                </p>
              )}
              <p className="text-sm text-muted-foreground mt-2">
                {tracks.length} tracks
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Button size="lg" onClick={handlePlayAll} disabled={tracks.length === 0}>
                <Play className="h-5 w-5 mr-2" />
                Play All
              </Button>
              <Button size="lg" variant="outline" onClick={handleShare}>
                <Share className="h-5 w-5" />
              </Button>
              {isOwner && (
                <>
                  <Button size="lg" variant="outline" onClick={() => navigate(`/niranx/music/album/${album.id}/edit`)}>
                    <Edit className="h-5 w-5" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="lg" variant="destructive">
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Album</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{album.title}"? This will also delete all tracks in this album. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                          {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>

            {album.description && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">About</h3>
                <p className="text-muted-foreground">{album.description}</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Tracks</h2>
        <Separator className="mb-4" />
        <div className="space-y-2">
          {tracks.map((track) => (
            <div
              key={track.id}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
              onClick={() => handlePlayTrack(track)}
            >
              <span className="text-muted-foreground w-8 text-center">{track.track_number}</span>
              <Music className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium">{track.title}</p>
                <p className="text-sm text-muted-foreground">{track.artist}</p>
              </div>
              <span className="text-sm text-muted-foreground">
                {formatDuration(track.duration)}
              </span>
              <Button size="icon" variant="ghost">
                <Play className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {tracks.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No tracks in this album</p>
          )}
        </div>
      </Card>
    </div>
  );
}
