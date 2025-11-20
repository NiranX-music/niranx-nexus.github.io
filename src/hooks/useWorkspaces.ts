import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  favorites: any[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchWorkspaces();
    } else {
      setWorkspaces([]);
      setActiveWorkspace(null);
      setIsLoading(false);
    }
  }, [user]);

  async function fetchWorkspaces() {
    try {
      const { data, error } = await supabase
        .from("workspaces")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const workspaceData = (data || []).map(w => ({
        ...w,
        favorites: Array.isArray(w.favorites) ? w.favorites : [],
        description: w.description || undefined,
        icon: w.icon || undefined,
      }));
      
      setWorkspaces(workspaceData);
      const active = workspaceData.find(w => w.is_active);
      setActiveWorkspace(active || null);
    } catch (error) {
      console.error("Error fetching workspaces:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function createWorkspace(name: string, description?: string, icon?: string) {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("workspaces")
        .insert({
          user_id: user.id,
          name,
          description,
          icon,
          favorites: [],
          is_active: false,
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success(`Workspace "${name}" created`);
      fetchWorkspaces();
      return data;
    } catch (error) {
      toast.error("Failed to create workspace");
      console.error(error);
    }
  }

  async function switchWorkspace(workspaceId: string) {
    if (!user) return;

    try {
      // Deactivate all workspaces
      await supabase
        .from("workspaces")
        .update({ is_active: false })
        .eq("user_id", user.id);

      // Activate selected workspace
      const { data, error } = await supabase
        .from("workspaces")
        .update({ is_active: true })
        .eq("id", workspaceId)
        .select()
        .single();

      if (error) throw error;

      const workspaceData = {
        ...data,
        favorites: Array.isArray(data.favorites) ? data.favorites : [],
        description: data.description || undefined,
        icon: data.icon || undefined,
      };

      setActiveWorkspace(workspaceData);
      toast.success(`Switched to "${data.name}"`);
      fetchWorkspaces();
    } catch (error) {
      toast.error("Failed to switch workspace");
      console.error(error);
    }
  }

  async function updateWorkspace(workspaceId: string, updates: Partial<Workspace>) {
    try {
      const { error } = await supabase
        .from("workspaces")
        .update(updates)
        .eq("id", workspaceId);

      if (error) throw error;
      
      toast.success("Workspace updated");
      fetchWorkspaces();
    } catch (error) {
      toast.error("Failed to update workspace");
      console.error(error);
    }
  }

  async function deleteWorkspace(workspaceId: string) {
    try {
      const { error } = await supabase
        .from("workspaces")
        .delete()
        .eq("id", workspaceId);

      if (error) throw error;
      
      toast.success("Workspace deleted");
      fetchWorkspaces();
    } catch (error) {
      toast.error("Failed to delete workspace");
      console.error(error);
    }
  }

  async function saveCurrentState(workspaceId: string, favorites: any[]) {
    try {
      const { error } = await supabase
        .from("workspaces")
        .update({ favorites })
        .eq("id", workspaceId);

      if (error) throw error;
    } catch (error) {
      console.error("Failed to save workspace state:", error);
    }
  }

  return {
    workspaces,
    activeWorkspace,
    isLoading,
    createWorkspace,
    switchWorkspace,
    updateWorkspace,
    deleteWorkspace,
    saveCurrentState,
  };
}
