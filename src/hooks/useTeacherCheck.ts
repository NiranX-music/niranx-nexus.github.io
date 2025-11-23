import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useTeacherCheck() {
  const [isTeacher, setIsTeacher] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function checkTeacherRole() {
      if (!user) {
        setIsTeacher(false);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'teacher'
        });

        if (error) {
          console.error("Error checking teacher role:", error);
          setIsTeacher(false);
        } else {
          setIsTeacher(data === true);
        }
      } catch (error) {
        console.error("Error in teacher check:", error);
        setIsTeacher(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkTeacherRole();
  }, [user]);

  return { isTeacher, isLoading };
}
