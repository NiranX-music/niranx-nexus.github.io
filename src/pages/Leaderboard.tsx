import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, TrendingUp, Zap, Clock, CheckCircle } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface LeaderboardEntry {
  id: string;
  user_id: string;
  score: number;
  rank: number;
  profiles?: {
    display_name: string;
    avatar_url: string;
  };
}

export default function Leaderboard() {
  const { user } = useAuth();
  const [globalXP, setGlobalXP] = useState<LeaderboardEntry[]>([]);
  const [studyTime, setStudyTime] = useState<LeaderboardEntry[]>([]);
  const [tasksCompleted, setTasksCompleted] = useState<LeaderboardEntry[]>([]);
  const [streaks, setStreaks] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchLeaderboards();
    }
  }, [user]);

  const fetchLeaderboards = async () => {
    try {
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      // Fetch different leaderboard types
      const [xpData, timeData, taskData, streakData] = await Promise.all([
        fetchLeaderboardType('global_xp', firstDayOfMonth, lastDayOfMonth),
        fetchLeaderboardType('study_time', firstDayOfMonth, lastDayOfMonth),
        fetchLeaderboardType('tasks_completed', firstDayOfMonth, lastDayOfMonth),
        fetchLeaderboardType('streak', firstDayOfMonth, lastDayOfMonth),
      ]);

      setGlobalXP(xpData || []);
      setStudyTime(timeData || []);
      setTasksCompleted(taskData || []);
      setStreaks(streakData || []);
    } catch (error) {
      console.error('Error fetching leaderboards:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboardType = async (type: string, start: Date, end: Date) => {
    const { data } = await supabase
      .from('leaderboard_entries')
      .select('*')
      .eq('leaderboard_type', type)
      .gte('period_start', start.toISOString().split('T')[0])
      .lte('period_end', end.toISOString().split('T')[0])
      .order('score', { ascending: false })
      .limit(10);

    // Fetch profile data separately
    if (data && data.length > 0) {
      const userIds = data.map(entry => entry.user_id);
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', userIds);

      // Map profiles to entries
      return data.map(entry => ({
        ...entry,
        profiles: profilesData?.find(p => p.user_id === entry.user_id) || { display_name: 'Anonymous', avatar_url: '' }
      }));
    }

    return data;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-orange-600" />;
      default:
        return <span className="text-muted-foreground">#{rank}</span>;
    }
  };

  const LeaderboardTable = ({ entries, icon: Icon, label }: { entries: LeaderboardEntry[], icon: any, label: string }) => (
    <div className="space-y-2">
      {entries.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="p-8 text-center text-muted-foreground">
            No data available yet
          </CardContent>
        </Card>
      ) : (
        entries.map((entry, index) => {
          const isCurrentUser = entry.user_id === user?.id;
          return (
            <Card
              key={entry.id}
              className={`glass-card hover-lift ${isCurrentUser ? 'border-primary' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10">
                      {getRankIcon(index + 1)}
                    </div>
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {entry.profiles?.display_name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">
                        {entry.profiles?.display_name || 'Anonymous'}
                        {isCurrentUser && (
                          <Badge variant="secondary" className="ml-2">You</Badge>
                        )}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Icon className="w-4 h-4" />
                        <span>{entry.score} {label}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Trophy className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold gradient-text">Leaderboard</h1>
          <p className="text-muted-foreground">See how you rank against other students</p>
        </div>
      </div>

      <Tabs defaultValue="xp" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="xp">
            <Zap className="w-4 h-4 mr-2" />
            XP
          </TabsTrigger>
          <TabsTrigger value="time">
            <Clock className="w-4 h-4 mr-2" />
            Study Time
          </TabsTrigger>
          <TabsTrigger value="tasks">
            <CheckCircle className="w-4 h-4 mr-2" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="streak">
            <TrendingUp className="w-4 h-4 mr-2" />
            Streak
          </TabsTrigger>
        </TabsList>

        <TabsContent value="xp" className="mt-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Top XP Earners</CardTitle>
              <CardDescription>Based on total XP earned this month</CardDescription>
            </CardHeader>
            <CardContent>
              <LeaderboardTable entries={globalXP} icon={Zap} label="XP" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time" className="mt-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Study Time Champions</CardTitle>
              <CardDescription>Based on total study time this month</CardDescription>
            </CardHeader>
            <CardContent>
              <LeaderboardTable entries={studyTime} icon={Clock} label="minutes" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="mt-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Task Masters</CardTitle>
              <CardDescription>Based on tasks completed this month</CardDescription>
            </CardHeader>
            <CardContent>
              <LeaderboardTable entries={tasksCompleted} icon={CheckCircle} label="tasks" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="streak" className="mt-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Consistency Kings</CardTitle>
              <CardDescription>Based on current study streaks</CardDescription>
            </CardHeader>
            <CardContent>
              <LeaderboardTable entries={streaks} icon={TrendingUp} label="days" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}