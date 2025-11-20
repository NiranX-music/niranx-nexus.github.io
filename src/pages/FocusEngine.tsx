import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { AIContextualSuggestions } from '@/components/AIContextualSuggestions';
import { Flame, Timer, BarChart3, Calendar, Trophy } from 'lucide-react';
import PomodoroFocus from '@/components/focus/PomodoroFocus';
import HavocMode from '@/components/focus/HavocMode';
import { useFocus } from '@/contexts/FocusContext';
import { useXP } from '@/contexts/XPContext';

export default function FocusEngine() {
  const [showHavoc, setShowHavoc] = useState(false);
  const [havocSubject, setHavocSubject] = useState('');
  const [havocDuration, setHavocDuration] = useState(60);
  const { getTodayStats, getStreak, sessions } = useFocus();
  const { xp, level } = useXP();
  
  const todayStats = getTodayStats();
  const streak = getStreak();

  const recentSessions = sessions
    .filter(s => s.completed)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    .slice(0, 5);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <h1 className="text-4xl font-bold gradient-text mb-2 flex items-center justify-center gap-3">
          <Timer className="w-8 h-8 text-primary animate-spin-slow" />
          Focus Engine
        </h1>
        <p className="text-muted-foreground">
          "Where Focus Becomes an Experience"
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-slide-up">
        <Card className="glass-card border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <Timer className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-3xl font-bold gradient-text">{todayStats.totalMinutes}</p>
              <p className="text-sm text-muted-foreground">Minutes Today</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-accent/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <Calendar className="w-8 h-8 text-accent mx-auto mb-2" />
              <p className="text-3xl font-bold gradient-text">{streak}</p>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-success/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <Trophy className="w-8 h-8 text-success mx-auto mb-2" />
              <p className="text-3xl font-bold gradient-text">L{level}</p>
              <p className="text-sm text-muted-foreground">Level</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-warning/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <BarChart3 className="w-8 h-8 text-warning mx-auto mb-2" />
              <p className="text-3xl font-bold gradient-text">{xp}</p>
              <p className="text-sm text-muted-foreground">Total XP</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Focus Modes */}
      <Tabs defaultValue="pomodoro" className="animate-scale-in">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="pomodoro" className="text-lg">
            <Timer className="w-4 h-4 mr-2" />
            Pomodoro
          </TabsTrigger>
          <TabsTrigger value="havoc" className="text-lg">
            <Flame className="w-4 h-4 mr-2" />
            Havoc Mode
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pomodoro">
          <PomodoroFocus />
        </TabsContent>

        <TabsContent value="havoc">
          <Card className="glass-card border-destructive/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl gradient-text">
                <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
                Havoc Mode
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Hyper-focus cinematic mode with full isolation. No distractions, no escapes.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                <h4 className="font-semibold text-destructive mb-2 flex items-center gap-2">
                  ⚠️ Warning
                </h4>
                <p className="text-sm">
                  Once activated, you cannot exit until the timer completes. Your session will be locked with full screen isolation.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[30, 60, 90].map(min => (
                  <Button
                    key={min}
                    variant={havocDuration === min ? "default" : "outline"}
                    onClick={() => setHavocDuration(min)}
                  >
                    {min}m
                  </Button>
                ))}
              </div>

              <Button
                onClick={() => setShowHavoc(true)}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:shadow-neon text-lg py-6"
              >
                <Flame className="w-5 h-5 mr-2" />
                Enter Havoc Mode
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Sessions */}
      <Card className="glass-card animate-slide-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Recent Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentSessions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No sessions yet. Start your first focus session!
            </p>
          ) : (
            <div className="space-y-3">
              {recentSessions.map(session => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-background/50 border"
                >
                  <div>
                    <p className="font-semibold">{session.subject}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(session.startTime).toLocaleDateString()} • {session.duration}min
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-success">Completed</p>
                    <p className="text-xs text-muted-foreground">
                      {session.interruptions} interruptions
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <HavocMode
        isOpen={showHavoc}
        onClose={() => setShowHavoc(false)}
        duration={havocDuration}
        subject="Deep Focus Session"
      />
    </div>
  );
}
