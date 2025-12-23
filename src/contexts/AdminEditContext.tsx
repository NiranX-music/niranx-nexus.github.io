import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { toast } from 'sonner';

interface EditableContent {
  [key: string]: string;
}

interface AdminEditContextType {
  isEditMode: boolean;
  toggleEditMode: () => void;
  isAdmin: boolean;
  content: EditableContent;
  updateContent: (key: string, value: string) => Promise<void>;
  getContent: (key: string, defaultValue: string) => string;
  isSaving: boolean;
}

const AdminEditContext = createContext<AdminEditContextType | undefined>(undefined);

export function AdminEditProvider({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoading: adminLoading } = useAdminCheck();
  const [isEditMode, setIsEditMode] = useState(false);
  const [content, setContent] = useState<EditableContent>({});
  const [isSaving, setIsSaving] = useState(false);

  // Load all content on mount
  useEffect(() => {
    const loadContent = async () => {
      const { data, error } = await supabase
        .from('admin_editable_content')
        .select('content_key, content_value');
      
      if (data && !error) {
        const contentMap: EditableContent = {};
        data.forEach((item) => {
          contentMap[item.content_key] = item.content_value;
        });
        setContent(contentMap);
      }
    };
    loadContent();
  }, []);

  const toggleEditMode = useCallback(() => {
    if (!isAdmin) {
      toast.error('You must be an admin to edit content');
      return;
    }
    setIsEditMode((prev) => !prev);
    if (isEditMode) {
      toast.success('Edit mode disabled');
    } else {
      toast.info('Edit mode enabled - Click on any editable text to edit');
    }
  }, [isAdmin, isEditMode]);

  const updateContent = useCallback(async (key: string, value: string) => {
    if (!isAdmin) return;
    
    setIsSaving(true);
    try {
      const { data: existing } = await supabase
        .from('admin_editable_content')
        .select('id')
        .eq('content_key', key)
        .single();

      if (existing) {
        await supabase
          .from('admin_editable_content')
          .update({ content_value: value, updated_at: new Date().toISOString() })
          .eq('content_key', key);
      } else {
        await supabase
          .from('admin_editable_content')
          .insert({ content_key: key, content_value: value });
      }

      setContent((prev) => ({ ...prev, [key]: value }));
      toast.success('Content saved');
    } catch (error) {
      toast.error('Failed to save content');
    } finally {
      setIsSaving(false);
    }
  }, [isAdmin]);

  const getContent = useCallback((key: string, defaultValue: string) => {
    return content[key] || defaultValue;
  }, [content]);

  return (
    <AdminEditContext.Provider
      value={{
        isEditMode,
        toggleEditMode,
        isAdmin,
        content,
        updateContent,
        getContent,
        isSaving,
      }}
    >
      {children}
    </AdminEditContext.Provider>
  );
}

export function useAdminEdit() {
  const context = useContext(AdminEditContext);
  if (context === undefined) {
    throw new Error('useAdminEdit must be used within an AdminEditProvider');
  }
  return context;
}
