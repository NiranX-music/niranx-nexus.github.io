import { useState, useEffect } from 'react';
import { useXstage } from '../contexts/XstageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { User, Bell, Shield, Palette, Camera, Save, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const XstageSettings = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    avatar_url: ''
  });
  const [notifications, setNotifications] = useState({
    email_notifications: true,
    push_notifications: true,
    event_reminders: true,
    message_alerts: true,
    file_updates: true
  });
  const [appearance, setAppearance] = useState({
    compact_mode: false,
    show_waveforms: true,
    auto_play_previews: false
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('user_id', user.id)
      .single();
    
    if (!error && data) {
      setProfile({
        full_name: data.full_name || '',
        avatar_url: data.avatar_url || ''
      });
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name
      })
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated');
    }
    setLoading(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error('Failed to upload avatar');
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('user_id', user.id);

    if (!updateError) {
      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      toast.success('Avatar updated');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/xstage');
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
          Settings
        </h1>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-fuchsia-400" />
                Profile
              </CardTitle>
              <CardDescription>Manage your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <Avatar className="h-20 w-20 border-2 border-fuchsia-500/50">
                    <AvatarImage src={profile.avatar_url} />
                    <AvatarFallback className="bg-fuchsia-500/20 text-fuchsia-400">
                      {profile.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <Camera className="h-6 w-6 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={profile.full_name}
                      onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Your name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      value={user?.email || ''}
                      disabled
                      className="mt-1 opacity-60"
                    />
                  </div>
                </div>
              </div>
              
              <Button onClick={handleSaveProfile} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-cyan-400" />
                Notifications
              </CardTitle>
              <CardDescription>Configure how you receive updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <Label htmlFor={key} className="capitalize">
                    {key.replace(/_/g, ' ')}
                  </Label>
                  <Switch
                    id={key}
                    checked={value}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, [key]: checked }))
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Appearance Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-pink-400" />
                Appearance
              </CardTitle>
              <CardDescription>Customize your experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(appearance).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <Label htmlFor={key} className="capitalize">
                    {key.replace(/_/g, ' ')}
                  </Label>
                  <Switch
                    id={key}
                    checked={value}
                    onCheckedChange={(checked) => 
                      setAppearance(prev => ({ ...prev, [key]: checked }))
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-400" />
                Security
              </CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                Change Password
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Two-Factor Authentication
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Active Sessions
              </Button>
              
              <Separator className="bg-white/10" />
              
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
