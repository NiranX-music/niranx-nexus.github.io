import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useGuestMode } from '@/contexts/GuestModeContext';
import { Lock, User, UserPlus } from 'lucide-react';

interface GuestModeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GuestModeDialog({ open, onOpenChange }: GuestModeDialogProps) {
  const navigate = useNavigate();
  const { enableGuestMode } = useGuestMode();

  const handleGuestMode = () => {
    enableGuestMode();
    navigate('/niranx/focus');
    onOpenChange(false);
  };

  const handleLogin = () => {
    navigate('/auth');
    onOpenChange(false);
  };

  const handleSignup = () => {
    navigate('/auth');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <Lock className="w-12 h-12 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">Login to Visit This Page</DialogTitle>
          <DialogDescription className="text-center text-base">
            This page requires authentication. You can continue in guest mode with limited access to Focus Engine only.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          <Button 
            onClick={handleGuestMode} 
            variant="outline" 
            className="w-full h-12 text-base"
          >
            <User className="w-5 h-5 mr-2" />
            Continue in Guest Mode
          </Button>

          <Button 
            onClick={handleLogin} 
            className="w-full h-12 text-base"
          >
            <Lock className="w-5 h-5 mr-2" />
            Login
          </Button>

          <Button 
            onClick={handleSignup} 
            variant="secondary" 
            className="w-full h-12 text-base"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Create Account
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-4">
          Guest mode provides access to Focus Engine only. Create an account for full access.
        </p>
      </DialogContent>
    </Dialog>
  );
}
