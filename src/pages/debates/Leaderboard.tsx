import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, TrendingUp, Award, Star } from "lucide-react";

export default function DebateLeaderboard() {
  const [topDebaters, setTopDebaters] = useState<any[]>([]);
  const [topDebates, setTopDebates] = useState<any[]>([]);

  useEffect(() => {
    loadLeaderboards();
  }, []);

  const loadLeaderboards = async () => {
    // Top Debaters by Karma
    const { data: debaters } = await supabase
      .from('user_debate_stats')
      .select(`
        *,
        profiles:user_id (username, avatar_url)
      `)
      .order('total_karma', { ascending: false })
      .limit(100);
    
    if (debaters) setTopDebaters(debaters);

    // Top Debates by Karma
    const { data: debates } = await supabase
      .from('debate_topics')
      .select(`
        *,
        profiles:user_id (username),
        debate_categories (name, color)
      `)
      .order('upvotes', { ascending: false })
      .limit(50);
    
    if (debates) setTopDebates(debates);
  };

  const getRankBadge = (rank: string) => {
    const badges: any = {
      'Grandmaster': { emoji: '🏆', color: 'bg-yellow-500' },
      'Master': { emoji: '👑', color: 'bg-purple-500' },
      'Expert': { emoji: '💎', color: 'bg-blue-500' },
      'Skilled': { emoji: '🥇', color: 'bg-green-500' },
      'Apprentice': { emoji: '🥈', color: 'bg-gray-400' },
      'Novice': { emoji: '🥉', color: 'bg-orange-400' }
    };
    const badge = badges[rank] || badges['Novice'];
    return (
      <Badge className={badge.color}>
        {badge.emoji} {rank}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <Trophy className="w-10 h-10" />
          Debate Leaderboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Top debaters and most impactful debates
        </p>
      </div>

      <Tabs defaultValue="debaters">
        <TabsList>
          <TabsTrigger value="debaters">
            <Star className="w-4 h-4 mr-2" />
            Top Debaters
          </TabsTrigger>
          <TabsTrigger value="debates">
            <TrendingUp className="w-4 h-4 mr-2" />
            Top Debates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="debaters" className="space-y-4 mt-6">
          {topDebaters.map((debater, index) => (
            <Card key={debater.id} className="p-4">
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold w-12 text-center">
                  {index + 1}
                </div>
                <Avatar className="w-12 h-12">
                  <AvatarImage src={debater.profiles?.avatar_url} />
                  <AvatarFallback>{debater.profiles?.username?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-semibold">{debater.profiles?.username || 'Anonymous'}</div>
                  <div className="text-sm text-muted-foreground">
                    {debater.debates_created} debates • {debater.comments_posted} comments
                  </div>
                </div>
                <div className="text-right">
                  {getRankBadge(debater.rank)}
                  <div className="text-2xl font-bold mt-1">{debater.total_karma}</div>
                  <div className="text-xs text-muted-foreground">karma</div>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="debates" className="space-y-4 mt-6">
          {topDebates.map((debate, index) => (
            <Card key={debate.id} className="p-4 cursor-pointer hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold w-12 text-center">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold line-clamp-1">{debate.title}</h3>
                  <div className="flex gap-2 items-center text-sm text-muted-foreground mt-1">
                    <span>by {debate.profiles?.username}</span>
                    {debate.debate_categories && (
                      <Badge style={{ backgroundColor: debate.debate_categories.color }}>
                        {debate.debate_categories.name}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-500">
                    {debate.upvotes - debate.downvotes}
                  </div>
                  <div className="text-xs text-muted-foreground">karma</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {debate.comment_count} comments
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}