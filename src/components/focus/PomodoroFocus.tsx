import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Play, Pause, RotateCcw, Zap, Music } from 'lucide-react';
import { useFocus } from '@/contexts/FocusContext';
import { useMood } from '@/contexts/MoodContext';
import { toast } from 'sonner';

export default function PomodoroFocus() {
  const [duration, setDuration] = useState(25);
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [subject, setSubject] = useState('');
  const [interruptions, setInterruptions] = useState(0);
  const { startSession, endSession, currentSession } = useFocus();
  const { mood } = useMood();
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft]);

  const handleStart = () => {
    if (!subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }
    
    startSession(subject, duration, mood);
    setIsRunning(true);
    toast.success('🔥 Focus session started!');
  };

  const handlePause = () => {
    setIsRunning(false);
    toast.info('⏸️ Session paused');
  };

  const handleResume = () => {
    setIsRunning(true);
    toast.success('▶️ Resumed');
  };

  const handleComplete = () => {
    setIsRunning(false);
    endSession(interruptions);
    toast.success(`🎉 Session complete! +${Math.floor(duration / 5)} XP`);
    resetTimer();
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(duration * 60);
    setInterruptions(0);
    toast.info('Timer reset');
  };

  const resetTimer = () => {
    setTimeLeft(duration * 60);
    setInterruptions(0);
    setSubject('');
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100;

  return (
    <Card className="glass-card border-primary/20 hover:shadow-neon transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl gradient-text">
          <Zap className="w-5 h-5 text-primary animate-pulse" />
          Pomodoro Focus
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!currentSession && (
          <>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject / Task</Label>
              <Input
                id="subject"
                placeholder="e.g., Physics - Motion in 2D"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="bg-background/50"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <div className="flex gap-2">
                {[25, 45, 60].map(min => (
                  <Button
                    key={min}
                    variant={duration === min ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setDuration(min);
                      setTimeLeft(min * 60);
                    }}
                    className="flex-1"
                  >
                    {min}m
                  </Button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Timer Display */}
        <div className="relative">
          <div className="text-center py-8">
            <div className="text-6xl font-bold gradient-text mb-2">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            <p className="text-sm text-muted-foreground">
              {subject || 'No subject set'}
            </p>
          </div>
          
          {/* Progress Arc */}
          <svg className="absolute inset-0 w-full h-full -z-10" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="8"
            />
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 80}`}
              strokeDashoffset={`${2 * Math.PI * 80 * (1 - progress / 100)}`}
              transform="rotate(-90 100 100)"
              className="transition-all duration-1000"
              filter="url(#glow)"
            />
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
          </svg>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-3">
          {!currentSession ? (
            <Button
              onClick={handleStart}
              className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-neon"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Session
            </Button>
          ) : (
            <>
              {isRunning ? (
                <Button onClick={handlePause} variant="outline">
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>
              ) : (
                <Button onClick={handleResume} variant="default">
                  <Play className="w-4 h-4 mr-2" />
                  Resume
                </Button>
              )}
              <Button onClick={handleReset} variant="ghost">
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button onClick={handleComplete} variant="outline" className="border-success text-success">
                Finish
              </Button>
            </>
          )}
        </div>

        {/* Stats */}
        {currentSession && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{interruptions}</p>
              <p className="text-xs text-muted-foreground">Interruptions</p>
            </div>
            <div className="text-center">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setInterruptions(prev => prev + 1)}
                className="text-xs"
              >
                Log Break
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
