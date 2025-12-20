import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  MoreVertical,
  Play,
  ListPlus,
  Radio,
  Share,
  FileText,
  Edit,
  Plus,
} from "lucide-react";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { toast } from "sonner";

interface Track {
  id: string;
  title: string;
  artist: string;
  audio_url: string;
  artwork_url?: string;
  cover_url?: string;
  album?: string;
  duration?: number;
  songwriter?: string;
  producer?: string;
  release_date?: string;
  genre?: string;
  artist_id?: string;
}

interface TrackActionsMenuProps {
  track: Track;
  showEditOptions?: boolean;
}

export function TrackActionsMenu({ track, showEditOptions = true }: TrackActionsMenuProps) {
  const { playTrack, addToQueue } = useMusicPlayer();
  const { isAdmin } = useAdminCheck();
  const [isModerator, setIsModerator] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const navigate = useNavigate();

  // Check if user is moderator
  useState(() => {
    const checkModerator = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .in("role", ["moderator", "music_moderator"]);
        setIsModerator(!!data && data.length > 0);
      }
    };
    checkModerator();
  });

  const handlePlay = () => {
    playTrack({
      id: track.id,
      name: track.title,
      url: track.audio_url,
      artist: track.artist,
      album: track.album,
      duration: track.duration,
    });
  };

  const handleAddToQueue = () => {
    addToQueue({
      id: track.id,
      name: track.title,
      url: track.audio_url,
      artist: track.artist,
      album: track.album,
      duration: track.duration,
    });
    toast.success("Added to queue");
  };

  const handleStartRadio = () => {
    // Play the track and fetch similar tracks
    handlePlay();
    toast.success(`Starting radio based on ${track.title}`);
    // In a full implementation, this would fetch similar tracks and queue them
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/niranx/music/track/${track.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Track link copied to clipboard");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const canEdit = isAdmin || isModerator;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={handlePlay}>
            <Play className="h-4 w-4 mr-2" />
            Play
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleAddToQueue}>
            <Plus className="h-4 w-4 mr-2" />
            Add to Queue
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => toast.info("Playlist feature coming soon!")}>
            <ListPlus className="h-4 w-4 mr-2" />
            Add to Playlist
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleStartRadio}>
            <Radio className="h-4 w-4 mr-2" />
            Start Radio
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleShare}>
            <Share className="h-4 w-4 mr-2" />
            Share Track
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowCredits(true)}>
            <FileText className="h-4 w-4 mr-2" />
            View Credits
          </DropdownMenuItem>
          
          {showEditOptions && canEdit && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate(`/niranx/music/track/${track.id}/edit`)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Track Details
              </DropdownMenuItem>
              {track.artist_id && (
                <DropdownMenuItem onClick={() => navigate(`/niranx/music/artist/${track.artist_id}/edit`)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Artist
                </DropdownMenuItem>
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showCredits} onOpenChange={setShowCredits}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Track Credits</DialogTitle>
            <DialogDescription>
              Credits for "{track.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Title</p>
                <p className="font-medium">{track.title}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Artist</p>
                <p className="font-medium">{track.artist}</p>
              </div>
              {track.album && (
                <div>
                  <p className="text-sm text-muted-foreground">Album</p>
                  <p className="font-medium">{track.album}</p>
                </div>
              )}
              {track.genre && (
                <div>
                  <p className="text-sm text-muted-foreground">Genre</p>
                  <p className="font-medium">{track.genre}</p>
                </div>
              )}
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
        </DialogContent>
      </Dialog>
    </>
  );
}
