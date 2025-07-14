import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings,
  Timer,
  Coffee,
  Brain,
  Zap,
  Target
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PomodoroSession {
  id: string;
  type: 'focus' | 'break';
  duration: number;
  completedAt: string;
  xpEarned: number;
}

interface PomodoroStats {
  totalSessions: number;
  totalFocusTime: number;
  totalXP: number;
  streak: number;
}

const PomodoroPage = () => {
  const { toast } = useToast();
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
  const [sessionType, setSessionType] = useState<'focus' | 'break'>('focus');
  const [focusTime, setFocusTime] = useState(25);
  const [breakTime, setBreakTime] = useState(5);
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [stats, setStats] = useState<PomodoroStats>({
    totalSessions: 0,
    totalFocusTime: 0,
    totalXP: 0,
    streak: 0
  });
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const savedSessions = localStorage.getItem('studyverse-pomodoro-sessions');
    const savedStats = localStorage.getItem('studyverse-pomodoro-stats');
    
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions));
    }
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('studyverse-pomodoro-sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('studyverse-pomodoro-stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSessionComplete();
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
  }, [isActive, timeLeft]);

  const handleSessionComplete = () => {
    setIsActive(false);
    playNotificationSound();
    
    const xpEarned = sessionType === 'focus' ? 25 : 10;
    const sessionDuration = sessionType === 'focus' ? focusTime : breakTime;
    
    const newSession: PomodoroSession = {
      id: Date.now().toString(),
      type: sessionType,
      duration: sessionDuration,
      completedAt: new Date().toISOString(),
      xpEarned
    };

    setSessions(prev => [...prev, newSession]);
    
    setStats(prev => ({
      totalSessions: prev.totalSessions + 1,
      totalFocusTime: prev.totalFocusTime + (sessionType === 'focus' ? sessionDuration : 0),
      totalXP: prev.totalXP + xpEarned,
      streak: prev.streak + 1
    }));

    toast({
      title: sessionType === 'focus' ? "Focus Session Complete! 🎯" : "Break Time Over! ☕",
      description: `+${xpEarned} XP earned!`
    });

    // Auto-switch session type
    const nextType = sessionType === 'focus' ? 'break' : 'focus';
    setSessionType(nextType);
    setTimeLeft(nextType === 'focus' ? focusTime * 60 : breakTime * 60);
  };

  const playNotificationSound = () => {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.1;
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2);
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(sessionType === 'focus' ? focusTime * 60 : breakTime * 60);
  };

  const switchSession = (type: 'focus' | 'break') => {
    setIsActive(false);
    setSessionType(type);
    setTimeLeft(type === 'focus' ? focusTime * 60 : breakTime * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const totalTime = sessionType === 'focus' ? focusTime * 60 : breakTime * 60;
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  const todaySessions = sessions.filter(session => {
    const today = new Date().toDateString();
    const sessionDate = new Date(session.completedAt).toDateString();
    return today === sessionDate;
  });

  return (
    <div className="min-h-screen p-6 pb-20">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Timer className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Pomodoro Focus
          </h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <Target className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.totalSessions}</div>
              <div className="text-sm text-muted-foreground">Sessions</div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <Brain className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{Math.round(stats.totalFocusTime / 60)}h</div>
              <div className="text-sm text-muted-foreground">Focus Time</div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <Zap className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.totalXP}</div>
              <div className="text-sm text-muted-foreground">Total XP</div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <Coffee className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{todaySessions.length}</div>
              <div className="text-sm text-muted-foreground">Today</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Timer */}
      <Card className="glass-card mb-6">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <Badge 
              variant={sessionType === 'focus' ? "default" : "secondary"}
              className="mb-4 text-lg px-4 py-2"
            >
              {sessionType === 'focus' ? '🎯 Focus Time' : '☕ Break Time'}
            </Badge>
            
            <div className="text-6xl md:text-8xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              {formatTime(timeLeft)}
            </div>
            
            <Progress value={getProgress()} className="h-3 mb-6" />
          </div>

          <div className="flex justify-center gap-4 mb-6">
            <Button
              onClick={toggleTimer}
              size="lg"
              className="w-16 h-16 rounded-full glass-button"
            >
              {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </Button>
            
            <Button
              onClick={resetTimer}
              size="lg"
              variant="outline"
              className="w-16 h-16 rounded-full glass-button"
            >
              <RotateCcw className="w-6 h-6" />
            </Button>
          </div>

          <div className="flex justify-center gap-2">
            <Button
              onClick={() => switchSession('focus')}
              variant={sessionType === 'focus' ? "default" : "outline"}
              size="sm"
            >
              Focus ({focusTime}m)
            </Button>
            <Button
              onClick={() => switchSession('break')}
              variant={sessionType === 'break' ? "default" : "outline"}
              size="sm"
            >
              Break ({breakTime}m)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card className="glass-card mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Timer Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Focus Time (minutes)</label>
              <div className="flex gap-2">
                {[15, 25, 30, 45].map(time => (
                  <Button
                    key={time}
                    onClick={() => {
                      setFocusTime(time);
                      if (sessionType === 'focus' && !isActive) {
                        setTimeLeft(time * 60);
                      }
                    }}
                    variant={focusTime === time ? "default" : "outline"}
                    size="sm"
                  >
                    {time}m
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Break Time (minutes)</label>
              <div className="flex gap-2">
                {[5, 10, 15, 20].map(time => (
                  <Button
                    key={time}
                    onClick={() => {
                      setBreakTime(time);
                      if (sessionType === 'break' && !isActive) {
                        setTimeLeft(time * 60);
                      }
                    }}
                    variant={breakTime === time ? "default" : "outline"}
                    size="sm"
                  >
                    {time}m
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Today's Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {todaySessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Timer className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No sessions completed today. Start your first focus session!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todaySessions.slice(-5).reverse().map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {session.type === 'focus' ? (
                      <Brain className="w-4 h-4 text-blue-500" />
                    ) : (
                      <Coffee className="w-4 h-4 text-orange-500" />
                    )}
                    <span className="capitalize font-medium">{session.type}</span>
                    <span className="text-sm text-muted-foreground">
                      {session.duration} min
                    </span>
                  </div>
                  <Badge variant="outline">+{session.xpEarned} XP</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PomodoroPage;