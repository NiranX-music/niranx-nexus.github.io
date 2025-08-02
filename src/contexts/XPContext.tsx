import React, { createContext, useContext, useEffect, useState } from 'react';

interface XPContextType {
  xp: number;
  level: number;
  addXP: (amount: number) => void;
  getXPForNextLevel: () => number;
  getXPProgress: () => number;
}

const XPContext = createContext<XPContextType | undefined>(undefined);

export function XPProvider({ children }: { children: React.ReactNode }) {
  const [xp, setXP] = useState(0);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    const savedXP = localStorage.getItem('userXP');
    const savedLevel = localStorage.getItem('userLevel');
    if (savedXP) setXP(parseInt(savedXP));
    if (savedLevel) setLevel(parseInt(savedLevel));
  }, []);

  useEffect(() => {
    localStorage.setItem('userXP', xp.toString());
    localStorage.setItem('userLevel', level.toString());
  }, [xp, level]);

  const getXPForLevel = (level: number) => {
    return level * 1000; // 1000 XP per level
  };

  const addXP = (amount: number) => {
    const newXP = xp + amount;
    setXP(newXP);
    
    // Check for level up
    const newLevel = Math.floor(newXP / 1000) + 1;
    if (newLevel > level) {
      setLevel(newLevel);
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
    <XPContext.Provider value={{ xp, level, addXP, getXPForNextLevel, getXPProgress }}>
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