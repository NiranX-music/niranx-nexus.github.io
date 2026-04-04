import { useState } from 'react';
import { Music, Pause, Play, SkipBack, SkipForward, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';

export function HeaderMediaControl() {
  const { currentTrack, isPlaying, togglePlayPause, nextTrack, previousTrack } = useMusicPlayer();

  if (!currentTrack) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-accent" title="Now Playing">
          <Music className="h-4 w-4" />
          {isPlaying && (
            <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-primary rounded-full animate-pulse" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="end">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Music className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{currentTrack.name}</p>
              <p className="text-xs text-muted-foreground truncate">{currentTrack.artist || 'Unknown'}</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Button size="icon" variant="ghost" onClick={previousTrack} className="h-8 w-8">
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="default" onClick={togglePlayPause} className="h-9 w-9">
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button size="icon" variant="ghost" onClick={nextTrack} className="h-8 w-8">
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
