import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const STORAGE_KEY = 'niranx-custom-tab-titles';

const getDefaultPageTitle = (pathname: string): string => {
  const segments = pathname.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1] || 'Dashboard';
  
  // Convert kebab-case to Title Case
  const title = lastSegment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  return `${title} | NiranX`;
};

export function useTabTitle() {
  const location = useLocation();
  const [customTitles, setCustomTitles] = useState<Record<string, string>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const currentPath = location.pathname;
  const defaultTitle = getDefaultPageTitle(currentPath);
  const customTitle = customTitles[currentPath];
  const currentTitle = customTitle || defaultTitle;

  // Update document title whenever it changes
  useEffect(() => {
    document.title = currentTitle;
  }, [currentTitle]);

  const setTabTitle = (title: string) => {
    const newTitles = { ...customTitles };
    
    if (title.trim()) {
      newTitles[currentPath] = title.trim();
    } else {
      delete newTitles[currentPath];
    }
    
    setCustomTitles(newTitles);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTitles));
  };

  const resetTabTitle = () => {
    const newTitles = { ...customTitles };
    delete newTitles[currentPath];
    setCustomTitles(newTitles);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTitles));
  };

  return {
    currentTitle,
    customTitle,
    defaultTitle,
    setTabTitle,
    resetTabTitle,
    hasCustomTitle: !!customTitle,
  };
}
