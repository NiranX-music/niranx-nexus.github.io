import { useState } from 'react';
import { Play, Pause, Heart, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { XVibeTrack } from '../../types';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { useXVibeLikes } from '../../hooks/useXVibeLibrary';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TrackCardProps {
  track: XVibeTrack;
  queue?: XVibeTrack[];
  showArtist?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function TrackCard({ track, queue, showArtist = true, size = 'md', className }: TrackCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { currentTrack, isPlaying, playTrack, togglePlayPause } = useMusicPlayer();
  const { isLiked, toggleLike } = useXVibeLikes();
  
  const isCurrentTrack = currentTrack?.id === track.id;
  const isTrackPlaying = isCurrentTrack && isPlaying;

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentTrack) {
      togglePlayPause();
    } else {
      // Convert XVibeTrack to Music Player Track format
      playTrack({
        id: track.id,
        name: track.title,
        url: track.audio_url,
        artist: track.artist?.name,
        album: track.album?.title,
        duration: track.duration
      });
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLike(track.id);
  };

  const sizeClasses = {
    sm: 'w-32',
    md: 'w-40',
    lg: 'w-48',
  };

  return (
    <div
      className={cn(
        'group relative flex flex-col rounded-lg p-3 transition-all duration-200',
        'bg-[#181818] hover:bg-[#282828] cursor-pointer',
        sizeClasses[size],
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handlePlay}
    >
      {/* Cover Art */}
      <div className="relative aspect-square w-full mb-3 rounded-md overflow-hidden shadow-lg">
        {track.cover_url ? (
          <img
            src={track.cover_url}
            alt={track.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-[#282828] flex items-center justify-center">
            <span className="text-4xl">🎵</span>
          </div>
        )}
        
        {/* Play Button Overlay */}
        <div
          className={cn(
            'absolute bottom-2 right-2 transition-all duration-200',
            isHovered || isTrackPlaying
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-2'
          )}
        >
          <Button
            size="icon"
            className="w-12 h-12 rounded-full bg-[#1DB954] hover:bg-[#1ed760] hover:scale-105 shadow-xl"
            onClick={handlePlay}
          >
            {isTrackPlaying ? (
              <Pause className="h-6 w-6 text-black fill-black" />
            ) : (
              <Play className="h-6 w-6 text-black fill-black ml-1" />
            )}
          </Button>
        </div>
      </div>

      {/* Track Info */}
      <div className="flex-1 min-w-0">
        <h3 className={cn(
          'font-semibold text-white truncate text-sm',
          isCurrentTrack && 'text-[#1DB954]'
        )}>
          {track.title}
        </h3>
        {showArtist && track.artist && (
          <p className="text-xs text-[#B3B3B3] truncate mt-1">
            {track.artist.name}
          </p>
        )}
      </div>

      {/* Actions (visible on hover) */}
      <div
        className={cn(
          'absolute top-2 right-2 flex gap-1 transition-opacity duration-200',
          isHovered ? 'opacity-100' : 'opacity-0'
        )}
      >
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-white hover:text-[#1DB954]"
          onClick={handleLike}
        >
          <Heart
            className={cn('h-4 w-4', isLiked(track.id) && 'fill-[#1DB954] text-[#1DB954]')}
          />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-white"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#282828] border-[#3e3e3e]">
            <DropdownMenuItem className="text-white hover:bg-[#3e3e3e]">
              Add to Queue
            </DropdownMenuItem>
            <DropdownMenuItem className="text-white hover:bg-[#3e3e3e]">
              Add to Playlist
            </DropdownMenuItem>
            <DropdownMenuItem className="text-white hover:bg-[#3e3e3e]">
              Go to Artist
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
