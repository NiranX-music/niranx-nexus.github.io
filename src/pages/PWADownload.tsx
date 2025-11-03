import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Smartphone, Monitor, Download, Share2, Chrome, Apple } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

export default function PWADownload() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      toast.error('Installation prompt not available');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      toast.success('App installed successfully!');
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
  };

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Install NiranX StudyVerse</h1>
        <p className="text-xl text-muted-foreground">
          Get the best experience with our Progressive Web App
        </p>
      </div>

      {isInstalled && (
        <Card className="border-green-500 bg-green-500/10">
          <CardContent className="pt-6 text-center">
            <p className="text-lg font-semibold text-green-500">
              ✓ App is already installed!
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Smartphone className="w-8 h-8 text-primary" />
              <div>
                <CardTitle>Install on Mobile</CardTitle>
                <CardDescription>Android & iOS devices</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {deferredPrompt ? (
              <Button onClick={handleInstallClick} className="w-full" size="lg">
                <Download className="w-4 h-4 mr-2" />
                Install Now
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                  <Chrome className="w-5 h-5 mt-0.5" />
                  <div className="space-y-2">
                    <p className="font-semibold">Android (Chrome)</p>
                    <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                      <li>Tap the menu icon (⋮)</li>
                      <li>Select "Add to Home screen"</li>
                      <li>Follow the prompts</li>
                    </ol>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                  <Apple className="w-5 h-5 mt-0.5" />
                  <div className="space-y-2">
                    <p className="font-semibold">iOS (Safari)</p>
                    <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                      <li>Tap the Share button <Share2 className="w-3 h-3 inline" /></li>
                      <li>Scroll and tap "Add to Home Screen"</li>
                      <li>Tap "Add"</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
              <p className="text-sm text-blue-600 dark:text-blue-400">
                <strong>Note:</strong> For native mobile apps (APK/IPA), we recommend using Capacitor or similar tools to wrap this PWA. Contact support for enterprise distribution options.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Monitor className="w-8 h-8 text-primary" />
              <div>
                <CardTitle>Install on Desktop</CardTitle>
                <CardDescription>Windows, Mac & Linux</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
              <Chrome className="w-5 h-5 mt-0.5" />
              <div className="space-y-2">
                <p className="font-semibold">Chrome / Edge</p>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Click the install icon in the address bar</li>
                  <li>Or go to Menu → "Install NiranX StudyVerse"</li>
                  <li>Click "Install"</li>
                </ol>
              </div>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-lg">
              <p className="text-sm text-purple-600 dark:text-purple-400">
                <strong>Desktop Apps (EXE/DMG):</strong> For native desktop applications, we recommend using Electron or Tauri to package this PWA. These can be distributed via your website or app stores.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold">Benefits of Installing:</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Works offline</li>
                <li>Faster performance</li>
                <li>No browser UI clutter</li>
                <li>Desktop/dock integration</li>
                <li>Push notifications</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
          <CardDescription>What you get with the installed app</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold">📴 Offline Access</h3>
              <p className="text-sm text-muted-foreground">
                Access your study materials even without internet
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">🚀 Fast Performance</h3>
              <p className="text-sm text-muted-foreground">
                Instant loading with optimized caching
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">🔔 Push Notifications</h3>
              <p className="text-sm text-muted-foreground">
                Get reminders for study sessions and deadlines
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">💾 Storage</h3>
              <p className="text-sm text-muted-foreground">
                Store more data locally for offline use
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">🎨 Native Feel</h3>
              <p className="text-sm text-muted-foreground">
                Looks and feels like a native app
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">🔄 Auto Updates</h3>
              <p className="text-sm text-muted-foreground">
                Always get the latest features automatically
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}