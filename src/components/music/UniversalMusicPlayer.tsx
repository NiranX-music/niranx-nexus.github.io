import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Shuffle,
  Repeat,
  ListMusic,
  Maximize2,
  Heart
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

export default function UniversalMusicPlayer() {
  const {
    currentTrack,
    isPlaying,
    queue,
    volume,
    currentTime,
    duration,
    togglePlayPause,
    nextTrack,
    previousTrack,
    removeFromQueue,
    setVolume,
    seekTo,
    playTrack,
  } = useMusicPlayer();
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(0.5);
  const [isLiked, setIsLiked] = useState(false);

  if (!currentTrack) return null;

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleVolumeToggle = () => {
    if (isMuted) {
      setVolume(previousVolume);
      setIsMuted(false);
    } else {
      setPreviousVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border">
      <div className="container mx-auto px-4">
        {/* Progress Bar - clickable */}
        <div 
          className="absolute top-0 left-0 right-0 h-1 bg-muted cursor-pointer group"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            seekTo(percent * duration);
          }}
        >
          <div 
            className="h-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
          />
        </div>

        <div className="flex items-center justify-between py-3 gap-4">
          {/* Track Info */}
          <div 
            className="flex items-center gap-3 min-w-0 w-[30%] cursor-pointer"
            onClick={() => navigate(`/niranx/music/track/${currentTrack.id}`)}
          >
            <img
              src="/placeholder.svg"
              alt={currentTrack.name}
              className="h-14 w-14 rounded-md object-cover shadow-lg"
            />
            <div className="min-w-0">
              <p className="font-medium text-sm truncate hover:underline">{currentTrack.name}</p>
              <p className="text-xs text-muted-foreground truncate hover:underline">
                {currentTrack.artist || "Unknown Artist"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className={`shrink-0 ${isLiked ? "text-primary" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                setIsLiked(!isLiked);
              }}
            >
              <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
            </Button>
          </div>

          {/* Controls */}
          <div className="flex flex-col items-center gap-1 w-[40%]">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <Shuffle className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={previousTrack}>
                <SkipBack className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                className="h-10 w-10 rounded-full bg-foreground text-background hover:scale-105 transition-transform"
                onClick={togglePlayPause}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5 fill-current" />
                ) : (
                  <Play className="h-5 w-5 fill-current ml-0.5" />
                )}
              </Button>
              <Button variant="ghost" size="icon" onClick={nextTrack}>
                <SkipForward className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <Repeat className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2 w-full max-w-md text-xs text-muted-foreground">
              <span className="w-10 text-right">{formatTime(currentTime)}</span>
              <Slider
                value={[progress]}
                max={100}
                step={0.1}
                className="flex-1"
                onValueChange={([val]) => seekTo((val / 100) * duration)}
              />
              <span className="w-10">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Volume & Queue */}
          <div className="flex items-center justify-end gap-2 w-[30%]">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <ListMusic className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Queue</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-100px)] mt-4">
                  <div className="space-y-2">
                    {/* Now Playing */}
                    <div className="mb-4">
                      <p className="text-xs text-muted-foreground mb-2">Now Playing</p>
                      <Card className="p-3 bg-primary/10">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded" />
                          <div>
                            <p className="font-medium text-sm">{currentTrack.name}</p>
                            <p className="text-xs text-muted-foreground">{currentTrack.artist}</p>
                          </div>
                        </div>
                      </Card>
                    </div>

                    {/* Up Next */}
                    {queue.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Up Next</p>
                        {queue.map((track, index) => (
                          <Card
                            key={track.id}
                            className="p-3 mb-2 cursor-pointer hover:bg-accent/50"
                            onClick={() => playTrack(track)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-muted-foreground w-4">{index + 1}</span>
                                <div>
                                  <p className="font-medium text-sm">{track.name}</p>
                                  <p className="text-xs text-muted-foreground">{track.artist}</p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFromQueue(track.id);
                                }}
                              >
                                Remove
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}

                    {queue.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">Queue is empty</p>
                    )}
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>

            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              onClick={handleVolumeToggle}
            >
              {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
            <Slider
              value={[volume * 100]}
              max={100}
              step={1}
              className="w-24"
              onValueChange={([val]) => {
                setVolume(val / 100);
                if (val > 0) setIsMuted(false);
              }}
            />
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => navigate(`/niranx/music/track/${currentTrack.id}`)}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}