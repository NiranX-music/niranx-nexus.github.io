import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Play, Pause, Volume2, VolumeX, Save, 
  CloudRain, TreePine, Coffee, Waves, Flame,
  Wind, Bird, Music, Loader2, Timer
} from 'lucide-react';
import { toast } from 'sonner';

interface SoundConfig {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  audioUrl: string;
  volume: number;
  isPlaying: boolean;
}

const AMBIENT_SOUNDS: Omit<SoundConfig, 'volume' | 'isPlaying'>[] = [
  { 
    id: 'rain', 
    name: 'Rain', 
    icon: <CloudRain className="h-6 w-6" />, 
    color: '#3b82f6',
    audioUrl: 'https://assets.mixkit.co/active_storage/sfx/212/212-preview.mp3'
  },
  { 
    id: 'forest', 
    name: 'Forest', 
    icon: <TreePine className="h-6 w-6" />, 
    color: '#22c55e',
    audioUrl: 'https://assets.mixkit.co/active_storage/sfx/1215/1215-preview.mp3'
  },
  { 
    id: 'cafe', 
    name: 'Café', 
    icon: <Coffee className="h-6 w-6" />, 
    color: '#a16207',
    audioUrl: 'https://assets.mixkit.co/active_storage/sfx/2515/2515-preview.mp3'
  },
  { 
    id: 'ocean', 
    name: 'Ocean', 
    icon: <Waves className="h-6 w-6" />, 
    color: '#0ea5e9',
    audioUrl: 'https://assets.mixkit.co/active_storage/sfx/2432/2432-preview.mp3'
  },
  { 
    id: 'fire', 
    name: 'Fireplace', 
    icon: <Flame className="h-6 w-6" />, 
    color: '#f97316',
    audioUrl: 'https://assets.mixkit.co/active_storage/sfx/2428/2428-preview.mp3'
  },
  { 
    id: 'wind', 
    name: 'Wind', 
    icon: <Wind className="h-6 w-6" />, 
    color: '#64748b',
    audioUrl: 'https://assets.mixkit.co/active_storage/sfx/2430/2430-preview.mp3'
  },
  { 
    id: 'birds', 
    name: 'Birds', 
    icon: <Bird className="h-6 w-6" />, 
    color: '#eab308',
    audioUrl: 'https://assets.mixkit.co/active_storage/sfx/2434/2434-preview.mp3'
  },
  { 
    id: 'whitenoise', 
    name: 'White Noise', 
    icon: <Music className="h-6 w-6" />, 
    color: '#8b5cf6',
    audioUrl: 'https://assets.mixkit.co/active_storage/sfx/2517/2517-preview.mp3'
  },
];

