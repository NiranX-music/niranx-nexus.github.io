import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSpotify = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsConnected(false);
        return;
      }

      const { data, error } = await supabase
        .from('spotify_tokens')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setIsConnected(!!data);
    } catch (error) {
      console.error('Error checking Spotify connection:', error);
    } finally {
      setLoading(false);
    }
  };

  const callSpotifyAPI = async (action: string, params?: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('spotify-api', {
        body: { action, ...params },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      if (error.message?.includes('Spotify not connected')) {
        setIsConnected(false);
        toast({
          title: "Spotify Not Connected",
          description: "Please connect your Spotify account in Settings",
          variant: "destructive",
        });
      }
      return { data: null, error };
    }
  };

  const searchTracks = async (query: string, limit = 20) => {
    return callSpotifyAPI('search', { query, limit });
  };

  const getPlaylists = async () => {
    return callSpotifyAPI('getPlaylists');
  };

  const createPlaylist = async (name: string, description?: string, is_public = true) => {
    return callSpotifyAPI('createPlaylist', { name, description, is_public });
  };

  const deletePlaylist = async (playlistId: string) => {
    return callSpotifyAPI('deletePlaylist', { playlistId });
  };

  const getPlaylistTracks = async (playlistId: string) => {
    return callSpotifyAPI('getPlaylistTracks', { playlistId });
  };

  const addTrackToPlaylist = async (playlistId: string, track: any) => {
    return callSpotifyAPI('addTrackToPlaylist', { playlistId, track });
  };

  const removeTrackFromPlaylist = async (trackId: string) => {
    return callSpotifyAPI('removeTrackFromPlaylist', { trackId });
  };

  const getFavorites = async () => {
    return callSpotifyAPI('getFavorites');
  };

  const addFavorite = async (track: any) => {
    return callSpotifyAPI('addFavorite', { track });
  };

  const removeFavorite = async (trackId: string) => {
    return callSpotifyAPI('removeFavorite', { trackId });
  };

  const openInSpotify = (trackId: string) => {
    window.open(`https://open.spotify.com/track/${trackId}`, '_blank');
  };

  return {
    isConnected,
    loading,
    searchTracks,
    getPlaylists,
    createPlaylist,
    deletePlaylist,
    getPlaylistTracks,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    getFavorites,
    addFavorite,
    removeFavorite,
    openInSpotify,
    checkConnection,
  };
};