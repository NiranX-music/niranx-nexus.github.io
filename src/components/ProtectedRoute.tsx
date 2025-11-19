import { ReactNode, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useGuestMode } from '@/contexts/GuestModeContext';
import { GuestModeDialog } from '@/components/GuestModeDialog';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
}

// Routes accessible in guest mode
const GUEST_ALLOWED_ROUTES = ['/niranx/focus'];

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const { isGuestMode } = useGuestMode();
  const location = useLocation();
  const [showGuestDialog, setShowGuestDialog] = useState(!user && !isGuestMode);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // If user is logged in, allow access
  if (user) {
    return <>{children}</>;
  }

  // If in guest mode and route is allowed, allow access
  if (isGuestMode && GUEST_ALLOWED_ROUTES.includes(location.pathname)) {
    return <>{children}</>;
  }

  // If not logged in and not guest mode, show dialog
  if (!user && !isGuestMode) {
    return (
      <>
        <GuestModeDialog open={showGuestDialog} onOpenChange={setShowGuestDialog} />
        {children}
      </>
    );
  }

  // If in guest mode but trying to access restricted route, show dialog
  if (isGuestMode && !GUEST_ALLOWED_ROUTES.includes(location.pathname)) {
    return (
      <>
        <GuestModeDialog open={true} onOpenChange={() => {}} />
        {children}
      </>
    );
  }

  return <Navigate to="/auth" replace />;
};
