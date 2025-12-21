import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MiniPlayer } from './MiniPlayer';
import { useXVibePlayer } from '../../contexts/XVibePlayerContext';

export function PersistentXVibeMiniPlayer() {
  const location = useLocation();
  const { currentTrack } = useXVibePlayer();
  const [showMiniPlayer, setShowMiniPlayer] = useState(true);
  
  // Check if we're on an XVibe page
  const isOnXVibePage = location.pathname.startsWith('/xvibe');
  
  // Only show mini player when NOT on XVibe pages and there's a track playing
  if (isOnXVibePage || !currentTrack || !showMiniPlayer) {
    return null;
  }

  return <MiniPlayer onClose={() => setShowMiniPlayer(false)} />;
}