const FocusSounds = () => {
  const [sounds, setSounds] = useState<SoundConfig[]>(
    AMBIENT_SOUNDS.map(s => ({ ...s, volume: 50, isPlaying: false }))
  );
  const [masterVolume, setMasterVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [mixName, setMixName] = useState('');
  const [savedMixes, setSavedMixes] = useState<{ name: string; sounds: { id: string; volume: number }[] }[]>([]);
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [timerActive, setTimerActive] = useState(false);
  const [timerRemaining, setTimerRemaining] = useState(0);
  
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

  useEffect(() => {
    // Initialize audio elements
    AMBIENT_SOUNDS.forEach(sound => {
      const audio = new Audio(sound.audioUrl);
      audio.loop = true;
      audioRefs.current[sound.id] = audio;
    });

    // Load saved mixes from localStorage
    const saved = localStorage.getItem('focus-sound-mixes');
    if (saved) {
      setSavedMixes(JSON.parse(saved));
    }

    return () => {
      // Cleanup audio elements
      Object.values(audioRefs.current).forEach(audio => {
        audio.pause();
        audio.src = '';
      });
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timerRemaining > 0) {
      interval = setInterval(() => {
        setTimerRemaining(t => t - 1);
      }, 1000);
    } else if (timerRemaining === 0 && timerActive) {
      setTimerActive(false);
      stopAll();
      toast.success('Timer finished! Take a break 🎉');
    }
    return () => clearInterval(interval);
  }, [timerActive, timerRemaining]);

  const toggleSound = (soundId: string) => {
    setSounds(prev => prev.map(sound => {
      if (sound.id === soundId) {
        const audio = audioRefs.current[soundId];
        if (sound.isPlaying) {
          audio.pause();
        } else {
          audio.volume = (sound.volume / 100) * (masterVolume / 100) * (isMuted ? 0 : 1);
          audio.play().catch(console.error);
        }
        return { ...sound, isPlaying: !sound.isPlaying };
      }
      return sound;
    }));
  };

  const updateVolume = (soundId: string, volume: number) => {
    setSounds(prev => prev.map(sound => {
      if (sound.id === soundId) {
        const audio = audioRefs.current[soundId];
        audio.volume = (volume / 100) * (masterVolume / 100) * (isMuted ? 0 : 1);
        return { ...sound, volume };
      }
      return sound;
    }));
  };

  const updateMasterVolume = (volume: number) => {
    setMasterVolume(volume);
    sounds.forEach(sound => {
      const audio = audioRefs.current[sound.id];
      audio.volume = (sound.volume / 100) * (volume / 100) * (isMuted ? 0 : 1);
    });
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    sounds.forEach(sound => {
      const audio = audioRefs.current[sound.id];
      audio.volume = newMuted ? 0 : (sound.volume / 100) * (masterVolume / 100);
    });
  };

  const stopAll = () => {
    setSounds(prev => prev.map(sound => {
      audioRefs.current[sound.id].pause();
      return { ...sound, isPlaying: false };
    }));
  };

  const saveMix = () => {
    if (!mixName.trim()) {
      toast.error('Please enter a mix name');
      return;
    }

    const activeSounds = sounds
      .filter(s => s.isPlaying || s.volume > 0)
      .map(s => ({ id: s.id, volume: s.volume }));

    const newMix = { name: mixName, sounds: activeSounds };
    const updated = [...savedMixes, newMix];
    setSavedMixes(updated);
    localStorage.setItem('focus-sound-mixes', JSON.stringify(updated));
    setMixName('');
    toast.success('Mix saved!');
  };

  const loadMix = (mix: { name: string; sounds: { id: string; volume: number }[] }) => {
    stopAll();
    
    setSounds(prev => prev.map(sound => {
      const mixSound = mix.sounds.find(s => s.id === sound.id);
      if (mixSound) {
        const audio = audioRefs.current[sound.id];
        audio.volume = (mixSound.volume / 100) * (masterVolume / 100);
        audio.play().catch(console.error);
        return { ...sound, volume: mixSound.volume, isPlaying: true };
      }
      return { ...sound, isPlaying: false };
    }));

    toast.success(`Loaded "${mix.name}"`);
  };

  const startTimer = () => {
    setTimerRemaining(timerMinutes * 60);
    setTimerActive(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const activeSoundsCount = sounds.filter(s => s.isPlaying).length;

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Focus Sounds</h1>
          <p className="text-muted-foreground">Create the perfect ambient environment for studying</p>
        </div>
        <div className="flex items-center gap-4">
          {activeSoundsCount > 0 && (
            <Button variant="outline" onClick={stopAll}>
              Stop All
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sound Grid */}
        <div className="lg:col-span-2 space-y-6">
          {/* Controls */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-6">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
                <div className="flex-1">
                  <Label className="text-sm text-muted-foreground">Master Volume</Label>
                  <Slider
                    value={[masterVolume]}
                    onValueChange={([v]) => updateMasterVolume(v)}
                    max={100}
                    step={1}
                    disabled={isMuted}
                  />
                </div>
                <Badge variant="secondary">
                  {activeSoundsCount} active
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Sound Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {sounds.map((sound) => (
              <Card 
                key={sound.id}
                className={`cursor-pointer transition-all ${
                  sound.isPlaying ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'
                }`}
              >
                <CardContent className="pt-6 space-y-4">
                  <button
                    onClick={() => toggleSound(sound.id)}
                    className="w-full flex flex-col items-center gap-2"
                  >
                    <div 
                      className={`p-4 rounded-full transition-colors ${
                        sound.isPlaying ? 'text-white' : 'bg-muted'
                      }`}
                      style={{ backgroundColor: sound.isPlaying ? sound.color : undefined }}
                    >
                      {sound.icon}
                    </div>
                    <span className="font-medium">{sound.name}</span>
                  </button>
                  
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                    <Slider
                      value={[sound.volume]}
                      onValueChange={([v]) => updateVolume(sound.id, v)}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timer */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5" />
                Focus Timer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {timerActive ? (
                <div className="text-center">
                  <div className="text-4xl font-mono font-bold mb-4">
                    {formatTime(timerRemaining)}
                  </div>
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      setTimerActive(false);
                      setTimerRemaining(0);
                    }}
                  >
                    Stop Timer
                  </Button>
                </div>
              ) : (
                <>
                  <div>
                    <Label>Duration (minutes)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={120}
                      value={timerMinutes}
                      onChange={(e) => setTimerMinutes(parseInt(e.target.value) || 25)}
                    />
                  </div>
                  <div className="flex gap-2">
                    {[15, 25, 45, 60].map((mins) => (
                      <Button
                        key={mins}
                        variant="outline"
                        size="sm"
                        onClick={() => setTimerMinutes(mins)}
                        className={timerMinutes === mins ? 'border-primary' : ''}
                      >
                        {mins}m
                      </Button>
                    ))}
                  </div>
                  <Button onClick={startTimer} className="w-full">
                    Start Timer
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Save Mix */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Save className="h-5 w-5" />
                Save Mix
              </CardTitle>
              <CardDescription>
                Save your current sound combination
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                value={mixName}
                onChange={(e) => setMixName(e.target.value)}
                placeholder="Mix name..."
              />
              <Button 
                onClick={saveMix} 
                className="w-full"
                disabled={!activeSoundsCount}
              >
                Save Mix
              </Button>
            </CardContent>
          </Card>

          {/* Saved Mixes */}
          {savedMixes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Saved Mixes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {savedMixes.map((mix, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => loadMix(mix)}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {mix.name}
                    <Badge variant="secondary" className="ml-auto">
                      {mix.sounds.length} sounds
                    </Badge>
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default FocusSounds;
