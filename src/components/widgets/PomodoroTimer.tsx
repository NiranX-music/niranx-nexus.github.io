import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { 
  Timer, 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  Coffee,
  Brain,
  Zap,
  Volume2,
  VolumeX
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface PomodoroSession {
  id: string;
  type: 'work' | 'short-break' | 'long-break';
  duration: number;
  completedAt: Date;
}

const PomodoroTimer = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes default
  const [currentSession, setCurrentSession] = useState<'work' | 'short-break' | 'long-break'>('work');
  const [completedSessions, setCompletedSessions] = useState<PomodoroSession[]>([]);
  const [settings, setSettings] = useState({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    soundEnabled: true,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [streak, setStreak] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load data from localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem('studyverse-pomodoro-sessions');
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        setCompletedSessions(parsed.map((session: any) => ({
          ...session,
          completedAt: new Date(session.completedAt)
        })));
      } catch (error) {
        console.error('Error loading pomodoro sessions:', error);
      }
    }

    const savedSettings = localStorage.getItem('studyverse-pomodoro-settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading pomodoro settings:', error);
      }
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('studyverse-pomodoro-sessions', JSON.stringify(completedSessions));
  }, [completedSessions]);

  useEffect(() => {
    localStorage.setItem('studyverse-pomodoro-settings', JSON.stringify(settings));
  }, [settings]);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  // Handle session completion
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      handleSessionComplete();
    }
  }, [timeLeft, isRunning]);

  // Calculate streak
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaysSessions = completedSessions.filter(session => {
      const sessionDate = new Date(session.completedAt);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === today.getTime() && session.type === 'work';
    });
    
    setStreak(todaysSessions.length);
  }, [completedSessions]);

  const handleSessionComplete = () => {
    setIsRunning(false);
    
    // Play completion sound
    if (settings.soundEnabled && audioRef.current) {
      audioRef.current.play().catch(console.error);
    }

    // Save completed session
    const newSession: PomodoroSession = {
      id: Math.random().toString(36).substr(2, 9),
      type: currentSession,
      duration: getDurationForSession(currentSession),
      completedAt: new Date(),
    };
    
    setCompletedSessions(prev => [...prev, newSession]);

    // Auto-switch to next session
    const workSessions = completedSessions.filter(s => s.type === 'work').length + (currentSession === 'work' ? 1 : 0);
    
    if (currentSession === 'work') {
      const nextSession = workSessions % settings.longBreakInterval === 0 ? 'long-break' : 'short-break';
      setCurrentSession(nextSession);
      setTimeLeft(getDurationForSession(nextSession) * 60);
      
      toast({
        title: "Work Session Complete! 🎉",
        description: `Time for a ${nextSession === 'long-break' ? 'long' : 'short'} break`,
      });
    } else {
      setCurrentSession('work');
      setTimeLeft(settings.workDuration * 60);
      
      toast({
        title: "Break Over! 💪",
        description: "Ready for your next work session?",
      });
    }
  };

  const getDurationForSession = (session: typeof currentSession) => {
    switch (session) {
      case 'work':
        return settings.workDuration;
      case 'short-break':
        return settings.shortBreakDuration;
      case 'long-break':
        return settings.longBreakDuration;
      default:
        return settings.workDuration;
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(getDurationForSession(currentSession) * 60);
  };

  const switchSession = (session: typeof currentSession) => {
    setCurrentSession(session);
    setTimeLeft(getDurationForSession(session) * 60);
    setIsRunning(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const totalTime = getDurationForSession(currentSession) * 60;
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  const getSessionIcon = (session: typeof currentSession) => {
    switch (session) {
      case 'work':
        return <Brain className="w-5 h-5" />;
      case 'short-break':
        return <Coffee className="w-5 h-5" />;
      case 'long-break':
        return <Zap className="w-5 h-5" />;
    }
  };

  const getSessionColor = (session: typeof currentSession) => {
    switch (session) {
      case 'work':
        return 'text-primary border-primary/30 bg-primary/10';
      case 'short-break':
        return 'text-yellow-600 border-yellow-500/30 bg-yellow-500/10';
      case 'long-break':
        return 'text-green-600 border-green-500/30 bg-green-500/10';
    }
  };

  return (
    <Card className="widget">
      {/* Hidden audio element for completion sound */}
      <audio ref={audioRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEoGkCVwtqjaBkjdKbPq2EgBTGa3pBUDA9JwqlTE0yz3ooiAiqJzfHViyQKFGO35pJdGQVFmNPsy4kGEjF+0qRvH0A8yTH3W6vxG+gBIAT/9YBAhOh3wBCXQqrywm6gKAL+/2Ry3O1DQBT3+/PLbQ8GIoTP9N2QQAoUXrTp66hVFApGn+DyvmEoGkCVwtqjaBkjdKbPq2EgBTGa3pBUDA9JwqlTE0yz3ooiAiqJzfHViyQKFGO35pJdGQVFmNPsy4kGEjF+0qRvH0A8yTH3W6vxG+gBIAT/9YBAhOh3wBCXQqrywm6gKAL+/2Ry3O1DQBT3+/PLbQ8GIoTP9N2QQAoUXrTp66hVFApGn+DyvmEoGkCVwtqjaBkjdKbPq2EgBTGa3pBUDA9JwqlTE0yz3ooiAiqJzfHViyQKFGO35pJdGQVFmNPsy4kGEjF+0qRvH0A8yTH3W6vxG+gBIAT/9YBAhOh3wBCXQqrywm6gKAL+/2Ry3O1DQBT3+/PLbQ8GIoTP9N2QQAoUXrTp66hVFApGn+DyvmEoGkCVwtqjaBkjdKbPq2EgBTGa3pBUDA9JwqlTE0yz3ooiAiqJzfHViyQKFGO35pJdGQVFmNPsy4kGEjF+0qRvH0A8yTH3W6vxG+gBIAT/9YBAhOh3wBCXQqrywm6gKAL+/2Ry3O1DQBT3+/PLbQ8GIoTP9N2QQAoUXrTp66hVFApGn+DyvmEoGkCVwtqjaBkjdKbPq2EgBTGa3pBUDA9JwqlTE0yz3ooiAiqJzfHViyQKFGO35pJdGQVFmNPsy4kGEjF+0qRvH0A8yTH3W6vxG+gBIAT/9YBA" type="audio/wav" />
      </audio>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
              <Timer className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Pomodoro Timer</h3>
              <p className="text-sm text-muted-foreground">
                {streak} session{streak !== 1 ? 's' : ''} today
              </p>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(true)}
            className="glass-button"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Session Type Selector */}
        <div className="flex gap-2">
          {(['work', 'short-break', 'long-break'] as const).map((session) => (
            <Button
              key={session}
              variant={currentSession === session ? 'default' : 'outline'}
              size="sm"
              onClick={() => switchSession(session)}
              className={`flex-1 text-xs ${currentSession === session ? '' : getSessionColor(session)}`}
            >
              {getSessionIcon(session)}
              <span className="ml-1 hidden sm:inline">
                {session === 'work' ? 'Work' : 
                 session === 'short-break' ? 'Short Break' : 'Long Break'}
              </span>
            </Button>
          ))}
        </div>

        {/* Timer Display */}
        <div className="text-center space-y-4">
          <div className="relative w-32 h-32 mx-auto">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="54"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted"
              />
              <circle
                cx="60"
                cy="60"
                r="54"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 54}`}
                strokeDashoffset={`${2 * Math.PI * 54 * (1 - getProgress() / 100)}`}
                className="text-primary transition-all duration-1000 ease-in-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold">{formatTime(timeLeft)}</span>
            </div>
          </div>

          <Badge className={`text-sm ${getSessionColor(currentSession)}`}>
            {currentSession === 'work' ? '🧠 Focus Time' : 
             currentSession === 'short-break' ? '☕ Short Break' : '🌟 Long Break'}
          </Badge>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <Button
            size="lg"
            onClick={toggleTimer}
            className="w-16 h-16 rounded-full bg-gradient-primary hover:scale-110 transition-transform"
          >
            {isRunning ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white ml-1" />
            )}
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            onClick={resetTimer}
            className="w-16 h-16 rounded-full"
          >
            <RotateCcw className="w-6 h-6" />
          </Button>
        </div>

        {/* Session Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-2xl font-bold text-primary">{streak}</p>
            <p className="text-xs text-muted-foreground">Today</p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-2xl font-bold text-accent">
              {completedSessions.filter(s => s.type === 'work').length}
            </p>
            <p className="text-xs text-muted-foreground">Total Sessions</p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-2xl font-bold text-success">
              {Math.round(completedSessions.filter(s => s.type === 'work').reduce((sum, s) => sum + s.duration, 0) / 60)}
            </p>
            <p className="text-xs text-muted-foreground">Hours Focused</p>
          </div>
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-card rounded-lg max-w-md w-full p-6">
              <h4 className="font-semibold mb-4">Pomodoro Settings</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Work Duration (minutes)</label>
                  <Slider
                    value={[settings.workDuration]}
                    onValueChange={([value]) => setSettings(prev => ({ ...prev, workDuration: value }))}
                    min={15}
                    max={60}
                    step={5}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{settings.workDuration} minutes</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Short Break (minutes)</label>
                  <Slider
                    value={[settings.shortBreakDuration]}
                    onValueChange={([value]) => setSettings(prev => ({ ...prev, shortBreakDuration: value }))}
                    min={3}
                    max={15}
                    step={1}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{settings.shortBreakDuration} minutes</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Long Break (minutes)</label>
                  <Slider
                    value={[settings.longBreakDuration]}
                    onValueChange={([value]) => setSettings(prev => ({ ...prev, longBreakDuration: value }))}
                    min={15}
                    max={30}
                    step={5}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{settings.longBreakDuration} minutes</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Long Break Interval</label>
                  <Slider
                    value={[settings.longBreakInterval]}
                    onValueChange={([value]) => setSettings(prev => ({ ...prev, longBreakInterval: value }))}
                    min={2}
                    max={8}
                    step={1}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Every {settings.longBreakInterval} work sessions</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Completion Sound</label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
                  >
                    {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="flex gap-2 mt-6">
                <Button onClick={() => setShowSettings(false)} className="flex-1">
                  Save Settings
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PomodoroTimer;