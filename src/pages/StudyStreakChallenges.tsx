import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useXP } from '@/contexts/XPContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flame, Trophy, Calendar, Target, CheckCircle2, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface StreakChallenge {
  id: string;
  title: string;
  description: string;
  target_days: number;
  xp_reward: number;
  badge_icon: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
}

export default function StudyStreakChallenges() {
  const { user } = useAuth();
  const { addXP } = useXP();
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);

  const challenges: StreakChallenge[] = [
    {
      id: 'beginner',
      title: 'Getting Started',
      description: 'Maintain a 3-day study streak',
      target_days: 3,
      xp_reward: 50,
      badge_icon: '🌱',
      difficulty: 'easy',
    },
    {
      id: 'consistent',
      title: 'Consistency Builder',
      description: 'Maintain a 7-day study streak',
      target_days: 7,
      xp_reward: 150,
      badge_icon: '🔥',
      difficulty: 'easy',
    },
    {
      id: 'dedicated',
      title: 'Dedicated Learner',
      description: 'Maintain a 14-day study streak',
      target_days: 14,
      xp_reward: 350,
      badge_icon: '💪',
      difficulty: 'medium',
    },
    {
      id: 'committed',
      title: 'Committed Scholar',
      description: 'Maintain a 30-day study streak',
      target_days: 30,
      xp_reward: 1000,
      badge_icon: '🎓',
      difficulty: 'medium',
    },
    {
      id: 'unstoppable',
      title: 'Unstoppable Force',
      description: 'Maintain a 60-day study streak',
      target_days: 60,
      xp_reward: 2500,
      badge_icon: '⚡',
      difficulty: 'hard',
    },
    {
      id: 'legendary',
      title: 'Legendary Master',
      description: 'Maintain a 100-day study streak',
      target_days: 100,
      xp_reward: 5000,
      badge_icon: '👑',
      difficulty: 'legendary',
    },
  ];

  useEffect(() => {
    if (user) {
      fetchStreakData();
      fetchCompletedChallenges();
    }
  }, [user]);

  const fetchStreakData = async () => {
    const { data: streaks } = await supabase
      .from('study_streaks')
      .select('*')
      .eq('user_id', user?.id)
      .order('study_date', { ascending: false });

    if (streaks && streaks.length > 0) {
      // Calculate current streak
      let current = 0;
      let longest = 0;
      let temp = 0;

      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      for (let i = 0; i < streaks.length; i++) {
        const streakDate = streaks[i].study_date;

        if (i === 0 && (streakDate === today || streakDate === yesterday)) {
          current = 1;
          temp = 1;
        } else if (i > 0) {
          const prevDate = new Date(streaks[i - 1].study_date);
          const currDate = new Date(streakDate);
          const dayDiff = Math.floor((prevDate.getTime() - currDate.getTime()) / 86400000);

          if (dayDiff === 1) {
            temp++;
            if (streaks[0].study_date === today || streaks[0].study_date === yesterday) {
              current = temp;
            }
          } else {
            temp = 1;
          }
        }

        longest = Math.max(longest, temp);
      }

      setCurrentStreak(current);
      setLongestStreak(longest);
    }
  };

  const fetchCompletedChallenges = async () => {
    const completed = localStorage.getItem(`streak-challenges-${user?.id}`);
    if (completed) {
      setCompletedChallenges(JSON.parse(completed));
    }
  };

  const claimReward = async (challenge: StreakChallenge) => {
    if (currentStreak < challenge.target_days) {
      toast.error('Streak requirement not met!');
      return;
    }

    if (completedChallenges.includes(challenge.id)) {
      toast.error('Already claimed!');
      return;
    }

    addXP(challenge.xp_reward);
    const updated = [...completedChallenges, challenge.id];
    setCompletedChallenges(updated);
    localStorage.setItem(`streak-challenges-${user?.id}`, JSON.stringify(updated));
    
    toast.success(`🎉 ${challenge.title} completed! +${challenge.xp_reward} XP`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-500 border-green-500';
      case 'medium': return 'text-yellow-500 border-yellow-500';
      case 'hard': return 'text-orange-500 border-orange-500';
      case 'legendary': return 'text-purple-500 border-purple-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Flame className="w-8 h-8 text-orange-500" />
        <div>
          <h1 className="text-3xl font-bold gradient-text">Study Streak Challenges</h1>
          <p className="text-muted-foreground">Build consistency and earn massive rewards</p>
        </div>
      </div>

      {/* Current Streak */}
      <Card className="glass-card border-orange-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-orange-500" />
            Your Current Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-5xl font-bold text-orange-500">{currentStreak}</p>
              <p className="text-sm text-muted-foreground">Days in a row</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{longestStreak}</p>
              <p className="text-sm text-muted-foreground">Best streak</p>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mt-6">
            {Array.from({ length: 7 }).map((_, i) => {
              const dayNumber = i + 1;
              const isActive = dayNumber <= currentStreak;
              return (
                <div
                  key={i}
                  className={`aspect-square rounded-lg border-2 flex items-center justify-center ${
                    isActive 
                      ? 'bg-orange-500/20 border-orange-500' 
                      : 'bg-muted/20 border-muted'
                  }`}
                >
                  {isActive ? (
                    <Flame className="w-4 h-4 text-orange-500" />
                  ) : (
                    <span className="text-xs text-muted-foreground">{dayNumber}</span>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Challenges */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="w-6 h-6 text-primary" />
          Streak Challenges
        </h2>

        {challenges.map((challenge) => {
          const progress = Math.min(100, (currentStreak / challenge.target_days) * 100);
          const isCompleted = completedChallenges.includes(challenge.id);
          const canClaim = currentStreak >= challenge.target_days && !isCompleted;
          const isLocked = currentStreak < challenge.target_days;

          return (
            <Card 
              key={challenge.id} 
              className={`glass-card hover-lift ${
                isCompleted ? 'border-green-500/50' : canClaim ? 'border-primary' : ''
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{challenge.badge_icon}</div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {challenge.title}
                        {isCompleted && (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        )}
                        {isLocked && (
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        )}
                      </CardTitle>
                      <CardDescription>{challenge.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="outline" className={getDifficultyColor(challenge.difficulty)}>
                      {challenge.difficulty.toUpperCase()}
                    </Badge>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {challenge.xp_reward} XP
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-medium">
                      {currentStreak} / {challenge.target_days} days
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <Button 
                  onClick={() => claimReward(challenge)}
                  disabled={!canClaim}
                  className="w-full"
                  variant={canClaim ? "default" : "outline"}
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Completed
                    </>
                  ) : canClaim ? (
                    <>
                      <Trophy className="w-4 h-4 mr-2" />
                      Claim Reward
                    </>
                  ) : (
                    <>
                      <Target className="w-4 h-4 mr-2" />
                      {challenge.target_days - currentStreak} more days
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tips */}
      <Card className="glass-card border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Tips for Maintaining Streaks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Study at the same time each day to build a habit</p>
          <p>• Even 15 minutes counts - consistency matters more than duration</p>
          <p>• Set daily reminders to keep your streak alive</p>
          <p>• Track your progress and celebrate small wins</p>
          <p>• Join study groups for accountability and motivation</p>
        </CardContent>
      </Card>
    </div>
  );
}
