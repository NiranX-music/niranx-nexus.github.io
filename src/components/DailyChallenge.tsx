import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, Zap } from 'lucide-react';
import { useFocus } from '@/contexts/FocusContext';
import { useXP } from '@/contexts/XPContext';

export default function DailyChallenge() {
  const { getTodayStats } = useFocus();
  const { xp } = useXP();
  const todayStats = getTodayStats();

  const challenges = [
    {
      id: 'focus_time',
      title: 'Study 3 Hours Today',
      description: 'Complete 180 minutes of focused study',
      target: 180,
      current: todayStats.totalMinutes,
      xpReward: 150,
      icon: Target,
    },
    {
      id: 'sessions',
      title: 'Complete 5 Sessions',
      description: 'Finish 5 focus sessions',
      target: 5,
      current: todayStats.sessions,
      xpReward: 100,
      icon: Zap,
    },
  ];

  return (
    <Card className="glass-card border-warning/20 bg-gradient-to-br from-warning/5 to-orange-500/5">
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-warning animate-pulse" />
            Daily Challenge
          </h3>
          <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/30">
            Active
          </Badge>
        </div>

        {challenges.map(challenge => {
          const progress = Math.min((challenge.current / challenge.target) * 100, 100);
          const isComplete = challenge.current >= challenge.target;
          const Icon = challenge.icon;

          return (
            <div key={challenge.id} className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1">
                  <Icon className={`w-4 h-4 mt-0.5 ${isComplete ? 'text-success' : 'text-warning'}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{challenge.title}</p>
                    <p className="text-xs text-muted-foreground">{challenge.description}</p>
                  </div>
                </div>
                <Badge 
                  variant={isComplete ? "default" : "outline"} 
                  className={`text-xs ${isComplete ? 'bg-success border-success' : 'border-warning text-warning'}`}
                >
                  +{challenge.xpReward} XP
                </Badge>
              </div>

              <div className="space-y-1">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground text-right">
                  {challenge.current} / {challenge.target} {challenge.id === 'focus_time' ? 'mins' : 'sessions'}
                </p>
              </div>

              {isComplete && (
                <div className="p-2 rounded bg-success/10 border border-success/30">
                  <p className="text-xs text-success font-semibold flex items-center gap-1">
                    ✨ Challenge Complete! Rewards claimed.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
