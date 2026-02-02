import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { action, ...params } = await req.json();

    // Get user's Spotify token
    const { data: tokenData, error: tokenError } = await supabaseClient
      .from('spotify_tokens')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (tokenError || !tokenData) {
      return new Response(
        JSON.stringify({ error: 'Spotify not connected', needsAuth: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Check if token is expired and refresh if needed
    let accessToken = tokenData.access_token;
    if (new Date(tokenData.expires_at) <= new Date()) {
      const refreshResponse = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: tokenData.refresh_token,
          client_id: Deno.env.get('SPOTIFY_CLIENT_ID') ?? '',
          client_secret: Deno.env.get('SPOTIFY_CLIENT_SECRET') ?? '',
        }),
      });

      if (!refreshResponse.ok) {
        throw new Error('Failed to refresh token');
      }

      const refreshData = await refreshResponse.json();
      accessToken = refreshData.access_token;

      // Update token in database
      await supabaseClient
        .from('spotify_tokens')
        .update({
          access_token: refreshData.access_token,
          expires_at: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);
    }

    let result;
    
    switch (action) {
      case 'search':
        const searchResponse = await fetch(
          `https://api.spotify.com/v1/search?q=${encodeURIComponent(params.query)}&type=track&limit=${params.limit || 20}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        result = await searchResponse.json();
        break;

      case 'getRecentlyPlayed':
        const recentResponse = await fetch(
          'https://api.spotify.com/v1/me/player/recently-played?limit=20',
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        result = await recentResponse.json();
        break;

      case 'getCurrentlyPlaying':
        const currentResponse = await fetch(
          'https://api.spotify.com/v1/me/player/currently-playing',
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (currentResponse.status === 204) {
          result = { item: null };
        } else {
          result = await currentResponse.json();
        }
        break;

      case 'getTopTracks':
        const topTracksResponse = await fetch(
          `https://api.spotify.com/v1/me/top/tracks?limit=${params.limit || 20}&time_range=${params.time_range || 'medium_term'}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        result = await topTracksResponse.json();
        break;

      case 'getTopArtists':
        const topArtistsResponse = await fetch(
          `https://api.spotify.com/v1/me/top/artists?limit=${params.limit || 20}&time_range=${params.time_range || 'medium_term'}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        result = await topArtistsResponse.json();
        break;

      case 'getPlaylists':
        const { data: playlists } = await supabaseClient
          .from('spotify_playlists')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        result = playlists;
        break;

      case 'createPlaylist':
        const { data: newPlaylist } = await supabaseClient
          .from('spotify_playlists')
          .insert({
            user_id: user.id,
            name: params.name,
            description: params.description,
            is_public: params.is_public ?? true,
          })
          .select()
          .single();
        result = newPlaylist;
        break;

      case 'deletePlaylist':
        await supabaseClient
          .from('spotify_playlists')
          .delete()
          .eq('id', params.playlistId)
          .eq('user_id', user.id);
        result = { success: true };
        break;

      case 'getPlaylistTracks':
        const { data: tracks } = await supabaseClient
          .from('spotify_playlist_tracks')
          .select('*')
          .eq('playlist_id', params.playlistId)
          .order('added_at', { ascending: false });
        result = tracks;
        break;

      case 'addTrackToPlaylist':
        const { data: addedTrack } = await supabaseClient
          .from('spotify_playlist_tracks')
          .insert({
            playlist_id: params.playlistId,
            spotify_track_id: params.track.id,
            track_name: params.track.name,
            artist_name: params.track.artists[0].name,
            album_name: params.track.album?.name,
            album_image_url: params.track.album?.images[0]?.url,
            duration_ms: params.track.duration_ms,
          })
          .select()
          .single();
        result = addedTrack;
        break;

      case 'removeTrackFromPlaylist':
        await supabaseClient
          .from('spotify_playlist_tracks')
          .delete()
          .eq('id', params.trackId);
        result = { success: true };
        break;

      case 'getFavorites':
        const { data: favorites } = await supabaseClient
          .from('spotify_favorites')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        result = favorites;
        break;

      case 'addFavorite':
        const { data: favorite } = await supabaseClient
          .from('spotify_favorites')
          .insert({
            user_id: user.id,
            spotify_track_id: params.track.id,
            track_name: params.track.name,
            artist_name: params.track.artists[0].name,
            album_name: params.track.album?.name,
            album_image_url: params.track.album?.images[0]?.url,
            duration_ms: params.track.duration_ms,
          })
          .select()
          .single();
        result = favorite;
        break;

      case 'removeFavorite':
        await supabaseClient
          .from('spotify_favorites')
          .delete()
          .eq('spotify_track_id', params.trackId)
          .eq('user_id', user.id);
        result = { success: true };
        break;

      default:
        throw new Error('Invalid action');
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});