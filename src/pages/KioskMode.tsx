import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Maximize, 
  Lock, 
  Unlock, 
  AlertTriangle, 
  Shield,
  X,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const KioskMode = () => {
  const navigate = useNavigate();
  const [isKioskActive, setIsKioskActive] = useState(false);
  const [exitPin, setExitPin] = useState('');
  const [userPin, setUserPin] = useState('');
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(true);
  const [confirmPin, setConfirmPin] = useState('');

  useEffect(() => {
    if (isKioskActive) {
      // Request fullscreen
      document.documentElement.requestFullscreen?.();

      // Prevent back navigation
      const preventBack = (e: PopStateEvent) => {
        window.history.pushState(null, '', window.location.href);
        setShowExitDialog(true);
      };

      window.history.pushState(null, '', window.location.href);
      window.addEventListener('popstate', preventBack);

      // Prevent context menu
      const preventContextMenu = (e: MouseEvent) => {
        e.preventDefault();
      };
      document.addEventListener('contextmenu', preventContextMenu);

      // Prevent certain keyboard shortcuts
      const preventKeys = (e: KeyboardEvent) => {
        // Prevent F11, Alt+F4, Ctrl+W, etc.
        if (
          e.key === 'F11' ||
          (e.altKey && e.key === 'F4') ||
          (e.ctrlKey && e.key === 'w') ||
          (e.ctrlKey && e.key === 'q')
        ) {
          e.preventDefault();
          setShowExitDialog(true);
        }
      };
      document.addEventListener('keydown', preventKeys);

      return () => {
        window.removeEventListener('popstate', preventBack);
        document.removeEventListener('contextmenu', preventContextMenu);
        document.removeEventListener('keydown', preventKeys);
      };
    }
  }, [isKioskActive]);

  const setupPin = () => {
    if (exitPin.length < 4) {
      toast.error('PIN must be at least 4 digits');
      return;
    }
    if (exitPin !== confirmPin) {
      toast.error('PINs do not match');
      return;
    }
    setShowPinSetup(false);
    toast.success('PIN set successfully');
  };

  const activateKiosk = () => {
    if (!exitPin) {
      toast.error('Please set up a PIN first');
      return;
    }
    setIsKioskActive(true);
    toast.success('Kiosk Mode Activated', {
      description: 'The page is now locked. Use your PIN to exit.'
    });
  };

  const attemptExit = () => {
    if (userPin === exitPin) {
      setIsKioskActive(false);
      setShowExitDialog(false);
      setUserPin('');
      document.exitFullscreen?.();
      toast.success('Kiosk Mode Deactivated');
      navigate('/niranx/dashboard');
    } else {
      toast.error('Incorrect PIN');
      setUserPin('');
    }
  };

  if (isKioskActive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-primary/10 flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-red-500/10 rounded-full">
                <Lock className="w-16 h-16 text-red-500" />
              </div>
            </div>
            <CardTitle className="text-3xl">Kiosk Mode Active</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="p-6 bg-muted rounded-lg">
                <Shield className="w-12 h-12 mx-auto mb-3 text-primary" />
                <p className="text-lg font-semibold">Page Locked</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Navigation and exit functions are disabled
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-4 border rounded-lg">
                  <X className="w-6 h-6 mx-auto mb-2 text-red-500" />
                  <p className="font-medium">Back Button</p>
                  <p className="text-muted-foreground">Disabled</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <X className="w-6 h-6 mx-auto mb-2 text-red-500" />
                  <p className="font-medium">Context Menu</p>
                  <p className="text-muted-foreground">Disabled</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <X className="w-6 h-6 mx-auto mb-2 text-red-500" />
                  <p className="font-medium">Keyboard Shortcuts</p>
                  <p className="text-muted-foreground">Disabled</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <Check className="w-6 h-6 mx-auto mb-2 text-green-500" />
                  <p className="font-medium">Fullscreen</p>
                  <p className="text-muted-foreground">Enabled</p>
                </div>
              </div>

              <Button
                onClick={() => setShowExitDialog(true)}
                variant="destructive"
                size="lg"
                className="w-full"
              >
                <Unlock className="w-5 h-5 mr-2" />
                Exit Kiosk Mode
              </Button>
            </div>
          </CardContent>
        </Card>

        <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-orange-500" />
                Exit Kiosk Mode
              </AlertDialogTitle>
              <AlertDialogDescription>
                Enter your PIN to exit kiosk mode and unlock navigation.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="py-4">
              <Input
                type="password"
                placeholder="Enter PIN"
                value={userPin}
                onChange={(e) => setUserPin(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && attemptExit()}
                className="text-center text-2xl tracking-widest"
                maxLength={10}
              />
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setUserPin('')}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={attemptExit}>Exit</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-primary/10 rounded-full">
              <Shield className="w-16 h-16 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold">Kiosk Mode</h1>
          <p className="text-lg text-muted-foreground">
            Lock the page and prevent navigation for focused study sessions
          </p>
        </div>

        {showPinSetup ? (
          <Card>
            <CardHeader>
              <CardTitle>Set Up Security PIN</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Enter PIN (min 4 digits)</label>
                <Input
                  type="password"
                  placeholder="Create PIN"
                  value={exitPin}
                  onChange={(e) => setExitPin(e.target.value)}
                  className="text-center text-2xl tracking-widest"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Confirm PIN</label>
                <Input
                  type="password"
                  placeholder="Confirm PIN"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  className="text-center text-2xl tracking-widest"
                />
              </div>

              <Button onClick={setupPin} className="w-full" size="lg">
                <Lock className="w-5 h-5 mr-2" />
                Set PIN
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Kiosk Mode Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <Maximize className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold">Fullscreen Lock</h3>
                    <p className="text-sm text-muted-foreground">
                      Automatically enters fullscreen mode and prevents exit
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <Lock className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold">Navigation Block</h3>
                    <p className="text-sm text-muted-foreground">
                      Disables back button, browser shortcuts, and navigation
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold">PIN Protection</h3>
                    <p className="text-sm text-muted-foreground">
                      Requires PIN to exit kiosk mode and unlock features
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold">Context Menu Disabled</h3>
                    <p className="text-sm text-muted-foreground">
                      Right-click and developer tools are disabled
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  <strong>Note:</strong> Make sure to remember your PIN. If you forget it, you'll need to refresh the page to exit kiosk mode.
                </p>
              </div>

              <Button onClick={activateKiosk} size="lg" className="w-full">
                <Lock className="w-5 h-5 mr-2" />
                Activate Kiosk Mode
              </Button>

              <Button 
                onClick={() => setShowPinSetup(true)} 
                variant="outline" 
                className="w-full"
              >
                Change PIN
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default KioskMode;
