import React, { createContext, useContext, useState, useEffect } from 'react';

interface GuestModeContextType {
  isGuestMode: boolean;
  enableGuestMode: () => void;
  disableGuestMode: () => void;
}

const GuestModeContext = createContext<GuestModeContextType | undefined>(undefined);

export function GuestModeProvider({ children }: { children: React.ReactNode }) {
  const [isGuestMode, setIsGuestMode] = useState(false);

  useEffect(() => {
    const savedGuestMode = localStorage.getItem('guestMode');
    if (savedGuestMode === 'true') {
      setIsGuestMode(true);
    }
  }, []);

  const enableGuestMode = () => {
    setIsGuestMode(true);
    localStorage.setItem('guestMode', 'true');
  };

  const disableGuestMode = () => {
    setIsGuestMode(false);
    localStorage.removeItem('guestMode');
  };

  return (
    <GuestModeContext.Provider value={{ isGuestMode, enableGuestMode, disableGuestMode }}>
      {children}
    </GuestModeContext.Provider>
  );
}

export function useGuestMode() {
  const context = useContext(GuestModeContext);
  if (context === undefined) {
    throw new Error('useGuestMode must be used within a GuestModeProvider');
  }
  return context;
}
