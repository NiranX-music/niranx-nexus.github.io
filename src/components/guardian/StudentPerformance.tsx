import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, Target, BookOpen, TrendingUp, Flame } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface StudentPerformanceProps {
  studentId: string;
}

export function StudentPerformance({ studentId }: StudentPerformanceProps) {
  const [stats, setStats] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, [studentId]);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', studentId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch this week's stats
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_student_weekly_stats', {
          p_student_id: studentId,
          p_week_start: weekStart.toISOString().split('T')[0]
        });

      if (statsError) throw statsError;
      setStats(statsData);

    } catch (error: any) {
      console.error('Error fetching student data:', error);
      toast({
        title: "Error",
        description: "Failed to load student performance",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const level = profile?.level || 1;
  const xp = profile?.xp || 0;
  const nextLevelXP = level * 1000;
  const xpProgress = (xp % nextLevelXP) / nextLevelXP * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Performance</CardTitle>
        <CardDescription>This week's activity summary</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Level & XP */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="font-medium">Level {level}</span>
            </div>
            <span className="text-sm text-muted-foreground">{xp} XP</span>
          </div>
          <Progress value={xpProgress} className="h-2" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Study Time</span>
            </div>
            <p className="text-2xl font-bold">{stats?.total_study_time || 0}m</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Flame className="h-4 w-4" />
              <span className="text-sm">Focus Sessions</span>
            </div>
            <p className="text-2xl font-bold">{stats?.focus_sessions || 0}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Target className="h-4 w-4" />
              <span className="text-sm">Tasks Done</span>
            </div>
            <p className="text-2xl font-bold">{stats?.tasks_completed || 0}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              <span className="text-sm">Exams Prep</span>
            </div>
            <p className="text-2xl font-bold">{stats?.exams_prepared || 0}</p>
          </div>
        </div>

        {/* Activity Level Badge */}
        <div className="flex items-center justify-center pt-4">
          {(stats?.total_study_time || 0) >= 300 && (
            <Badge variant="default" className="bg-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              Highly Active
            </Badge>
          )}
          {(stats?.total_study_time || 0) >= 120 && (stats?.total_study_time || 0) < 300 && (
            <Badge variant="default" className="bg-blue-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              Active
            </Badge>
          )}
          {(stats?.total_study_time || 0) < 120 && (
            <Badge variant="secondary">
              Needs Encouragement
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
