import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sword, Shield, Zap, Heart, Skull } from "lucide-react";

interface BossHomework {
  id: string;
  title: string;
  subject: string;
  difficulty: "easy" | "medium" | "hard" | "legendary";
  health: number;
  maxHealth: number;
  xpReward: number;
  status: "active" | "defeated" | "locked";
}

interface HomeworkBossBattlesProps {
  homework: any[];
}

export const HomeworkBossBattles = ({ homework }: HomeworkBossBattlesProps) => {
  const [bosses, setBosses] = useState<BossHomework[]>([]);
  const [playerStats, setPlayerStats] = useState({
    attack: 25,
    defense: 15,
    health: 100,
    maxHealth: 100
  });

  useEffect(() => {
    convertHomeworkToBosses();
  }, [homework]);

  const convertHomeworkToBosses = () => {
    const complexHomework = homework.filter(h => 
      h.status === "pending" && (h.priority === "high" || (h.estimated_time && h.estimated_time > 60))
    );

    const bossData: BossHomework[] = complexHomework.slice(0, 4).map((hw, idx) => {
      const difficulty = getDifficulty(hw);
      const maxHealth = getMaxHealth(difficulty);
      
      return {
        id: hw.id,
        title: hw.title,
        subject: hw.subject,
        difficulty,
        health: maxHealth,
        maxHealth,
        xpReward: getXPReward(difficulty),
        status: idx === 0 ? "active" : "locked"
      };
    });

    setBosses(bossData);
  };

  const getDifficulty = (homework: any): "easy" | "medium" | "hard" | "legendary" => {
    const time = homework.estimated_time || 30;
    const priority = homework.priority;

    if (priority === "high" && time > 120) return "legendary";
    if (priority === "high" || time > 90) return "hard";
    if (time > 60) return "medium";
    return "easy";
  };

  const getMaxHealth = (difficulty: string): number => {
    switch (difficulty) {
      case "legendary": return 1000;
      case "hard": return 500;
      case "medium": return 250;
      case "easy": return 100;
      default: return 100;
    }
  };

  const getXPReward = (difficulty: string): number => {
    switch (difficulty) {
      case "legendary": return 500;
      case "hard": return 250;
      case "medium": return 100;
      case "easy": return 50;
      default: return 50;
    }
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case "legendary": return "text-purple-600";
      case "hard": return "text-red-600";
      case "medium": return "text-yellow-600";
      case "easy": return "text-green-600";
      default: return "text-gray-600";
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "legendary": return <Badge className="bg-purple-600">⚔️ Legendary</Badge>;
      case "hard": return <Badge variant="destructive">🔥 Hard</Badge>;
      case "medium": return <Badge className="bg-yellow-600">⚡ Medium</Badge>;
      case "easy": return <Badge className="bg-green-600">✨ Easy</Badge>;
      default: return null;
    }
  };

  const attackBoss = (bossId: string) => {
    setBosses(prev => prev.map(boss => {
      if (boss.id === bossId && boss.status === "active") {
        const newHealth = Math.max(0, boss.health - playerStats.attack);
        const newStatus = newHealth === 0 ? "defeated" : "active";
        
        return { ...boss, health: newHealth, status: newStatus };
      }
      return boss;
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sword className="w-5 h-5 text-red-600" />
          Homework Boss Battles
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Player Stats */}
        <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-primary/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">Your Stats</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Sword className="w-4 h-4 text-red-500" />
                <span className="text-xs font-medium">{playerStats.attack}</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-medium">{playerStats.defense}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500" />
            <Progress value={(playerStats.health / playerStats.maxHealth) * 100} className="flex-1 h-2" />
            <span className="text-xs font-medium">{playerStats.health}/{playerStats.maxHealth}</span>
          </div>
        </div>

        {/* Boss List */}
        <div className="space-y-3">
          {bosses.length === 0 ? (
            <div className="text-center py-6">
              <Skull className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No homework bosses available</p>
              <p className="text-xs text-muted-foreground mt-1">Complete more assignments to unlock battles!</p>
            </div>
          ) : (
            bosses.map((boss) => (
              <div
                key={boss.id}
                className={`p-4 rounded-lg border-2 ${
                  boss.status === "active" 
                    ? "border-primary bg-primary/5" 
                    : boss.status === "defeated"
                    ? "border-green-500/50 bg-green-500/5 opacity-60"
                    : "border-muted bg-muted/20 opacity-40"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-bold text-sm ${getDifficultyColor(boss.difficulty)}`}>
                        {boss.title}
                      </h4>
                      {boss.status === "defeated" && <Badge variant="outline" className="text-xs">✓ Defeated</Badge>}
                      {boss.status === "locked" && <Badge variant="secondary" className="text-xs">🔒 Locked</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{boss.subject}</p>
                  </div>
                  {getDifficultyBadge(boss.difficulty)}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>Boss HP</span>
                    <span className="font-medium">{boss.health}/{boss.maxHealth}</span>
                  </div>
                  <Progress 
                    value={(boss.health / boss.maxHealth) * 100} 
                    className="h-3"
                  />
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1 text-xs">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium">+{boss.xpReward} XP</span>
                  </div>
                  {boss.status === "active" && (
                    <Button 
                      size="sm" 
                      onClick={() => attackBoss(boss.id)}
                      className="gap-1"
                    >
                      <Sword className="w-3 h-3" />
                      Attack
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};