import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useXP } from "@/contexts/XPContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Flame, Trophy, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface RewardTier {
  id: string;
  tier_name: string;
  required_streak: number;
  xp_reward: number;
  bonus_items: any;
}

export default function DailyRewards() {
  const { user } = useAuth();
  const { addXP } = useXP();
  const [rewardTiers, setRewardTiers] = useState<RewardTier[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [canClaim, setCanClaim] = useState(true);
  const [loading, setLoading] = useState(false);
  const [nextMilestone, setNextMilestone] = useState<RewardTier | null>(null);

  useEffect(() => {
    if (user) {
      fetchRewardTiers();
      checkStreak();
    }
  }, [user]);

  const fetchRewardTiers = async () => {
    const { data, error } = await supabase
      .from("reward_tiers")
      .select("*")
      .order("required_streak", { ascending: true });

    if (!error && data) {
      setRewardTiers(data as RewardTier[]);
    }
  };

  const checkStreak = async () => {
    if (!user) return;

    // Check if already claimed today
    const today = new Date().toISOString().split("T")[0];
    const { data: claimed } = await supabase
      .from("claimed_daily_rewards")
      .select("*")
      .eq("user_id", user.id)
      .eq("claim_date", today)
      .single();

    if (claimed) {
      setCanClaim(false);
    }

    // Get current streak
    const { data: streaks } = await supabase
      .from("login_streaks")
      .select("*")
      .eq("user_id", user.id)
      .order("login_date", { ascending: false })
      .limit(2);

    if (streaks && streaks.length > 0) {
      const latestStreak = streaks[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      if (latestStreak.login_date === today) {
        setCurrentStreak(latestStreak.streak_count);
      } else if (latestStreak.login_date === yesterdayStr) {
        setCurrentStreak(latestStreak.streak_count);
      } else {
        setCurrentStreak(0);
      }
    }

    // Find next milestone
    const next = rewardTiers.find((tier) => tier.required_streak > currentStreak);
    setNextMilestone(next || null);
  };

  const claimDailyReward = async () => {
    if (!user || !canClaim) return;

    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];

      // Update or create streak
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      const { data: lastStreak } = await supabase
        .from("login_streaks")
        .select("*")
        .eq("user_id", user.id)
        .eq("login_date", yesterdayStr)
        .single();

      const newStreakCount = lastStreak ? lastStreak.streak_count + 1 : 1;

      await supabase.from("login_streaks").insert({
        user_id: user.id,
        login_date: today,
        streak_count: newStreakCount,
      });

      // Find matching reward tier
      const matchingTier = rewardTiers
        .filter((tier) => tier.required_streak <= newStreakCount)
        .sort((a, b) => b.required_streak - a.required_streak)[0];

      // Random bonus (10% chance)
      const isRandomBonus = Math.random() < 0.1;
      const bonusXP = isRandomBonus ? Math.floor(Math.random() * 100) + 50 : 0;
      const totalXP = (matchingTier?.xp_reward || 50) + bonusXP;

      // Claim reward
      await supabase.from("claimed_daily_rewards").insert({
        user_id: user.id,
        claim_date: today,
        reward_tier_id: matchingTier?.id,
        xp_earned: totalXP,
        bonus_items: matchingTier?.bonus_items || [],
        streak_count: newStreakCount,
        is_random_bonus: isRandomBonus,
      });

      // Add XP
      addXP(totalXP);

      setCurrentStreak(newStreakCount);
      setCanClaim(false);

      toast({
        title: "Daily Reward Claimed! 🎉",
        description: `+${totalXP} XP${isRandomBonus ? " (includes bonus!)" : ""}. Current streak: ${newStreakCount} days`,
      });
    } catch (error) {
      console.error("Error claiming reward:", error);
      toast({
        title: "Error",
        description: "Failed to claim daily reward",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const progressToNext = nextMilestone
    ? (currentStreak / nextMilestone.required_streak) * 100
    : 100;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold gradient-text mb-2">Daily Rewards</h1>
        <p className="text-muted-foreground">
          Login daily to maintain your streak and earn rewards!
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card className="bg-gradient-to-br from-primary/20 to-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-2">{currentStreak} Days</div>
            {nextMilestone && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Next milestone: {nextMilestone.tier_name}</span>
                  <span>{nextMilestone.required_streak} days</span>
                </div>
                <Progress value={progressToNext} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/20 to-secondary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-pink-500" />
              Today's Reward
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={claimDailyReward}
              disabled={!canClaim || loading}
              size="lg"
              className="w-full"
            >
              {!canClaim ? "Already Claimed Today ✓" : "Claim Daily Reward"}
            </Button>
            {!canClaim && (
              <p className="text-sm text-muted-foreground mt-2 text-center">
                Come back tomorrow for your next reward!
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Reward Milestones
          </CardTitle>
          <CardDescription>Earn special rewards at these streak milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rewardTiers.map((tier) => (
              <div
                key={tier.id}
                className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                  currentStreak >= tier.required_streak
                    ? "bg-primary/10 border-primary"
                    : "bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      currentStreak >= tier.required_streak
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {currentStreak >= tier.required_streak ? "✓" : tier.required_streak}
                  </div>
                  <div>
                    <div className="font-semibold">{tier.tier_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {tier.required_streak} day streak
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">+{tier.xp_reward} XP</Badge>
                  {tier.bonus_items && tier.bonus_items.length > 0 && (
                    <Badge variant="outline" className="gap-1">
                      <Sparkles className="h-3 w-3" />
                      {tier.bonus_items.length} Bonus
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
