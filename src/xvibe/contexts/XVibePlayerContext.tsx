import { createContext, useContext, useState, useRef, useCallback, useEffect, ReactNode } from 'react';
import { XVibeTrack, PlayerState, RepeatMode } from '../types';
import { supabase } from '@/integrations/supabase/client';

interface XVibePlayerContextType extends PlayerState {
  audioRef: React.RefObject<HTMLAudioElement>;
  playTrack: (track: XVibeTrack, queue?: XVibeTrack[]) => void;
  togglePlayPause: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  setRepeatMode: (mode: RepeatMode) => void;
  addToQueue: (track: XVibeTrack) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  toggleFullscreen: () => void;
  toggleQueue: () => void;
  toggleDJMode: () => void;
}

const XVibePlayerContext = createContext<XVibePlayerContextType | undefined>(undefined);

export function XVibePlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [currentTrack, setCurrentTrack] = useState<XVibeTrack | null>(null);
  const [queue, setQueue] = useState<XVibeTrack[]>([]);
  const [originalQueue, setOriginalQueue] = useState<XVibeTrack[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [shuffleMode, setShuffleMode] = useState(false);
  const [repeatMode, setRepeatModeState] = useState<RepeatMode>('off');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isDJMode, setIsDJMode] = useState(false);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration || 0);
    const handleEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play();
      } else {
        nextTrack();
      }
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [repeatMode, queue]);

  // Shuffle helper
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const playTrack = useCallback((track: XVibeTrack, newQueue?: XVibeTrack[]) => {
    if (!audioRef.current) return;

    setCurrentTrack(track);
    audioRef.current.src = track.audio_url;
    audioRef.current.play().catch(console.error);
    setIsPlaying(true);

    if (newQueue) {
      const filteredQueue = newQueue.filter(t => t.id !== track.id);
      setOriginalQueue(filteredQueue);
      setQueue(shuffleMode ? shuffleArray(filteredQueue) : filteredQueue);
    }

    // Record play count (fire and forget)
  }, [shuffleMode]);

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
  }, [isPlaying]);

  const nextTrack = useCallback(() => {
    if (queue.length === 0) {
      if (repeatMode === 'all' && originalQueue.length > 0) {
        const newQueue = shuffleMode ? shuffleArray(originalQueue) : [...originalQueue];
        if (newQueue.length > 0) {
          const [next, ...rest] = newQueue;
          setQueue(rest);
          playTrack(next);
        }
      } else {
        setIsPlaying(false);
      }
      return;
    }

    const [next, ...rest] = queue;
    setQueue(rest);
    playTrack(next);
  }, [queue, repeatMode, originalQueue, shuffleMode, playTrack]);

  const previousTrack = useCallback(() => {
    if (audioRef.current) {
      if (audioRef.current.currentTime > 3) {
        audioRef.current.currentTime = 0;
      } else {
        // Go to previous track logic could be added here
        audioRef.current.currentTime = 0;
      }
    }
  }, []);

  const seekTo = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
    if (vol > 0) setIsMuted(false);
  }, []);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const toggleShuffle = useCallback(() => {
    if (!shuffleMode) {
      setQueue(shuffleArray(queue));
    } else {
      setQueue([...originalQueue].filter(t => !currentTrack || t.id !== currentTrack.id));
    }
    setShuffleMode(!shuffleMode);
  }, [shuffleMode, queue, originalQueue, currentTrack]);

  const setRepeatMode = useCallback((mode: RepeatMode) => {
    setRepeatModeState(mode);
  }, []);

  const addToQueue = useCallback((track: XVibeTrack) => {
    setQueue(prev => [...prev, track]);
    setOriginalQueue(prev => [...prev, track]);
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    setQueue(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
    setOriginalQueue([]);
  }, []);

  const reorderQueue = useCallback((fromIndex: number, toIndex: number) => {
    setQueue(prev => {
      const newQueue = [...prev];
      const [moved] = newQueue.splice(fromIndex, 1);
      newQueue.splice(toIndex, 0, moved);
      return newQueue;
    });
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  const toggleQueue = useCallback(() => {
    setIsQueueOpen(prev => !prev);
  }, []);

  const toggleDJMode = useCallback(() => {
    setIsDJMode(prev => !prev);
  }, []);

  return (
    <XVibePlayerContext.Provider
      value={{
        currentTrack,
        queue,
        originalQueue,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        shuffleMode,
        repeatMode,
        isFullscreen,
        isQueueOpen,
        isDJMode,
        audioRef,
        playTrack,
        togglePlayPause,
        nextTrack,
        previousTrack,
        seekTo,
        setVolume,
        toggleMute,
        toggleShuffle,
        setRepeatMode,
        addToQueue,
        removeFromQueue,
        clearQueue,
        reorderQueue,
        toggleFullscreen,
        toggleQueue,
        toggleDJMode,
      }}
    >
      <audio ref={audioRef} preload="metadata" />
      {children}
    </XVibePlayerContext.Provider>
  );
}

export function useXVibePlayer() {
  const context = useContext(XVibePlayerContext);
  if (context === undefined) {
    throw new Error('useXVibePlayer must be used within a XVibePlayerProvider');
  }
  return context;
}
