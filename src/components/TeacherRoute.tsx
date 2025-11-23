import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface TeacherRouteProps {
  children: React.ReactNode;
}

export function TeacherRoute({ children }: TeacherRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const [isTeacher, setIsTeacher] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkTeacherStatus();
  }, [user]);

  const checkTeacherStatus = async () => {
    if (!user) {
      setIsTeacher(false);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'teacher'
      });

      if (error) {
        console.error('Error checking teacher status:', error);
        setIsTeacher(false);
      } else {
        setIsTeacher(data === true);
      }
    } catch (error) {
      console.error('Error checking teacher status:', error);
      setIsTeacher(false);
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

  if (isTeacher === false) {
    toast({
      title: "Access denied",
      description: "You don't have permission to access the teacher portal",
      variant: "destructive",
    });
    return <Navigate to="/niranx/dashboard" replace />;
  }

  return <>{children}</>;
}
