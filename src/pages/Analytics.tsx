import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Target, 
  Flame,
  Trophy,
  Brain,
  Zap,
  Calendar,
  BookOpen
} from 'lucide-react';

const Analytics = () => {
  const [stats, setStats] = useState({
    totalStudyHours: 142,
    weeklyGoal: 40,
    currentStreak: 12,
    tasksCompleted: 89,
    xpEarned: 2450,
    level: 8,
    focusScore: 85,
    subjectProgress: [
      { name: 'Mathematics', hours: 35, progress: 87, color: 'bg-blue-500' },
      { name: 'Physics', hours: 28, progress: 75, color: 'bg-green-500' },
      { name: 'Chemistry', hours: 22, progress: 68, color: 'bg-purple-500' },
      { name: 'English', hours: 18, progress: 60, color: 'bg-yellow-500' },
    ],
    weeklyHours: [8, 12, 10, 15, 9, 14, 16],
    pomodoroSessions: [5, 8, 6, 10, 7, 9, 11],
  });

  const [achievements, setAchievements] = useState([
    { id: 1, title: 'Study Streak Master', description: '7 days continuous study', earned: true, icon: Flame },
    { id: 2, title: 'Pomodoro Pro', description: '100 focus sessions completed', earned: true, icon: Clock },
    { id: 3, title: 'Task Terminator', description: '50 tasks completed', earned: true, icon: Target },
    { id: 4, title: 'Knowledge Hunter', description: 'Upload 25 study materials', earned: false, icon: BookOpen },
    { id: 5, title: 'Level Up Legend', description: 'Reach level 10', earned: false, icon: Trophy },
  ]);

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const maxHours = Math.max(...stats.weeklyHours);

  return (
    <div className="min-h-screen p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <BarChart3 className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <Brain className="w-6 h-6 text-accent animate-pulse" />
        </div>
        <p className="text-muted-foreground">
          Track your learning journey and unlock insights 📊
        </p>
      </div>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Study Hours</span>
            </div>
            <div className="text-2xl font-bold text-primary">{stats.totalStudyHours}h</div>
            <div className="text-xs text-muted-foreground">This month</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="text-sm text-muted-foreground">Streak</span>
            </div>
            <div className="text-2xl font-bold text-orange-500">{stats.currentStreak}</div>
            <div className="text-xs text-muted-foreground">Days</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span className="text-sm text-muted-foreground">XP Earned</span>
            </div>
            <div className="text-2xl font-bold text-yellow-500">{stats.xpEarned}</div>
            <div className="text-xs text-muted-foreground">Level {stats.level}</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Target className="w-5 h-5 text-green-500" />
              <span className="text-sm text-muted-foreground">Tasks Done</span>
            </div>
            <div className="text-2xl font-bold text-green-500">{stats.tasksCompleted}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Progress */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Weekly Study Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span>Weekly Goal: {stats.weeklyGoal}h</span>
                <Badge variant="secondary">
                  {Math.round((stats.weeklyHours.reduce((a, b) => a + b, 0) / stats.weeklyGoal) * 100)}%
                </Badge>
              </div>
              
              <div className="flex items-end justify-between gap-2 h-32">
                {stats.weeklyHours.map((hours, index) => (
                  <div key={index} className="flex flex-col items-center gap-2 flex-1">
                    <div 
                      className="w-full bg-primary rounded-t-md transition-all duration-500 ease-out min-h-[4px]"
                      style={{ 
                        height: `${(hours / maxHours) * 100}%`
                      }}
                    />
                    <div className="text-xs text-muted-foreground">{weekDays[index]}</div>
                    <div className="text-xs font-medium">{hours}h</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Pomodoro Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span>Focus Sessions This Week</span>
                <Badge variant="secondary">
                  {stats.pomodoroSessions.reduce((a, b) => a + b, 0)} sessions
                </Badge>
              </div>
              
              <div className="flex items-end justify-between gap-2 h-32">
                {stats.pomodoroSessions.map((sessions, index) => (
                  <div key={index} className="flex flex-col items-center gap-2 flex-1">
                    <div 
                      className="w-full bg-green-500 rounded-t-md transition-all duration-500 ease-out min-h-[4px]"
                      style={{ 
                        height: `${(sessions / Math.max(...stats.pomodoroSessions)) * 100}%`
                      }}
                    />
                    <div className="text-xs text-muted-foreground">{weekDays[index]}</div>
                    <div className="text-xs font-medium">{sessions}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subject Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Subject Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.subjectProgress.map((subject, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${subject.color}`} />
                    <span className="font-medium">{subject.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{subject.hours}h studied</span>
                    <Badge variant="outline">{subject.progress}%</Badge>
                  </div>
                </div>
                <Progress value={subject.progress} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {achievements.map((achievement) => {
              const Icon = achievement.icon;
              return (
                <div 
                  key={achievement.id}
                  className={`p-4 rounded-lg border transition-all ${
                    achievement.earned 
                      ? 'bg-primary/10 border-primary/20' 
                      : 'bg-muted/30 border-border opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      achievement.earned 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium">{achievement.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {achievement.description}
                      </div>
                    </div>
                    {achievement.earned && (
                      <Badge className="ml-auto">Earned!</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Focus Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Focus Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">{stats.focusScore}%</div>
            <div className="text-sm text-muted-foreground">Average Focus Score</div>
          </div>
          
          <Progress value={stats.focusScore} className="h-3" />
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-green-500">98%</div>
              <div className="text-xs text-muted-foreground">Morning Focus</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-yellow-500">85%</div>
              <div className="text-xs text-muted-foreground">Afternoon Focus</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-blue-500">72%</div>
              <div className="text-xs text-muted-foreground">Evening Focus</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;