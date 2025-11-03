import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function PrivacySettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    profile_visibility: 'public',
    show_study_stats: true,
    show_achievements: true,
    show_activity: true,
    allow_messages: true,
    allow_friend_requests: true,
  });

  useEffect(() => {
    if (user) {
      fetchPrivacySettings();
    }
  }, [user]);

  const fetchPrivacySettings = async () => {
    const { data, error } = await supabase
      .from('privacy_settings')
      .select('*')
      .eq('user_id', user?.id)
      .single();

    if (data) {
      setSettings(data);
    }
  };

  const updateSettings = async (newSettings: any) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('privacy_settings')
        .upsert({
          user_id: user?.id,
          ...newSettings,
        });

      if (error) throw error;

      setSettings(newSettings);
      toast.success('Privacy settings updated');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: string, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    updateSettings(newSettings);
  };

  const handleVisibilityChange = (value: string) => {
    const newSettings = { ...settings, profile_visibility: value };
    updateSettings(newSettings);
  };

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Privacy Settings</h1>
          <p className="text-muted-foreground">Control what others can see about you</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Visibility</CardTitle>
          <CardDescription>Choose who can see your profile</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={settings.profile_visibility} onValueChange={handleVisibilityChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public - Anyone can see</SelectItem>
              <SelectItem value="friends">Friends Only</SelectItem>
              <SelectItem value="private">Private - Only you</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What Others Can See</CardTitle>
          <CardDescription>Control what information is visible to others</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Study Statistics</Label>
              <p className="text-sm text-muted-foreground">Show your study time and progress</p>
            </div>
            <Switch
              checked={settings.show_study_stats}
              onCheckedChange={(checked) => handleToggle('show_study_stats', checked)}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Achievements</Label>
              <p className="text-sm text-muted-foreground">Display your badges and achievements</p>
            </div>
            <Switch
              checked={settings.show_achievements}
              onCheckedChange={(checked) => handleToggle('show_achievements', checked)}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Activity Status</Label>
              <p className="text-sm text-muted-foreground">Show when you're active</p>
            </div>
            <Switch
              checked={settings.show_activity}
              onCheckedChange={(checked) => handleToggle('show_activity', checked)}
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Communication Preferences</CardTitle>
          <CardDescription>Control who can contact you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow Messages</Label>
              <p className="text-sm text-muted-foreground">Let others send you messages</p>
            </div>
            <Switch
              checked={settings.allow_messages}
              onCheckedChange={(checked) => handleToggle('allow_messages', checked)}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow Friend Requests</Label>
              <p className="text-sm text-muted-foreground">Let others send you friend requests</p>
            </div>
            <Switch
              checked={settings.allow_friend_requests}
              onCheckedChange={(checked) => handleToggle('allow_friend_requests', checked)}
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}