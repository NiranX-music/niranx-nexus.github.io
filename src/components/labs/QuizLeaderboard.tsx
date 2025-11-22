import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Medal, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface LeaderboardEntry {
  user_id: string;
  total_score: number;
  total_attempts: number;
  avg_score: number;
  profile?: {
    full_name: string;
  };
}

interface QuizLeaderboardProps {
  labType: string;
}

export function QuizLeaderboard({ labType }: QuizLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [labType]);

  const loadLeaderboard = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('lab_quiz_scores')
      .select('user_id, score, total_questions')
      .eq('lab_type', labType)
      .order('score', { ascending: false });

    if (error) {
      console.error('Error loading leaderboard:', error);
      setLoading(false);
      return;
    }

    // Aggregate scores by user
    const userScores = data.reduce((acc, entry) => {
      if (!acc[entry.user_id]) {
        acc[entry.user_id] = {
          user_id: entry.user_id,
          total_score: 0,
          total_attempts: 0,
          avg_score: 0,
        };
      }
      acc[entry.user_id].total_score += entry.score;
      acc[entry.user_id].total_attempts += 1;
      return acc;
    }, {} as Record<string, LeaderboardEntry>);

    // Calculate averages and fetch profiles
    const leaderboardData = await Promise.all(
      Object.values(userScores).map(async (entry) => {
        entry.avg_score = Math.round(entry.total_score / entry.total_attempts);
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', entry.user_id)
          .single();
        
        return { ...entry, profile: profile || { full_name: 'Anonymous' } };
      })
    );

    // Sort by average score
    leaderboardData.sort((a, b) => b.avg_score - a.avg_score);
    
    setLeaderboard(leaderboardData.slice(0, 10));
    setLoading(false);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30';
      case 2:
        return 'from-gray-400/20 to-gray-500/10 border-gray-400/30';
      case 3:
        return 'from-amber-600/20 to-amber-700/10 border-amber-600/30';
      default:
        return 'from-muted/50 to-background border-border';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Quiz Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Quiz Leaderboard - Top 10
        </CardTitle>
      </CardHeader>
      <CardContent>
        {leaderboard.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No quiz attempts yet. Be the first to compete!
          </p>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry, index) => (
              <Card
                key={entry.user_id}
                className={`bg-gradient-to-r ${getRankColor(index + 1)} transition-all hover:scale-[1.02]`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="flex items-center justify-center w-12">
                      {getRankIcon(index + 1)}
                    </div>

                    {/* Avatar */}
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {entry.profile?.full_name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>

                    {/* User Info */}
                    <div className="flex-1">
                      <p className="font-semibold">
                        {entry.profile?.full_name || 'Anonymous User'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {entry.total_attempts} attempt{entry.total_attempts > 1 ? 's' : ''}
                      </p>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      <Badge variant="default" className="text-lg px-4 py-2">
                        {entry.avg_score}%
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Avg Score
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
