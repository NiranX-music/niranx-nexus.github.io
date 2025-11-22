import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Zap, Award } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";

interface GamificationStatsProps {
  homework: any[];
  exams: any[];
}

export const GamificationStats = ({ homework, exams }: GamificationStatsProps) => {
  const [stats, setStats] = useState({
    totalXP: 0,
    level: 1,
    completedHomework: 0,
    perfectWeeks: 0,
    examsPrepared: 0
  });

  useEffect(() => {
    calculateStats();
  }, [homework, exams]);

  const calculateStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user profile for XP
      const { data: profile } = await supabase
        .from("profiles")
        .select("xp, level")
        .eq("user_id", user.id)
        .single();

      const completedCount = homework.filter(h => h.status === "completed").length;
      const preparedExams = exams.filter(e => e.preparation_progress >= 70).length;

      setStats({
        totalXP: profile?.xp || 0,
        level: profile?.level || 1,
        completedHomework: completedCount,
        perfectWeeks: Math.floor(completedCount / 7), // Mock calculation
        examsPrepared: preparedExams
      });
    } catch (error) {
      console.error("Error calculating stats:", error);
    }
  };

  const achievements = [
    { 
      icon: Target, 
      title: "Homework Hero", 
      progress: stats.completedHomework,
      target: 10,
      unlocked: stats.completedHomework >= 10
    },
    { 
      icon: Zap, 
      title: "Speed Demon", 
      progress: stats.perfectWeeks,
      target: 3,
      unlocked: stats.perfectWeeks >= 3
    },
    { 
      icon: Award, 
      title: "Exam Master", 
      progress: stats.examsPrepared,
      target: 5,
      unlocked: stats.examsPrepared >= 5
    }
  ];

  const xpForNextLevel = stats.level * 100;
  const currentLevelXP = stats.totalXP % 100;
  const levelProgress = (currentLevelXP / xpForNextLevel) * 100;

  return (
    <div className="space-y-4">
      {/* Level & XP Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            Level {stats.level}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Progress to Level {stats.level + 1}</span>
            <span className="font-medium">{currentLevelXP}/{xpForNextLevel} XP</span>
          </div>
          <Progress value={levelProgress} className="h-2" />
          <div className="pt-2 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total XP</span>
              <span className="font-bold text-primary">{stats.totalXP}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Achievements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {achievements.map((achievement, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <achievement.icon className={`w-5 h-5 ${achievement.unlocked ? "text-yellow-600" : "text-muted-foreground"}`} />
                  <span className="text-sm font-medium">{achievement.title}</span>
                </div>
                {achievement.unlocked ? (
                  <Badge variant="default">Unlocked</Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {achievement.progress}/{achievement.target}
                  </span>
                )}
              </div>
              {!achievement.unlocked && (
                <Progress 
                  value={(achievement.progress / achievement.target) * 100} 
                  className="h-1" 
                />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-green-600">{stats.completedHomework}</div>
            <p className="text-xs text-muted-foreground mt-1">Homework Done</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-blue-600">{stats.examsPrepared}</div>
            <p className="text-xs text-muted-foreground mt-1">Exams Prepared</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
