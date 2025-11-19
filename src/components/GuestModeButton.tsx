import { Button } from '@/components/ui/button';
import { useGuestMode } from '@/contexts/GuestModeContext';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';

export function GuestModeButton() {
  const { enableGuestMode } = useGuestMode();
  const navigate = useNavigate();

  const handleGuestMode = () => {
    enableGuestMode();
    navigate('/niranx/focus');
  };

  return (
    <Button 
      size="lg" 
      variant="outline" 
      className="text-lg px-8 py-6"
      onClick={handleGuestMode}
    >
      <User className="mr-2 h-5 w-5" />
      Try Guest Mode
    </Button>
  );
}
