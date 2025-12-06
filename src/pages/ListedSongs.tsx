import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Upload, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  MoreVertical,
  Trash2,
  Music,
  FolderUp,
  Shuffle,
  Repeat,
  ExternalLink
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Slider } from '@/components/ui/slider';

interface ListedSong {
  id: string;
  title: string;
  file_url: string;
  file_name: string;
  file_size: number | null;
  duration: number | null;
  created_at: string;
}

export default function ListedSongs() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [songs, setSongs] = useState<ListedSong[]>([]);
  const [currentSong, setCurrentSong] = useState<ListedSong | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'all' | 'one'>('none');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (user) {
      fetchSongs();
    }
  }, [user]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => handleNextSong();

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [songs, currentSong, isShuffled, repeatMode]);

  const fetchSongs = async () => {
    const { data, error } = await supabase
      .from('listed_songs')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch songs');
      return;
    }
    setSongs(data || []);
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || !user) return;

    setUploading(true);
    const audioFiles = Array.from(files).filter(f => f.type.startsWith('audio/'));
    
    if (audioFiles.length === 0) {
      toast.error('No audio files selected');
      setUploading(false);
      return;
    }

    let uploaded = 0;
    for (const file of audioFiles) {
      const fileName = `${user.id}/${Date.now()}-${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('listed-songs')
        .upload(fileName, file);

      if (uploadError) {
        toast.error(`Failed to upload ${file.name}`);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from('listed-songs')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('listed_songs')
        .insert({
          user_id: user.id,
          title: file.name.replace(/\.[^/.]+$/, ''),
          file_url: urlData.publicUrl,
          file_name: file.name,
          file_size: file.size,
        });

      if (dbError) {
        toast.error(`Failed to save ${file.name}`);
        continue;
      }

      uploaded++;
      setUploadProgress((uploaded / audioFiles.length) * 100);
    }

    toast.success(`Uploaded ${uploaded} song(s)`);
    setUploading(false);
    setUploadProgress(0);
    fetchSongs();
  };

  const playSong = (song: ListedSong) => {
    setCurrentSong(song);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.src = song.file_url;
      audioRef.current.play();
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !currentSong) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleNextSong = () => {
    if (!currentSong || songs.length === 0) return;

    if (repeatMode === 'one') {
      audioRef.current?.play();
      return;
    }

    const currentIndex = songs.findIndex(s => s.id === currentSong.id);
    let nextIndex: number;

    if (isShuffled) {
      nextIndex = Math.floor(Math.random() * songs.length);
    } else {
      nextIndex = (currentIndex + 1) % songs.length;
    }

    if (nextIndex === 0 && repeatMode === 'none' && !isShuffled) {
      setIsPlaying(false);
      return;
    }

    playSong(songs[nextIndex]);
  };

  const handlePrevSong = () => {
    if (!currentSong || songs.length === 0) return;

    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }

    const currentIndex = songs.findIndex(s => s.id === currentSong.id);
    const prevIndex = currentIndex === 0 ? songs.length - 1 : currentIndex - 1;
    playSong(songs[prevIndex]);
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const vol = value[0];
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
    setIsMuted(vol === 0);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const deleteSong = async (song: ListedSong) => {
    const fileName = song.file_url.split('/').slice(-2).join('/');
    
    await supabase.storage.from('listed-songs').remove([fileName]);
    
    const { error } = await supabase
      .from('listed_songs')
      .delete()
      .eq('id', song.id);

    if (error) {
      toast.error('Failed to delete song');
      return;
    }

    if (currentSong?.id === song.id) {
      setCurrentSong(null);
      setIsPlaying(false);
    }

    toast.success('Song deleted');
    fetchSongs();
  };

  const publishToHub = (song: ListedSong) => {
    navigate('/upload-track', { 
      state: { 
        prefilledUrl: song.file_url,
        prefilledTitle: song.title 
      } 
    });
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8">
          <p className="text-muted-foreground">Please log in to access Listed Songs</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 pb-40">
      <audio ref={audioRef} />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Listed Songs</h1>
          <p className="text-muted-foreground">Your personal music collection</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => document.getElementById('folder-upload')?.click()}
            disabled={uploading}
          >
            <FolderUp className="w-4 h-4 mr-2" />
            Upload Folder
          </Button>
          <Button
            onClick={() => document.getElementById('file-upload')?.click()}
            disabled={uploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Songs
          </Button>
          <input
            id="file-upload"
            type="file"
            accept="audio/*"
            multiple
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)}
          />
          <input
            id="folder-upload"
            type="file"
            accept="audio/*"
            multiple
            // @ts-ignore
            webkitdirectory=""
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)}
          />
        </div>
      </div>

      {uploading && (
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-2">Uploading songs...</p>
          <Progress value={uploadProgress} />
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="w-5 h-5" />
            Your Songs ({songs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {songs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No songs uploaded yet</p>
              <p className="text-sm">Upload songs or folders to get started</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-1">
                {songs.map((song, index) => (
                  <div
                    key={song.id}
                    className={`flex items-center gap-4 p-3 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors ${
                      currentSong?.id === song.id ? 'bg-accent' : ''
                    }`}
                    onClick={() => playSong(song)}
                  >
                    <div className="w-8 text-center text-muted-foreground text-sm">
                      {currentSong?.id === song.id && isPlaying ? (
                        <div className="flex items-center justify-center gap-0.5">
                          <span className="w-1 h-3 bg-primary animate-pulse rounded-full" />
                          <span className="w-1 h-4 bg-primary animate-pulse rounded-full delay-75" />
                          <span className="w-1 h-2 bg-primary animate-pulse rounded-full delay-150" />
                        </div>
                      ) : (
                        index + 1
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{song.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {song.file_name}
                      </p>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      {song.file_size ? `${(song.file_size / 1024 / 1024).toFixed(1)} MB` : ''}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          publishToHub(song);
                        }}>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Publish to Music Hub
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSong(song);
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Player Bar */}
      {currentSong && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t p-4 z-50">
          <div className="container mx-auto">
            <div className="flex items-center gap-4">
              {/* Song Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{currentSong.title}</p>
                <p className="text-xs text-muted-foreground truncate">{currentSong.file_name}</p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsShuffled(!isShuffled)}
                  className={isShuffled ? 'text-primary' : ''}
                >
                  <Shuffle className="w-4 h-4" />
                </Button>
                
                <Button variant="ghost" size="icon" onClick={handlePrevSong}>
                  <SkipBack className="w-5 h-5" />
                </Button>
                
                <Button 
                  size="icon" 
                  className="h-10 w-10 rounded-full"
                  onClick={togglePlayPause}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" />
                  )}
                </Button>
                
                <Button variant="ghost" size="icon" onClick={handleNextSong}>
                  <SkipForward className="w-5 h-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setRepeatMode(
                    repeatMode === 'none' ? 'all' : 
                    repeatMode === 'all' ? 'one' : 'none'
                  )}
                  className={repeatMode !== 'none' ? 'text-primary' : ''}
                >
                  <Repeat className="w-4 h-4" />
                  {repeatMode === 'one' && (
                    <span className="absolute text-[10px] font-bold">1</span>
                  )}
                </Button>
              </div>

              {/* Progress */}
              <div className="hidden md:flex items-center gap-2 flex-1">
                <span className="text-xs text-muted-foreground w-10 text-right">
                  {formatTime(currentTime)}
                </span>
                <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={1}
                  onValueChange={handleSeek}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-10">
                  {formatTime(duration)}
                </span>
              </div>

              {/* Volume */}
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={toggleMute}>
                  {isMuted ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                  className="w-24"
                />
              </div>
            </div>

            {/* Mobile Progress */}
            <div className="md:hidden mt-2">
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={1}
                onValueChange={handleSeek}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
