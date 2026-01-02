import { useState } from 'react';
import { Play, Pause, Heart, MoreHorizontal, Clock } from 'lucide-react';
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

interface TrackRowProps {
  track: XVibeTrack;
  index: number;
  queue?: XVibeTrack[];
  showAlbum?: boolean;
  showCover?: boolean;
}

export function TrackRow({ track, index, queue, showAlbum = true, showCover = true }: TrackRowProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { currentTrack, isPlaying, playTrack, togglePlayPause } = useMusicPlayer();
  const { isLiked, toggleLike } = useXVibeLikes();
  
  const isCurrentTrack = currentTrack?.id === track.id;
  const isTrackPlaying = isCurrentTrack && isPlaying;

  const handlePlay = () => {
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

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={cn(
        'grid gap-4 px-4 py-2 rounded-md transition-colors group',
        'hover:bg-[#ffffff10]',
        isCurrentTrack && 'bg-[#ffffff10]',
        showAlbum ? 'grid-cols-[16px_4fr_3fr_minmax(120px,1fr)]' : 'grid-cols-[16px_4fr_minmax(120px,1fr)]'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Track Number / Play Icon */}
      <div className="flex items-center justify-center w-4">
        {isHovered || isTrackPlaying ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={handlePlay}
          >
            {isTrackPlaying ? (
              <Pause className="h-4 w-4 text-[#1DB954] fill-[#1DB954]" />
            ) : (
              <Play className="h-4 w-4 text-white fill-white" />
            )}
          </Button>
        ) : (
          <span className={cn(
            'text-sm tabular-nums',
            isCurrentTrack ? 'text-[#1DB954]' : 'text-[#B3B3B3]'
          )}>
            {index}
          </span>
        )}
      </div>

      {/* Track Info */}
      <div className="flex items-center gap-3 min-w-0">
        {showCover && (
          <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
            {track.cover_url ? (
              <img
                src={track.cover_url}
                alt={track.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#282828] flex items-center justify-center">
                <span className="text-lg">🎵</span>
              </div>
            )}
          </div>
        )}
        <div className="min-w-0">
          <p className={cn(
            'font-medium truncate',
            isCurrentTrack ? 'text-[#1DB954]' : 'text-white'
          )}>
            {track.title}
          </p>
          <p className="text-sm text-[#B3B3B3] truncate">
            {track.is_explicit && (
              <span className="inline-block mr-1 px-1 py-0.5 text-[9px] bg-[#B3B3B3] text-black rounded">
                E
              </span>
            )}
            {track.artist?.name || 'Unknown Artist'}
          </p>
        </div>
      </div>

      {/* Album */}
      {showAlbum && (
        <div className="flex items-center min-w-0">
          <span className="text-sm text-[#B3B3B3] truncate hover:underline cursor-pointer">
            {track.album?.title || 'Single'}
          </span>
        </div>
      )}

      {/* Actions & Duration */}
      <div className="flex items-center justify-end gap-4">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-8 w-8 transition-opacity',
            isHovered || isLiked(track.id) ? 'opacity-100' : 'opacity-0'
          )}
          onClick={(e) => {
            e.stopPropagation();
            toggleLike(track.id);
          }}
        >
          <Heart
            className={cn(
              'h-4 w-4',
              isLiked(track.id) ? 'fill-[#1DB954] text-[#1DB954]' : 'text-[#B3B3B3]'
            )}
          />
        </Button>
        
        <span className="text-sm text-[#B3B3B3] tabular-nums">
          {formatDuration(track.duration)}
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-8 w-8 transition-opacity',
                isHovered ? 'opacity-100' : 'opacity-0'
              )}
            >
              <MoreHorizontal className="h-4 w-4 text-[#B3B3B3]" />
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
            <DropdownMenuItem className="text-white hover:bg-[#3e3e3e]">
              Share
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// Header for track list
export function TrackRowHeader({ showAlbum = true }: { showAlbum?: boolean }) {
  return (
    <div
      className={cn(
        'grid gap-4 px-4 py-2 border-b border-[#ffffff10] text-[#B3B3B3] text-sm uppercase tracking-wider',
        showAlbum ? 'grid-cols-[16px_4fr_3fr_minmax(120px,1fr)]' : 'grid-cols-[16px_4fr_minmax(120px,1fr)]'
      )}
    >
      <div className="text-center">#</div>
      <div>Title</div>
      {showAlbum && <div>Album</div>}
      <div className="flex justify-end">
        <Clock className="h-4 w-4" />
      </div>
    </div>
  );
}
