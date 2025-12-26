import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIProviderSelector, useAIProvider } from '@/components/ai/AIProviderSelector';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  Flame,
  Brain,
  BookOpen,
  Trophy,
  Calendar,
  Sparkles,
  Loader2,
  BarChart3,
  Activity,
  Zap,
} from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

interface AnalyticsData {
  totalStudyHours: number;
  weeklyStudyHours: number;
  currentStreak: number;
  longestStreak: number;
  flashcardsReviewed: number;
  flashcardsCorrect: number;
  tasksCompleted: number;
  totalXP: number;
  level: number;
  focusScore: number;
  weeklyData: { day: string; hours: number }[];
  subjectBreakdown: { name: string; value: number }[];
  dailyProgress: { date: string; minutes: number; flashcards: number }[];
  recentAchievements: { name: string; icon: string; earned_at: string }[];
}

export default function StudyAnalytics() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { provider, model, setProvider, setModel } = useAIProvider('analytics');

  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [aiInsights, setAiInsights] = useState<string>('');
  const [generatingInsights, setGeneratingInsights] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('xp, level')
        .eq('id', user.id)
        .single();

      // Fetch streak data from profiles or local storage
      const storedStreak = localStorage.getItem('studyverse-streak');
      const streakData = storedStreak ? JSON.parse(storedStreak) : { currentStreak: 0, longestStreak: 0 };

      // Fetch flashcard reviews (last 30 days)
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
      const { data: flashcardReviews } = await supabase
        .from('flashcard_reviews')
        .select('*')
        .eq('user_id', user.id)
        .gte('reviewed_at', thirtyDaysAgo);

      // Fetch focus sessions (last 30 days)
      const { data: focusSessions } = await supabase
        .from('focus_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', thirtyDaysAgo);

      // Fetch completed tasks
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed', true);

      // Fetch achievements
      const { data: userAchievements } = await supabase
        .from('user_achievements')
        .select('*, achievements(*)')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false })
        .limit(5);

      // Calculate weekly data
      const weekStart = startOfWeek(new Date());
      const weekEnd = endOfWeek(new Date());
      const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
      
      const weeklyData = weekDays.map((day) => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const dayMinutes = (focusSessions || [])
          .filter((s: any) => s.created_at?.startsWith(dayStr))
          .reduce((sum: number, s: any) => sum + (s.duration_minutes || 0), 0);
        
        return {
          day: format(day, 'EEE'),
          hours: Math.round(dayMinutes / 60 * 10) / 10,
        };
      });

      // Calculate daily progress for chart
      const dailyProgress = [];
      for (let i = 6; i >= 0; i--) {
        const day = subDays(new Date(), i);
        const dayStr = format(day, 'yyyy-MM-dd');
        
        const dayMinutes = (focusSessions || [])
          .filter((s: any) => s.created_at?.startsWith(dayStr))
          .reduce((sum: number, s: any) => sum + (s.duration_minutes || 0), 0);
        
        const dayFlashcards = (flashcardReviews || [])
          .filter((r: any) => r.reviewed_at?.startsWith(dayStr))
          .length;
        
        dailyProgress.push({
          date: format(day, 'MMM dd'),
          minutes: dayMinutes,
          flashcards: dayFlashcards,
        });
      }

      // Subject breakdown (mock data - could be enhanced with actual subject tracking)
      const subjectBreakdown = [
        { name: 'Mathematics', value: 35 },
        { name: 'Science', value: 25 },
        { name: 'Languages', value: 20 },
        { name: 'History', value: 12 },
        { name: 'Other', value: 8 },
      ];

      // Calculate totals
      const totalMinutes = (focusSessions || []).reduce(
        (sum: number, s: any) => sum + (s.duration_minutes || 0),
        0
      );
      const weeklyMinutes = focusSessions
        ?.filter((s: any) => new Date(s.created_at) >= weekStart)
        .reduce((sum: number, s: any) => sum + (s.duration_minutes || 0), 0) || 0;

      const correctReviews = (flashcardReviews || []).filter((r: any) => r.rating >= 3).length;

      setAnalytics({
        totalStudyHours: Math.round(totalMinutes / 60),
        weeklyStudyHours: Math.round(weeklyMinutes / 60 * 10) / 10,
        currentStreak: streakData.currentStreak || 0,
        longestStreak: streakData.longestStreak || 0,
        flashcardsReviewed: (flashcardReviews || []).length,
        flashcardsCorrect: correctReviews,
        tasksCompleted: (tasks || []).length,
        totalXP: profile?.xp || 0,
        level: profile?.level || 1,
        focusScore: Math.min(100, Math.round((weeklyMinutes / 600) * 100)), // Target: 10hrs/week
        weeklyData,
        subjectBreakdown,
        dailyProgress,
        recentAchievements: (userAchievements || []).map((ua: any) => ({
          name: ua.achievements?.name || 'Achievement',
          icon: ua.achievements?.icon || '🏆',
          earned_at: ua.earned_at,
        })),
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAIInsights = async () => {
    if (!analytics) return;

    setGeneratingInsights(true);
    try {
      const prompt = `Analyze this student's study data and provide 3-4 personalized insights and recommendations:
      
Study Stats:
- Total study hours: ${analytics.totalStudyHours}
- Weekly study hours: ${analytics.weeklyStudyHours}
- Current streak: ${analytics.currentStreak} days
- Flashcards reviewed: ${analytics.flashcardsReviewed}
- Accuracy: ${analytics.flashcardsReviewed > 0 ? Math.round((analytics.flashcardsCorrect / analytics.flashcardsReviewed) * 100) : 0}%
- Tasks completed: ${analytics.tasksCompleted}
- Focus score: ${analytics.focusScore}/100

Provide brief, actionable insights focusing on:
1. Strengths
2. Areas for improvement
3. Specific recommendations
Keep each insight to 1-2 sentences.`;

      const response = await supabase.functions.invoke('ai-chat', {
        body: {
          messages: [{ role: 'user', content: prompt }],
          provider,
          model,
        },
      });

      if (response.error) throw new Error(response.error.message);
      
      setAiInsights(response.data.content || response.data.message || 'Unable to generate insights.');
    } catch (error: any) {
      console.error('Error generating insights:', error);
      setAiInsights('Failed to generate AI insights. Please try again.');
    } finally {
      setGeneratingInsights(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Sign in to view Analytics</h2>
            <Button onClick={() => navigate('/auth')}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="h-8 w-8" />
          Study Analytics
        </h1>
        <p className="text-muted-foreground">
          Track your learning progress and get AI-powered insights
        </p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Study Time</span>
            </div>
            <div className="text-2xl font-bold">{analytics.totalStudyHours}h</div>
            <p className="text-xs text-muted-foreground">
              {analytics.weeklyStudyHours}h this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-sm">Streak</span>
            </div>
            <div className="text-2xl font-bold">{analytics.currentStreak} days</div>
            <p className="text-xs text-muted-foreground">
              Best: {analytics.longestStreak} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Brain className="h-4 w-4 text-purple-500" />
              <span className="text-sm">Flashcards</span>
            </div>
            <div className="text-2xl font-bold">{analytics.flashcardsReviewed}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.flashcardsReviewed > 0
                ? Math.round((analytics.flashcardsCorrect / analytics.flashcardsReviewed) * 100)
                : 0}
              % accuracy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">Level</span>
            </div>
            <div className="text-2xl font-bold">{analytics.level}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.totalXP.toLocaleString()} XP
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Weekly Study Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Weekly Study Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.weeklyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                  }}
                />
                <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Daily Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">7-Day Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={analytics.dailyProgress}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="minutes"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary) / 0.2)"
                  name="Study Minutes"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Subject Breakdown & Focus Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Subject Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={analytics.subjectBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {analytics.subjectBreakdown.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {analytics.subjectBreakdown.map((subject, index) => (
                <Badge
                  key={subject.name}
                  variant="outline"
                  style={{ borderColor: COLORS[index % COLORS.length] }}
                >
                  {subject.name}: {subject.value}%
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Focus Score</CardTitle>
            <CardDescription>Weekly study goal progress</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="relative w-32 h-32 mb-4">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  className="stroke-muted"
                  strokeWidth="8"
                  fill="none"
                  cx="50"
                  cy="50"
                  r="40"
                />
                <circle
                  className="stroke-primary"
                  strokeWidth="8"
                  fill="none"
                  cx="50"
                  cy="50"
                  r="40"
                  strokeLinecap="round"
                  strokeDasharray={`${analytics.focusScore * 2.51} 251`}
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold">{analytics.focusScore}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Target: 10 hours/week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.recentAchievements.length > 0 ? (
              <div className="space-y-3">
                {analytics.recentAchievements.map((achievement, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-2xl">{achievement.icon}</span>
                    <div>
                      <p className="font-medium text-sm">{achievement.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(achievement.earned_at), 'MMM dd')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No achievements yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                AI Study Insights
              </CardTitle>
              <CardDescription>
                Get personalized recommendations based on your study patterns
              </CardDescription>
            </div>
            <AIProviderSelector
              selectedProvider={provider}
              selectedModel={model}
              onProviderChange={setProvider}
              onModelChange={setModel}
              compact
            />
          </div>
        </CardHeader>
        <CardContent>
          {aiInsights ? (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <p className="whitespace-pre-wrap">{aiInsights}</p>
            </div>
          ) : (
            <div className="text-center py-6">
              <Brain className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                Generate AI-powered insights based on your study data
              </p>
              <Button onClick={generateAIInsights} disabled={generatingInsights}>
                {generatingInsights ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Insights
                  </>
                )}
              </Button>
            </div>
          )}

          {aiInsights && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={generateAIInsights}
              disabled={generatingInsights}
            >
              {generatingInsights ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <Activity className="h-4 w-4 mr-2" />
                  Refresh Insights
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
