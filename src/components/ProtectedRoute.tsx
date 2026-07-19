import { ReactNode, useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useGuestMode } from '@/contexts/GuestModeContext';
import { GuestModeDialog } from '@/components/GuestModeDialog';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: ReactNode;
}

// Only the Focus Session is publicly accessible without auth
const PUBLIC_ROUTES = ['/focus-engine', '/niranx/focus', '/', '/velorah', '/jack'];

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const { isGuestMode } = useGuestMode();
  const location = useLocation();
  const [showGuestDialog, setShowGuestDialog] = useState(!user && !isGuestMode);
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('user_id', user.id)
          .maybeSingle();
        setOnboardingCompleted(data?.onboarding_completed ?? false);
      }
      setOnboardingChecked(true);
    };
    if (!loading && user) {
      checkOnboarding();
    } else if (!loading) {
      setOnboardingChecked(true);
    }
  }, [user, loading]);

  if (loading || (user && !onboardingChecked)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // If user is logged in but onboarding not completed, redirect to setup
  if (user && !onboardingCompleted && location.pathname !== '/welcome-setup') {
    return <Navigate to="/welcome-setup" replace />;
  }

  // If user is logged in, allow access
  if (user) {
    return <>{children}</>;
  }

  // Public routes (Focus Session) are accessible without auth
  if (PUBLIC_ROUTES.includes(location.pathname)) {
    return <>{children}</>;
  }

  // Everything else requires sign-in
  return (
    <Navigate
      to="/sign-in-required"
      replace
      state={{ from: location.pathname }}
    />
  );
};
