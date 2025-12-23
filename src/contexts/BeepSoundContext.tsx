import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

const BEEP_SOUNDS = [
  { id: 'click1', name: 'Digital Click', url: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3' },
  { id: 'click2', name: 'Soft Tap', url: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3' },
  { id: 'click3', name: 'Tech Beep', url: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3' },
  { id: 'click4', name: 'Space Ping', url: 'https://assets.mixkit.co/active_storage/sfx/1114/1114-preview.mp3' },
  { id: 'click5', name: 'UI Select', url: 'https://assets.mixkit.co/active_storage/sfx/2574/2574-preview.mp3' },
  { id: 'click6', name: 'Minimal Pop', url: 'https://assets.mixkit.co/active_storage/sfx/2575/2575-preview.mp3' },
  { id: 'click7', name: 'Sci-Fi Blip', url: 'https://assets.mixkit.co/active_storage/sfx/1113/1113-preview.mp3' },
  { id: 'click8', name: 'Retro Click', url: 'https://assets.mixkit.co/active_storage/sfx/2576/2576-preview.mp3' },
  { id: 'click9', name: 'Bubble Pop', url: 'https://assets.mixkit.co/active_storage/sfx/2577/2577-preview.mp3' },
  { id: 'click10', name: 'Glass Tap', url: 'https://assets.mixkit.co/active_storage/sfx/2569/2569-preview.mp3' },
  { id: 'click11', name: 'Synth Tone', url: 'https://assets.mixkit.co/active_storage/sfx/1115/1115-preview.mp3' },
  { id: 'click12', name: 'Arcade Beep', url: 'https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.mp3' },
  { id: 'click13', name: 'Notification', url: 'https://assets.mixkit.co/active_storage/sfx/2579/2579-preview.mp3' },
  { id: 'click14', name: 'Alert Ping', url: 'https://assets.mixkit.co/active_storage/sfx/1116/1116-preview.mp3' },
  { id: 'click15', name: 'Cyber Click', url: 'https://assets.mixkit.co/active_storage/sfx/2580/2580-preview.mp3' },
  { id: 'click16', name: 'Electric Zap', url: 'https://assets.mixkit.co/active_storage/sfx/2581/2581-preview.mp3' },
  { id: 'click17', name: 'Hologram', url: 'https://assets.mixkit.co/active_storage/sfx/1117/1117-preview.mp3' },
  { id: 'click18', name: 'Toggle', url: 'https://assets.mixkit.co/active_storage/sfx/2582/2582-preview.mp3' },
  { id: 'click19', name: 'Snap', url: 'https://assets.mixkit.co/active_storage/sfx/2583/2583-preview.mp3' },
  { id: 'click20', name: 'Space Confirm', url: 'https://assets.mixkit.co/active_storage/sfx/1118/1118-preview.mp3' },
];

interface BeepSoundContextType {
  beepEnabled: boolean;
  setBeepEnabled: (enabled: boolean) => void;
  selectedSound: string;
  setSelectedSound: (soundId: string) => void;
  playBeep: () => void;
  previewSound: (soundId: string) => void;
  availableSounds: typeof BEEP_SOUNDS;
}

const BeepSoundContext = createContext<BeepSoundContextType | undefined>(undefined);

export function BeepSoundProvider({ children }: { children: ReactNode }) {
  const [beepEnabled, setBeepEnabled] = useState(() => {
    const saved = localStorage.getItem('beepEnabled');
    return saved !== null ? JSON.parse(saved) : false;
  });
  
  const [selectedSound, setSelectedSound] = useState(() => {
    return localStorage.getItem('selectedBeepSound') || 'click1';
  });

  useEffect(() => {
    localStorage.setItem('beepEnabled', JSON.stringify(beepEnabled));
  }, [beepEnabled]);

  useEffect(() => {
    localStorage.setItem('selectedBeepSound', selectedSound);
  }, [selectedSound]);

  const playBeep = useCallback(() => {
    if (!beepEnabled) return;
    const sound = BEEP_SOUNDS.find(s => s.id === selectedSound);
    if (sound) {
      const audio = new Audio(sound.url);
      audio.volume = 0.3;
      audio.play().catch(() => {});
    }
  }, [beepEnabled, selectedSound]);

  const previewSound = useCallback((soundId: string) => {
    const sound = BEEP_SOUNDS.find(s => s.id === soundId);
    if (sound) {
      const audio = new Audio(sound.url);
      audio.volume = 0.3;
      audio.play().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button, a, [role="button"], [role="tab"], [role="menuitem"]')) {
        playBeep();
      }
    };

    if (beepEnabled) {
      document.addEventListener('click', handleClick);
    }

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [beepEnabled, playBeep]);

  return (
    <BeepSoundContext.Provider value={{
      beepEnabled,
      setBeepEnabled,
      selectedSound,
      setSelectedSound,
      playBeep,
      previewSound,
      availableSounds: BEEP_SOUNDS,
    }}>
      {children}
    </BeepSoundContext.Provider>
  );
}

export function useBeepSound() {
  const context = useContext(BeepSoundContext);
  if (!context) {
    throw new Error('useBeepSound must be used within a BeepSoundProvider');
  }
  return context;
}
