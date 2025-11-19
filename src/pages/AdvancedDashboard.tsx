import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useXP } from '@/contexts/XPContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, TrendingUp, Calendar, Clock, Target, 
  Flame, Award, BookOpen, Brain, Zap 
} from 'lucide-react';

export default function AdvancedDashboard() {
  const { user } = useAuth();
  const { xp, level, getXPProgress } = useXP();
  const [stats, setStats] = useState({
    totalStudyHours: 0,
    weeklyHours: [] as number[],
    focusSessions: 0,
    tasksCompleted: 0,
    currentStreak: 0,
    longestStreak: 0,
    avgFocusTime: 0,
    productivity: 0,
  });

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch study streaks
      const { data: streaks } = await supabase
        .from('study_streaks')
        .select('*')
        .eq('user_id', user?.id)
        .order('study_date', { ascending: false });

      // Fetch focus sessions
      const { data: sessions } = await supabase
        .from('focus_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('completed', true);

      // Fetch tasks
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user?.id)
        .eq('completed', true);

      // Calculate stats
      const totalMinutes = sessions?.reduce((acc, s) => acc + s.duration_minutes, 0) || 0;
      const totalHours = Math.round(totalMinutes / 60 * 10) / 10;
      
      // Calculate streak
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      
      if (streaks && streaks.length > 0) {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        
        for (let i = 0; i < streaks.length; i++) {
          const streakDate = streaks[i].study_date;
          
          if (i === 0 && (streakDate === today || streakDate === yesterday)) {
            currentStreak = 1;
            tempStreak = 1;
          } else if (i > 0) {
            const prevDate = new Date(streaks[i - 1].study_date);
            const currDate = new Date(streakDate);
            const dayDiff = Math.floor((prevDate.getTime() - currDate.getTime()) / 86400000);
            
            if (dayDiff === 1) {
              tempStreak++;
              if (i === 0 || streaks[0].study_date === today || streaks[0].study_date === yesterday) {
                currentStreak = tempStreak;
              }
            } else {
              tempStreak = 1;
            }
          }
          
          longestStreak = Math.max(longestStreak, tempStreak);
        }
      }

      // Calculate weekly hours
      const weeklyHours = Array(7).fill(0);
      const today = new Date();
      
      sessions?.forEach(session => {
        const sessionDate = new Date(session.started_at || '');
        const dayDiff = Math.floor((today.getTime() - sessionDate.getTime()) / 86400000);
        
        if (dayDiff < 7) {
          weeklyHours[6 - dayDiff] += session.duration_minutes / 60;
        }
      });

      const avgFocusTime = sessions && sessions.length > 0 
        ? Math.round(sessions.reduce((acc, s) => acc + s.duration_minutes, 0) / sessions.length) 
        : 0;

      const productivity = Math.min(100, Math.round((currentStreak * 10) + (totalHours * 2)));

      setStats({
        totalStudyHours: totalHours,
        weeklyHours,
        focusSessions: sessions?.length || 0,
        tasksCompleted: tasks?.length || 0,
        currentStreak,
        longestStreak,
        avgFocusTime,
        productivity,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold gradient-text">Advanced Dashboard</h1>
          <p className="text-muted-foreground">Your complete study analytics and insights</p>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Total Study Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold gradient-text">{stats.totalStudyHours}h</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-500">{stats.currentStreak}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Best: {stats.longestStreak} days
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4 text-green-500" />
              Tasks Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{stats.tasksCompleted}</div>
            <p className="text-xs text-muted-foreground mt-1">Total tasks</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-500" />
              Productivity Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-500">{stats.productivity}%</div>
            <Progress value={stats.productivity} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="glass-card">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="focus">Focus Sessions</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Weekly Activity */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Weekly Activity</CardTitle>
              <CardDescription>Your study hours for the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weekDays.map((day, index) => (
                  <div key={day} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{day}</span>
                      <span className="text-muted-foreground">
                        {stats.weeklyHours[index]?.toFixed(1) || 0}h
                      </span>
                    </div>
                    <Progress 
                      value={(stats.weeklyHours[index] || 0) * 20} 
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* XP Progress */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Level Progress
              </CardTitle>
              <CardDescription>Level {level} • {xp.toLocaleString()} XP</CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={getXPProgress()} className="h-3" />
              <p className="text-sm text-muted-foreground mt-2">
                {Math.round(getXPProgress())}% to Level {level + 1}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="focus" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Focus Session Stats</CardTitle>
              <CardDescription>Your concentration metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total Sessions</p>
                  <p className="text-2xl font-bold">{stats.focusSessions}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Avg Duration</p>
                  <p className="text-2xl font-bold">{stats.avgFocusTime}min</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Focus Quality</span>
                  <span className="font-medium">
                    {stats.focusSessions > 10 ? 'Excellent' : stats.focusSessions > 5 ? 'Good' : 'Getting Started'}
                  </span>
                </div>
                <Progress value={Math.min(100, stats.focusSessions * 10)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Overall Progress
              </CardTitle>
              <CardDescription>Your learning journey</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Study Time Goal</span>
                  <Badge variant="secondary">{stats.totalStudyHours}/100h</Badge>
                </div>
                <Progress value={Math.min(100, stats.totalStudyHours)} />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Task Completion</span>
                  <Badge variant="secondary">{stats.tasksCompleted}/50</Badge>
                </div>
                <Progress value={Math.min(100, (stats.tasksCompleted / 50) * 100)} />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Consistency</span>
                  <Badge variant="secondary">{stats.currentStreak}/30 days</Badge>
                </div>
                <Progress value={Math.min(100, (stats.currentStreak / 30) * 100)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
