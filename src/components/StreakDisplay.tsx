import { useStreakTracking } from '@/hooks/useStreakTracking';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, TrendingUp, Calendar, Award } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

export const StreakDisplay = () => {
  const { streakData, loading } = useStreakTracking();

  if (loading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  const streakPercentage = Math.min((streakData.currentStreak / 30) * 100, 100);

  return (
    <Card className="glass-card border-primary/20 overflow-hidden relative">
      {/* Animated background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 animate-pulse-glow" />
      
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
              Study Streak
            </CardTitle>
            <CardDescription>
              {streakData.todayStudied ? "You're on fire today! 🔥" : "Study today to keep your streak!"}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              {streakData.currentStreak}
            </div>
            <div className="text-sm text-muted-foreground">days</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 relative">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress to 30 days</span>
            <span className="font-medium">{Math.min(streakData.currentStreak, 30)}/30</span>
          </div>
          <Progress value={streakPercentage} className="h-2" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 pt-4">
          <div className="text-center p-3 rounded-lg bg-background/50 backdrop-blur-sm">
            <TrendingUp className="w-5 h-5 mx-auto mb-2 text-green-500" />
            <div className="text-xl font-bold">{streakData.longestStreak}</div>
            <div className="text-xs text-muted-foreground">Best Streak</div>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-background/50 backdrop-blur-sm">
            <Calendar className="w-5 h-5 mx-auto mb-2 text-blue-500" />
            <div className="text-xl font-bold">{streakData.totalDays}</div>
            <div className="text-xs text-muted-foreground">Total Days</div>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-background/50 backdrop-blur-sm">
            <Award className="w-5 h-5 mx-auto mb-2 text-yellow-500" />
            <div className="text-xl font-bold">
              {streakData.currentStreak >= 30 ? '🏆' : streakData.currentStreak >= 7 ? '🥇' : '🎯'}
            </div>
            <div className="text-xs text-muted-foreground">Status</div>
          </div>
        </div>

        {/* Next milestone */}
        {streakData.currentStreak < 365 && (
          <div className="pt-4 border-t border-border/50">
            <div className="text-sm text-center text-muted-foreground">
              Next milestone:{' '}
              <span className="font-semibold text-foreground">
                {streakData.currentStreak < 7
                  ? '7 days (500 XP)'
                  : streakData.currentStreak < 14
                  ? '14 days (1000 XP)'
                  : streakData.currentStreak < 30
                  ? '30 days (2500 XP)'
                  : streakData.currentStreak < 60
                  ? '60 days (5000 XP)'
                  : streakData.currentStreak < 100
                  ? '100 days (10000 XP)'
                  : '365 days (25000 XP)'}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
