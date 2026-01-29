import { useState, useEffect, useCallback } from 'react';

interface StudyStats {
  totalMinutes: number;
  sessionsCompleted: number;
  currentStreak: number;
  lastStudyDate: string | null;
}

interface ExtensionSettings {
  notifications: boolean;
  focusReminders: boolean;
  dailyGoal: number;
}

// Declare chrome types for extension environment
declare const chrome: {
  runtime: {
    id: string;
    sendMessage: (message: unknown, callback?: (response: unknown) => void) => void;
  };
  storage: {
    local: {
      get: (keys: string[], callback: (result: Record<string, unknown>) => void) => void;
      set: (items: Record<string, unknown>, callback?: () => void) => void;
    };
  };
} | undefined;

// Check if running as Chrome extension
const isExtension = typeof chrome !== 'undefined' && chrome?.runtime && chrome?.runtime?.id;

export function useExtensionStorage() {
  const [stats, setStats] = useState<StudyStats>({
    totalMinutes: 0,
    sessionsCompleted: 0,
    currentStreak: 0,
    lastStudyDate: null
  });
  
  const [settings, setSettings] = useState<ExtensionSettings>({
    notifications: true,
    focusReminders: true,
    dailyGoal: 120
  });
  
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    if (isExtension && chrome) {
      chrome.storage.local.get(['studyStats', 'settings'], (result) => {
        if (result.studyStats) setStats(result.studyStats as StudyStats);
        if (result.settings) setSettings(result.settings as ExtensionSettings);
        setIsLoading(false);
      });
    } else {
      // Fallback to localStorage for web version
      const savedStats = localStorage.getItem('niranx_stats');
      const savedSettings = localStorage.getItem('niranx_settings');
      if (savedStats) setStats(JSON.parse(savedStats));
      if (savedSettings) setSettings(JSON.parse(savedSettings));
      setIsLoading(false);
    }
  }, []);

  const updateStats = useCallback((newStats: Partial<StudyStats>) => {
    const updated = { ...stats, ...newStats };
    setStats(updated);
    
    if (isExtension && chrome) {
      chrome.runtime.sendMessage({ type: 'UPDATE_STATS', stats: newStats });
    } else {
      localStorage.setItem('niranx_stats', JSON.stringify(updated));
    }
  }, [stats]);

  const updateSettings = useCallback((newSettings: Partial<ExtensionSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    
    if (isExtension && chrome) {
      chrome.storage.local.set({ settings: updated });
    } else {
      localStorage.setItem('niranx_settings', JSON.stringify(updated));
    }
  }, [settings]);

  const setStudyReminder = useCallback((delayMinutes: number, periodMinutes?: number) => {
    if (isExtension && chrome) {
      chrome.runtime.sendMessage({
        type: 'SET_STUDY_REMINDER',
        delayMinutes,
        periodMinutes
      });
    }
  }, []);

  const setBreakReminder = useCallback((delayMinutes: number) => {
    if (isExtension && chrome) {
      chrome.runtime.sendMessage({
        type: 'SET_BREAK_REMINDER',
        delayMinutes
      });
    }
  }, []);

  const clearReminders = useCallback(() => {
    if (isExtension && chrome) {
      chrome.runtime.sendMessage({ type: 'CLEAR_ALARMS' });
    }
  }, []);

  return {
    stats,
    settings,
    isLoading,
    isExtension,
    updateStats,
    updateSettings,
    setStudyReminder,
    setBreakReminder,
    clearReminders
  };
}
