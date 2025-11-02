import React, { createContext, useContext, useEffect, useState } from 'react';
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

  useEffect(() => {
    const savedSessions = localStorage.getItem('focus-sessions');
    if (savedSessions) {
      try {
        setSessions(JSON.parse(savedSessions));
      } catch (e) {
        console.error('Failed to parse focus sessions');
      }
    }
  }, []);

  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('focus-sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

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

  const endSession = (interruptions: number) => {
    if (!currentSession) return;

    const completedSession = {
      ...currentSession,
      endTime: new Date(),
      interruptions,
      completed: true,
    };

    setSessions(prev => [...prev, completedSession]);
    
    // Award XP based on duration and interruptions
    const baseXP = Math.floor(currentSession.duration / 5); // 1 XP per 5 mins
    const penalty = interruptions * 5; // -5 XP per interruption
    const earnedXP = Math.max(baseXP - penalty, 10); // Min 10 XP
    
    addXP(earnedXP);
    setCurrentSession(null);
  };

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
    const sortedSessions = [...sessions]
      .filter(s => s.completed)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedSessions.length; i++) {
      const sessionDate = new Date(sortedSessions[i].startTime);
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
    <FocusContext.Provider value={{ 
      sessions, 
      currentSession, 
      startSession, 
      endSession, 
      getTodayStats,
      getStreak 
    }}>
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
