import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Music,
  Heart,
  Shuffle,
  Repeat,
  Upload,
  Headphones,
  ExternalLink
} from "lucide-react";

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  duration: number;
  mood: string;
  isLocal?: boolean;
}

interface Playlist {
  id: string;
  name: string;
  mood: string;
  tracks: Track[];
  color: string;
}

const MusicPage = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedMood, setSelectedMood] = useState('focus');
  const [uploadedTracks, setUploadedTracks] = useState<Track[]>([]);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Predefined playlists with mood-based categories
  const playlists: Playlist[] = [
    {
      id: 'focus',
      name: 'Deep Focus',
      mood: 'focus',
      color: 'bg-blue-500',
      tracks: [
        { id: '1', title: 'Lofi Hip Hop Study', artist: 'ChillVibes', url: 'https://example.com/lofi1.mp3', duration: 180, mood: 'focus' },
        { id: '2', title: 'Ambient Focus', artist: 'Zen Sounds', url: 'https://example.com/ambient1.mp3', duration: 240, mood: 'focus' },
        { id: '3', title: 'Rain & Piano', artist: 'Nature Sounds', url: 'https://example.com/rain1.mp3', duration: 300, mood: 'focus' }
      ]
    },
    {
      id: 'energize',
      name: 'Energy Boost',
      mood: 'energize',
      color: 'bg-red-500',
      tracks: [
        { id: '4', title: 'Upbeat Electronic', artist: 'Synth Wave', url: 'https://example.com/upbeat1.mp3', duration: 200, mood: 'energize' },
        { id: '5', title: 'Motivational Beats', artist: 'Power Music', url: 'https://example.com/power1.mp3', duration: 180, mood: 'energize' }
      ]
    },
    {
      id: 'chill',
      name: 'Chill Vibes',
      mood: 'chill',
      color: 'bg-green-500',
      tracks: [
        { id: '6', title: 'Sunday Morning', artist: 'Calm Collective', url: 'https://example.com/chill1.mp3', duration: 220, mood: 'chill' },
        { id: '7', title: 'Ocean Waves', artist: 'Nature Vibes', url: 'https://example.com/ocean1.mp3', duration: 360, mood: 'chill' }
      ]
    },
    {
      id: 'zen',
      name: 'Meditation',
      mood: 'zen',
      color: 'bg-purple-500',
      tracks: [
        { id: '8', title: 'Tibetan Bowls', artist: 'Meditation Masters', url: 'https://example.com/bowls1.mp3', duration: 600, mood: 'zen' },
        { id: '9', title: 'Forest Sounds', artist: 'Nature Peace', url: 'https://example.com/forest1.mp3', duration: 480, mood: 'zen' }
      ]
    }
  ];

  const moods = [
    { id: 'focus', name: 'Focus', icon: '🎯', color: 'bg-blue-500' },
    { id: 'energize', name: 'Energize', icon: '⚡', color: 'bg-red-500' },
    { id: 'chill', name: 'Chill', icon: '😌', color: 'bg-green-500' },
    { id: 'zen', name: 'Zen', icon: '🧘', color: 'bg-purple-500' }
  ];

  useEffect(() => {
    const savedTracks = localStorage.getItem('studyverse-uploaded-tracks');
    if (savedTracks) {
      setUploadedTracks(JSON.parse(savedTracks));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('studyverse-uploaded-tracks', JSON.stringify(uploadedTracks));
  }, [uploadedTracks]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('audio/')) {
        const url = URL.createObjectURL(file);
        const track: Track = {
          id: Date.now().toString() + Math.random(),
          title: file.name.replace(/\.[^/.]+$/, ""),
          artist: 'Local File',
          url,
          duration: 0,
          mood: selectedMood,
          isLocal: true
        };
        
        setUploadedTracks(prev => [...prev, track]);
      }
    });
  };

  const playTrack = (track: Track) => {
    if (currentTrack?.id === track.id && isPlaying) {
      setIsPlaying(false);
      audioRef.current?.pause();
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.src = track.url;
        audioRef.current.play();
      }
    }
  };

  const togglePlayPause = () => {
    if (!currentTrack) return;
    
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentPlaylist = () => {
    const playlist = playlists.find(p => p.mood === selectedMood);
    const allTracks = [...(playlist?.tracks || []), ...uploadedTracks.filter(t => t.mood === selectedMood)];
    return allTracks;
  };

  const openSpotify = () => {
    window.open('https://open.spotify.com/', '_blank');
  };

  const openSpotifyPlaylist = (mood: string) => {
    const playlists = {
      focus: 'https://open.spotify.com/genre/0JQ5DAqbMKFHOzuVTgTizF', // Focus playlists
      energize: 'https://open.spotify.com/genre/0JQ5DAqbMKFCfObibaOZbv', // Workout playlists  
      chill: 'https://open.spotify.com/genre/0JQ5DAqbMKFzHmL4bQU3tB', // Chill playlists
      zen: 'https://open.spotify.com/genre/0JQ5DAqbMKFAXlCG6JvYjt', // Ambient playlists
    };
    window.open(playlists[mood] || 'https://open.spotify.com/', '_blank');
  };

  return (
    <div className="min-h-screen p-6 pb-20">
      {/* Spotify Redirect Banner */}
      <div className="mb-8 p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-green-600 dark:text-green-400">Listen on Spotify</h2>
              <p className="text-sm text-muted-foreground">Access millions of songs and curated playlists</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={openSpotify}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Spotify
            </Button>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Music className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Music Zone
          </h1>
        </div>

        {/* Mood Selector with Spotify Integration */}
        <div className="flex gap-3 mb-6 overflow-x-auto">
          {moods.map((mood) => (
            <div key={mood.id} className="flex flex-col gap-2">
              <Button
                onClick={() => setSelectedMood(mood.id)}
                variant={selectedMood === mood.id ? "default" : "outline"}
                className="flex items-center gap-2 whitespace-nowrap glass-button"
              >
                <span className="text-lg">{mood.icon}</span>
                {mood.name}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => openSpotifyPlaylist(mood.id)}
                className="text-xs text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
              >
                Spotify {mood.name}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Now Playing */}
      {currentTrack && (
        <Card className="glass-card mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-16 h-16 rounded-lg ${moods.find(m => m.id === selectedMood)?.color} flex items-center justify-center`}>
                <Headphones className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{currentTrack.title}</h3>
                <p className="text-muted-foreground">{currentTrack.artist}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700"
              >
                <Heart className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <span className="text-sm text-muted-foreground min-w-12">
                {formatTime(currentTime)}
              </span>
              <Slider
                value={[currentTime]}
                max={duration}
                step={1}
                onValueChange={(value) => {
                  if (audioRef.current) {
                    audioRef.current.currentTime = value[0];
                    setCurrentTime(value[0]);
                  }
                }}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground min-w-12">
                {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center justify-center gap-4 mb-4">
              <Button variant="ghost" size="sm">
                <Shuffle className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <SkipBack className="w-4 h-4" />
              </Button>
              <Button
                onClick={togglePlayPause}
                size="lg"
                className="w-12 h-12 rounded-full glass-button"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>
              <Button variant="ghost" size="sm">
                <SkipForward className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Repeat className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                max={100}
                step={1}
                onValueChange={(value) => {
                  setVolume(value[0]);
                  setIsMuted(value[0] === 0);
                }}
                className="w-24"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Section */}
      <Card className="glass-card mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Music
          </CardTitle>
        </CardHeader>
        <CardContent>
          <input
            type="file"
            accept="audio/*"
            multiple
            onChange={handleFileUpload}
            ref={fileInputRef}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="w-full glass-button"
          >
            <Upload className="w-4 h-4 mr-2" />
            Choose Audio Files
          </Button>
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Upload MP3, WAV, or other audio files
          </p>
        </CardContent>
      </Card>

      {/* Playlist */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">{moods.find(m => m.id === selectedMood)?.icon}</span>
            {moods.find(m => m.id === selectedMood)?.name} Playlist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {getCurrentPlaylist().length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No tracks in this mood. Upload some music to get started!</p>
              </div>
            ) : (
              getCurrentPlaylist().map((track) => (
                <div
                  key={track.id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    currentTrack?.id === track.id
                      ? 'bg-primary/20 border border-primary/50'
                      : 'bg-background/50 hover:bg-background/80'
                  }`}
                  onClick={() => playTrack(track)}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-8 h-8 p-0 rounded-full"
                  >
                    {currentTrack?.id === track.id && isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{track.title}</h4>
                    <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {track.isLocal && (
                      <Badge variant="secondary" className="text-xs">Local</Badge>
                    )}
                    <span className="text-sm text-muted-foreground">
                      {track.duration > 0 ? formatTime(track.duration) : '--:--'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
};

export default MusicPage;