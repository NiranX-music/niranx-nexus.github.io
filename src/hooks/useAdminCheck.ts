import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useAdminCheck() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function checkRoles() {
      if (!user) {
        setIsAdmin(false);
        setIsModerator(false);
        setIsLoading(false);
        return;
      }

      try {
        // Check both admin and moderator roles in parallel
        const [adminResult, moderatorResult] = await Promise.all([
          supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' }),
          supabase.rpc('has_role', { _user_id: user.id, _role: 'moderator' })
        ]);

        if (adminResult.error) {
          console.error("Error checking admin role:", adminResult.error);
          setIsAdmin(false);
        } else {
          setIsAdmin(adminResult.data === true);
        }

        if (moderatorResult.error) {
          console.error("Error checking moderator role:", moderatorResult.error);
          setIsModerator(false);
        } else {
          setIsModerator(moderatorResult.data === true);
        }
      } catch (error) {
        console.error("Error in role check:", error);
        setIsAdmin(false);
        setIsModerator(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkRoles();
  }, [user]);

  return { isAdmin, isModerator, isLoading };
}
