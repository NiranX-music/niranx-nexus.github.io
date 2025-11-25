import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useBrowserNotifications } from '@/hooks/useBrowserNotifications';
import { Separator } from '@/components/ui/separator';

export const NotificationSettings = () => {
  const { user } = useAuth();
  const { permission, requestPermission, isGranted, supported } = useBrowserNotifications();
  
  const [preferences, setPreferences] = useState({
    resource_access: true,
    feedback_responses: true,
    exam_reminders: true,
    streak_reminders: true,
    streak_milestones: true,
    task_reminders: true,
    task_due_soon: true,
    browser_notifications: false,
    email_notifications: false,
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPreferences();
  }, [user]);

  const fetchPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setPreferences({
          resource_access: data.resource_access ?? true,
          feedback_responses: data.feedback_responses ?? true,
          exam_reminders: data.exam_reminders ?? true,
          streak_reminders: data.streak_reminders ?? true,
          streak_milestones: data.streak_milestones ?? true,
          task_reminders: data.task_reminders ?? true,
          task_due_soon: data.task_due_soon ?? true,
          browser_notifications: data.browser_notifications ?? false,
          email_notifications: data.email_notifications ?? false,
        });
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      toast.error('Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (key: string, value: boolean) => {
    if (!user) return;

    // If enabling browser notifications, request permission first
    if (key === 'browser_notifications' && value && !isGranted) {
      const granted = await requestPermission();
      if (!granted) {
        return;
      }
    }

    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          [key]: value,
        });

      if (error) throw error;

      setPreferences((prev) => ({ ...prev, [key]: value }));
      toast.success('Notification preferences updated');
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
    }
  };

  const handleEnableBrowserNotifications = async () => {
    if (!isGranted) {
      const granted = await requestPermission();
      if (granted) {
        await updatePreference('browser_notifications', true);
      }
    } else {
      await updatePreference('browser_notifications', !preferences.browser_notifications);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Browser Notifications
          </CardTitle>
          <CardDescription>
            Get instant notifications in your browser
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!supported && (
            <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
              Browser notifications are not supported in your browser
            </div>
          )}
          
          {supported && (
            <>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Browser Notifications</Label>
                  <div className="text-sm text-muted-foreground">
                    {permission === 'denied'
                      ? 'Permission denied. Please enable in browser settings.'
                      : permission === 'granted'
                      ? 'Notifications are enabled'
                      : 'Click to request permission'}
                  </div>
                </div>
                <Button
                  variant={isGranted && preferences.browser_notifications ? 'default' : 'outline'}
                  size="sm"
                  onClick={handleEnableBrowserNotifications}
                  disabled={permission === 'denied'}
                >
                  {isGranted && preferences.browser_notifications ? (
                    <>
                      <Bell className="w-4 h-4 mr-2" />
                      Enabled
                    </>
                  ) : (
                    <>
                      <BellOff className="w-4 h-4 mr-2" />
                      Enable
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Receive important updates via email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notifications">Enable Email Notifications</Label>
            <Switch
              id="email-notifications"
              checked={preferences.email_notifications}
              onCheckedChange={(checked) => updatePreference('email_notifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <CardDescription>Choose what you want to be notified about</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="streak-reminders">Streak Reminders</Label>
            <Switch
              id="streak-reminders"
              checked={preferences.streak_reminders}
              onCheckedChange={(checked) => updatePreference('streak_reminders', checked)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <Label htmlFor="streak-milestones">Streak Milestones</Label>
            <Switch
              id="streak-milestones"
              checked={preferences.streak_milestones}
              onCheckedChange={(checked) => updatePreference('streak_milestones', checked)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <Label htmlFor="task-reminders">Task Reminders</Label>
            <Switch
              id="task-reminders"
              checked={preferences.task_reminders}
              onCheckedChange={(checked) => updatePreference('task_reminders', checked)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <Label htmlFor="task-due-soon">Task Due Soon Alerts</Label>
            <Switch
              id="task-due-soon"
              checked={preferences.task_due_soon}
              onCheckedChange={(checked) => updatePreference('task_due_soon', checked)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <Label htmlFor="exam-reminders">Exam Reminders</Label>
            <Switch
              id="exam-reminders"
              checked={preferences.exam_reminders}
              onCheckedChange={(checked) => updatePreference('exam_reminders', checked)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <Label htmlFor="resource-access">Resource Access Alerts</Label>
            <Switch
              id="resource-access"
              checked={preferences.resource_access}
              onCheckedChange={(checked) => updatePreference('resource_access', checked)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <Label htmlFor="feedback-responses">Feedback Responses</Label>
            <Switch
              id="feedback-responses"
              checked={preferences.feedback_responses}
              onCheckedChange={(checked) => updatePreference('feedback_responses', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
