import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useXP } from './XPContext';

interface FocusSession {
  id: string;
  subject: string;
  duration: number;
  startTime: Date;
  endTime?: Date;
  interruptions: number;
  mood: string;
  completed: boolean;
}

interface FocusContextType {
  sessions: FocusSession[];
  currentSession: FocusSession | null;
  startSession: (subject: string, duration: number, mood: string) => void;
  endSession: (interruptions: number) => void;
  getTodayStats: () => { totalMinutes: number; sessions: number };
  getStreak: () => number;
}

const FocusContext = createContext<FocusContextType | undefined>(undefined);

export function FocusProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null);
  const { addXP } = useXP();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadSessionsFromDB();
    }
  }, [user]);

  const loadSessionsFromDB = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('focus_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(200);
      if (data) {
        setSessions(data.map((s: any) => ({
          id: s.id,
          subject: s.subject || '',
          duration: s.duration_minutes || 0,
          startTime: new Date(s.created_at),
          endTime: s.completed_at ? new Date(s.completed_at) : undefined,
          interruptions: 0,
          mood: '',
          completed: s.completed || false,
        })));
      }
    } catch (error) {
      console.error('Error loading focus sessions:', error);
    }
  };

  const startSession = (subject: string, duration: number, mood: string) => {
    const newSession: FocusSession = {
      id: Date.now().toString(),
      subject,
      duration,
      startTime: new Date(),
      interruptions: 0,
      mood,
      completed: false,
    };
    setCurrentSession(newSession);
  };

  const endSession = useCallback(async (interruptions: number) => {
    if (!currentSession) return;

    const completedSession: FocusSession = {
      ...currentSession,
      endTime: new Date(),
      interruptions,
      completed: true,
    };

    setSessions(prev => [completedSession, ...prev]);

    const baseXP = Math.floor(currentSession.duration / 5);
    const penalty = interruptions * 5;
    const earnedXP = Math.max(baseXP - penalty, 10);
    addXP(earnedXP, 'for completing a focus session');

    if (user) {
      try {
        await supabase.from('focus_sessions').insert({
          user_id: user.id,
          subject: currentSession.subject,
          duration_minutes: currentSession.duration,
          completed: true,
          completed_at: new Date().toISOString(),
          xp_earned: earnedXP,
        });
      } catch (error) {
        console.error('Error saving focus session:', error);
      }
    }

    setCurrentSession(null);
  }, [currentSession, user, addXP]);

  const getTodayStats = () => {
    const today = new Date().toDateString();
    const todaySessions = sessions.filter(s =>
      s.completed && new Date(s.startTime).toDateString() === today
    );
    return {
      totalMinutes: todaySessions.reduce((sum, s) => sum + s.duration, 0),
      sessions: todaySessions.length,
    };
  };

  const getStreak = () => {
    let streak = 0;
    const sorted = [...sessions]
      .filter(s => s.completed)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    for (const session of sorted) {
      const sessionDate = new Date(session.startTime);
      sessionDate.setHours(0, 0, 0, 0);
      if (sessionDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (sessionDate.getTime() < currentDate.getTime()) {
        break;
      }
    }
    return streak;
  };

  return (
    <FocusContext.Provider value={{ sessions, currentSession, startSession, endSession, getTodayStats, getStreak }}>
      {children}
    </FocusContext.Provider>
  );
}

export function useFocus() {
  const context = useContext(FocusContext);
  if (context === undefined) {
    throw new Error('useFocus must be used within a FocusProvider');
  }
  return context;
}
