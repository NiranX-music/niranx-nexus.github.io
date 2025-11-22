import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, Trophy, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StudyBuddyPanelProps {
  homework: any[];
}

export const StudyBuddyPanel = ({ homework }: StudyBuddyPanelProps) => {
  const { toast } = useToast();
  const [studySessions, setStudySessions] = useState<any[]>([]);
  const [buddies, setBuddies] = useState<any[]>([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    fetchStudyData();
  }, []);

  const fetchStudyData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch study sessions
      const { data: sessions } = await supabase
        .from("study_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      setStudySessions(sessions || []);

      // Calculate streak (consecutive days with completed homework)
      const { data: recentHomework } = await supabase
        .from("homework_assignments")
        .select("status, created_at")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(10);

      if (recentHomework && recentHomework.length > 0) {
        let currentStreak = 1;
        let lastDate = new Date(recentHomework[0].created_at).toDateString();
        
        for (let i = 1; i < recentHomework.length; i++) {
          const currentDate = new Date(recentHomework[i].created_at).toDateString();
          const dayDiff = Math.floor((new Date(lastDate).getTime() - new Date(currentDate).getTime()) / (1000 * 60 * 60 * 24));
          
          if (dayDiff === 1) {
            currentStreak++;
            lastDate = currentDate;
          } else {
            break;
          }
        }
        setStreak(currentStreak);
      }

      // Mock buddies data (in real app, fetch from a buddies table)
      setBuddies([
        { id: "1", name: "Alex Chen", avatar: null, xp: 2350, status: "online" },
        { id: "2", name: "Sarah Kim", avatar: null, xp: 1890, status: "studying" },
      ]);
    } catch (error) {
      console.error("Error fetching study data:", error);
    }
  };

  const createStudySession = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("study_sessions").insert({
        user_id: user.id,
        type: "homework",
        duration: 0,
        xp_earned: 0
      });

      if (error) throw error;

      toast({
        title: "Study Session Started",
        description: "Timer started! Focus on your homework.",
      });

      fetchStudyData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start study session",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Homework Streak */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            Homework Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-2">
            <div className="text-5xl font-bold text-orange-500">{streak}</div>
            <p className="text-sm text-muted-foreground">
              {streak === 0 ? "Start your streak today!" : 
               streak === 1 ? "Day! Keep it going!" : "Days! Amazing!"}
            </p>
            <Button size="sm" onClick={createStudySession} className="mt-2">
              Start Study Session
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Study Buddies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Study Buddies
            </div>
            <Button size="sm" variant="outline">
              <UserPlus className="w-4 h-4 mr-2" />
              Invite
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {buddies.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No study buddies yet. Invite friends to earn bonus XP together!
            </p>
          ) : (
            buddies.map((buddy) => (
              <div key={buddy.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={buddy.avatar} />
                    <AvatarFallback>{buddy.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{buddy.name}</h4>
                      <div className={`w-2 h-2 rounded-full ${
                        buddy.status === "online" ? "bg-green-500" :
                        buddy.status === "studying" ? "bg-blue-500" : "bg-gray-400"
                      }`} />
                    </div>
                    <p className="text-xs text-muted-foreground capitalize">{buddy.status}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <Trophy className="w-4 h-4 text-yellow-600" />
                    {buddy.xp}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Recent Study Sessions */}
      {studySessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent Study Sessions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {studySessions.map((session, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm p-2 rounded bg-muted/30">
                <span className="text-muted-foreground">{session.subject || session.type}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{session.duration}m</Badge>
                  <span className="text-primary font-medium">+{session.xp_earned} XP</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
