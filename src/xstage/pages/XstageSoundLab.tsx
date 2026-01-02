import { useState, useRef, useEffect, useCallback } from 'react';
import { useXstage } from '../contexts/XstageContext';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Play, Pause, Square, Circle, SkipBack, SkipForward,
  Volume2, VolumeX, Mic, Music, Piano, AudioWaveform,
  Plus, Trash2, Settings, Repeat, Timer
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Track {
  id: string;
  name: string;
  type: 'audio' | 'midi';
  volume: number;
  pan: number;
  muted: boolean;
  solo: boolean;
  color: string;
}

interface Note {
  id: string;
  pitch: number;
  start: number;
  duration: number;
  velocity: number;
}

const TRACK_COLORS = [
  'bg-fuchsia-500', 'bg-cyan-500', 'bg-pink-500', 'bg-purple-500',
  'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-orange-500'
];

const PIANO_KEYS = [
  { note: 'C', black: false }, { note: 'C#', black: true },
  { note: 'D', black: false }, { note: 'D#', black: true },
  { note: 'E', black: false }, { note: 'F', black: false },
  { note: 'F#', black: true }, { note: 'G', black: false },
  { note: 'G#', black: true }, { note: 'A', black: false },
  { note: 'A#', black: true }, { note: 'B', black: false }
];

