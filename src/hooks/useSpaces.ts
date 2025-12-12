import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Space {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  space_url: string;
  has_password: boolean;
  is_public: boolean;
  is_active: boolean;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  owner_name?: string;
  owner_avatar?: string;
}

export interface CreateSpaceData {
  name: string;
  description?: string;
  space_url?: string;
  pin: string;
  password?: string;
  is_public: boolean;
}

export function useSpaces() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [activeSpace, setActiveSpace] = useState<Space | null>(null);
  const [publicSpaces, setPublicSpaces] = useState<Space[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [spaceLimit, setSpaceLimit] = useState(5);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchSpaces();
      fetchSpaceLimit();
    } else {
      setSpaces([]);
      setActiveSpace(null);
      setIsLoading(false);
    }
  }, [user]);

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('spaces-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'spaces', filter: `user_id=eq.${user.id}` },
        () => fetchSpaces()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  async function fetchSpaces() {
    try {
      const { data, error } = await supabase
        .from("spaces")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const userSpaces = (data || []).filter(s => s.user_id === user?.id);
      setSpaces(userSpaces as Space[]);
      
      const active = userSpaces.find(s => s.is_active);
      setActiveSpace(active as Space || null);
    } catch (error) {
      console.error("Error fetching spaces:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchSpaceLimit() {
    if (!user) return;
    
    try {
      // Check user-specific limit
      const { data: userLimit } = await supabase
        .from("user_space_limits")
        .select("max_spaces")
        .eq("user_id", user.id)
        .single();

      if (userLimit) {
        setSpaceLimit(userLimit.max_spaces);
        return;
      }

      // Fall back to default
      const { data: defaultLimit } = await supabase
        .from("admin_settings")
        .select("setting_value")
        .eq("setting_key", "default_space_limit")
        .single();

      if (defaultLimit) {
        setSpaceLimit(Number(defaultLimit.setting_value) || 5);
      }
    } catch (error) {
      console.error("Error fetching space limit:", error);
    }
  }

  async function fetchPublicSpaces() {
    try {
      const { data, error } = await supabase
        .from("spaces")
        .select("*")
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch owner profiles
      const userIds = [...new Set((data || []).map(s => s.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .in("id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      const spacesWithOwners = (data || []).map(space => ({
        ...space,
        owner_name: profileMap.get(space.user_id)?.display_name || "Unknown",
        owner_avatar: profileMap.get(space.user_id)?.avatar_url
      }));

      setPublicSpaces(spacesWithOwners as Space[]);
      return spacesWithOwners;
    } catch (error) {
      console.error("Error fetching public spaces:", error);
      return [];
    }
  }

  async function createSpace(data: CreateSpaceData) {
    if (!user) return null;

    if (spaces.length >= spaceLimit) {
      toast.error(`You've reached your space limit (${spaceLimit})`);
      return null;
    }

    try {
      // Generate space URL if not provided
      const spaceUrl = data.space_url || `space-${Date.now().toString(36)}`;

      // Hash PIN (simple hash for demo - in production use bcrypt)
      const pinHash = btoa(data.pin);
      const passwordHash = data.password ? btoa(data.password) : null;

      const { data: newSpace, error } = await supabase
        .from("spaces")
        .insert({
          user_id: user.id,
          name: data.name,
          description: data.description,
          space_url: spaceUrl,
          pin_hash: pinHash,
          password_hash: passwordHash,
          has_password: !!data.password,
          is_public: data.is_public,
          is_active: false
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          toast.error("Space URL already taken. Please choose another.");
        } else {
          throw error;
        }
        return null;
      }

      toast.success(`Space "${data.name}" created successfully!`);
      fetchSpaces();
      return newSpace;
    } catch (error) {
      console.error("Error creating space:", error);
      toast.error("Failed to create space");
      return null;
    }
  }

  async function switchToSpace(spaceId: string, pin: string, password?: string) {
    try {
      const space = spaces.find(s => s.id === spaceId);
      if (!space) {
        toast.error("Space not found");
        return false;
      }

      // Verify PIN
      if (btoa(pin) !== (space as any).pin_hash) {
        toast.error("Incorrect PIN");
        return false;
      }

      // Verify password if required
      if (space.has_password && (!password || btoa(password) !== (space as any).password_hash)) {
        toast.error("Incorrect password");
        return false;
      }

      // Deactivate all spaces
      await supabase
        .from("spaces")
        .update({ is_active: false })
        .eq("user_id", user?.id);

      // Activate selected space
      const { error } = await supabase
        .from("spaces")
        .update({ is_active: true })
        .eq("id", spaceId);

      if (error) throw error;

      setActiveSpace(space);
      toast.success(`Switched to "${space.name}"`);
      fetchSpaces();
      return true;
    } catch (error) {
      console.error("Error switching space:", error);
      toast.error("Failed to switch space");
      return false;
    }
  }

  async function exitSpace() {
    if (!user || !activeSpace) return;

    try {
      await supabase
        .from("spaces")
        .update({ is_active: false })
        .eq("id", activeSpace.id);

      setActiveSpace(null);
      toast.success("Exited space");
      fetchSpaces();
    } catch (error) {
      console.error("Error exiting space:", error);
    }
  }

  async function deleteSpace(spaceId: string) {
    try {
      const { error } = await supabase
        .from("spaces")
        .delete()
        .eq("id", spaceId);

      if (error) throw error;

      toast.success("Space deleted");
      if (activeSpace?.id === spaceId) {
        setActiveSpace(null);
      }
      fetchSpaces();
    } catch (error) {
      console.error("Error deleting space:", error);
      toast.error("Failed to delete space");
    }
  }

  async function updateSpace(spaceId: string, updates: Partial<Space>) {
    try {
      const { error } = await supabase
        .from("spaces")
        .update(updates)
        .eq("id", spaceId);

      if (error) throw error;

      toast.success("Space updated");
      fetchSpaces();
    } catch (error) {
      console.error("Error updating space:", error);
      toast.error("Failed to update space");
    }
  }

  return {
    spaces,
    activeSpace,
    publicSpaces,
    isLoading,
    spaceLimit,
    createSpace,
    switchToSpace,
    exitSpace,
    deleteSpace,
    updateSpace,
    fetchPublicSpaces,
    refetch: fetchSpaces
  };
}
