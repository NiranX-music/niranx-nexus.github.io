import { createContext, useContext, useState, ReactNode } from 'react';

interface NowPlayingData {
  type: 'music' | 'video' | null;
  title: string;
  artist?: string;
  thumbnail?: string;
  url?: string;
}

interface NowPlayingContextType {
  nowPlaying: NowPlayingData;
  setNowPlaying: (data: NowPlayingData) => void;
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
}

const NowPlayingContext = createContext<NowPlayingContextType | undefined>(undefined);

export function NowPlayingProvider({ children }: { children: ReactNode }) {
  const [nowPlaying, setNowPlaying] = useState<NowPlayingData>({
    type: null,
    title: '',
  });
  const [isVisible, setIsVisible] = useState(false);

  return (
    <NowPlayingContext.Provider value={{ nowPlaying, setNowPlaying, isVisible, setIsVisible }}>
      {children}
    </NowPlayingContext.Provider>
  );
}

export function useNowPlaying() {
  const context = useContext(NowPlayingContext);
  if (context === undefined) {
    throw new Error('useNowPlaying must be used within a NowPlayingProvider');
  }
  return context;
}
