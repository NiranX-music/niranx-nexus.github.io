import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useXP } from '@/contexts/XPContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Target, Clock, CheckCircle2, Flame } from 'lucide-react';
import { toast } from 'sonner';

interface Challenge {
  id: string;
  title: string;
  description: string;
  challenge_type: string;
  target_value: number;
  xp_reward: number;
  challenge_date: string;
}

interface UserProgress {
  id: string;
  challenge_id: string;
  progress_value: number;
  completed: boolean;
  completed_at: string | null;
}

export default function DailyChallenges() {
  const { user } = useAuth();
  const { addXP } = useXP();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userProgress, setUserProgress] = useState<Record<string, UserProgress>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTodaysChallenges();
    }
  }, [user]);

  const fetchTodaysChallenges = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Fetch today's challenges
      const { data: challengesData, error: challengesError } = await supabase
        .from('daily_challenges')
        .select('*')
        .eq('challenge_date', today);

      if (challengesError) throw challengesError;

      // If no challenges exist for today, create default ones
      if (!challengesData || challengesData.length === 0) {
        await createDefaultChallenges(today);
        await fetchTodaysChallenges();
        return;
      }

      setChallenges(challengesData || []);

      // Fetch user progress
      if (challengesData && challengesData.length > 0) {
        const challengeIds = challengesData.map(c => c.id);
        const { data: progressData } = await supabase
          .from('user_challenge_progress')
          .select('*')
          .eq('user_id', user?.id)
          .in('challenge_id', challengeIds);

        const progressMap: Record<string, UserProgress> = {};
        progressData?.forEach(p => {
          progressMap[p.challenge_id] = p;
        });
        setUserProgress(progressMap);
      }
    } catch (error: any) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultChallenges = async (date: string) => {
    const defaultChallenges = [
      {
        title: 'Study Marathon',
        description: 'Complete 60 minutes of focused study time',
        challenge_type: 'study_time',
        target_value: 60,
        xp_reward: 100,
        challenge_date: date,
      },
      {
        title: 'Task Master',
        description: 'Complete 5 tasks today',
        challenge_type: 'task_completion',
        target_value: 5,
        xp_reward: 75,
        challenge_date: date,
      },
      {
        title: 'Focus Champion',
        description: 'Complete 3 Pomodoro focus sessions',
        challenge_type: 'focus_session',
        target_value: 3,
        xp_reward: 50,
        challenge_date: date,
      },
      {
        title: 'Flashcard Wizard',
        description: 'Review 20 flashcards',
        challenge_type: 'flashcard_review',
        target_value: 20,
        xp_reward: 40,
        challenge_date: date,
      },
    ];

    await supabase.from('daily_challenges').insert(defaultChallenges);
  };

  const claimReward = async (challenge: Challenge, progress: UserProgress) => {
    if (!user || progress.completed) return;

    try {
      const { error: updateError } = await supabase
        .from('user_challenge_progress')
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq('id', progress.id);

      if (updateError) throw updateError;

      addXP(challenge.xp_reward);
      toast.success(`+${challenge.xp_reward} XP earned!`);
      fetchTodaysChallenges();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'study_time':
        return <Clock className="w-5 h-5" />;
      case 'task_completion':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'focus_session':
        return <Target className="w-5 h-5" />;
      case 'flashcard_review':
        return <Flame className="w-5 h-5" />;
      default:
        return <Trophy className="w-5 h-5" />;
    }
  };

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Trophy className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold gradient-text">Daily Challenges</h1>
          <p className="text-muted-foreground">Complete challenges to earn bonus XP</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {challenges.map((challenge) => {
          const progress = userProgress[challenge.id];
          const progressPercentage = progress
            ? Math.min((progress.progress_value / challenge.target_value) * 100, 100)
            : 0;
          const isCompleted = progress?.completed || progressPercentage >= 100;

          return (
            <Card key={challenge.id} className={`glass-card ${isCompleted ? 'border-green-500' : ''}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      {getChallengeIcon(challenge.challenge_type)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{challenge.title}</CardTitle>
                      <CardDescription>{challenge.description}</CardDescription>
                    </div>
                  </div>
                  {isCompleted && (
                    <Badge variant="secondary" className="bg-green-500/20 text-green-600">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold">
                      {progress?.progress_value || 0} / {challenge.target_value}
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-semibold">{challenge.xp_reward} XP</span>
                  </div>
                  {isCompleted && !progress?.completed && (
                    <Button
                      onClick={() => progress && claimReward(challenge, progress)}
                      size="sm"
                      className="bg-gradient-to-r from-primary to-primary-glow"
                    >
                      Claim Reward
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {challenges.length === 0 && !loading && (
        <Card className="glass-card">
          <CardContent className="p-8 text-center text-muted-foreground">
            No challenges available for today. Check back tomorrow!
          </CardContent>
        </Card>
      )}
    </div>
  );
}