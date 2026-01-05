import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { BookOpen, Play, Pause, RotateCcw, TrendingUp, Clock, Eye, Zap, Trophy, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

interface ReadingSession {
  id: string;
  date: string;
  wpm: number;
  accuracy: number;
  duration: number;
}

const SAMPLE_TEXTS = [
  {
    title: "The Solar System",
    text: `The solar system consists of the Sun and the objects that orbit it, including eight planets, their moons, dwarf planets, asteroids, and comets. The Sun, a G-type main-sequence star, contains 99.86% of the system's mass. The four inner planets—Mercury, Venus, Earth, and Mars—are terrestrial planets composed primarily of rock and metal. The four outer planets—Jupiter, Saturn, Uranus, and Neptune—are gas and ice giants with massive atmospheres. Between Mars and Jupiter lies the asteroid belt, containing millions of rocky objects. Beyond Neptune, the Kuiper Belt houses dwarf planets like Pluto and countless icy bodies. The solar system formed approximately 4.6 billion years ago from the gravitational collapse of a giant molecular cloud.`
  },
  {
    title: "Photosynthesis",
    text: `Photosynthesis is the biological process by which plants, algae, and certain bacteria convert light energy into chemical energy stored in glucose. This process occurs primarily in chloroplasts, organelles containing the green pigment chlorophyll. During photosynthesis, carbon dioxide from the atmosphere and water from the soil are transformed into glucose and oxygen. The light-dependent reactions occur in the thylakoid membranes, where sunlight is absorbed to generate ATP and NADPH. The Calvin cycle, or light-independent reactions, takes place in the stroma, using ATP and NADPH to fix carbon dioxide into organic molecules. Photosynthesis is fundamental to life on Earth, producing the oxygen we breathe and forming the base of most food chains.`
  },
  {
    title: "The French Revolution",
    text: `The French Revolution, which began in 1789 and lasted until 1799, was a period of radical political and societal change in France. Triggered by fiscal crisis, social inequality, and Enlightenment ideas, the revolution fundamentally transformed French society. The storming of the Bastille on July 14, 1789, became a powerful symbol of popular uprising against tyranny. The revolution abolished the feudal system, established the Declaration of the Rights of Man and of the Citizen, and eventually led to the execution of King Louis XVI. The Reign of Terror, led by Robespierre, saw thousands executed by guillotine. The revolution concluded with Napoleon Bonaparte's rise to power, spreading revolutionary ideals across Europe through military conquest.`
  },
];

export default function ReadingTrainer() {
  const { toast } = useToast();
  const [selectedText, setSelectedText] = useState(SAMPLE_TEXTS[0]);
  const [isReading, setIsReading] = useState(false);
  const [showText, setShowText] = useState(true);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [sessions, setSessions] = useState<ReadingSession[]>([]);
  const [flashSpeed, setFlashSpeed] = useState([300]); // WPM for flash mode
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isFlashMode, setIsFlashMode] = useState(false);
  const [showComprehension, setShowComprehension] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load sessions from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('reading-sessions');
    if (saved) {
      setSessions(JSON.parse(saved));
    }
  }, []);

  // Save sessions to localStorage
  useEffect(() => {
    localStorage.setItem('reading-sessions', JSON.stringify(sessions));
  }, [sessions]);

  const words = selectedText.text.split(/\s+/);
  const wordCount = words.length;

  const startReading = () => {
    setIsReading(true);
    setStartTime(Date.now());
    setEndTime(null);
    setShowText(true);
    setCurrentWordIndex(0);
  };

  const stopReading = () => {
    if (startTime) {
      const end = Date.now();
      setEndTime(end);
      setIsReading(false);
      
      const durationMinutes = (end - startTime) / 60000;
      const wpm = Math.round(wordCount / durationMinutes);
      
      const session: ReadingSession = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        wpm,
        accuracy: 100, // Simplified - no comprehension test
        duration: Math.round((end - startTime) / 1000),
      };
      
      setSessions([session, ...sessions.slice(0, 19)]); // Keep last 20
      toast({ 
        title: 'Reading complete!', 
        description: `Your speed: ${wpm} WPM` 
      });
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsFlashMode(false);
  };

  const startFlashReading = () => {
    setIsFlashMode(true);
    setIsReading(true);
    setStartTime(Date.now());
    setCurrentWordIndex(0);
    
    const msPerWord = 60000 / flashSpeed[0];
    
    intervalRef.current = setInterval(() => {
      setCurrentWordIndex(prev => {
        if (prev >= words.length - 1) {
          stopReading();
          return prev;
        }
        return prev + 1;
      });
    }, msPerWord);
  };

  const reset = () => {
    setIsReading(false);
    setStartTime(null);
    setEndTime(null);
    setShowText(true);
    setCurrentWordIndex(0);
    setIsFlashMode(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const getAverageWPM = () => {
    if (sessions.length === 0) return 0;
    return Math.round(sessions.reduce((sum, s) => sum + s.wpm, 0) / sessions.length);
  };

  const getBestWPM = () => {
    if (sessions.length === 0) return 0;
    return Math.max(...sessions.map(s => s.wpm));
  };

  const getCurrentWPM = () => {
    if (!startTime || !isReading) return 0;
    const elapsed = (Date.now() - startTime) / 60000;
    if (elapsed === 0) return 0;
    const wordsRead = isFlashMode ? currentWordIndex : wordCount;
    return Math.round(wordsRead / elapsed);
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500">
          <BookOpen className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Speed Reading Trainer</h1>
          <p className="text-muted-foreground">Improve your reading speed and comprehension</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4 text-center">
            <Clock className="h-6 w-6 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">{sessions.length}</p>
            <p className="text-xs text-muted-foreground">Sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">{getAverageWPM()}</p>
            <p className="text-xs text-muted-foreground">Avg WPM</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Trophy className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
            <p className="text-2xl font-bold">{getBestWPM()}</p>
            <p className="text-xs text-muted-foreground">Best WPM</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Zap className="h-6 w-6 mx-auto mb-2 text-purple-500" />
            <p className="text-2xl font-bold">{isReading ? getCurrentWPM() : '-'}</p>
            <p className="text-xs text-muted-foreground">Current WPM</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Select Text</Label>
              <div className="space-y-2">
                {SAMPLE_TEXTS.map((text, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedText(text);
                      reset();
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedText.title === text.title
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    <p className="font-medium">{text.title}</p>
                    <p className="text-xs opacity-80">{text.text.split(' ').length} words</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Flash Reading Speed: {flashSpeed[0]} WPM</Label>
              <Slider
                value={flashSpeed}
                onValueChange={setFlashSpeed}
                min={100}
                max={1000}
                step={50}
                disabled={isReading}
              />
              <p className="text-xs text-muted-foreground">
                Words appear one at a time at this speed
              </p>
            </div>

            <div className="space-y-2">
              <Button
                onClick={startFlashReading}
                disabled={isReading}
                className="w-full"
                variant="secondary"
              >
                <Zap className="h-4 w-4 mr-2" />
                Flash Reading Mode
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Train your eyes to read faster
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Reading Area */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{selectedText.title}</CardTitle>
              <Badge variant="outline">{wordCount} words</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isFlashMode ? (
              <div className="min-h-[300px] flex items-center justify-center bg-muted rounded-lg">
                <motion.div
                  key={currentWordIndex}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-4xl font-bold text-center"
                >
                  {words[currentWordIndex]}
                </motion.div>
              </div>
            ) : (
              <div className="min-h-[300px] p-6 bg-muted rounded-lg">
                <p className="text-lg leading-relaxed">{selectedText.text}</p>
              </div>
            )}

            {isReading && (
              <Progress 
                value={isFlashMode ? (currentWordIndex / words.length) * 100 : undefined} 
                className="h-2"
              />
            )}

            <div className="flex gap-2">
              {!isReading ? (
                <Button onClick={startReading} className="flex-1">
                  <Play className="h-4 w-4 mr-2" />
                  Start Reading (Timed)
                </Button>
              ) : (
                <Button onClick={stopReading} variant="destructive" className="flex-1">
                  <Pause className="h-4 w-4 mr-2" />
                  Done Reading
                </Button>
              )}
              <Button variant="outline" onClick={reset}>
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowText(!showText)}
                disabled={isFlashMode}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>

            {endTime && startTime && (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {Math.round(wordCount / ((endTime - startTime) / 60000))} WPM
                </p>
                <p className="text-sm text-muted-foreground">
                  Read {wordCount} words in {Math.round((endTime - startTime) / 1000)} seconds
                </p>
              </div>
            )}

            {/* Recent Sessions */}
            {sessions.length > 0 && (
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Recent Sessions</h4>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {sessions.slice(0, 10).map((session) => (
                    <div key={session.id} className="flex-shrink-0 p-2 bg-muted rounded-lg text-center min-w-[80px]">
                      <p className="font-bold">{session.wpm}</p>
                      <p className="text-xs text-muted-foreground">WPM</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
