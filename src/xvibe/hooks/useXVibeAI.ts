import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RecommendedTrack {
  id: string;
  title: string;
  artist_name: string;
  cover_url: string | null;
  audio_url: string;
  score: number;
  reason: string;
}

export function useXVibeAI() {
  const [recommendations, setRecommendations] = useState<RecommendedTrack[]>([]);
  const [dailyMixes, setDailyMixes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAI();
  }, []);

  const initializeAI = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      await generateRecommendations(user.id);
    } catch (error) {
      console.error('Error initializing AI:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = async (userId: string) => {
    try {
      const { data: likes } = await supabase
        .from('xvibe_likes')
        .select('track_id')
        .eq('user_id', userId);

      const likedTrackIds = new Set((likes || []).map(l => l.track_id));

      const { data: tracks } = await supabase
        .from('xvibe_tracks')
        .select('id, title, cover_url, audio_url, genre, play_count, like_count, xvibe_artists(name)')
        .eq('status', 'approved')
        .order('play_count', { ascending: false })
        .limit(50);

      if (tracks) {
        const scored = tracks.map((track: any) => {
          let score = Math.random() * 50;
          if (track.play_count > 1000) score += 15;
          if (track.like_count > 100) score += 20;

          return {
            id: track.id,
            title: track.title,
            artist_name: track.xvibe_artists?.name || 'Unknown',
            cover_url: track.cover_url,
            audio_url: track.audio_url,
            score,
            reason: 'Recommended for you'
          };
        });

        setRecommendations(scored.sort((a, b) => b.score - a.score).slice(0, 20));
        
        setDailyMixes([{
          id: 'mix-discover',
          title: 'Discover Weekly',
          description: 'New music picked for you',
          tracks: scored.slice(0, 10),
          cover_gradient: 'from-purple-500 to-pink-500'
        }]);
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
    }
  };

  const trackPlay = useCallback(async (trackId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('xvibe_streams').insert({
        user_id: user.id,
        track_id: trackId
      });
    } catch (error) {
      console.error('Error tracking play:', error);
    }
  }, []);

  const refreshRecommendations = useCallback(async () => {
    setLoading(true);
    await initializeAI();
  }, []);

  return { recommendations, dailyMixes, loading, trackPlay, refreshRecommendations };
}
