import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Volume2,
  Upload,
  Music,
  Heart,
  MoreHorizontal,
  Disc3
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Track {
  id: string;
  name: string;
  file: File;
  url: string;
  duration?: number;
  isLiked?: boolean;
}

const MusicPlayer = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(75);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved tracks from localStorage
  useEffect(() => {
    const savedTracks = localStorage.getItem('studyverse-music-tracks');
    if (savedTracks) {
      try {
        const parsed = JSON.parse(savedTracks);
        // Can't save File objects, so this would need a more complex solution
        // For now, tracks are reset on page reload
      } catch (error) {
        console.error('Error loading tracks:', error);
      }
    }
  }, []);

  // Update document title with current track
  useEffect(() => {
    if (tracks[currentTrackIndex]) {
      document.title = `${tracks[currentTrackIndex].name} - StudyVerse`;
    } else {
      document.title = 'StudyVerse';
    }
  }, [currentTrackIndex, tracks]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setIsLoading(true);

    Promise.all(
      files.map(file => {
        return new Promise<Track>((resolve) => {
          const url = URL.createObjectURL(file);
          const audio = new Audio(url);
          
          audio.addEventListener('loadedmetadata', () => {
            resolve({
              id: Math.random().toString(36).substr(2, 9),
              name: file.name.replace(/\.[^/.]+$/, ""),
              file,
              url,
              duration: audio.duration
            });
          });
        });
      })
    ).then((newTracks) => {
      setTracks(prev => [...prev, ...newTracks]);
      setIsLoading(false);
      toast({
        title: "Music Added!",
        description: `Added ${newTracks.length} track(s) to your playlist`,
      });
    });
  };

  const playTrack = (index: number) => {
    if (!audioRef.current || !tracks[index]) return;
    
    setCurrentTrackIndex(index);
    audioRef.current.src = tracks[index].url;
    audioRef.current.play();
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const nextTrack = () => {
    if (tracks.length === 0) return;
    
    let nextIndex;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * tracks.length);
    } else {
      nextIndex = (currentTrackIndex + 1) % tracks.length;
    }
    playTrack(nextIndex);
  };

  const previousTrack = () => {
    if (tracks.length === 0) return;
    
    const prevIndex = currentTrackIndex === 0 ? tracks.length - 1 : currentTrackIndex - 1;
    playTrack(prevIndex);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    if (audioRef.current) {
      audioRef.current.volume = value[0] / 100;
    }
  };

  const handleTrackEnd = () => {
    if (isRepeat) {
      playTrack(currentTrackIndex);
    } else {
      nextTrack();
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const currentTrack = tracks[currentTrackIndex];

  return (
    <Card className="widget music-widget col-span-1 md:col-span-2">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={handleTrackEnd}
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Music Player</h3>
              <p className="text-sm text-muted-foreground">
                {tracks.length} track{tracks.length !== 1 ? 's' : ''} loaded
              </p>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="glass-button"
          >
            <Upload className="w-4 h-4 mr-2" />
            {isLoading ? 'Loading...' : 'Add Music'}
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="audio/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Current Track Display */}
        {currentTrack && (
          <div className="text-center space-y-4">
            <div className="w-24 h-24 mx-auto bg-gradient-accent rounded-full flex items-center justify-center animate-rotate-slow">
              <Disc3 className="w-12 h-12 text-white" />
            </div>
            
            <div>
              <h4 className="font-semibold text-lg truncate">{currentTrack.name}</h4>
              <p className="text-sm text-muted-foreground">Unknown Artist</p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <Slider
                value={[currentTime]}
                max={duration}
                step={1}
                onValueChange={handleSeek}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsShuffle(!isShuffle)}
            className={isShuffle ? 'text-primary' : ''}
          >
            <Shuffle className="w-4 h-4" />
          </Button>

          <Button variant="ghost" size="sm" onClick={previousTrack}>
            <SkipBack className="w-5 h-5" />
          </Button>

          <Button
            size="lg"
            onClick={togglePlayPause}
            disabled={!currentTrack}
            className="w-14 h-14 rounded-full bg-gradient-primary hover:scale-110 transition-transform"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white ml-1" />
            )}
          </Button>

          <Button variant="ghost" size="sm" onClick={nextTrack}>
            <SkipForward className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsRepeat(!isRepeat)}
            className={isRepeat ? 'text-primary' : ''}
          >
            <Repeat className="w-4 h-4" />
          </Button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-3">
          <Volume2 className="w-4 h-4 text-muted-foreground" />
          <Slider
            value={[volume]}
            max={100}
            step={1}
            onValueChange={handleVolumeChange}
            className="flex-1"
          />
          <span className="text-xs text-muted-foreground w-8">{volume}%</span>
        </div>

        {/* Playlist */}
        {tracks.length > 0 && (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            <h5 className="font-medium text-sm text-muted-foreground">Playlist</h5>
            {tracks.map((track, index) => (
              <div
                key={track.id}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                  index === currentTrackIndex
                    ? 'bg-primary/20 text-primary'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => playTrack(index)}
              >
                <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                  <Music className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{track.name}</p>
                  {track.duration && (
                    <p className="text-xs text-muted-foreground">
                      {formatTime(track.duration)}
                    </p>
                  )}
                </div>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {tracks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No music added yet</p>
            <p className="text-sm">Upload some tracks to get started!</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default MusicPlayer;