import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
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
  Disc3,
  Trash2,
  Loader2,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface Track {
  id: string;
  name: string;
  url: string;
  duration?: number;
  isLiked?: boolean;
  artist?: string;
  album?: string;
  size: number;
  created_at: string;
}

const sanitizeFileName = (fileName: string) => {
  const parts = fileName.split(".");
  const extension = parts.length > 1 ? parts.pop() : "";
  const baseName = parts.join(".") || "audio";

  const normalizedBase = baseName
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();

  return extension
    ? `${normalizedBase || "audio"}.${extension.toLowerCase()}`
    : normalizedBase || "audio";
};

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
  const [uploadingTracks, setUploadingTracks] = useState<Set<string>>(new Set());

  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Load tracks from Supabase
  useEffect(() => {
    fetchTracks();
  }, []);

  const fetchTracks = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('study_materials')
        .select('*')
        .eq('type', 'audio')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const musicTracks: Track[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        url: item.url,
        duration: item.duration || 0,
        isLiked: false,
        artist: item.artist || 'Unknown Artist',
        album: item.album || 'Unknown Album',
        size: item.size,
        created_at: item.created_at
      }));

      setTracks(musicTracks);
    } catch (error) {
      console.error('Error fetching tracks:', error);
      toast({
        title: "Error",
        description: "Failed to load music tracks",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    for (const file of files) {
      // Check if it's an audio file
      if (!file.type.startsWith('audio/')) {
        toast({
          title: "Invalid File",
          description: `${file.name} is not an audio file`,
          variant: "destructive",
        });
        continue;
      }

      const trackId = Math.random().toString(36).substr(2, 9);
      setUploadingTracks(prev => new Set(prev).add(trackId));

      try {
        // Upload file to Supabase Storage
        const safeFileName = sanitizeFileName(file.name);
        const filePath = `uploads/${Date.now()}-${safeFileName}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('music-files')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('music-files')
          .getPublicUrl(filePath);

        // Get audio duration
        const audio = new Audio();
        audio.src = URL.createObjectURL(file);
        
        audio.addEventListener('loadedmetadata', async () => {
          try {
            // Save metadata to database
            const { data: dbData, error: dbError } = await supabase
              .from('study_materials')
              .insert({
                name: file.name.replace(/\.[^/.]+$/, ""),
                type: 'audio',
                size: file.size,
                url: publicUrl,
                category: 'Music',
                tags: ['music', 'audio'],
                is_public: true,
                album: 'Shared Music',
                artist: 'Community',
                duration: Math.round(audio.duration),
              })
              .select()
              .single();

            if (dbError) throw dbError;

            // Add to local state
            const newTrack: Track = {
              id: dbData.id,
              name: dbData.name,
              url: dbData.url,
              duration: dbData.duration || audio.duration,
              isLiked: false,
              artist: dbData.artist || 'Community',
              album: dbData.album || 'Shared Music',
              size: dbData.size,
              created_at: dbData.created_at
            };

            setTracks(prev => [newTrack, ...prev]);
            
            toast({
              title: "Music Uploaded! 🎵",
              description: `${file.name} has been uploaded and is now available to all users`,
            });
          } catch (error) {
            console.error('Error saving track metadata:', error);
            toast({
              title: "Upload Failed",
              description: `Failed to save ${file.name}`,
              variant: "destructive",
            });
          } finally {
            setUploadingTracks(prev => {
              const newSet = new Set(prev);
              newSet.delete(trackId);
              return newSet;
            });
            URL.revokeObjectURL(audio.src);
          }
        });

        audio.addEventListener('error', () => {
          setUploadingTracks(prev => {
            const newSet = new Set(prev);
            newSet.delete(trackId);
            return newSet;
          });
          toast({
            title: "Upload Failed",
            description: `Failed to process ${file.name}`,
            variant: "destructive",
          });
          URL.revokeObjectURL(audio.src);
        });

        audio.load();
      } catch (error) {
        console.error('Error uploading file:', error);
        setUploadingTracks(prev => {
          const newSet = new Set(prev);
          newSet.delete(trackId);
          return newSet;
        });
        toast({
          title: "Upload Failed",
          description: `Failed to upload ${file.name}`,
          variant: "destructive",
        });
      }
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const deleteTrack = async (trackId: string) => {
    try {
      const { error } = await supabase
        .from('study_materials')
        .delete()
        .eq('id', trackId);

      if (error) throw error;

      setTracks(prev => prev.filter(track => track.id !== trackId));
      
      // If we deleted the currently playing track, stop playback
      const deletedIndex = tracks.findIndex(track => track.id === trackId);
      if (deletedIndex === currentTrackIndex) {
        setIsPlaying(false);
        setCurrentTime(0);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
      } else if (deletedIndex < currentTrackIndex) {
        setCurrentTrackIndex(prev => prev - 1);
      }

      toast({
        title: "Track Deleted",
        description: "Music track removed successfully",
      });
    } catch (error) {
      console.error('Error deleting track:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete track",
        variant: "destructive",
      });
    }
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
    } else {
      if (!tracks[currentTrackIndex]) return;
      
      if (audioRef.current.src !== tracks[currentTrackIndex].url) {
        audioRef.current.src = tracks[currentTrackIndex].url;
      }
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const previousTrack = () => {
    const newIndex = isShuffle 
      ? Math.floor(Math.random() * tracks.length)
      : currentTrackIndex > 0 
        ? currentTrackIndex - 1 
        : tracks.length - 1;
    playTrack(newIndex);
  };

  const nextTrack = () => {
    const newIndex = isShuffle 
      ? Math.floor(Math.random() * tracks.length)
      : currentTrackIndex < tracks.length - 1 
        ? currentTrackIndex + 1 
        : 0;
    playTrack(newIndex);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    if (isRepeat) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      nextTrack();
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

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const toggleLike = (trackId: string) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId 
        ? { ...track, isLiked: !track.isLiked }
        : track
    ));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Update document title with current track
  useEffect(() => {
    if (tracks[currentTrackIndex]) {
      document.title = `${tracks[currentTrackIndex].name} - NiranX Universe`;
    } else {
      document.title = 'NiranX Universe';
    }
  }, [currentTrackIndex, tracks]);

  // Set up audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.volume = volume / 100;

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrackIndex, isRepeat, volume]);

  const queue =
    tracks.length > 1
      ? [...tracks.slice(currentTrackIndex + 1), ...tracks.slice(0, currentTrackIndex)]
      : [];

  if (isLoading) {
    return (
      <Card className="widget">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Loading music library...</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="widget">
      <div className="space-y-6">
        {/* Spotify Redirect Header */}
        <div className="mb-6 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <Music className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-green-600 dark:text-green-400">Better Music Experience</h3>
                <p className="text-sm text-muted-foreground">Listen to millions of songs on Spotify</p>
              </div>
            </div>
            <Button 
              onClick={() => window.open('https://open.spotify.com/', '_blank')}
              className="bg-green-500 hover:bg-green-600 text-white"
              size="sm"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Spotify
            </Button>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Shared Music Player</h3>
              <p className="text-sm text-muted-foreground">
                {tracks.length} track{tracks.length !== 1 ? 's' : ''} shared by the community
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://open.spotify.com/', '_blank')}
              className="bg-green-500/10 border-green-500/30 text-green-600 hover:bg-green-500/20"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Spotify
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="glass-button"
              disabled={uploadingTracks.size > 0}
            >
              {uploadingTracks.size > 0 ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              {uploadingTracks.size > 0 ? 'Uploading...' : 'Upload Music'}
            </Button>
          </div>
        </div>

        {/* Upload Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="audio/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Current Track Display */}
        {tracks[currentTrackIndex] && (
          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Disc3 className={`w-8 h-8 text-white ${isPlaying ? 'animate-spin' : ''}`} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">{tracks[currentTrackIndex].name}</h4>
                <p className="text-sm text-muted-foreground">
                  {tracks[currentTrackIndex].artist} • {tracks[currentTrackIndex].album}
                </p>
                <Badge variant="secondary" className="mt-1">
                  {formatFileSize(tracks[currentTrackIndex].size)}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleLike(tracks[currentTrackIndex].id)}
              >
                <Heart 
                  className={`w-5 h-5 ${tracks[currentTrackIndex].isLiked ? 'fill-red-500 text-red-500' : ''}`} 
                />
              </Button>
            </div>
          </div>
        )}

        {/* Player Controls */}
        <div className="space-y-6">
          {/* Enhanced Progress Bar */}
          <div className="space-y-3">
            <div className="relative group">
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={1}
                onValueChange={handleSeek}
                className="w-full cursor-pointer"
              />
              <div 
                className="absolute -top-8 left-0 bg-primary text-primary-foreground px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{ left: `${(currentTime / (duration || 100)) * 100}%`, transform: 'translateX(-50%)' }}
              >
                {formatTime(currentTime)}
              </div>
            </div>
            <div className="flex justify-between text-xs font-medium">
              <span className="text-foreground/80">{formatTime(currentTime)}</span>
              <span className="text-muted-foreground">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Enhanced Control Buttons */}
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsShuffle(!isShuffle)}
              className={`hover-scale transition-all duration-200 ${
                isShuffle 
                  ? 'text-primary bg-primary/10 hover:bg-primary/20' 
                  : 'hover:bg-muted/50'
              }`}
            >
              <Shuffle className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={previousTrack}
              disabled={tracks.length === 0}
              className="hover-scale transition-all duration-200 hover:bg-muted/50 disabled:opacity-30"
            >
              <SkipBack className="w-5 h-5" />
            </Button>
            
            <Button
              size="lg"
              onClick={togglePlayPause}
              disabled={tracks.length === 0}
              className={`w-16 h-16 rounded-full shadow-lg transition-all duration-300 hover-scale ${
                isPlaying 
                  ? 'bg-gradient-to-br from-primary to-primary/80 hover:shadow-primary/50 hover:shadow-xl' 
                  : 'bg-gradient-to-br from-primary to-primary/70'
              } disabled:opacity-30 disabled:cursor-not-allowed`}
            >
              {isPlaying ? 
                <Pause className="w-7 h-7 animate-scale-in" /> : 
                <Play className="w-7 h-7 ml-1 animate-scale-in" />
              }
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={nextTrack}
              disabled={tracks.length === 0}
              className="hover-scale transition-all duration-200 hover:bg-muted/50 disabled:opacity-30"
            >
              <SkipForward className="w-5 h-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsRepeat(!isRepeat)}
              className={`hover-scale transition-all duration-200 ${
                isRepeat 
                  ? 'text-primary bg-primary/10 hover:bg-primary/20' 
                  : 'hover:bg-muted/50'
              }`}
            >
              <Repeat className="w-4 h-4" />
            </Button>
          </div>

          {/* Enhanced Volume Control */}
          <div className="flex items-center gap-4 px-2">
            <Volume2 className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1 relative group">
              <Slider
                value={[volume]}
                max={100}
                step={1}
                onValueChange={handleVolumeChange}
                className="cursor-pointer"
              />
            </div>
            <span className="text-sm font-medium text-foreground/70 w-10 text-right">{volume}%</span>
          </div>
        </div>

        {/* Track List */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {tracks.length > 0 ? (
            tracks.map((track, index) => (
              <div
                key={track.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                  index === currentTrackIndex ? 'bg-primary/10 border-primary' : ''
                }`}
                onClick={() => playTrack(index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                      <Music className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium truncate">{track.name}</h5>
                      <p className="text-xs text-muted-foreground">
                        {track.artist} • {formatFileSize(track.size)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(track.id);
                      }}
                    >
                      <Heart 
                        className={`w-4 h-4 ${track.isLiked ? 'fill-red-500 text-red-500' : ''}`} 
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTrack(track.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No music tracks found</p>
              <p className="text-sm">Upload your first track to get started!</p>
            </div>
          )}
        </div>

        {/* Up Next Queue */}
        {queue.length > 0 && (
          <div className="space-y-2 mt-4">
            <h4 className="text-sm font-semibold">Up Next</h4>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {queue.slice(0, 10).map((track) => {
                const originalIndex = tracks.findIndex((t) => t.id === track.id);
                return (
                  <div
                    key={track.id}
                    className="flex items-center justify-between px-3 py-2 rounded-md bg-muted/30 hover:bg-muted/50 cursor-pointer text-xs"
                    onClick={() => playTrack(originalIndex)}
                  >
                    <span className="truncate flex-1 mr-2">{track.name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatTime(track.duration || 0)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Audio Element */}
        <audio ref={audioRef} preload="metadata" />
      </div>
    </Card>
  );
};

export default MusicPlayer;