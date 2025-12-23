import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface OfflineTrack {
  id: string;
  track_id: string;
  title: string;
  artist_name: string;
  cover_url: string | null;
  expires_at: string;
}

export function useXVibeDRM() {
  const [offlineTracks, setOfflineTracks] = useState<OfflineTrack[]>([]);
  const [downloading, setDownloading] = useState<Set<string>>(new Set());
  const [deviceId, setDeviceId] = useState<string>('');

  useEffect(() => {
    let storedDeviceId = localStorage.getItem('xvibe_device_id');
    if (!storedDeviceId) {
      storedDeviceId = crypto.randomUUID();
      localStorage.setItem('xvibe_device_id', storedDeviceId);
    }
    setDeviceId(storedDeviceId);
    loadOfflineTracks();
  }, []);

  const loadOfflineTracks = () => {
    try {
      const stored = localStorage.getItem('xvibe_offline_tracks');
      if (stored) {
        const tracks = JSON.parse(stored) as OfflineTrack[];
        setOfflineTracks(tracks.filter(t => new Date(t.expires_at) > new Date()));
      }
    } catch (error) {
      console.error('Error loading offline tracks:', error);
    }
  };

  const downloadTrack = useCallback(async (track: {
    id: string;
    title: string;
    artist_name: string;
    cover_url: string | null;
  }) => {
    if (downloading.has(track.id)) return;

    setDownloading(prev => new Set(prev).add(track.id));
    toast.info(`Downloading "${track.title}"...`);

    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const offlineTrack: OfflineTrack = {
        id: crypto.randomUUID(),
        track_id: track.id,
        title: track.title,
        artist_name: track.artist_name,
        cover_url: track.cover_url,
        expires_at: expiresAt.toISOString()
      };

      const updated = [...offlineTracks, offlineTrack];
      setOfflineTracks(updated);
      localStorage.setItem('xvibe_offline_tracks', JSON.stringify(updated));
      toast.success(`"${track.title}" saved for offline`);
    } catch (error) {
      toast.error('Failed to download');
    } finally {
      setDownloading(prev => {
        const next = new Set(prev);
        next.delete(track.id);
        return next;
      });
    }
  }, [downloading, offlineTracks]);

  const removeOfflineTrack = useCallback((trackId: string) => {
    const updated = offlineTracks.filter(t => t.track_id !== trackId);
    setOfflineTracks(updated);
    localStorage.setItem('xvibe_offline_tracks', JSON.stringify(updated));
    toast.success('Removed from downloads');
  }, [offlineTracks]);

  const isDownloaded = useCallback((trackId: string) => offlineTracks.some(t => t.track_id === trackId), [offlineTracks]);
  const isDownloading = useCallback((trackId: string) => downloading.has(trackId), [downloading]);

  return { offlineTracks, downloading, downloadTrack, removeOfflineTrack, isDownloaded, isDownloading, deviceId };
}
