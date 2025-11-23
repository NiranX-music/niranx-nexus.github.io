import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AIContextualSuggestions } from '@/components/AIContextualSuggestions';
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
  BookOpen,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface AnalyticsData {
  totalStudyHours: number;
  weeklyGoal: number;
  currentStreak: number;
  tasksCompleted: number;
  xpEarned: number;
  level: number;
  focusScore: number;
  subjectProgress: SubjectProgress[];
  weeklyHours: number[];
  pomodoroSessions: number[];
  totalFocusSessions: number;
  completedTasks: number;
  totalExams: number;
  upcomingExams: number;
}

interface SubjectProgress {
  name: string;
  hours: number;
  progress: number;
  color: string;
}

const Analytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AnalyticsData>({
    totalStudyHours: 0,
    weeklyGoal: 40,
    currentStreak: 0,
    tasksCompleted: 0,
    xpEarned: 0,
    level: 1,
    focusScore: 0,
    subjectProgress: [],
    weeklyHours: [0, 0, 0, 0, 0, 0, 0],
    pomodoroSessions: [0, 0, 0, 0, 0, 0, 0],
    totalFocusSessions: 0,
    completedTasks: 0,
    totalExams: 0,
    upcomingExams: 0,
  });

  const [achievements, setAchievements] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  // Real-time subscriptions for analytics updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('analytics-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          fetchAnalytics();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'study_streaks'
        },
        () => {
          fetchAnalytics();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'focus_sessions'
        },
        () => {
          fetchAnalytics();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks'
        },
        () => {
          fetchAnalytics();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'exams'
        },
        () => {
          fetchAnalytics();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_achievements'
        },
        () => {
          fetchAnalytics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('xp, level')
        .eq('user_id', user?.id)
        .maybeSingle();

      // Fetch study streaks
      const { data: streaks } = await supabase
        .from('study_streaks')
        .select('study_date, minutes_studied')
        .eq('user_id', user?.id)
        .order('study_date', { ascending: false });

      // Calculate current streak
      let currentStreak = 0;
      if (streaks && streaks.length > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        for (const streak of streaks) {
          const streakDate = new Date(streak.study_date);
          streakDate.setHours(0, 0, 0, 0);
          const daysDiff = Math.floor((today.getTime() - streakDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysDiff === currentStreak) {
            currentStreak++;
          } else {
            break;
          }
        }
      }

      // Fetch focus sessions
      const { data: focusSessions } = await supabase
        .from('focus_sessions')
        .select('duration_minutes, completed, completed_at, subject')
        .eq('user_id', user?.id)
        .eq('completed', true);

      // Calculate total study hours
      const totalStudyMinutes = focusSessions?.reduce((sum, session) => sum + session.duration_minutes, 0) || 0;
      const totalStudyHours = Math.round(totalStudyMinutes / 60);

      // Calculate weekly data
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });

      const weeklyHours = last7Days.map(date => {
        const daysSessions = focusSessions?.filter(s => 
          s.completed_at?.startsWith(date)
        ) || [];
        return Math.round(daysSessions.reduce((sum, s) => sum + s.duration_minutes, 0) / 60);
      });

      const pomodoroSessions = last7Days.map(date => {
        return focusSessions?.filter(s => 
          s.completed_at?.startsWith(date)
        )?.length || 0;
      });

      // Calculate subject progress
      const subjectMap = new Map<string, number>();
      focusSessions?.forEach(session => {
        if (session.subject) {
          subjectMap.set(session.subject, (subjectMap.get(session.subject) || 0) + session.duration_minutes);
        }
      });

      const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-pink-500', 'bg-orange-500'];
      const subjectProgress = Array.from(subjectMap.entries())
        .map(([name, minutes], index) => ({
          name,
          hours: Math.round(minutes / 60),
          progress: Math.min(100, Math.round((minutes / 60 / (totalStudyHours || 1)) * 100)),
          color: colors[index % colors.length]
        }))
        .sort((a, b) => b.hours - a.hours)
        .slice(0, 6);

      // Fetch tasks
      const { data: tasks } = await supabase
        .from('tasks')
        .select('completed')
        .eq('user_id', user?.id);

      const completedTasks = tasks?.filter(t => t.completed).length || 0;

      // Fetch exams
      const { data: exams } = await supabase
        .from('exams')
        .select('exam_date')
        .eq('user_id', user?.id);

      const today = new Date();
      const upcomingExams = exams?.filter(e => new Date(e.exam_date) >= today).length || 0;

      // Fetch achievements
      const { data: userAchievements } = await supabase
        .from('user_achievements')
        .select('achievement_id, achievements(*)')
        .eq('user_id', user?.id);

      const { data: allAchievements } = await supabase
        .from('achievements')
        .select('*');

      const achievementsList = allAchievements?.map(ach => ({
        ...ach,
        earned: userAchievements?.some((ua: any) => ua.achievement_id === ach.id) || false,
        icon: Trophy
      })) || [];

      // Calculate focus score
      const avgSessionLength = focusSessions && focusSessions.length > 0 
        ? focusSessions.reduce((sum, s) => sum + s.duration_minutes, 0) / focusSessions.length 
        : 0;
      const focusScore = Math.min(100, Math.round((avgSessionLength / 25) * 100));

      setStats({
        totalStudyHours,
        weeklyGoal: 40,
        currentStreak,
        tasksCompleted: completedTasks,
        xpEarned: profile?.xp || 0,
        level: profile?.level || 1,
        focusScore,
        subjectProgress,
        weeklyHours,
        pomodoroSessions,
        totalFocusSessions: focusSessions?.length || 0,
        completedTasks,
        totalExams: exams?.length || 0,
        upcomingExams,
      });

      setAchievements(achievementsList);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const maxHours = Math.max(...stats.weeklyHours, 1);

  if (loading) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Brain className="w-16 h-16 text-primary mx-auto animate-pulse" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

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
            <div className="text-2xl font-bold text-green-500">{stats.completedTasks}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="text-center">
          <CardContent className="p-4">
            <Clock className="w-5 h-5 text-primary mx-auto mb-2" />
            <div className="text-xl font-bold">{stats.totalFocusSessions}</div>
            <div className="text-xs text-muted-foreground">Focus Sessions</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <BookOpen className="w-5 h-5 text-blue-500 mx-auto mb-2" />
            <div className="text-xl font-bold">{stats.totalExams}</div>
            <div className="text-xs text-muted-foreground">Total Exams</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <Calendar className="w-5 h-5 text-purple-500 mx-auto mb-2" />
            <div className="text-xl font-bold">{stats.upcomingExams}</div>
            <div className="text-xs text-muted-foreground">Upcoming Exams</div>
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