import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Users, Flame, Clock, Star, Target, Zap, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: typeof Trophy;
  target: number;
  current: number;
  xpReward: number;
  type: 'individual' | 'team';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  endsIn: string;
}

const challenges: Challenge[] = [
  { id: '1', title: 'Study Marathon', description: 'Study for 10 hours this week', icon: Clock, target: 10, current: 6.5, xpReward: 200, type: 'individual', difficulty: 'Medium', endsIn: '3 days' },
  { id: '2', title: 'Quiz Master', description: 'Score 90%+ on 5 quizzes', icon: Target, target: 5, current: 3, xpReward: 150, type: 'individual', difficulty: 'Hard', endsIn: '3 days' },
  { id: '3', title: 'Team Sprint', description: 'Complete 20 tasks as a team', icon: Users, target: 20, current: 14, xpReward: 300, type: 'team', difficulty: 'Medium', endsIn: '4 days' },
  { id: '4', title: 'Note Taker', description: 'Create 15 study notes', icon: BookOpen, target: 15, current: 8, xpReward: 100, type: 'individual', difficulty: 'Easy', endsIn: '5 days' },
  { id: '5', title: 'Streak Keeper', description: 'Maintain a 7-day study streak', icon: Flame, target: 7, current: 5, xpReward: 250, type: 'individual', difficulty: 'Medium', endsIn: '2 days' },
  { id: '6', title: 'Speed Learner', description: 'Complete 3 courses in a week', icon: Zap, target: 3, current: 1, xpReward: 500, type: 'individual', difficulty: 'Hard', endsIn: '4 days' },
];

const diffColor = (d: string) => d === 'Easy' ? 'bg-green-500/20 text-green-500' : d === 'Medium' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-red-500/20 text-red-500';

export default function WeeklyChallenges() {
  return (
    <div className="container mx-auto p-6 space-y-6 max-w-5xl">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <Trophy className="w-10 h-10 text-primary" />
          <h1 className="text-3xl font-bold font-[Orbitron]">Weekly Challenges</h1>
        </div>
        <p className="text-muted-foreground">Compete individually or as a team for XP and rewards</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {challenges.map(c => {
          const Icon = c.icon;
          const pct = Math.min((c.current / c.target) * 100, 100);
          const completed = c.current >= c.target;
          return (
            <Card key={c.id} className={`border-primary/20 bg-card/60 backdrop-blur-sm ${completed ? 'ring-1 ring-green-500/30' : ''}`}>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold">{c.title}</h3>
                      <p className="text-sm text-muted-foreground">{c.description}</p>
                    </div>
                  </div>
                  <Badge className={diffColor(c.difficulty)}>{c.difficulty}</Badge>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{c.current}/{c.target}</span>
                    <span className="text-muted-foreground">{pct.toFixed(0)}%</span>
                  </div>
                  <Progress value={pct} className="h-2" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-xs">
                      {c.type === 'team' ? <Users className="w-3 h-3 mr-1" /> : <Star className="w-3 h-3 mr-1" />}
                      {c.type}
                    </Badge>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{c.endsIn}</span>
                  </div>
                  <Badge className="bg-primary/20 text-primary">+{c.xpReward} XP</Badge>
                </div>

                {completed && (
                  <Button className="w-full" size="sm" onClick={() => toast.success(`Claimed ${c.xpReward} XP!`)}>
                    Claim Reward
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
