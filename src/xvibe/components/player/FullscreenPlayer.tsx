import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1,
  Volume2, VolumeX, Volume1, Heart, ChevronDown, ListMusic, Share2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useXVibePlayer } from '../../contexts/XVibePlayerContext';
import { useXVibeLikes } from '../../hooks/useXVibeLibrary';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

export function FullscreenPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    shuffleMode,
    repeatMode,
    isFullscreen,
    togglePlayPause,
    nextTrack,
    previousTrack,
    seekTo,
    setVolume,
    toggleMute,
    toggleShuffle,
    setRepeatMode,
    toggleFullscreen,
    toggleQueue,
  } = useXVibePlayer();

  const { isLiked, toggleLike } = useXVibeLikes();
  const [showLyrics, setShowLyrics] = useState(false);

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, toggleFullscreen]);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRepeatClick = () => {
    const modes: ('off' | 'one' | 'all')[] = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    setRepeatMode(modes[(currentIndex + 1) % 3]);
  };

  const VolumeIcon = isMuted || volume === 0 
    ? VolumeX 
    : volume < 0.5 
      ? Volume1 
      : Volume2;

  if (!currentTrack) return null;

  return (
    <AnimatePresence>
      {isFullscreen && (
        <motion.div
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed inset-0 z-[100] bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f0f23] overflow-hidden"
        >
          {/* Background blur effect */}
          <div 
            className="absolute inset-0 opacity-30 blur-3xl scale-150"
            style={{
              backgroundImage: currentTrack.cover_url ? `url(${currentTrack.cover_url})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          
          {/* Content */}
          <div className="relative z-10 flex flex-col h-full p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-white hover:bg-white/10"
                onClick={toggleFullscreen}
              >
                <ChevronDown className="h-6 w-6" />
              </Button>
              <div className="text-center">
                <p className="text-xs text-white/60 uppercase tracking-widest">Playing from</p>
                <p className="text-sm font-medium text-white">
                  {currentTrack.album?.title || 'Your Library'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-white hover:bg-white/10"
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center max-w-lg w-full">
                {/* Album Art */}
                <motion.div 
                  className="w-80 h-80 md:w-96 md:h-96 rounded-lg overflow-hidden shadow-2xl mb-8"
                  animate={{ scale: isPlaying ? 1 : 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentTrack.cover_url ? (
                    <img
                      src={currentTrack.cover_url}
                      alt={currentTrack.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#5038a0] to-[#1a1a2e] flex items-center justify-center">
                      <span className="text-8xl">🎵</span>
                    </div>
                  )}
                </motion.div>

                {/* Track Info */}
                <div className="w-full flex items-center justify-between mb-6">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold text-white truncate">
                      {currentTrack.title}
                    </h2>
                    <p className="text-lg text-white/70">
                      {currentTrack.artist?.name || 'Unknown Artist'}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 flex-shrink-0"
                    onClick={() => toggleLike(currentTrack.id)}
                  >
                    <Heart
                      className={cn(
                        'h-6 w-6',
                        isLiked(currentTrack.id) ? 'fill-[#1DB954] text-[#1DB954]' : 'text-white'
                      )}
                    />
                  </Button>
                </div>

                {/* Progress Bar */}
                <div className="w-full mb-6">
                  <Slider
                    value={[currentTime]}
                    max={duration || 100}
                    step={1}
                    onValueChange={([value]) => seekTo(value)}
                    className="cursor-pointer [&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_.bg-primary]:bg-white"
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-sm text-white/60 tabular-nums">
                      {formatTime(currentTime)}
                    </span>
                    <span className="text-sm text-white/60 tabular-nums">
                      {formatTime(duration)}
                    </span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-6 mb-8">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn('h-10 w-10', shuffleMode && 'text-[#1DB954]')}
                    onClick={toggleShuffle}
                  >
                    <Shuffle className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12"
                    onClick={previousTrack}
                  >
                    <SkipBack className="h-8 w-8 fill-white" />
                  </Button>
                  <Button
                    size="icon"
                    className="h-16 w-16 rounded-full bg-white hover:bg-white/90 hover:scale-105 transition-transform"
                    onClick={togglePlayPause}
                  >
                    {isPlaying ? (
                      <Pause className="h-8 w-8 text-black fill-black" />
                    ) : (
                      <Play className="h-8 w-8 text-black fill-black ml-1" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12"
                    onClick={nextTrack}
                  >
                    <SkipForward className="h-8 w-8 fill-white" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn('h-10 w-10', repeatMode !== 'off' && 'text-[#1DB954]')}
                    onClick={handleRepeatClick}
                  >
                    {repeatMode === 'one' ? (
                      <Repeat1 className="h-5 w-5" />
                    ) : (
                      <Repeat className="h-5 w-5" />
                    )}
                  </Button>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2 w-32">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-white/60 hover:text-white"
                      onClick={toggleMute}
                    >
                      <VolumeIcon className="h-5 w-5" />
                    </Button>
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      max={1}
                      step={0.01}
                      onValueChange={([value]) => setVolume(value)}
                      className="flex-1 cursor-pointer [&_.bg-primary]:bg-white"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-white/60 hover:text-white"
                    onClick={toggleQueue}
                  >
                    <ListMusic className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