export const XstageSoundLab = () => {
  const { currentProject } = useXstage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [bpm, setBpm] = useState(120);
  const [timeSignature, setTimeSignature] = useState('4/4');
  const [masterVolume, setMasterVolume] = useState(80);
  const [loopEnabled, setLoopEnabled] = useState(false);
  const [metronomeEnabled, setMetronomeEnabled] = useState(false);
  const [tracks, setTracks] = useState<Track[]>([
    { id: '1', name: 'Drums', type: 'audio', volume: 80, pan: 0, muted: false, solo: false, color: 'bg-fuchsia-500' },
    { id: '2', name: 'Bass', type: 'audio', volume: 75, pan: 0, muted: false, solo: false, color: 'bg-cyan-500' },
    { id: '3', name: 'Keys', type: 'midi', volume: 70, pan: 0, muted: false, solo: false, color: 'bg-pink-500' }
  ]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => prev + 0.1);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handlePlay = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleRecord = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        toast.success('Recording saved!');
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPlaying(true);
    } catch (error) {
      toast.error('Could not access microphone');
    }
  };

  const addTrack = () => {
    const newTrack: Track = {
      id: Date.now().toString(),
      name: `Track ${tracks.length + 1}`,
      type: 'audio',
      volume: 75,
      pan: 0,
      muted: false,
      solo: false,
      color: TRACK_COLORS[tracks.length % TRACK_COLORS.length]
    };
    setTracks([...tracks, newTrack]);
  };

  const removeTrack = (id: string) => {
    setTracks(tracks.filter(t => t.id !== id));
    if (selectedTrack === id) setSelectedTrack(null);
  };

  const updateTrack = (id: string, updates: Partial<Track>) => {
    setTracks(tracks.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const playNote = useCallback((note: string, octave: number) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    const noteFreqs: Record<string, number> = {
      'C': 261.63, 'C#': 277.18, 'D': 293.66, 'D#': 311.13,
      'E': 329.63, 'F': 349.23, 'F#': 369.99, 'G': 392.00,
      'G#': 415.30, 'A': 440.00, 'A#': 466.16, 'B': 493.88
    };
    
    const freq = noteFreqs[note] * Math.pow(2, octave - 4);
    oscillator.frequency.value = freq;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.5);
    
    setActiveKeys(prev => new Set([...prev, `${note}${octave}`]));
    setTimeout(() => {
      setActiveKeys(prev => {
        const next = new Set(prev);
        next.delete(`${note}${octave}`);
        return next;
      });
    }, 200);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${ms.toString().padStart(2, '0')}`;
  };

  const tapTempoTimes = useRef<number[]>([]);
  const handleTapTempo = () => {
    const now = Date.now();
    tapTempoTimes.current.push(now);
    
    if (tapTempoTimes.current.length > 4) {
      tapTempoTimes.current.shift();
    }
    
    if (tapTempoTimes.current.length >= 2) {
      const intervals = [];
      for (let i = 1; i < tapTempoTimes.current.length; i++) {
        intervals.push(tapTempoTimes.current[i] - tapTempoTimes.current[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const newBpm = Math.round(60000 / avgInterval);
      if (newBpm >= 40 && newBpm <= 300) {
        setBpm(newBpm);
      }
    }
  };

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Select a project to use SoundLab</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-background to-background/80">
      {/* Transport Bar */}
      <div className="border-b border-white/10 bg-black/40 backdrop-blur-xl p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={handleStop}
              className="hover:bg-white/10"
            >
              <Square className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant={isPlaying ? 'default' : 'ghost'}
              onClick={isPlaying ? handlePause : handlePlay}
              className={isPlaying ? 'bg-fuchsia-500 hover:bg-fuchsia-600' : 'hover:bg-white/10'}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              size="icon"
              variant={isRecording ? 'destructive' : 'ghost'}
              onClick={handleRecord}
              className={isRecording ? 'animate-pulse' : 'hover:bg-white/10'}
            >
              <Circle className={`h-4 w-4 ${isRecording ? 'fill-current' : ''}`} />
            </Button>
            <div className="w-px h-6 bg-white/20 mx-2" />
            <Button
              size="icon"
              variant={loopEnabled ? 'default' : 'ghost'}
              onClick={() => setLoopEnabled(!loopEnabled)}
              className={loopEnabled ? 'bg-cyan-500 hover:bg-cyan-600' : 'hover:bg-white/10'}
            >
              <Repeat className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant={metronomeEnabled ? 'default' : 'ghost'}
              onClick={() => setMetronomeEnabled(!metronomeEnabled)}
              className={metronomeEnabled ? 'bg-pink-500 hover:bg-pink-600' : 'hover:bg-white/10'}
            >
              <Timer className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-2xl font-mono bg-black/40 px-4 py-2 rounded-lg border border-white/10">
              {formatTime(currentTime)}
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleTapTempo}>
                TAP
              </Button>
              <Input
                type="number"
                value={bpm}
                onChange={(e) => setBpm(parseInt(e.target.value) || 120)}
                className="w-20 text-center"
              />
              <span className="text-sm text-muted-foreground">BPM</span>
            </div>

            <select
              value={timeSignature}
              onChange={(e) => setTimeSignature(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm"
            >
              <option value="4/4">4/4</option>
              <option value="3/4">3/4</option>
              <option value="6/8">6/8</option>
              <option value="2/4">2/4</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            {masterVolume === 0 ? (
              <VolumeX className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
            <Slider
              value={[masterVolume]}
              onValueChange={([v]) => setMasterVolume(v)}
              max={100}
              className="w-24"
            />
            <span className="text-sm w-8">{masterVolume}%</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="studio" className="h-full flex flex-col">
          <div className="border-b border-white/10 px-4">
            <TabsList className="bg-transparent h-12">
              <TabsTrigger value="studio" className="data-[state=active]:bg-fuchsia-500/20">
                <AudioWaveform className="h-4 w-4 mr-2" />
                Studio
              </TabsTrigger>
              <TabsTrigger value="piano" className="data-[state=active]:bg-fuchsia-500/20">
                <Piano className="h-4 w-4 mr-2" />
                Piano Roll
              </TabsTrigger>
              <TabsTrigger value="recorder" className="data-[state=active]:bg-fuchsia-500/20">
                <Mic className="h-4 w-4 mr-2" />
                Recorder
              </TabsTrigger>
              <TabsTrigger value="stems" className="data-[state=active]:bg-fuchsia-500/20">
                <Music className="h-4 w-4 mr-2" />
                AI Stems
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="studio" className="flex-1 overflow-hidden m-0 p-4">
            <div className="h-full flex gap-4">
              {/* Track List */}
              <div className="w-64 space-y-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Tracks</h3>
                  <Button size="sm" variant="outline" onClick={addTrack}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {tracks.map((track) => (
                  <motion.div
                    key={track.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      selectedTrack === track.id
                        ? 'bg-white/10 border-fuchsia-500/50'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                    onClick={() => setSelectedTrack(track.id)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${track.color}`} />
                      <span className="flex-1 text-sm font-medium">{track.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {track.type}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant={track.muted ? 'destructive' : 'ghost'}
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateTrack(track.id, { muted: !track.muted });
                        }}
                      >
                        <span className="text-xs">M</span>
                      </Button>
                      <Button
                        size="icon"
                        variant={track.solo ? 'default' : 'ghost'}
                        className={`h-6 w-6 ${track.solo ? 'bg-yellow-500 hover:bg-yellow-600' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          updateTrack(track.id, { solo: !track.solo });
                        }}
                      >
                        <span className="text-xs">S</span>
                      </Button>
                      <Slider
                        value={[track.volume]}
                        onValueChange={([v]) => updateTrack(track.id, { volume: v })}
                        max={100}
                        className="flex-1"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTrack(track.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Timeline */}
              <div className="flex-1 bg-black/20 rounded-lg border border-white/10 overflow-hidden">
                <div className="h-8 bg-white/5 border-b border-white/10 flex items-center px-4">
                  <div className="flex gap-16 text-xs text-muted-foreground">
                    {Array.from({ length: 16 }, (_, i) => (
                      <span key={i}>{i + 1}</span>
                    ))}
                  </div>
                </div>
                
                <div className="relative">
                  {/* Playhead */}
                  <div
                    className="absolute top-0 bottom-0 w-px bg-fuchsia-500 z-10"
                    style={{ left: `${(currentTime / 30) * 100}%` }}
                  />
                  
                  {tracks.map((track) => (
                    <div
                      key={track.id}
                      className={`h-16 border-b border-white/5 ${track.muted ? 'opacity-50' : ''}`}
                    >
                      <div
                        className={`h-full ${track.color} opacity-30`}
                        style={{ width: '60%' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="piano" className="flex-1 overflow-hidden m-0 p-4">
            <div className="h-full flex flex-col">
              <div className="flex-1 bg-black/20 rounded-lg border border-white/10 mb-4 p-4">
                <div className="grid grid-cols-16 gap-1 h-full">
                  {Array.from({ length: 16 }, (_, bar) => (
                    <div key={bar} className="border-r border-white/10 last:border-0">
                      {Array.from({ length: 12 }, (_, note) => (
                        <div
                          key={note}
                          className="h-4 border-b border-white/5 hover:bg-fuchsia-500/30 cursor-pointer"
                          onClick={() => {
                            const newNote: Note = {
                              id: Date.now().toString(),
                              pitch: 60 + note,
                              start: bar,
                              duration: 1,
                              velocity: 100
                            };
                            setNotes([...notes, newNote]);
                          }}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Virtual Keyboard */}
              <div className="h-32 flex justify-center">
                {[3, 4, 5].map((octave) => (
                  <div key={octave} className="flex">
                    {PIANO_KEYS.map((key, idx) => (
                      <button
                        key={`${key.note}${octave}`}
                        className={`relative ${
                          key.black
                            ? 'w-8 h-20 bg-gray-900 -mx-4 z-10 rounded-b-md border border-gray-700'
                            : 'w-12 h-32 bg-white border border-gray-300 rounded-b-md'
                        } ${
                          activeKeys.has(`${key.note}${octave}`)
                            ? key.black
                              ? 'bg-fuchsia-800'
                              : 'bg-fuchsia-200'
                            : ''
                        } transition-colors`}
                        onClick={() => playNote(key.note, octave)}
                      >
                        {!key.black && (
                          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-gray-500">
                            {key.note}{octave}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="recorder" className="flex-1 overflow-hidden m-0 p-4">
            <div className="h-full flex flex-col items-center justify-center">
              <div className="w-full max-w-2xl">
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mic className="h-5 w-5 text-fuchsia-400" />
                      Audio Recorder
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="h-32 bg-black/40 rounded-lg border border-white/10 flex items-center justify-center">
                      {isRecording ? (
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                          <span className="text-red-400">Recording...</span>
                        </div>
                      ) : (
                        <AudioWaveform className="h-12 w-12 text-muted-foreground/50" />
                      )}
                    </div>
                    
                    <div className="flex justify-center gap-4">
                      <Button
                        size="lg"
                        variant={isRecording ? 'destructive' : 'default'}
                        onClick={handleRecord}
                        className={isRecording ? '' : 'bg-gradient-to-r from-fuchsia-500 to-pink-500'}
                      >
                        {isRecording ? (
                          <>
                            <Square className="h-5 w-5 mr-2" />
                            Stop Recording
                          </>
                        ) : (
                          <>
                            <Circle className="h-5 w-5 mr-2" />
                            Start Recording
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stems" className="flex-1 overflow-hidden m-0 p-4">
            <div className="h-full flex flex-col items-center justify-center">
              <Card className="bg-white/5 border-white/10 max-w-xl w-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Music className="h-5 w-5 text-fuchsia-400" />
                    AI Stem Separation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-fuchsia-500/50 transition-colors cursor-pointer">
                    <Music className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground mb-2">Drop an audio file here</p>
                    <p className="text-xs text-muted-foreground">or click to browse</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {['Vocals', 'Drums', 'Bass', 'Other'].map((stem) => (
                      <div
                        key={stem}
                        className="p-4 bg-white/5 rounded-lg border border-white/10 text-center"
                      >
                        <p className="font-medium mb-2">{stem}</p>
                        <Button size="sm" variant="outline" disabled>
                          Export
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    AI-powered stem separation coming soon
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
