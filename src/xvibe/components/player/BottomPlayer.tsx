import { useState } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1,
  Volume2, VolumeX, Volume1, Heart, ListMusic, Maximize2, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useXVibePlayer } from '../../contexts/XVibePlayerContext';
import { useXVibeLikes } from '../../hooks/useXVibeLibrary';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export function BottomPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    shuffleMode,
    repeatMode,
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
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [aiPrompt, setAIPrompt] = useState('');
  const [aiGenerating, setAIGenerating] = useState(false);

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

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Please enter a description for your song');
      return;
    }
    
    setAIGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-song', {
        body: { prompt: aiPrompt }
      });
      
      if (error) throw error;
      
      if (data?.audioUrl) {
        toast.success('AI song generated! Check AI Library for your creation.');
        setShowAIDialog(false);
        setAIPrompt('');
      } else {
        toast.info('Song generation started. It may take a few minutes to complete.');
        setShowAIDialog(false);
        setAIPrompt('');
      }
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error('Failed to generate song. Please try again.');
    } finally {
      setAIGenerating(false);
    }
  };

  const VolumeIcon = isMuted || volume === 0 
    ? VolumeX 
    : volume < 0.5 
      ? Volume1 
      : Volume2;

  if (!currentTrack) {
    return (
      <div className="fixed bottom-0 left-0 right-0 h-[90px] bg-[#181818] border-t border-[#282828] z-50" />
    );
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 h-[90px] bg-gradient-to-b from-[#181818] to-[#121212] border-t border-[#282828] z-50 px-4">
        <div className="flex items-center justify-between h-full max-w-screen-2xl mx-auto">
          {/* Left: Now Playing */}
          <div className="flex items-center gap-4 w-[30%] min-w-[180px]">
            <div 
              className="relative w-14 h-14 rounded overflow-hidden flex-shrink-0 cursor-pointer shadow-lg"
              onClick={toggleFullscreen}
            >
              {currentTrack.cover_url ? (
                <img
                  src={currentTrack.cover_url}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#282828] flex items-center justify-center">
                  <span className="text-2xl">🎵</span>
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate hover:underline cursor-pointer">
                {currentTrack.title}
              </p>
              <p className="text-xs text-[#B3B3B3] truncate hover:underline cursor-pointer">
                {currentTrack.artist?.name || 'Unknown Artist'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0"
              onClick={() => toggleLike(currentTrack.id)}
            >
              <Heart
                className={cn(
                  'h-4 w-4',
                  isLiked(currentTrack.id) ? 'fill-[#1DB954] text-[#1DB954]' : 'text-[#B3B3B3]'
                )}
              />
            </Button>
          </div>

          {/* Center: Player Controls */}
          <div className="flex flex-col items-center gap-2 w-[40%] max-w-[722px]">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className={cn('h-8 w-8', shuffleMode && 'text-[#1DB954]')}
                onClick={toggleShuffle}
              >
                <Shuffle className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={previousTrack}
              >
                <SkipBack className="h-5 w-5 fill-current" />
              </Button>
              <Button
                size="icon"
                className="h-9 w-9 rounded-full bg-white hover:bg-white/90 hover:scale-105 transition-transform"
                onClick={togglePlayPause}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5 text-black fill-black" />
                ) : (
                  <Play className="h-5 w-5 text-black fill-black ml-0.5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={nextTrack}
              >
                <SkipForward className="h-5 w-5 fill-current" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn('h-8 w-8', repeatMode !== 'off' && 'text-[#1DB954]')}
                onClick={handleRepeatClick}
              >
                {repeatMode === 'one' ? (
                  <Repeat1 className="h-4 w-4" />
                ) : (
                  <Repeat className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center gap-2 w-full">
              <span className="text-xs text-[#B3B3B3] w-10 text-right tabular-nums">
                {formatTime(currentTime)}
              </span>
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={1}
                onValueChange={([value]) => seekTo(value)}
                className="flex-1 cursor-pointer [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:opacity-0 hover:[&_[role=slider]]:opacity-100 [&_.bg-primary]:bg-[#1DB954] hover:[&_.bg-primary]:bg-[#1DB954]"
              />
              <span className="text-xs text-[#B3B3B3] w-10 tabular-nums">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Right: Volume & Options */}
          <div className="flex items-center justify-end gap-3 w-[30%] min-w-[180px]">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-[#B3B3B3] hover:text-white"
              onClick={() => setShowAIDialog(true)}
              title="Create AI Music"
            >
              <Sparkles className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-[#B3B3B3] hover:text-white"
              onClick={toggleQueue}
            >
              <ListMusic className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 w-32">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-[#B3B3B3] hover:text-white"
                onClick={toggleMute}
              >
                <VolumeIcon className="h-4 w-4" />
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                max={1}
                step={0.01}
                onValueChange={([value]) => setVolume(value)}
                className="flex-1 cursor-pointer [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_.bg-primary]:bg-white hover:[&_.bg-primary]:bg-[#1DB954]"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-[#B3B3B3] hover:text-white"
              onClick={toggleFullscreen}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* AI Music Dialog */}
      <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
        <DialogContent className="bg-[#181818] border-[#282828] text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#1DB954]" />
              Create AI Music
            </DialogTitle>
            <DialogDescription className="text-[#B3B3B3]">
              Describe the type of music you want to create
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={aiPrompt}
              onChange={(e) => setAIPrompt(e.target.value)}
              placeholder="e.g., A calm lo-fi beat with soft piano and rain sounds, perfect for studying..."
              className="bg-[#282828] border-none text-white min-h-[120px] placeholder:text-[#B3B3B3]/50"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowAIDialog(false)}
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAIGenerate}
                disabled={aiGenerating || !aiPrompt.trim()}
                className="flex-1 bg-[#1DB954] hover:bg-[#1DB954]/90 text-white"
              >
                {aiGenerating ? 'Generating...' : 'Generate'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
