import { useState } from 'react';
import { 
  Play, Pause, SkipForward, ChevronUp, ChevronDown, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useXVibePlayer } from '../../contexts/XVibePlayerContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface MiniPlayerProps {
  onClose?: () => void;
}

export function MiniPlayer({ onClose }: MiniPlayerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlayPause,
    nextTrack,
  } = useXVibePlayer();

  if (!currentTrack) return null;

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div 
      className={cn(
        "fixed bottom-4 right-4 z-[60] bg-[#1a1a1a] border border-[#333] rounded-xl shadow-2xl transition-all duration-300",
        isExpanded ? "w-80" : "w-64"
      )}
    >
      {/* Progress bar on top */}
      <div className="h-1 bg-[#333] rounded-t-xl overflow-hidden">
        <div 
          className="h-full bg-[#1DB954] transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-3">
        {/* Header with expand/close */}
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => navigate('/xvibe')}
            className="text-xs text-[#1DB954] hover:underline font-medium"
          >
            Open XVibe
          </button>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-[#B3B3B3] hover:text-white"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-[#B3B3B3] hover:text-white"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Track Info */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
            {currentTrack.cover_url ? (
              <img
                src={currentTrack.cover_url}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#282828] flex items-center justify-center">
                <span className="text-xl">🎵</span>
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {currentTrack.title}
            </p>
            <p className="text-xs text-[#B3B3B3] truncate">
              {currentTrack.artist?.name || 'Unknown Artist'}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <Button
              size="icon"
              className="h-8 w-8 rounded-full bg-white hover:bg-white/90"
              onClick={togglePlayPause}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4 text-black fill-black" />
              ) : (
                <Play className="h-4 w-4 text-black fill-black ml-0.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-[#B3B3B3] hover:text-white"
              onClick={nextTrack}
            >
              <SkipForward className="h-4 w-4 fill-current" />
            </Button>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-[#333]">
            <div className="flex items-center justify-between text-xs text-[#B3B3B3]">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatTime(seconds: number) {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
