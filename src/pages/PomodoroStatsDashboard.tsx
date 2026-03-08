import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import { Timer, Flame, Target, BarChart3, Calendar, Zap, Brain, Trophy, Clock, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Session {
  id: string;
  date: string;
  duration: number;
  type: 'focus' | 'short_break' | 'long_break';
  completed: boolean;
  subject?: string;
}

const generateMockSessions = (): Session[] => {
  const sessions: Session[] = [];
  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Literature', 'Programming', 'History'];
  const types: Session['type'][] = ['focus', 'short_break', 'long_break'];
  for (let d = 0; d < 30; d++) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    const count = Math.floor(Math.random() * 8) + 1;
    for (let i = 0; i < count; i++) {
      sessions.push({
        id: `${d}-${i}`,
        date: date.toISOString(),
        duration: types[i % 3] === 'focus' ? 25 : types[i % 3] === 'short_break' ? 5 : 15,
        type: types[i % 3],
        completed: Math.random() > 0.15,
        subject: subjects[Math.floor(Math.random() * subjects.length)],
      });
    }
  }
  return sessions;
};

const PomodoroStatsDashboard = () => {
  const [sessions] = useState<Session[]>(generateMockSessions);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('7d');

  const filtered = useMemo(() => {
    const now = Date.now();
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 365;
    return sessions.filter(s => (now - new Date(s.date).getTime()) / 86400000 <= days);
  }, [sessions, timeRange]);

  const stats = useMemo(() => {
    const focusSessions = filtered.filter(s => s.type === 'focus');
    const completed = focusSessions.filter(s => s.completed);
    const totalMinutes = completed.reduce((a, s) => a + s.duration, 0);
    const subjectMap: Record<string, number> = {};
    completed.forEach(s => {
      if (s.subject) subjectMap[s.subject] = (subjectMap[s.subject] || 0) + s.duration;
    });
    const topSubjects = Object.entries(subjectMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const dailyMap: Record<string, number> = {};
    completed.forEach(s => {
      const day = new Date(s.date).toLocaleDateString();
      dailyMap[day] = (dailyMap[day] || 0) + s.duration;
    });
    const dailyAvg = Object.keys(dailyMap).length > 0
      ? Math.round(Object.values(dailyMap).reduce((a, b) => a + b, 0) / Object.keys(dailyMap).length)
      : 0;
    return {
      totalSessions: focusSessions.length,
      completedSessions: completed.length,
      completionRate: focusSessions.length > 0 ? Math.round((completed.length / focusSessions.length) * 100) : 0,
      totalMinutes,
      totalHours: (totalMinutes / 60).toFixed(1),
      topSubjects,
      dailyAvg,
      dailyData: Object.entries(dailyMap).slice(0, 7).reverse(),
    };
  }, [filtered]);

  const metricCards = [
    { label: "TOTAL_SESSIONS", value: stats.totalSessions, icon: Timer, color: "text-primary" },
    { label: "COMPLETED", value: stats.completedSessions, icon: Target, color: "text-success" },
    { label: "FOCUS_HOURS", value: stats.totalHours, icon: Clock, color: "text-accent" },
    { label: "DAILY_AVG_MIN", value: `${stats.dailyAvg}m`, icon: Activity, color: "text-warning" },
  ];

  return (
    <div className="min-h-full p-4 md:p-6 space-y-6 cyber-grid">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="w-8 h-8 text-primary" />
          <h1 className="text-2xl md:text-3xl font-display font-bold gradient-text tracking-wider">
            POMODORO_ANALYTICS
          </h1>
        </div>
        <p className="font-mono text-xs text-muted-foreground tracking-widest">
          {">"} SESSION_METRICS // PRODUCTIVITY_INTEL
        </p>
      </motion.div>

      {/* Time Range Selector */}
      <div className="flex gap-2">
        {(['7d', '30d', 'all'] as const).map(r => (
          <Button key={r} size="sm" variant={timeRange === r ? 'default' : 'outline'}
            className="font-mono text-xs tracking-wide" onClick={() => setTimeRange(r)}>
            {r === 'all' ? 'ALL_TIME' : r.toUpperCase()}
          </Button>
        ))}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metricCards.map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}>
            <Card className="tech-card hud-corners">
              <CardContent className="p-4 text-center">
                <m.icon className={cn("w-6 h-6 mx-auto mb-2", m.color)} />
                <p className={cn("text-2xl font-display font-bold tabular-nums", m.color)}>{m.value}</p>
                <p className="text-[10px] font-mono text-muted-foreground tracking-widest mt-1">{m.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Completion Rate */}
      <Card className="tech-card">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-xs text-muted-foreground tracking-wider">COMPLETION_RATE</span>
            <Badge variant="secondary" className="font-mono text-xs">{stats.completionRate}%</Badge>
          </div>
          <Progress value={stats.completionRate} className="h-2" />
        </CardContent>
      </Card>

      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList className="font-mono text-xs">
          <TabsTrigger value="daily">DAILY_CHART</TabsTrigger>
          <TabsTrigger value="subjects">SUBJECTS</TabsTrigger>
          <TabsTrigger value="history">HISTORY</TabsTrigger>
        </TabsList>

        <TabsContent value="daily">
          <Card className="tech-card">
            <CardHeader className="pb-2">
              <CardTitle className="font-mono text-sm tracking-wider flex items-center gap-2">
                <Flame className="w-4 h-4 text-primary" /> DAILY_FOCUS_MINUTES
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex items-end gap-2 h-40">
                {stats.dailyData.map(([day, mins], i) => {
                  const max = Math.max(...stats.dailyData.map(d => d[1] as number), 1);
                  const h = ((mins as number) / max) * 100;
                  return (
                    <motion.div key={day} className="flex-1 flex flex-col items-center gap-1"
                      initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: i * 0.05 }}>
                      <span className="text-[10px] font-mono text-primary tabular-nums">{mins as number}m</span>
                      <div className="w-full bg-primary/20 rounded-t relative" style={{ height: `${h}%`, minHeight: 4 }}>
                        <div className="absolute inset-0 bg-gradient-to-t from-primary to-primary/60 rounded-t" />
                      </div>
                      <span className="text-[9px] font-mono text-muted-foreground truncate max-w-full">
                        {new Date(day as string).toLocaleDateString(undefined, { weekday: 'short' })}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects">
          <Card className="tech-card">
            <CardHeader className="pb-2">
              <CardTitle className="font-mono text-sm tracking-wider flex items-center gap-2">
                <Brain className="w-4 h-4 text-accent" /> SUBJECT_BREAKDOWN
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {stats.topSubjects.map(([subject, mins], i) => {
                const max = stats.topSubjects[0]?.[1] || 1;
                return (
                  <div key={subject}>
                    <div className="flex justify-between mb-1">
                      <span className="font-mono text-xs">{subject}</span>
                      <span className="font-mono text-xs text-muted-foreground">{mins}m</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                        initial={{ width: 0 }} animate={{ width: `${(mins / (max as number)) * 100}%` }}
                        transition={{ delay: i * 0.1, duration: 0.5 }} />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="tech-card">
            <CardHeader className="pb-2">
              <CardTitle className="font-mono text-sm tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" /> SESSION_LOG
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-64">
                <div className="p-4 space-y-2">
                  {filtered.filter(s => s.type === 'focus').slice(0, 20).map(s => (
                    <div key={s.id} className="flex items-center justify-between p-2 rounded border border-border/50 bg-muted/30">
                      <div className="flex items-center gap-2">
                        <Timer className="w-3.5 h-3.5 text-primary" />
                        <span className="font-mono text-xs">{s.subject || 'General'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-muted-foreground">{s.duration}m</span>
                        <Badge variant={s.completed ? "default" : "outline"} className="text-[10px] font-mono">
                          {s.completed ? 'DONE' : 'SKIP'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PomodoroStatsDashboard;
