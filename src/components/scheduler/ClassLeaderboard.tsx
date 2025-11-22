import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

interface LeaderboardEntry {
  rank: number;
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
  score: number;
  stats: {
    homework_completed: number;
    attendance: number;
    exam_readiness: number;
  };
}

export const ClassLeaderboard = () => {
  const [homeworkLeaderboard, setHomeworkLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [attendanceLeaderboard, setAttendanceLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [examLeaderboard, setExamLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  const fetchLeaderboards = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user?.id || null);

      // Mock data - In production, fetch from leaderboard_entries table
      const mockHomeworkLeaders: LeaderboardEntry[] = [
        {
          rank: 1,
          user: { id: "1", name: "Sarah Johnson", avatar: null },
          score: 2850,
          stats: { homework_completed: 42, attendance: 95, exam_readiness: 88 }
        },
        {
          rank: 2,
          user: { id: "2", name: "Alex Chen", avatar: null },
          score: 2720,
          stats: { homework_completed: 39, attendance: 92, exam_readiness: 85 }
        },
        {
          rank: 3,
          user: { id: "3", name: "Jordan Smith", avatar: null },
          score: 2680,
          stats: { homework_completed: 38, attendance: 90, exam_readiness: 82 }
        },
        {
          rank: 4,
          user: { id: user?.id || "current", name: "You", avatar: null },
          score: 2450,
          stats: { homework_completed: 35, attendance: 88, exam_readiness: 78 }
        },
      ];

      setHomeworkLeaderboard(mockHomeworkLeaders);
      setAttendanceLeaderboard([...mockHomeworkLeaders].sort((a, b) => b.stats.attendance - a.stats.attendance));
      setExamLeaderboard([...mockHomeworkLeaders].sort((a, b) => b.stats.exam_readiness - a.stats.exam_readiness));
    } catch (error) {
      console.error("Error fetching leaderboards:", error);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Medal className="w-5 h-5 text-amber-600" />;
      default: return <span className="text-muted-foreground text-sm font-medium">#{rank}</span>;
    }
  };

  const renderLeaderboard = (entries: LeaderboardEntry[], scoreLabel: string) => (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div
          key={entry.user.id}
          className={`flex items-center gap-3 p-3 rounded-lg ${
            entry.user.id === currentUser 
              ? "bg-primary/10 border border-primary/20" 
              : "bg-muted/30"
          }`}
        >
          <div className="w-8 flex items-center justify-center">
            {getRankIcon(entry.rank)}
          </div>
          <Avatar className="w-10 h-10">
            <AvatarImage src={entry.user.avatar || undefined} />
            <AvatarFallback>
              {entry.user.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">{entry.user.name}</span>
              {entry.user.id === currentUser && (
                <Badge variant="secondary" className="text-xs">You</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{scoreLabel}: {entry.score}</p>
          </div>
          <div className="text-right">
            <TrendingUp className="w-4 h-4 text-green-500 ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5" />
          Class Leaderboards
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="homework">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="homework">Homework</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="exams">Exams</TabsTrigger>
          </TabsList>
          <TabsContent value="homework" className="mt-4">
            {renderLeaderboard(homeworkLeaderboard, "Completed")}
          </TabsContent>
          <TabsContent value="attendance" className="mt-4">
            {renderLeaderboard(attendanceLeaderboard, "Attendance %")}
          </TabsContent>
          <TabsContent value="exams" className="mt-4">
            {renderLeaderboard(examLeaderboard, "Readiness %")}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};