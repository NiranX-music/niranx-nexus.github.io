import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'space' | 'grey' | 'pink';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  systemSync: boolean;
  setSystemSync: (sync: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [systemSync, setSystemSync] = useState(false);

  // Detect system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    const savedSync = localStorage.getItem('theme-system-sync') === 'true';
    
    if (savedSync) {
      setSystemSync(true);
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    } else if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // Listen to system preference changes
  useEffect(() => {
    if (!systemSync) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [systemSync]);

  useEffect(() => {
    if (!systemSync) {
      localStorage.setItem('theme', theme);
    }
    localStorage.setItem('theme-system-sync', String(systemSync));
    
    // Remove all theme classes
    const themes = ['light', 'dark', 'space', 'grey', 'pink'];
    themes.forEach(t => document.documentElement.classList.remove(t));
    
    // Add current theme class
    document.documentElement.classList.add(theme);
  }, [theme, systemSync]);

  const handleSetSystemSync = (sync: boolean) => {
    setSystemSync(sync);
    if (sync) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, systemSync, setSystemSync: handleSetSystemSync }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}