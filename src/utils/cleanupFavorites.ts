import { supabase } from "@/integrations/supabase/client";
import { getValidIconOrFallback, isValidLucideIcon } from "@/lib/iconValidator";
import { toast } from "sonner";

export async function cleanupInvalidFavoriteIcons(userId: string) {
  try {
    // Fetch all favorites for the user
    const { data: favorites, error: fetchError } = await supabase
      .from("user_favorites")
      .select("*")
      .eq("user_id", userId);

    if (fetchError) throw fetchError;
    if (!favorites || favorites.length === 0) return;

    // Find favorites with invalid icons
    const invalidFavorites = favorites.filter(
      (fav) => fav.icon_name && !isValidLucideIcon(fav.icon_name)
    );

    if (invalidFavorites.length === 0) {
      console.log("No invalid favorite icons found");
      return;
    }

    // Update each invalid favorite
    const updates = invalidFavorites.map((fav) =>
      supabase
        .from("user_favorites")
        .update({ icon_name: getValidIconOrFallback(fav.icon_name) })
        .eq("id", fav.id)
    );

    await Promise.all(updates);

    console.log(`Cleaned up ${invalidFavorites.length} invalid favorite icons`);
    toast.success(`Fixed ${invalidFavorites.length} invalid favorite icons`);
  } catch (error) {
    console.error("Error cleaning up favorite icons:", error);
  }
}
