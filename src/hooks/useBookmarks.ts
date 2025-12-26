import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface BookmarkCollection {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  color: string;
  is_public: boolean;
  created_at: string;
}

export interface SmartBookmark {
  id: string;
  user_id: string;
  collection_id: string | null;
  url: string;
  title: string;
  description: string | null;
  favicon: string | null;
  category: string | null;
  tags: string[];
  ai_summary: string | null;
  created_at: string;
  updated_at: string;
}

export const useBookmarks = () => {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<SmartBookmark[]>([]);
  const [collections, setCollections] = useState<BookmarkCollection[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('smart_bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookmarks(data || []);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  };

  const fetchCollections = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('bookmark_collections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCollections(data || []);
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  };

  const createBookmark = async (bookmark: Omit<Partial<SmartBookmark>, 'url' | 'title'> & { url: string; title: string }) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('smart_bookmarks')
        .insert([{
          ...bookmark,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      setBookmarks([data, ...bookmarks]);
      toast.success('Bookmark added!');
      return data;
    } catch (error) {
      console.error('Error creating bookmark:', error);
      toast.error('Failed to add bookmark');
    }
  };

  const updateBookmark = async (id: string, updates: Partial<SmartBookmark>) => {
    try {
      const { error } = await supabase
        .from('smart_bookmarks')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      setBookmarks(bookmarks.map(b => b.id === id ? { ...b, ...updates } : b));
      toast.success('Bookmark updated!');
    } catch (error) {
      console.error('Error updating bookmark:', error);
      toast.error('Failed to update bookmark');
    }
  };

  const deleteBookmark = async (id: string) => {
    try {
      const { error } = await supabase
        .from('smart_bookmarks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setBookmarks(bookmarks.filter(b => b.id !== id));
      toast.success('Bookmark deleted!');
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      toast.error('Failed to delete bookmark');
    }
  };

  const createCollection = async (collection: Omit<Partial<BookmarkCollection>, 'name'> & { name: string }) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('bookmark_collections')
        .insert([{
          ...collection,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      setCollections([data, ...collections]);
      toast.success('Collection created!');
      return data;
    } catch (error) {
      console.error('Error creating collection:', error);
      toast.error('Failed to create collection');
    }
  };

  const deleteCollection = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bookmark_collections')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setCollections(collections.filter(c => c.id !== id));
      toast.success('Collection deleted!');
    } catch (error) {
      console.error('Error deleting collection:', error);
      toast.error('Failed to delete collection');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchBookmarks(), fetchCollections()]);
      setLoading(false);
    };

    loadData();
  }, [user]);

  return {
    bookmarks,
    collections,
    loading,
    createBookmark,
    updateBookmark,
    deleteBookmark,
    createCollection,
    deleteCollection,
    refreshBookmarks: fetchBookmarks,
  };
};
