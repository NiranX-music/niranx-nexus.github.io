import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Timer, Play, Pause, RotateCcw, TrendingUp, Clock, Target, Flame, Calendar, BarChart3, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday, subDays } from 'date-fns';

interface StudySession {
  id: string;
  date: string;
  duration: number; // minutes
  subject: string;
  completed: boolean;
}

interface DailyStats {
  date: string;
  totalMinutes: number;
  sessions: number;
}

const SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 
  'History', 'Literature', 'Programming', 'Languages', 'Other'
];

export default function StudyTimerAnalytics() {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [timerMode, setTimerMode] = useState<'focus' | 'break'>('focus');
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [focusDuration, setFocusDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [sessionStart, setSessionStart] = useState<Date | null>(null);
  const [dailyGoal, setDailyGoal] = useState(120); // minutes
  const [streak, setStreak] = useState(0);

  // Load data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('study-sessions');
    if (saved) {
      setSessions(JSON.parse(saved));
    }
    const savedGoal = localStorage.getItem('daily-study-goal');
    if (savedGoal) {
      setDailyGoal(parseInt(savedGoal));
    }
  }, []);

  // Save sessions to localStorage
  useEffect(() => {
    localStorage.setItem('study-sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Calculate streak
  useEffect(() => {
    let currentStreak = 0;
    let checkDate = new Date();
    
    while (true) {
      const dateStr = format(checkDate, 'yyyy-MM-dd');
      const dayTotal = sessions
        .filter(s => s.date === dateStr)
        .reduce((sum, s) => sum + s.duration, 0);
      
      if (dayTotal >= dailyGoal) {
        currentStreak++;
        checkDate = subDays(checkDate, 1);
      } else if (!isToday(checkDate)) {
        break;
      } else {
        break;
      }
    }
    
    setStreak(currentStreak);
  }, [sessions, dailyGoal]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    
    if (timerMode === 'focus' && sessionStart) {
      const duration = Math.round((Date.now() - sessionStart.getTime()) / 60000);
      const newSession: StudySession = {
        id: Date.now().toString(),
        date: format(new Date(), 'yyyy-MM-dd'),
        duration,
        subject: selectedSubject,
        completed: true,
      };
      setSessions([newSession, ...sessions]);
      toast({ 
        title: '🎉 Focus session complete!', 
        description: `${duration} minutes of ${selectedSubject}` 
      });
      
      // Switch to break
      setTimerMode('break');
      setTimeLeft(breakDuration * 60);
    } else {
      // Break complete
      toast({ title: '☕ Break over!', description: 'Ready for another focus session?' });
      setTimerMode('focus');
      setTimeLeft(focusDuration * 60);
    }
  };

  const startTimer = () => {
    if (!isRunning && timerMode === 'focus') {
      setSessionStart(new Date());
    }
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(timerMode === 'focus' ? focusDuration * 60 : breakDuration * 60);
    setSessionStart(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTodayMinutes = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return sessions
      .filter(s => s.date === today)
      .reduce((sum, s) => sum + s.duration, 0);
  };

  const getWeeklyStats = (): DailyStats[] => {
    const start = startOfWeek(new Date());
    const end = endOfWeek(new Date());
    const days = eachDayOfInterval({ start, end });
    
    return days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const daySessions = sessions.filter(s => s.date === dateStr);
      return {
        date: dateStr,
        totalMinutes: daySessions.reduce((sum, s) => sum + s.duration, 0),
        sessions: daySessions.length,
      };
    });
  };

  const getSubjectBreakdown = () => {
    const breakdown: Record<string, number> = {};
    sessions.forEach(s => {
      breakdown[s.subject] = (breakdown[s.subject] || 0) + s.duration;
    });
    return Object.entries(breakdown)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };

  const todayMinutes = getTodayMinutes();
  const weeklyStats = getWeeklyStats();
  const subjectBreakdown = getSubjectBreakdown();
  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
  const maxWeeklyMinutes = Math.max(...weeklyStats.map(s => s.totalMinutes), dailyGoal);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500">
          <Timer className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Study Timer & Analytics</h1>
          <p className="text-muted-foreground">Track your study sessions and progress</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Timer */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Badge variant={timerMode === 'focus' ? 'default' : 'secondary'} className="mb-4">
                  {timerMode === 'focus' ? '🎯 Focus Mode' : '☕ Break Time'}
                </Badge>
                
                <motion.div
                  key={timeLeft}
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  className="relative"
                >
                  <div className="text-7xl font-mono font-bold mb-6">
                    {formatTime(timeLeft)}
                  </div>
                  <Progress 
                    value={((timerMode === 'focus' ? focusDuration * 60 : breakDuration * 60) - timeLeft) / 
                           (timerMode === 'focus' ? focusDuration * 60 : breakDuration * 60) * 100} 
                    className="h-2 mb-6"
                  />
                </motion.div>

                <div className="flex gap-2 justify-center mb-6">
                  {!isRunning ? (
                    <Button onClick={startTimer} size="lg" className="w-32">
                      <Play className="h-5 w-5 mr-2" />
                      Start
                    </Button>
                  ) : (
                    <Button onClick={pauseTimer} size="lg" variant="secondary" className="w-32">
                      <Pause className="h-5 w-5 mr-2" />
                      Pause
                    </Button>
                  )}
                  <Button onClick={resetTimer} variant="outline" size="lg">
                    <RotateCcw className="h-5 w-5" />
                  </Button>
                </div>

                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map(subject => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-4 text-center">
                <Flame className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                <p className="text-2xl font-bold">{streak}</p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <Clock className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">{Math.round(totalMinutes / 60)}h</p>
                <p className="text-xs text-muted-foreground">Total Study</p>
              </CardContent>
            </Card>
          </div>

          {/* Today's Progress */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5" />
                Today's Goal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold">{todayMinutes}m</span>
                <span className="text-muted-foreground">/ {dailyGoal}m</span>
              </div>
              <Progress value={(todayMinutes / dailyGoal) * 100} className="h-3" />
              {todayMinutes >= dailyGoal && (
                <p className="text-sm text-green-500 mt-2 text-center">🎉 Goal achieved!</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Analytics */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Weekly Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between h-48 gap-2">
                {weeklyStats.map((day, i) => {
                  const height = maxWeeklyMinutes > 0 
                    ? (day.totalMinutes / maxWeeklyMinutes) * 100 
                    : 0;
                  const isGoalMet = day.totalMinutes >= dailyGoal;
                  const dayIsToday = isToday(new Date(day.date));
                  
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center">
                      <div className="w-full flex flex-col items-center flex-1 justify-end">
                        <span className="text-xs text-muted-foreground mb-1">
                          {day.totalMinutes}m
                        </span>
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.max(height, 5)}%` }}
                          transition={{ delay: i * 0.1 }}
                          className={`w-full rounded-t-lg ${
                            isGoalMet 
                              ? 'bg-green-500' 
                              : dayIsToday 
                                ? 'bg-primary' 
                                : 'bg-muted'
                          }`}
                        />
                      </div>
                      <span className={`text-xs mt-2 ${dayIsToday ? 'font-bold' : 'text-muted-foreground'}`}>
                        {format(new Date(day.date), 'EEE')}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-center gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-green-500" />
                  <span>Goal Met</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-primary" />
                  <span>Today</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-muted" />
                  <span>In Progress</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Subject Breakdown */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Subject Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                {subjectBreakdown.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No study sessions yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {subjectBreakdown.map(([subject, minutes]) => (
                      <div key={subject}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">{subject}</span>
                          <span className="text-sm text-muted-foreground">
                            {Math.round(minutes / 60)}h {minutes % 60}m
                          </span>
                        </div>
                        <Progress 
                          value={(minutes / subjectBreakdown[0][1]) * 100} 
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Sessions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sessions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Start your first session!
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[200px] overflow-auto">
                    {sessions.slice(0, 10).map(session => (
                      <div key={session.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{session.subject}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(session.date), 'MMM d')}
                          </p>
                        </div>
                        <Badge variant="outline">{session.duration}m</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
