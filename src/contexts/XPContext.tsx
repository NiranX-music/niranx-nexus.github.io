import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

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

  const loadXPFromDatabase = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('xp, level')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data) {
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

    // Save to database if user is logged in
    if (user) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ 
            xp: newXP, 
            level: newLevel 
          })
          .eq('user_id', user.id);

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