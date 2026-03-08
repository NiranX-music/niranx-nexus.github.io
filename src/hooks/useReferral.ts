import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useReferral() {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralUses, setReferralUses] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const loadReferralData = useCallback(async () => {
    if (!user) return;
    try {
      let { data, error } = await supabase
        .from("referral_codes")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!data) {
        // Generate referral code
        const { data: codeData } = await supabase.rpc("generate_referral_code" as any);
        const code = (codeData as string) || `NX-${user.id.substring(0, 6).toUpperCase()}`;
        
        const { data: newData, error: insertError } = await supabase
          .from("referral_codes")
          .insert({ user_id: user.id, code })
          .select()
          .single();

        if (!insertError && newData) {
          data = newData;
        }
      }

      if (data) {
        setReferralCode(data.code);
        setReferralUses(data.uses);
      }

      // Count referral uses
      const { count } = await supabase
        .from("referral_uses")
        .select("*", { count: "exact", head: true })
        .eq("referrer_user_id", user.id);

      if (count !== null) setReferralUses(count);
    } catch (e) {
      console.error("Error loading referral data:", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadReferralData();
  }, [loadReferralData]);

  const applyReferralCode = useCallback(async (code: string) => {
    if (!user) return { success: false, error: "Not logged in" };

    try {
      // Check if user already used a referral
      const { data: existing } = await supabase
        .from("referral_uses")
        .select("id")
        .eq("referred_user_id", user.id)
        .maybeSingle();

      if (existing) return { success: false, error: "You have already used a referral code" };

      // Find the referral code
      const { data: codeData } = await supabase
        .from("referral_codes")
        .select("*")
        .eq("code", code.toUpperCase().trim())
        .maybeSingle();

      if (!codeData) return { success: false, error: "Invalid referral code" };
      if (codeData.user_id === user.id) return { success: false, error: "Cannot use your own referral code" };

      // Get bonus amount from admin settings
      const { data: settingData } = await supabase.rpc("get_admin_setting", {
        p_setting_key: "referral_bonus_credits",
      });
      const bonusAmount = (settingData && typeof settingData === "object" && "amount" in (settingData as any))
        ? (settingData as any).amount
        : 100;

      // Create referral use record
      const { error: useError } = await supabase.from("referral_uses").insert({
        referral_code_id: codeData.id,
        referred_user_id: user.id,
        referrer_user_id: codeData.user_id,
        bonus_credits: bonusAmount,
      });

      if (useError) throw useError;

      // Add bonus credits to referred user
      await supabase
        .from("ai_credits")
        .upsert({ user_id: user.id, bonus_credits: bonusAmount, credits_remaining: bonusAmount }, { onConflict: "user_id" });

      // Add bonus credits to referrer
      const { data: referrerCredits } = await supabase
        .from("ai_credits")
        .select("bonus_credits, credits_remaining")
        .eq("user_id", codeData.user_id)
        .maybeSingle();

      if (referrerCredits) {
        await supabase
          .from("ai_credits")
          .update({
            bonus_credits: (referrerCredits.bonus_credits || 0) + bonusAmount,
            credits_remaining: (referrerCredits.credits_remaining || 0) + bonusAmount,
          })
          .eq("user_id", codeData.user_id);
      } else {
        await supabase
          .from("ai_credits")
          .insert({ user_id: codeData.user_id, bonus_credits: bonusAmount, credits_remaining: bonusAmount });
      }

      // Update referral code uses count
      await supabase
        .from("referral_codes")
        .update({ uses: codeData.uses + 1 })
        .eq("id", codeData.id);

      return { success: true, bonusAmount };
    } catch (e: any) {
      return { success: false, error: e.message || "Failed to apply referral code" };
    }
  }, [user]);

  return { referralCode, referralUses, loading, applyReferralCode, refresh: loadReferralData };
}
