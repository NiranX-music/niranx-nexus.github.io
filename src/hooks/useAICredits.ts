import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useAICredits() {
  const { user } = useAuth();
  const [credits, setCredits] = useState<number>(0);
  const [bonusCredits, setBonusCredits] = useState<number>(0);
  const [lastClaimDate, setLastClaimDate] = useState<string | null>(null);
  const [dailyLimit, setDailyLimit] = useState<number>(500);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  const loadCredits = useCallback(async () => {
    if (!user) return;
    try {
      // Load user credits
      const { data, error } = await supabase
        .from("ai_credits")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!error && data) {
        setCredits(data.credits_remaining);
        setBonusCredits(data.bonus_credits);
        setLastClaimDate(data.last_claim_date);
      }

      // Load daily limit from admin settings
      const { data: settingData } = await supabase.rpc("get_admin_setting", {
        p_setting_key: "daily_ai_credit_limit",
      });
      if (settingData && typeof settingData === "object" && "limit" in (settingData as any)) {
        setDailyLimit((settingData as any).limit);
      }
    } catch (e) {
      console.error("Error loading credits:", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadCredits();

    if (!user) return;
    const channel = supabase
      .channel("ai-credits-" + user.id)
      .on("postgres_changes", { event: "*", schema: "public", table: "ai_credits", filter: `user_id=eq.${user.id}` }, () => {
        loadCredits();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, loadCredits]);

  const canClaim = useCallback(() => {
    if (!lastClaimDate) return true;
    const today = new Date().toISOString().split("T")[0];
    return lastClaimDate !== today;
  }, [lastClaimDate]);

  const claimDailyCredits = useCallback(async () => {
    if (!user || !canClaim()) return false;
    setClaiming(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const { error } = await supabase
        .from("ai_credits")
        .upsert({
          user_id: user.id,
          credits_remaining: credits + dailyLimit,
          last_claim_date: today,
          credits_used_today: 0,
          last_reset_date: today,
        }, { onConflict: "user_id" });

      if (error) throw error;
      await loadCredits();
      return true;
    } catch (e) {
      console.error("Error claiming credits:", e);
      return false;
    } finally {
      setClaiming(false);
    }
  }, [user, canClaim, credits, dailyLimit, loadCredits]);

  const useCredit = useCallback(async (amount: number = 1) => {
    if (!user || credits < amount) return false;
    try {
      const { error } = await supabase
        .from("ai_credits")
        .update({
          credits_remaining: credits - amount,
          credits_used_today: (await supabase.from("ai_credits").select("credits_used_today").eq("user_id", user.id).single()).data?.credits_used_today + amount || amount,
        })
        .eq("user_id", user.id);

      if (error) throw error;
      setCredits((prev) => prev - amount);
      return true;
    } catch (e) {
      console.error("Error using credit:", e);
      return false;
    }
  }, [user, credits]);

  return {
    credits,
    bonusCredits,
    totalCredits: credits + bonusCredits,
    dailyLimit,
    lastClaimDate,
    canClaim: canClaim(),
    loading,
    claiming,
    claimDailyCredits,
    useCredit,
    refresh: loadCredits,
  };
}
