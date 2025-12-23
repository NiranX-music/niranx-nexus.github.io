import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Palette, 
  Database, 
  Download, 
  Trash2,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Music,
  Video,
  LogOut,
  ShieldCheck,
  AlertTriangle,
  Link2,
  Eye,
  Folder,
  Play
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from 'react';
import { useNowPlaying } from '@/contexts/NowPlayingContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserSidebarManager } from '@/components/UserSidebarManager';
import { useBeepSound } from '@/contexts/BeepSoundContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useAdminCheck } from '@/hooks/useAdminCheck';

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { isVisible, setIsVisible } = useNowPlaying();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { isAdmin } = useAdminCheck();
  const { beepEnabled, setBeepEnabled, selectedSound, setSelectedSound, previewSound, availableSounds } = useBeepSound();
  
  const [settings, setSettings] = useState({
    notifications: true,
    soundEffects: true,
    autoSave: true,
    darkMode: theme === 'dark',
    dataCollection: false,
    emailUpdates: true,
    pushNotifications: false,
    showQuickAccess: true
  });

  

  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const updateSetting = (key: string, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('appSettings', JSON.stringify(newSettings));

    // Notify other components (like MacDock) in the same tab
    window.dispatchEvent(new Event('appSettingsChanged'));
    
    if (key === 'darkMode') {
      setTheme(value ? 'dark' : 'light');
    }

    toast({
      title: "Settings Updated",
      description: `${key.replace(/([A-Z])/g, ' $1').toLowerCase()} ${value ? 'enabled' : 'disabled'}`,
    });
  };

  const clearData = () => {
    localStorage.clear();
    toast({
      title: "Data Cleared",
      description: "All local data has been cleared",
      variant: "destructive",
    });
  };

  const exportData = () => {
    const data = {
      profile: localStorage.getItem('userProfile'),
      xp: localStorage.getItem('userXP'),
      level: localStorage.getItem('userLevel'),
      tasks: localStorage.getItem('task-scheduler-data'),
      library: localStorage.getItem('library-books'),
      settings: localStorage.getItem('appSettings')
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'studyverse-data.json';
    a.click();
    
    toast({
      title: "Data Exported",
      description: "Your data has been downloaded as JSON file",
    });
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mobile-container min-h-screen bg-background mobile-padding space-y-6">
      <div className="container mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <SettingsIcon className="w-6 h-6 md:w-8 md:h-8 text-primary" />
          <div>
            <h1 className="mobile-title">Settings</h1>
            <p className="text-sm md:text-base text-muted-foreground">Customize your StudyVerse experience</p>
          </div>
        </div>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {settings.darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                <div>
                  <Label htmlFor="darkMode">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Use dark theme across the application</p>
                </div>
              </div>
              <Switch
                id="darkMode"
                checked={settings.darkMode}
                onCheckedChange={(checked) => updateSetting('darkMode', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="showQuickAccess">Quick Access Button</Label>
                <p className="text-sm text-muted-foreground">Show floating quick access dock at the bottom</p>
              </div>
              <Switch
                id="showQuickAccess"
                checked={settings.showQuickAccess}
                onCheckedChange={(checked) => updateSetting('showQuickAccess', checked)}
              />
            </div>

            <Separator />

            <div>
              <Label className="text-base font-medium">Theme Selection</Label>
              <p className="text-sm text-muted-foreground mb-4">Choose your preferred color theme</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {[
                  { name: 'light', label: 'Light', color: 'bg-white border-2' },
                  { name: 'dark', label: 'Dark', color: 'bg-gray-900' },
                  { name: 'space', label: 'Space', color: 'bg-purple-900' },
                  { name: 'grey', label: 'Grey', color: 'bg-gray-500' },
                  { name: 'pink', label: 'Pink', color: 'bg-pink-500' },
                ].map((themeOption) => (
                  <Button
                    key={themeOption.name}
                    variant={theme === themeOption.name ? "default" : "outline"}
                    className="h-16 md:h-20 flex-col gap-2"
                    onClick={() => setTheme(themeOption.name as any)}
                  >
                    <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full ${themeOption.color}`} />
                    <span className="text-xs md:text-sm">{themeOption.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications">Desktop Notifications</Label>
                <p className="text-sm text-muted-foreground">Get notified about important updates</p>
              </div>
              <Switch
                id="notifications"
                checked={settings.notifications}
                onCheckedChange={(checked) => updateSetting('notifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="emailUpdates">Email Updates</Label>
                <p className="text-sm text-muted-foreground">Receive study tips and announcements via email</p>
              </div>
              <Switch
                id="emailUpdates"
                checked={settings.emailUpdates}
                onCheckedChange={(checked) => updateSetting('emailUpdates', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="pushNotifications">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Browser push notifications for reminders</p>
              </div>
              <Switch
                id="pushNotifications"
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Audio Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {settings.soundEffects ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              Audio & Media
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="soundEffects">Sound Effects</Label>
                <p className="text-sm text-muted-foreground">Play sounds for interactions and notifications</p>
              </div>
              <Switch
                id="soundEffects"
                checked={settings.soundEffects}
                onCheckedChange={(checked) => updateSetting('soundEffects', checked)}
              />
            </div>

            <Separator />

            {/* Beep Sound Settings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="beepEnabled">Click Beep Sound</Label>
                  <p className="text-sm text-muted-foreground">Play a beep sound on button clicks</p>
                </div>
                <Switch
                  id="beepEnabled"
                  checked={beepEnabled}
                  onCheckedChange={(checked) => {
                    setBeepEnabled(checked);
                    toast({
                      title: checked ? "Beep Sound Enabled" : "Beep Sound Disabled",
                      description: checked 
                        ? "Click sounds will now play on interactions" 
                        : "Click sounds have been disabled",
                    });
                  }}
                />
              </div>

              {beepEnabled && (
                <div className="space-y-3 pl-4 border-l-2 border-primary/20">
                  <Label className="text-sm font-medium">Select Beep Sound</Label>
                  <div className="flex gap-2">
                    <Select value={selectedSound} onValueChange={setSelectedSound}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select a sound" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSounds.map((sound) => (
                          <SelectItem key={sound.id} value={sound.id}>
                            {sound.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => previewSound(selectedSound)}
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Click the play button to preview the selected sound
                  </p>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-3">
              <div>
                <Label className="text-base font-medium">Now Playing View</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Show a floating widget when music or video is playing across the site
                </p>
              </div>
              <Button
                onClick={() => {
                  setIsVisible(!isVisible);
                  toast({
                    title: isVisible ? "Now Playing Hidden" : "Now Playing Visible",
                    description: isVisible 
                      ? "The now playing widget has been hidden" 
                      : "The now playing widget will show when media is playing",
                  });
                }}
                variant={isVisible ? "default" : "outline"}
                className="w-full"
              >
                {isVisible ? (
                  <>
                    <Music className="w-4 h-4 mr-2" />
                    Now Playing: Enabled
                  </>
                ) : (
                  <>
                    <Video className="w-4 h-4 mr-2" />
                    Now Playing: Disabled
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              Account & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-base font-medium">Connected Accounts</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Manage your OAuth connections and authentication methods
              </p>
              <Button 
                onClick={() => navigate('/niranx/oauth-settings')} 
                variant="outline" 
                className="w-full"
              >
                <Link2 className="w-4 h-4 mr-2" />
                Manage OAuth Accounts
              </Button>
            </div>

            <Separator />

            <div>
              <Label className="text-base font-medium">Security Options</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Additional security settings and authentication methods
              </p>
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={() => navigate('/niranx/security/2fa')} 
                  variant="outline"
                  className="w-full justify-start"
                >
                  Two-Factor Authentication
                </Button>
                <Button 
                  onClick={() => navigate('/niranx/security/sessions')} 
                  variant="outline"
                  className="w-full justify-start"
                >
                  Active Sessions
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Privacy & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoSave">Auto Save</Label>
                <p className="text-sm text-muted-foreground">Automatically save your progress and data</p>
              </div>
              <Switch
                id="autoSave"
                checked={settings.autoSave}
                onCheckedChange={(checked) => updateSetting('autoSave', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dataCollection">Anonymous Analytics</Label>
                <p className="text-sm text-muted-foreground">Help improve the app by sharing anonymous usage data</p>
              </div>
              <Switch
                id="dataCollection"
                checked={settings.dataCollection}
                onCheckedChange={(checked) => updateSetting('dataCollection', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="mobile-flex gap-3">
              <Button onClick={exportData} variant="outline" className="flex-1 min-h-[44px]">
                <Download className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Export Data</span>
                <span className="sm:hidden">Export</span>
              </Button>
              
              <Button onClick={clearData} variant="destructive" className="flex-1 min-h-[44px]">
                <Trash2 className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Clear All Data</span>
                <span className="sm:hidden">Clear</span>
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Export your data as a backup or clear all local data to start fresh. This action cannot be undone.
            </p>
          </CardContent>
        </Card>

        {/* Account Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Account Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/niranx/accessibility-settings')} 
              variant="outline" 
              className="w-full mb-3"
            >
              <Eye className="w-4 h-4 mr-2" />
              Accessibility Settings
            </Button>
            <Button 
              onClick={handleLogout} 
              variant="destructive" 
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </Button>
            <p className="text-sm text-muted-foreground mt-3">
              Sign out of your account and return to the login page.
            </p>
          </CardContent>
        </Card>

        {/* App Information */}
        <Card>
          <CardHeader>
            <CardTitle>About StudyVerse</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Version</span>
              <span className="text-muted-foreground">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>Build</span>
              <span className="text-muted-foreground">2024.01.01</span>
            </div>
            <div className="flex justify-between">
              <span>Developer</span>
              <span className="text-muted-foreground">NiranX Developers</span>
            </div>
            <Separator className="my-4" />
            <p className="text-sm text-muted-foreground">
              StudyVerse is designed to enhance your learning experience with modern tools and features. 
              For support or feedback, please contact our team.
            </p>
          </CardContent>
        </Card>

        {/* Sidebar Customization */}
        <UserSidebarManager />
      </div>

    </div>
  );
};

export default Settings;