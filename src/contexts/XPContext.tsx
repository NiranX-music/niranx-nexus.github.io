import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { CelebrationAnimation } from '@/components/CelebrationAnimation';

interface XPContextType {
  xp: number;
  level: number;
  addXP: (amount: number, reason?: string) => Promise<void>;
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

  // Load XP from Supabase profiles
  useEffect(() => {
    if (user) {
      loadXPFromDatabase();
    } else {
      // Load from localStorage for guests
      const savedXP = localStorage.getItem('userXP');
      const savedLevel = localStorage.getItem('userLevel');
      if (savedXP) setXP(parseInt(savedXP));
      if (savedLevel) setLevel(parseInt(savedLevel));
      setLoading(false);
    }
  }, [user]);

  // Real-time sync for XP across devices
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`xp-sync-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          const newData = payload.new as any;
          if (newData.xp !== undefined) setXP(newData.xp);
          if (newData.level !== undefined) setLevel(newData.level);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
        // If profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          const { error: insertError } = await supabase
            .from('user_profiles')
            .insert({ id: user.id, xp: 0, level: 1 });
          
          if (insertError) throw insertError;
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

  const getXPForLevel = (level: number) => {
    return level * 1000; // 1000 XP per level
  };

  const addXP = async (amount: number, reason?: string) => {
    const newXP = xp + amount;
    const newLevel = Math.floor(newXP / 1000) + 1;
    const leveledUp = newLevel > level;
    
    setXP(newXP);
    setLevel(newLevel);

    // Show celebration animation
    if (leveledUp) {
      setCelebration({ type: 'level-up', message: `You're now level ${newLevel}!` });
    } else {
      setCelebration({ type: 'xp', value: amount, message: reason });
    }

    // Save to database if user is logged in
    if (user) {
      try {
        const { error } = await supabase
          .from('user_profiles')
          .upsert({ 
            id: user.id,
            xp: newXP, 
            level: newLevel,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'id'
          });

        if (error) throw error;

        // Show toast notification
        if (leveledUp) {
          toast.success(`🎉 Level Up! You're now level ${newLevel}!`);
        } else if (reason) {
          toast.success(`+${amount} XP earned! ${reason}`);
        }
      } catch (error) {
        console.error('Error saving XP:', error);
        toast.error('Failed to save XP progress');
      }
    } else {
      // Save to localStorage for guests
      localStorage.setItem('userXP', newXP.toString());
      localStorage.setItem('userLevel', newLevel.toString());
      
      if (leveledUp) {
        toast.success(`🎉 Level Up! You're now level ${newLevel}!`);
      }
    }
  };

  const getXPForNextLevel = () => {
    return getXPForLevel(level);
  };

  const getXPProgress = () => {
    const currentLevelXP = (level - 1) * 1000;
    const nextLevelXP = level * 1000;
    return ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
  };

  return (
    <XPContext.Provider value={{ xp, level, addXP, getXPForNextLevel, getXPProgress, loading }}>
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