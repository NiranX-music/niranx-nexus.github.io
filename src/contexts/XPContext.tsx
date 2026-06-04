import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { CelebrationAnimation } from '@/components/CelebrationAnimation';

interface XPContextType {
  xp: number;
  level: number;
  addXP: (amount: number, reason?: string, activityType?: string) => Promise<void>;
  spendXP: (amount: number, reason?: string) => Promise<boolean>;
  getXPForNextLevel: () => number;
  getXPProgress: () => number;
  loading: boolean;
}

const XPContext = createContext<XPContextType | undefined>(undefined);

export function XPProvider({ children }: { children: React.ReactNode }) {
  const [xp, setXP] = useState(0);
  const [level, setLevel] = useState(1);
  const [loading, setLoading] = useState(true);
  const [celebration, setCelebration] = useState<{ type: 'xp' | 'level-up'; value?: number; message?: string } | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadXPFromDatabase();
    } else {
      setXP(0);
      setLevel(1);
      setLoading(false);
    }
  }, [user]);

  // Real-time sync
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`xp-profile-sync-${user.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'user_profiles',
        filter: `id=eq.${user.id}`,
      }, (payload) => {
        const d = payload.new as any;
        if (d.xp !== undefined) setXP(d.xp);
        if (d.level !== undefined) setLevel(d.level);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const loadXPFromDatabase = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('xp, level')
        .eq('id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          await supabase.from('user_profiles').insert({ id: user.id, xp: 0, level: 1 });
          setXP(0);
          setLevel(1);
        } else {
          throw error;
        }
      } else if (data) {
        setXP(data.xp || 0);
        setLevel(data.level || 1);
      }
    } catch (error) {
      console.error('Error loading XP:', error);
    } finally {
      setLoading(false);
    }
  };

  const addXP = useCallback(async (amount: number, reason?: string, activityType?: string) => {
    if (!user) {
      const newXP = xp + amount;
      const newLevel = Math.floor(newXP / 1000) + 1;
      setXP(newXP);
      setLevel(newLevel);
      setCelebration(newLevel > level
        ? { type: 'level-up', message: `You're now level ${newLevel}!` }
        : { type: 'xp', value: amount, message: reason });
      return;
    }

    try {
      const { data, error } = await supabase.rpc('award_xp', {
        _amount: amount,
        _reason: reason || 'XP earned',
        _activity_type: activityType || 'general',
      });
      if (error) throw error;

      const row: any = Array.isArray(data) ? data[0] : data;
      const newXP = row?.new_xp ?? xp + amount;
      const newLevel = row?.new_level ?? Math.floor(newXP / 1000) + 1;
      const leveledUp = !!row?.leveled_up;

      setXP(newXP);
      setLevel(newLevel);

      if (leveledUp) {
        setCelebration({ type: 'level-up', message: `You're now level ${newLevel}!` });
        toast.success(`🎉 Level Up! You're now level ${newLevel}!`);
      } else {
        setCelebration({ type: 'xp', value: amount, message: reason });
        if (reason) toast.success(`+${amount} XP ${reason}`);
      }
    } catch (error) {
      console.error('Error awarding XP:', error);
    }
  }, [xp, level, user]);

  const spendXP = useCallback(async (amount: number, reason?: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const { data, error } = await supabase.rpc('spend_xp', {
        _amount: amount,
        _reason: reason || 'XP spent',
      });
      if (error) throw error;

      const row: any = Array.isArray(data) ? data[0] : data;
      if (!row?.success) return false;

      setXP(row.new_xp);
      setLevel(row.new_level);
      return true;
    } catch (error) {
      console.error('Error spending XP:', error);
      return false;
    }
  }, [user]);

  const getXPForNextLevel = () => level * 1000;

  const getXPProgress = () => {
    const currentLevelXP = (level - 1) * 1000;
    const nextLevelXP = level * 1000;
    return ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
  };

  return (
    <XPContext.Provider value={{ xp, level, addXP, spendXP, getXPForNextLevel, getXPProgress, loading }}>
      {children}
      {celebration && (
        <CelebrationAnimation
          type={celebration.type}
          value={celebration.value}
          message={celebration.message}
          onComplete={() => setCelebration(null)}
        />
      )}
    </XPContext.Provider>
  );
}

export function useXP() {
  const context = useContext(XPContext);
  if (context === undefined) {
    throw new Error('useXP must be used within an XPProvider');
  }
  return context;
}
