import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useXVibeLikes() {
  const [likedTracks, setLikedTracks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLikedTracks();
  }, []);

  const fetchLikedTracks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('xvibe_likes')
        .select('track_id')
        .eq('user_id', user.id);

      setLikedTracks(new Set((data || []).map(l => l.track_id)));
    } catch (error) {
      console.error('Error fetching likes:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = useCallback(async (trackId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Sign in to save tracks');
      return;
    }

    const isLiked = likedTracks.has(trackId);

    setLikedTracks(prev => {
      const next = new Set(prev);
      if (isLiked) {
        next.delete(trackId);
      } else {
        next.add(trackId);
      }
      return next;
    });

    try {
      if (isLiked) {
        await supabase
          .from('xvibe_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('track_id', trackId);
      } else {
        await supabase
          .from('xvibe_likes')
          .insert({
            user_id: user.id,
            track_id: trackId
          });
        toast.success('Added to Liked Songs');
      }
    } catch (error) {
      setLikedTracks(prev => {
        const next = new Set(prev);
        if (isLiked) {
          next.add(trackId);
        } else {
          next.delete(trackId);
        }
        return next;
      });
      console.error('Error toggling like:', error);
      toast.error('Failed to update');
    }
  }, [likedTracks]);

  const isLiked = useCallback((trackId: string) => {
    return likedTracks.has(trackId);
  }, [likedTracks]);

  return { likedTracks, toggleLike, isLiked, loading };
}
