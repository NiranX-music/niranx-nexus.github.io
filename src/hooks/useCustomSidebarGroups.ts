import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SidebarCategory {
  id: string;
  name: string;
  icon: string | null;
  order_index: number;
}

export interface CustomSidebarGroup {
  id: string;
  name: string;
  icon: string | null;
  order_index: number;
  is_enabled: boolean;
  is_default: boolean;
  category_id?: string | null;
}

export interface CustomSidebarPage {
  id: string;
  group_id: string | null;
  title: string;
  url: string;
  icon: string | null;
  order_index: number;
  is_enabled: boolean;
  disabled_until: string | null;
}

export function useCustomSidebarGroups() {
  const [categories, setCategories] = useState<SidebarCategory[]>([]);
  const [groups, setGroups] = useState<CustomSidebarGroup[]>([]);
  const [pages, setPages] = useState<CustomSidebarPage[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [catsRes, groupsRes, pagesRes] = await Promise.all([
        supabase.from('sidebar_categories').select('*').order('order_index'),
        supabase.from('sidebar_groups').select('*').eq('is_enabled', true).order('order_index'),
        supabase.from('sidebar_pages').select('*').eq('is_enabled', true).order('order_index')
      ]);

      if (groupsRes.error) throw groupsRes.error;
      if (pagesRes.error) throw pagesRes.error;

      // Filter out pages that are temporarily disabled
      const now = new Date();
      const activePagesData = (pagesRes.data || []).filter(page => {
        if (!page.disabled_until) return true;
        return new Date(page.disabled_until) <= now;
      });

      setCategories((catsRes.data as SidebarCategory[]) || []);
      setGroups(groupsRes.data || []);
      setPages(activePagesData);
    } catch (error) {
      console.error('Error loading custom sidebar groups:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getGroupPages = (groupId: string) => {
    return pages.filter(p => p.group_id === groupId).sort((a, b) => a.order_index - b.order_index);
  };

  const getRootPages = () => {
    return pages.filter(p => p.group_id === null).sort((a, b) => a.order_index - b.order_index);
  };

  const getCategoryGroups = (categoryId: string) => {
    return groups.filter(g => g.category_id === categoryId).sort((a, b) => a.order_index - b.order_index);
  };

  const getUncategorizedGroups = () => {
    return groups.filter(g => !g.category_id).sort((a, b) => a.order_index - b.order_index);
  };

  return {
    categories,
    groups,
    pages,
    loading,
    getGroupPages,
    getRootPages,
    getCategoryGroups,
    getUncategorizedGroups,
    reload: loadData
  };
}
