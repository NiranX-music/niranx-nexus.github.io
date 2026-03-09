import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Clock, Target, Flame, TrendingUp, BookOpen, CheckCircle, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useXP } from '@/contexts/XPContext';

export default function WeeklyReport() {
  const { user } = useAuth();
  const { xp, level } = useXP();

  // Mock weekly data - in production would come from analytics_snapshots
  const weekData = {
    totalHours: 14.5,
    sessionsCompleted: 23,
    tasksCompleted: 18,
    streak: 7,
    topSubjects: ['Mathematics', 'Physics', 'Computer Science'],
    dailyBreakdown: [
      { day: 'Mon', hours: 2.5 },
      { day: 'Tue', hours: 1.8 },
      { day: 'Wed', hours: 3.2 },
      { day: 'Thu', hours: 1.5 },
      { day: 'Fri', hours: 2.0 },
      { day: 'Sat', hours: 2.5 },
      { day: 'Sun', hours: 1.0 },
    ],
    improvement: '+12%',
    xpEarned: 450,
    goalsHit: 4,
    goalsMissed: 1,
  };

  const maxHours = Math.max(...weekData.dailyBreakdown.map(d => d.hours));

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-4xl">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <BarChart3 className="w-10 h-10 text-primary" />
          <h1 className="text-3xl font-bold font-[Orbitron]">Weekly Report</h1>
        </div>
        <p className="text-muted-foreground">Your study performance summary for this week</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Study Hours', value: `${weekData.totalHours}h`, icon: Clock, color: 'text-primary' },
          { label: 'Sessions', value: weekData.sessionsCompleted, icon: Target, color: 'text-green-500' },
          { label: 'Tasks Done', value: weekData.tasksCompleted, icon: CheckCircle, color: 'text-blue-500' },
          { label: 'Day Streak', value: weekData.streak, icon: Flame, color: 'text-orange-500' },
        ].map((s, i) => (
          <Card key={i} className="border-primary/20 bg-card/60 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <s.icon className={`w-6 h-6 mx-auto mb-2 ${s.color}`} />
              <p className="text-2xl font-bold font-[Orbitron]">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-primary/20 bg-card/60 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Daily Breakdown</CardTitle>
            <Badge variant="outline" className="text-green-500 border-green-500/30">
              <TrendingUp className="w-3 h-3 mr-1" />{weekData.improvement} vs last week
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3 h-40">
            {weekData.dailyBreakdown.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-muted-foreground">{d.hours}h</span>
                <div
                  className="w-full bg-primary/60 rounded-t-md transition-all hover:bg-primary"
                  style={{ height: `${(d.hours / maxHours) * 100}%`, minHeight: '4px' }}
                />
                <span className="text-xs font-medium">{d.day}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-primary/20 bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />Top Subjects
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {weekData.topSubjects.map((s, i) => (
              <div key={s} className="flex items-center gap-3">
                <span className="text-lg font-bold text-primary font-[Orbitron]">#{i + 1}</span>
                <span className="font-medium">{s}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />Goals This Week
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Goals Completed</span>
              <Badge className="bg-green-500/20 text-green-500">{weekData.goalsHit}/{weekData.goalsHit + weekData.goalsMissed}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">XP Earned</span>
              <Badge variant="outline">{weekData.xpEarned} XP</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Current Level</span>
              <Badge className="bg-primary/20 text-primary">Level {level}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
