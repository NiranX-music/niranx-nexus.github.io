import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface QuickLink {
  id: string;
  user_id: string;
  title: string;
  url: string;
  icon_name: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export function useQuickLinks() {
  const { user } = useAuth();
  const [quickLinks, setQuickLinks] = useState<QuickLink[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuickLinks = async () => {
    if (!user) {
      setQuickLinks([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('quick_links')
        .select('*')
        .eq('user_id', user.id)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setQuickLinks(data || []);
    } catch (error: any) {
      console.error('Error fetching quick links:', error);
      toast.error('Failed to load quick links');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuickLinks();
  }, [user]);

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('quick-links-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quick_links',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchQuickLinks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const addQuickLink = async (title: string, url: string, iconName: string) => {
    if (!user) return;

    try {
      const maxOrder = quickLinks.length > 0 
        ? Math.max(...quickLinks.map(q => q.order_index)) 
        : -1;

      const { error } = await supabase
        .from('quick_links')
        .insert({
          user_id: user.id,
          title,
          url,
          icon_name: iconName,
          order_index: maxOrder + 1,
        });

      if (error) throw error;
      
      toast.success('Quick link added successfully');
      fetchQuickLinks();
    } catch (error: any) {
      console.error('Error adding quick link:', error);
      toast.error('Failed to add quick link');
    }
  };

  const removeQuickLink = async (id: string) => {
    try {
      const { error } = await supabase
        .from('quick_links')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Quick link removed');
      fetchQuickLinks();
    } catch (error: any) {
      console.error('Error removing quick link:', error);
      toast.error('Failed to remove quick link');
    }
  };

  const reorderQuickLinks = async (reorderedLinks: QuickLink[]) => {
    try {
      const updates = reorderedLinks.map((link, index) => ({
        id: link.id,
        order_index: index,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('quick_links')
          .update({ order_index: update.order_index })
          .eq('id', update.id);

        if (error) throw error;
      }

      setQuickLinks(reorderedLinks);
    } catch (error: any) {
      console.error('Error reordering quick links:', error);
      toast.error('Failed to reorder quick links');
    }
  };

  return {
    quickLinks,
    loading,
    addQuickLink,
    removeQuickLink,
    reorderQuickLinks,
    refetch: fetchQuickLinks,
  };
}
