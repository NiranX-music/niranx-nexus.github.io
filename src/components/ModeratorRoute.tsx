import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface ModeratorRouteProps {
  children: React.ReactNode;
}

export function ModeratorRoute({ children }: ModeratorRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const [isModerator, setIsModerator] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkModeratorStatus();
  }, [user]);

  const checkModeratorStatus = async () => {
    if (!user) {
      setIsModerator(false);
      setLoading(false);
      return;
    }

    try {
      // Check if user has moderator or admin role
      const { data: moderatorData, error: moderatorError } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'moderator'
      });

      const { data: adminData, error: adminError } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });

      if (moderatorError || adminError) {
        console.error('Error checking moderator status:', moderatorError || adminError);
        setIsModerator(false);
      } else {
        setIsModerator(moderatorData === true || adminData === true);
      }
    } catch (error) {
      console.error('Error checking moderator status:', error);
      setIsModerator(false);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    toast({
      title: "Authentication required",
      description: "Please sign in to access this page",
      variant: "destructive",
    });
    return <Navigate to="/niranx/auth" replace />;
  }

  if (isModerator === false) {
    toast({
      title: "Access denied",
      description: "You don't have permission to access this page",
      variant: "destructive",
    });
    return <Navigate to="/niranx/dashboard" replace />;
  }

  return <>{children}</>;
}