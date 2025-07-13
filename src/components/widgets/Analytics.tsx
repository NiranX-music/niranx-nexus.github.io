import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Target, 
  BookOpen,
  Zap,
  Award,
  Calendar
} from "lucide-react";

interface AnalyticsData {
  pomodoroSessions: Array<{
    date: string;
    sessions: number;
    focusTime: number;
  }>;
  taskCompletion: Array<{
    date: string;
    completed: number;
    total: number;
  }>;
  subjectTime: Array<{
    subject: string;
    time: number;
    sessions: number;
  }>;
  weeklyGoals: {
    targetSessions: number;
    completedSessions: number;
    targetHours: number;
    completedHours: number;
  };
}

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    pomodoroSessions: [],
    taskCompletion: [],
    subjectTime: [],
    weeklyGoals: {
      targetSessions: 20,
      completedSessions: 0,
      targetHours: 10,
      completedHours: 0,
    }
  });
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');

  useEffect(() => {
    // Load data from localStorage and compute analytics
    const loadAnalytics = () => {
      try {
        // Load Pomodoro sessions
        const pomodoroSessions = JSON.parse(localStorage.getItem('studyverse-pomodoro-sessions') || '[]');
        const tasks = JSON.parse(localStorage.getItem('studyverse-tasks') || '[]');
        
        // Process data for the selected period
        const now = new Date();
        const periodStart = new Date(now);
        
        if (selectedPeriod === 'week') {
          periodStart.setDate(now.getDate() - 7);
        } else {
          periodStart.setDate(now.getDate() - 30);
        }

        // Pomodoro analytics
        const pomodoroByDay = new Map<string, { sessions: number; focusTime: number }>();
        pomodoroSessions
          .filter((session: any) => new Date(session.completedAt) >= periodStart)
          .forEach((session: any) => {
            const date = new Date(session.completedAt).toLocaleDateString();
            const current = pomodoroByDay.get(date) || { sessions: 0, focusTime: 0 };
            pomodoroByDay.set(date, {
              sessions: current.sessions + (session.type === 'work' ? 1 : 0),
              focusTime: current.focusTime + (session.type === 'work' ? session.duration : 0)
            });
          });

        // Task completion analytics
        const tasksByDay = new Map<string, { completed: number; total: number }>();
        tasks.forEach((task: any) => {
          const createdDate = new Date(task.createdAt).toLocaleDateString();
          if (new Date(task.createdAt) >= periodStart) {
            const current = tasksByDay.get(createdDate) || { completed: 0, total: 0 };
            tasksByDay.set(createdDate, {
              completed: current.completed + (task.completed ? 1 : 0),
              total: current.total + 1
            });
          }
        });

        // Subject time analytics
        const subjectMap = new Map<string, { time: number; sessions: number }>();
        pomodoroSessions
          .filter((session: any) => 
            new Date(session.completedAt) >= periodStart && session.type === 'work'
          )
          .forEach((session: any) => {
            const subject = session.subject || 'General Study';
            const current = subjectMap.get(subject) || { time: 0, sessions: 0 };
            subjectMap.set(subject, {
              time: current.time + session.duration,
              sessions: current.sessions + 1
            });
          });

        // Weekly goals
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        
        const weekSessions = pomodoroSessions
          .filter((session: any) => 
            new Date(session.completedAt) >= weekStart && session.type === 'work'
          );

        const weeklyGoals = {
          targetSessions: 20,
          completedSessions: weekSessions.length,
          targetHours: 10,
          completedHours: weekSessions.reduce((sum: number, s: any) => sum + s.duration, 0) / 60
        };

        setAnalyticsData({
          pomodoroSessions: Array.from(pomodoroByDay.entries()).map(([date, data]) => ({
            date,
            ...data
          })),
          taskCompletion: Array.from(tasksByDay.entries()).map(([date, data]) => ({
            date,
            ...data
          })),
          subjectTime: Array.from(subjectMap.entries()).map(([subject, data]) => ({
            subject,
            ...data
          })),
          weeklyGoals
        });

      } catch (error) {
        console.error('Error loading analytics:', error);
      }
    };

    loadAnalytics();
  }, [selectedPeriod]);

  const getTotalFocusTime = () => {
    return analyticsData.pomodoroSessions.reduce((sum, day) => sum + day.focusTime, 0);
  };

  const getTotalSessions = () => {
    return analyticsData.pomodoroSessions.reduce((sum, day) => sum + day.sessions, 0);
  };

  const getAverageSessionsPerDay = () => {
    const days = analyticsData.pomodoroSessions.length;
    return days > 0 ? (getTotalSessions() / days).toFixed(1) : '0';
  };

  const getTaskCompletionRate = () => {
    const total = analyticsData.taskCompletion.reduce((sum, day) => sum + day.total, 0);
    const completed = analyticsData.taskCompletion.reduce((sum, day) => sum + day.completed, 0);
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <Card className="widget col-span-1 md:col-span-2 xl:col-span-3">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Progress Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Your study insights and achievements
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Badge
              variant={selectedPeriod === 'week' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedPeriod('week')}
            >
              7 Days
            </Badge>
            <Badge
              variant={selectedPeriod === 'month' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedPeriod('month')}
            >
              30 Days
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="focus">Focus</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">Total Sessions</span>
                </div>
                <p className="text-2xl font-bold text-primary">{getTotalSessions()}</p>
              </div>

              <div className="p-4 bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-accent" />
                  <span className="text-sm font-medium">Focus Time</span>
                </div>
                <p className="text-2xl font-bold text-accent">{formatMinutes(getTotalFocusTime())}</p>
              </div>

              <div className="p-4 bg-gradient-to-br from-success/10 to-success/5 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-success" />
                  <span className="text-sm font-medium">Task Rate</span>
                </div>
                <p className="text-2xl font-bold text-success">{getTaskCompletionRate()}%</p>
              </div>

              <div className="p-4 bg-gradient-to-br from-warning/10 to-warning/5 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-warning" />
                  <span className="text-sm font-medium">Avg/Day</span>
                </div>
                <p className="text-2xl font-bold text-warning">{getAverageSessionsPerDay()}</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h4 className="font-medium mb-4">Recent Activity</h4>
              <div className="space-y-3">
                {analyticsData.pomodoroSessions.slice(-5).map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{day.date}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{day.sessions} sessions</span>
                      <span>{formatMinutes(day.focusTime)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="focus" className="space-y-6">
            <div>
              <h4 className="font-medium mb-4">Focus Sessions by Day</h4>
              <div className="space-y-2">
                {analyticsData.pomodoroSessions.map((day, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-sm w-20 text-muted-foreground">{day.date}</span>
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((day.sessions / 8) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-16">{day.sessions} sessions</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Subject Breakdown */}
            {analyticsData.subjectTime.length > 0 && (
              <div>
                <h4 className="font-medium mb-4">Time by Subject</h4>
                <div className="space-y-3">
                  {analyticsData.subjectTime
                    .sort((a, b) => b.time - a.time)
                    .map((subject, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-4 h-4 text-primary" />
                        <span className="font-medium">{subject.subject}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatMinutes(subject.time)} • {subject.sessions} sessions
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <div>
              <h4 className="font-medium mb-4">Task Completion Rate</h4>
              <div className="space-y-2">
                {analyticsData.taskCompletion.map((day, index) => {
                  const rate = day.total > 0 ? (day.completed / day.total) * 100 : 0;
                  return (
                    <div key={index} className="flex items-center gap-3">
                      <span className="text-sm w-20 text-muted-foreground">{day.date}</span>
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div 
                          className="bg-success h-2 rounded-full transition-all duration-500"
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-16">{day.completed}/{day.total}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="text-center p-6 bg-muted/20 rounded-lg">
              <Target className="w-12 h-12 mx-auto mb-4 text-success" />
              <h4 className="font-semibold mb-2">Overall Completion Rate</h4>
              <p className="text-3xl font-bold text-success">{getTaskCompletionRate()}%</p>
              <p className="text-sm text-muted-foreground mt-2">
                Keep up the great work! 🎉
              </p>
            </div>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <div>
              <h4 className="font-medium mb-4">Weekly Goals</h4>
              <div className="space-y-4">
                {/* Sessions Goal */}
                <div className="p-4 bg-muted/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Focus Sessions</span>
                    <span className="text-sm text-muted-foreground">
                      {analyticsData.weeklyGoals.completedSessions}/{analyticsData.weeklyGoals.targetSessions}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div 
                      className="progress-glow h-3 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min((analyticsData.weeklyGoals.completedSessions / analyticsData.weeklyGoals.targetSessions) * 100, 100)}%` 
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round((analyticsData.weeklyGoals.completedSessions / analyticsData.weeklyGoals.targetSessions) * 100)}% complete
                  </p>
                </div>

                {/* Hours Goal */}
                <div className="p-4 bg-muted/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Study Hours</span>
                    <span className="text-sm text-muted-foreground">
                      {analyticsData.weeklyGoals.completedHours.toFixed(1)}h/{analyticsData.weeklyGoals.targetHours}h
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div 
                      className="bg-gradient-accent h-3 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min((analyticsData.weeklyGoals.completedHours / analyticsData.weeklyGoals.targetHours) * 100, 100)}%` 
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round((analyticsData.weeklyGoals.completedHours / analyticsData.weeklyGoals.targetHours) * 100)}% complete
                  </p>
                </div>
              </div>
            </div>

            {/* Achievement Badges */}
            <div>
              <h4 className="font-medium mb-4">Achievements</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <Award className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="font-medium text-sm">Focus Master</p>
                  <p className="text-xs text-muted-foreground">Complete 10 sessions</p>
                </div>
                <div className="text-center p-4 bg-accent/10 rounded-lg">
                  <Zap className="w-8 h-8 mx-auto mb-2 text-accent" />
                  <p className="font-medium text-sm">Productivity Pro</p>
                  <p className="text-xs text-muted-foreground">7-day streak</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
};

export default Analytics;