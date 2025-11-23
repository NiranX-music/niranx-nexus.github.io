import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, MessageSquare, Award, TrendingUp } from "lucide-react";

export function DebateStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    const { data } = await supabase
      .from('user_debate_stats')
      .select('*')
      .eq('user_id', user?.id)
      .single();
    
    if (data) setStats(data);
  };

  if (!stats) return null;

  const getRankColor = (rank: string) => {
    const colors: any = {
      'Grandmaster': 'bg-yellow-500',
      'Master': 'bg-purple-500',
      'Expert': 'bg-blue-500',
      'Skilled': 'bg-green-500',
      'Apprentice': 'bg-gray-400',
      'Novice': 'bg-orange-400'
    };
    return colors[rank] || colors['Novice'];
  };

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Trophy className="w-5 h-5" />
        Your Debate Stats
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-muted-foreground">Rank</div>
          <Badge className={getRankColor(stats.rank)}>
            {stats.rank}
          </Badge>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Total Karma</div>
          <div className="text-2xl font-bold">{stats.total_karma}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Debates</div>
          <div className="text-lg font-semibold flex items-center gap-1">
            <MessageSquare className="w-4 h-4" />
            {stats.debates_created}
          </div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Comments</div>
          <div className="text-lg font-semibold">{stats.comments_posted}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Debates Won</div>
          <div className="text-lg font-semibold text-green-500">{stats.debates_won}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Awards</div>
          <div className="text-lg font-semibold flex items-center gap-1">
            <Award className="w-4 h-4" />
            {stats.awards_received}
          </div>
        </div>
      </div>
    </Card>
  );
}
