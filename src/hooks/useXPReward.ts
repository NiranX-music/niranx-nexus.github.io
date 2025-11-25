import { useXP } from '@/contexts/XPContext';
import { XPRewardKey, getXPReward, getXPDescription } from '@/lib/xpRewards';
import { useCallback } from 'react';

/**
 * Hook to easily award XP for activities across the app
 */
export function useXPReward() {
  const { addXP } = useXP();

  const awardXP = useCallback(
    async (activity: XPRewardKey) => {
      const amount = getXPReward(activity);
      const description = getXPDescription(activity);
      await addXP(amount, description);
    },
    [addXP]
  );

  const awardCustomXP = useCallback(
    async (amount: number, reason: string) => {
      await addXP(amount, reason);
    },
    [addXP]
  );

  return {
    awardXP,
    awardCustomXP,
  };
}
