import { Music, Pause, Play, SkipBack, SkipForward, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import { useNavigate } from "react-router-dom";

export function MiniPlayer() {
  const { currentTrack, isPlaying, togglePlayPause, nextTrack, previousTrack } = useMusicPlayer();
  const navigate = useNavigate();

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 right-4 z-50 animate-slide-up">
      <div className="glass-card p-4 flex items-center gap-3 min-w-[300px] hover-lift">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{currentTrack.name}</p>
          <p className="text-xs text-muted-foreground truncate">
            {currentTrack.artist || 'Unknown Artist'}
          </p>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={previousTrack}
            className="h-8 w-8"
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          
          <Button
            size="icon"
            variant="default"
            onClick={togglePlayPause}
            className="h-8 w-8"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          
          <Button
            size="icon"
            variant="ghost"
            onClick={nextTrack}
            className="h-8 w-8"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        <Button
          size="icon"
          variant="ghost"
          onClick={() => navigate('/niranx/music-hub')}
          className="h-8 w-8"
          title="Open Music Player"
        >
          <Music className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
