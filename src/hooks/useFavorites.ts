import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Favorite {
  id: string;
  page_url: string;
  page_title: string;
  icon_name?: string;
  display_order: number;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setFavorites([]);
      setIsLoading(false);
    }
  }, [user]);

  async function fetchFavorites() {
    try {
      const { data, error } = await supabase
        .from("user_favorites")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function addFavorite(pageUrl: string, pageTitle: string, iconName?: string) {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("user_favorites")
        .insert({
          user_id: user.id,
          page_url: pageUrl,
          page_title: pageTitle,
          icon_name: iconName,
          display_order: favorites.length,
        });

      if (error) throw error;
      
      toast.success("Added to favorites");
      fetchFavorites();
    } catch (error: any) {
      if (error.code === "23505") {
        toast.error("Page already in favorites");
      } else {
        toast.error("Failed to add favorite");
      }
    }
  }

  async function removeFavorite(favoriteId: string) {
    try {
      const { error } = await supabase
        .from("user_favorites")
        .delete()
        .eq("id", favoriteId);

      if (error) throw error;
      
      toast.success("Removed from favorites");
      fetchFavorites();
    } catch (error) {
      toast.error("Failed to remove favorite");
    }
  }

  function isFavorite(pageUrl: string): boolean {
    return favorites.some(fav => fav.page_url === pageUrl);
  }

  async function reorderFavorites(newOrder: Favorite[]) {
    try {
      // Update display_order for all favorites
      const updates = newOrder.map((fav, index) => 
        supabase
          .from("user_favorites")
          .update({ display_order: index })
          .eq("id", fav.id)
      );

      await Promise.all(updates);
      setFavorites(newOrder);
    } catch (error) {
      console.error("Error reordering favorites:", error);
      toast.error("Failed to reorder favorites");
    }
  }

  return {
    favorites,
    isLoading,
    addFavorite,
    removeFavorite,
    isFavorite,
    reorderFavorites,
  };
}
