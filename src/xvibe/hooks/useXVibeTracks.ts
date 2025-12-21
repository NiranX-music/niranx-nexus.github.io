import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { XVibeTrack, XVibeArtist, XVibeAlbum } from '../types';

export function useXVibeTracks() {
  const [tracks, setTracks] = useState<XVibeTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTracks();
  }, []);

  const fetchTracks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('xvibe_tracks')
        .select(`
          *,
          artist:xvibe_artists(*),
          album:xvibe_albums(*)
        `)
        .eq('status', 'live')
        .order('play_count', { ascending: false });

      if (error) throw error;
      setTracks(data as XVibeTrack[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { tracks, loading, error, refetch: fetchTracks };
}

export function useXVibeArtists() {
  const [artists, setArtists] = useState<XVibeArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('xvibe_artists')
        .select('*')
        .eq('status', 'approved')
        .order('monthly_listeners', { ascending: false });

      if (error) throw error;
      setArtists(data as XVibeArtist[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { artists, loading, error, refetch: fetchArtists };
}

export function useXVibeAlbums() {
  const [albums, setAlbums] = useState<XVibeAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('xvibe_albums')
        .select(`
          *,
          artist:xvibe_artists(*)
        `)
        .eq('status', 'live')
        .order('play_count', { ascending: false });

      if (error) throw error;
      setAlbums(data as XVibeAlbum[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { albums, loading, error, refetch: fetchAlbums };
}

export function useXVibeSearch(query: string) {
  const [results, setResults] = useState<{
    tracks: XVibeTrack[];
    artists: XVibeArtist[];
    albums: XVibeAlbum[];
  }>({ tracks: [], artists: [], albums: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setResults({ tracks: [], artists: [], albums: [] });
      return;
    }

    const debounce = setTimeout(() => {
      search(query);
    }, 300);

    return () => clearTimeout(debounce);
  }, [query]);

  const search = async (q: string) => {
    setLoading(true);
    try {
      const [tracksRes, artistsRes, albumsRes] = await Promise.all([
        supabase
          .from('xvibe_tracks')
          .select('*, artist:xvibe_artists(*)')
          .eq('status', 'live')
          .ilike('title', `%${q}%`)
          .limit(10),
        supabase
          .from('xvibe_artists')
          .select('*')
          .eq('status', 'approved')
          .ilike('name', `%${q}%`)
          .limit(10),
        supabase
          .from('xvibe_albums')
          .select('*, artist:xvibe_artists(*)')
          .eq('status', 'live')
          .ilike('title', `%${q}%`)
          .limit(10),
      ]);

      setResults({
        tracks: (tracksRes.data || []) as XVibeTrack[],
        artists: (artistsRes.data || []) as XVibeArtist[],
        albums: (albumsRes.data || []) as XVibeAlbum[],
      });
    } finally {
      setLoading(false);
    }
  };

  return { results, loading };
}

export function useXVibeListeningHistory() {
  const [history, setHistory] = useState<XVibeTrack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;

      const { data, error } = await supabase
        .from('xvibe_listening_history')
        .select(`
          *,
          track:xvibe_tracks(*, artist:xvibe_artists(*))
        `)
        .eq('user_id', session.session.user.id)
        .order('played_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setHistory(data?.map(h => h.track).filter(Boolean) as XVibeTrack[]);
    } finally {
      setLoading(false);
    }
  };

  return { history, loading, refetch: fetchHistory };
}
