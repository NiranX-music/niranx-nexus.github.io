import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Automatically records study activity when the user is active in the app.
 * Triggers on mount and every 5 minutes of active usage.
 * Also auto-awards streak badges.
 */
export function useAutoStreak() {
  const { user } = useAuth();
  const recorded = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) return;

    const recordAndAward = async () => {
      try {
        // Record 1 minute of activity (app usage)
        await supabase.rpc('record_study_activity', {
          p_user_id: user.id,
          p_minutes: 1,
          p_tasks: 0,
          p_xp: 0,
        });

        // Auto-award any earned streak badges
        await supabase.rpc('auto_award_streak_badges', {
          p_user_id: user.id,
        });
      } catch (err) {
        console.error('Auto streak error:', err);
      }
    };

    // Record once on first load per session
    if (!recorded.current) {
      recorded.current = true;
      recordAndAward();
    }

    // Then every 5 minutes of active usage
    intervalRef.current = setInterval(recordAndAward, 5 * 60 * 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [user]);
}
