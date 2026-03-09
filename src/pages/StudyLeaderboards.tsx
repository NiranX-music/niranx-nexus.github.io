import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Trophy, Medal, Flame, Clock, CheckSquare, Star, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

interface LeaderboardEntry {
  user_id: string;
  score: number;
  rank: number;
  full_name?: string;
  avatar_url?: string;
}

const rankIcons = [Crown, Medal, Medal];
const rankColors = ['text-yellow-500', 'text-gray-400', 'text-amber-700'];

const StudyLeaderboards = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState('global_xp');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [tab]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    const { data } = await supabase.rpc('get_leaderboard_rankings', {
      p_leaderboard_type: tab,
      p_limit: 50,
    });

    if (data) {
      setEntries(data.map((d: any) => ({
        user_id: d.user_id,
        score: d.score,
        rank: d.alltime_rank,
        full_name: d.full_name,
        avatar_url: d.avatar_url,
      })));
    }
    setLoading(false);
  };

  const tabConfig = [
    { value: 'global_xp', label: 'XP', icon: Star },
    { value: 'study_time', label: 'Study Time', icon: Clock },
    { value: 'tasks_completed', label: 'Tasks', icon: CheckSquare },
    { value: 'streak', label: 'Streaks', icon: Flame },
  ];

  const formatScore = (score: number, type: string) => {
    if (type === 'study_time') return `${Math.round(score / 60)}h ${score % 60}m`;
    if (type === 'streak') return `${score} days`;
    return score.toLocaleString();
  };

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-3xl">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Trophy className="w-8 h-8 text-primary" />
          Study Leaderboards
        </h1>
        <p className="text-muted-foreground">Compete with fellow students and climb the ranks</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-4 w-full">
          {tabConfig.map(t => (
            <TabsTrigger key={t.value} value={t.value} className="flex items-center gap-1">
              <t.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{t.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {tabConfig.map(t => (
          <TabsContent key={t.value} value={t.value}>
            <Card>
              <CardContent className="p-4">
                {loading ? (
                  <div className="text-center py-12 text-muted-foreground">Loading rankings...</div>
                ) : entries.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">No data yet. Start studying to appear!</div>
                ) : (
                  <div className="space-y-2">
                    {entries.map((entry, i) => {
                      const isMe = user?.id === entry.user_id;
                      const RankIcon = i < 3 ? rankIcons[i] : null;
                      return (
                        <motion.div
                          key={entry.user_id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.02 }}
                          className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                            isMe ? 'bg-primary/10 border border-primary/30' : 'hover:bg-muted/50'
                          }`}
                        >
                          <div className="w-8 text-center font-bold text-sm">
                            {RankIcon ? (
                              <RankIcon className={`w-6 h-6 mx-auto ${rankColors[i]}`} />
                            ) : (
                              <span className="text-muted-foreground">#{i + 1}</span>
                            )}
                          </div>
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={entry.avatar_url || ''} />
                            <AvatarFallback className="text-xs">{(entry.full_name || 'U')[0]}</AvatarFallback>
                          </Avatar>
                          <span className="flex-1 font-medium text-sm truncate">
                            {entry.full_name || 'Anonymous'}
                            {isMe && <Badge variant="outline" className="ml-2 text-xs">You</Badge>}
                          </span>
                          <span className="font-bold text-primary text-sm">{formatScore(entry.score, tab)}</span>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default StudyLeaderboards;
