import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  ExternalLink,
  Globe,
  User,
  Users,
  ListPlus,
  List,
  X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

interface ListedSong {
  id: string;
  user_id: string;
  title: string;
  file_url: string;
  file_name: string;
  file_size: number | null;
  duration: number | null;
  created_at: string;
  is_public: boolean;
}

export default function ListedSongs() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [personalSongs, setPersonalSongs] = useState<ListedSong[]>([]);
  const [publicSongs, setPublicSongs] = useState<ListedSong[]>([]);
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
  const [activeTab, setActiveTab] = useState<'personal' | 'public'>('personal');
  const [queue, setQueue] = useState<ListedSong[]>([]);
  const [showQueue, setShowQueue] = useState(false);

  useEffect(() => {
    fetchPublicSongs();
    if (user) {
      fetchPersonalSongs();
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
  }, [personalSongs, publicSongs, currentSong, isShuffled, repeatMode, activeTab, queue]);

  const fetchPersonalSongs = async () => {
    const { data, error } = await supabase
      .from('listed_songs')
      .select('*')
      .eq('user_id', user?.id)
      .eq('is_public', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch personal songs:', error);
      return;
    }
    setPersonalSongs(data || []);
  };

  const fetchPublicSongs = async () => {
    const { data, error } = await supabase
      .from('listed_songs')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch public songs:', error);
      return;
    }
    setPublicSongs(data || []);
  };

  const handleFileUpload = async (files: FileList | null, isPublic: boolean = false) => {
    if (!files || !user) {
      toast.error('Please log in to upload songs');
      return;
    }

    setUploading(true);
    const audioFiles = Array.from(files).filter(f => f.type.startsWith('audio/'));
    
    if (audioFiles.length === 0) {
      toast.error('No audio files selected');
      setUploading(false);
      return;
    }

    const bucket = isPublic ? 'listed-songs' : 'personal-songs';
    let uploaded = 0;

    for (const file of audioFiles) {
      const fileName = `${user.id}/${Date.now()}-${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (uploadError) {
        toast.error(`Failed to upload ${file.name}`);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('listed_songs')
        .insert({
          user_id: user.id,
          title: file.name.replace(/\.[^/.]+$/, ''),
          file_url: urlData.publicUrl,
          file_name: file.name,
          file_size: file.size,
          is_public: isPublic,
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
    fetchPersonalSongs();
    fetchPublicSongs();
  };

  const getCurrentSongList = () => {
    return activeTab === 'personal' ? personalSongs : publicSongs;
  };

  const playSong = (song: ListedSong) => {
    setCurrentSong(song);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.src = song.file_url;
      audioRef.current.play();
    }
  };

  const addToQueue = (song: ListedSong) => {
    setQueue(prev => [...prev, song]);
    toast.success(`Added "${song.title}" to queue`);
  };

  const removeFromQueue = (index: number) => {
    setQueue(prev => prev.filter((_, i) => i !== index));
  };

  const clearQueue = () => {
    setQueue([]);
    toast.success('Queue cleared');
  };

  const playNext = (song: ListedSong) => {
    setQueue(prev => [song, ...prev]);
    toast.success(`"${song.title}" will play next`);
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
    if (repeatMode === 'one') {
      audioRef.current?.play();
      return;
    }

    // Play from queue first
    if (queue.length > 0) {
      const [nextSong, ...rest] = queue;
      setQueue(rest);
      playSong(nextSong);
      return;
    }

    const songs = getCurrentSongList();
    if (!currentSong || songs.length === 0) return;

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
    const songs = getCurrentSongList();
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
    // Only allow deletion of personal (non-public) songs by the owner
    if (song.is_public) {
      toast.error('Public songs can only be deleted by admins from the admin dashboard');
      return;
    }

    if (song.user_id !== user?.id) {
      toast.error('You can only delete your own songs');
      return;
    }

    const bucket = song.is_public ? 'listed-songs' : 'personal-songs';
    const fileName = song.file_url.split('/').slice(-2).join('/');
    
    await supabase.storage.from(bucket).remove([fileName]);
    
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

    // Remove from queue if present
    setQueue(prev => prev.filter(s => s.id !== song.id));

    toast.success('Song deleted');
    fetchPersonalSongs();
    fetchPublicSongs();
  };

  const publishToHub = (song: ListedSong) => {
    navigate('/niranx/music/upload', { 
      state: { 
        prefilledUrl: song.file_url,
        prefilledTitle: song.title 
      } 
    });
  };

  const makePublic = async (song: ListedSong) => {
    if (song.is_public) {
      toast.info('Song is already public');
      return;
    }

    const { error } = await supabase
      .from('listed_songs')
      .update({ is_public: true })
      .eq('id', song.id);

    if (error) {
      toast.error('Failed to make song public');
      return;
    }

    toast.success('Song is now public');
    fetchPersonalSongs();
    fetchPublicSongs();
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderSongList = (songs: ListedSong[], isPersonal: boolean) => (
    <ScrollArea className="h-[400px]">
      <div className="space-y-1">
        {songs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{isPersonal ? 'No personal songs uploaded yet' : 'No public songs available'}</p>
            {isPersonal && <p className="text-sm">Upload songs or folders to get started</p>}
          </div>
        ) : (
          songs.map((song, index) => (
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
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="truncate">{song.file_name}</span>
                  {!isPersonal && song.user_id !== user?.id && (
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      Shared
                    </span>
                  )}
                </div>
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
                    addToQueue(song);
                  }}>
                    <ListPlus className="w-4 h-4 mr-2" />
                    Add to Queue
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    playNext(song);
                  }}>
                    <Play className="w-4 h-4 mr-2" />
                    Play Next
                  </DropdownMenuItem>
                  {user && isPersonal && !song.is_public && (
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      makePublic(song);
                    }}>
                      <Globe className="w-4 h-4 mr-2" />
                      Make Public
                    </DropdownMenuItem>
                  )}
                  {user && (
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      publishToHub(song);
                    }}>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Publish to Music Hub
                    </DropdownMenuItem>
                  )}
                  {isPersonal && song.user_id === user?.id && !song.is_public && (
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
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  );

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 pb-40">
      <audio ref={audioRef} />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Listed Songs</h1>
          <p className="text-muted-foreground">Personal & public music collection</p>
        </div>
        
        {user && (
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
              onChange={(e) => handleFileUpload(e.target.files, false)}
            />
            <input
              id="folder-upload"
              type="file"
              accept="audio/*"
              multiple
              // @ts-ignore
              webkitdirectory=""
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files, false)}
            />
          </div>
        )}
      </div>

      {uploading && (
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-2">Uploading songs...</p>
          <Progress value={uploadProgress} />
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'personal' | 'public')}>
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="personal" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Personal ({personalSongs.length})
              </TabsTrigger>
              <TabsTrigger value="public" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Public ({publicSongs.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Your Songs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!user ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Please log in to view your personal songs</p>
                    </div>
                  ) : (
                    renderSongList(personalSongs, true)
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="public" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Public Songs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderSongList(publicSongs, false)}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Queue Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <List className="w-5 h-5" />
                Up Next
                {queue.length > 0 && (
                  <Badge variant="secondary">{queue.length}</Badge>
                )}
              </CardTitle>
              {queue.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearQueue}>
                  Clear
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[350px]">
                {queue.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <ListPlus className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Queue is empty</p>
                    <p className="text-xs mt-1">Add songs from the menu</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {queue.map((song, index) => (
                      <div
                        key={`${song.id}-${index}`}
                        className="flex items-center gap-3 p-2 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors"
                      >
                        <span className="text-xs text-muted-foreground w-5">{index + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{song.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{song.file_name}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => removeFromQueue(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

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

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowQueue(!showQueue)}
                  className={showQueue ? 'text-primary' : ''}
                >
                  <List className="w-4 h-4" />
                  {queue.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[10px] flex items-center justify-center">
                      {queue.length}
                    </Badge>
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
