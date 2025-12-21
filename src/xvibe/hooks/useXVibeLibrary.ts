import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { XVibeTrack, XVibePlaylist, XVibeAlbum, XVibeArtist } from '../types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useXVibeLikes() {
  const { user } = useAuth();
  const [likedTracks, setLikedTracks] = useState<XVibeTrack[]>([]);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchLikedTracks();
  }, [user]);

  const fetchLikedTracks = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('xvibe_likes')
        .select(`
          track_id,
          track:xvibe_tracks(*, artist:xvibe_artists(*))
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      const tracks = data?.map(l => l.track).filter(Boolean) as XVibeTrack[];
      setLikedTracks(tracks);
      setLikedIds(new Set(data?.map(l => l.track_id)));
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = useCallback(async (trackId: string) => {
    if (!user) {
      toast.error('Please sign in to like tracks');
      return;
    }

    const isLiked = likedIds.has(trackId);

    if (isLiked) {
      await supabase
        .from('xvibe_likes')
        .delete()
        .eq('user_id', user.id)
        .eq('track_id', trackId);
      
      setLikedIds(prev => {
        const next = new Set(prev);
        next.delete(trackId);
        return next;
      });
      setLikedTracks(prev => prev.filter(t => t.id !== trackId));
    } else {
      await supabase
        .from('xvibe_likes')
        .insert({ user_id: user.id, track_id: trackId });
      
      setLikedIds(prev => new Set([...prev, trackId]));
      // Refetch to get full track data
      fetchLikedTracks();
    }
  }, [user, likedIds]);

  const isLiked = useCallback((trackId: string) => likedIds.has(trackId), [likedIds]);

  return { likedTracks, loading, toggleLike, isLiked, refetch: fetchLikedTracks };
}

export function useXVibePlaylists() {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState<XVibePlaylist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchPlaylists();
  }, [user]);

  const fetchPlaylists = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('xvibe_playlists')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setPlaylists(data as XVibePlaylist[]);
    } finally {
      setLoading(false);
    }
  };

  const createPlaylist = async (name: string, description?: string) => {
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('xvibe_playlists')
      .insert({
        user_id: user.id,
        name,
        description,
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to create playlist');
      return null;
    }

    setPlaylists(prev => [data as XVibePlaylist, ...prev]);
    toast.success('Playlist created');
    return data;
  };

  const addTrackToPlaylist = async (playlistId: string, trackId: string) => {
    const { count } = await supabase
      .from('xvibe_playlist_tracks')
      .select('*', { count: 'exact', head: true })
      .eq('playlist_id', playlistId);

    const { error } = await supabase
      .from('xvibe_playlist_tracks')
      .insert({
        playlist_id: playlistId,
        track_id: trackId,
        position: (count || 0) + 1,
        added_by: user?.id,
      });

    if (error) {
      if (error.code === '23505') {
        toast.error('Track already in playlist');
      } else {
        toast.error('Failed to add track');
      }
      return false;
    }

    toast.success('Added to playlist');
    return true;
  };

  const deletePlaylist = async (playlistId: string) => {
    const { error } = await supabase
      .from('xvibe_playlists')
      .delete()
      .eq('id', playlistId);

    if (error) {
      toast.error('Failed to delete playlist');
      return false;
    }

    setPlaylists(prev => prev.filter(p => p.id !== playlistId));
    toast.success('Playlist deleted');
    return true;
  };

  return {
    playlists,
    loading,
    createPlaylist,
    addTrackToPlaylist,
    deletePlaylist,
    refetch: fetchPlaylists,
  };
}

export function useXVibeFollowedArtists() {
  const { user } = useAuth();
  const [artists, setArtists] = useState<XVibeArtist[]>([]);
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchFollowedArtists();
  }, [user]);

  const fetchFollowedArtists = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('xvibe_artist_followers')
        .select(`
          artist_id,
          artist:xvibe_artists(*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      const artistList = data?.map(f => f.artist).filter(Boolean) as XVibeArtist[];
      setArtists(artistList);
      setFollowedIds(new Set(data?.map(f => f.artist_id)));
    } finally {
      setLoading(false);
    }
  };

  const toggleFollow = useCallback(async (artistId: string) => {
    if (!user) {
      toast.error('Please sign in to follow artists');
      return;
    }

    const isFollowing = followedIds.has(artistId);

    if (isFollowing) {
      await supabase
        .from('xvibe_artist_followers')
        .delete()
        .eq('user_id', user.id)
        .eq('artist_id', artistId);
      
      setFollowedIds(prev => {
        const next = new Set(prev);
        next.delete(artistId);
        return next;
      });
      setArtists(prev => prev.filter(a => a.id !== artistId));
      toast.success('Unfollowed artist');
    } else {
      await supabase
        .from('xvibe_artist_followers')
        .insert({ user_id: user.id, artist_id: artistId });
      
      setFollowedIds(prev => new Set([...prev, artistId]));
      fetchFollowedArtists();
      toast.success('Following artist');
    }
  }, [user, followedIds]);

  const isFollowing = useCallback((artistId: string) => followedIds.has(artistId), [followedIds]);

  return { artists, loading, toggleFollow, isFollowing, refetch: fetchFollowedArtists };
}

export function useXVibeSavedAlbums() {
  const { user } = useAuth();
  const [albums, setAlbums] = useState<XVibeAlbum[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchSavedAlbums();
  }, [user]);

  const fetchSavedAlbums = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('xvibe_saved_albums')
        .select(`
          album_id,
          album:xvibe_albums(*, artist:xvibe_artists(*))
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      const albumList = data?.map(s => s.album).filter(Boolean) as XVibeAlbum[];
      setAlbums(albumList);
      setSavedIds(new Set(data?.map(s => s.album_id)));
    } finally {
      setLoading(false);
    }
  };

  const toggleSave = useCallback(async (albumId: string) => {
    if (!user) {
      toast.error('Please sign in to save albums');
      return;
    }

    const isSaved = savedIds.has(albumId);

    if (isSaved) {
      await supabase
        .from('xvibe_saved_albums')
        .delete()
        .eq('user_id', user.id)
        .eq('album_id', albumId);
      
      setSavedIds(prev => {
        const next = new Set(prev);
        next.delete(albumId);
        return next;
      });
      setAlbums(prev => prev.filter(a => a.id !== albumId));
    } else {
      await supabase
        .from('xvibe_saved_albums')
        .insert({ user_id: user.id, album_id: albumId });
      
      setSavedIds(prev => new Set([...prev, albumId]));
      fetchSavedAlbums();
    }
  }, [user, savedIds]);

  const isSaved = useCallback((albumId: string) => savedIds.has(albumId), [savedIds]);

  return { albums, loading, toggleSave, isSaved, refetch: fetchSavedAlbums };
}
