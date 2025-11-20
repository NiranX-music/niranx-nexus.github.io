import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Bell, Mail, Smartphone } from "lucide-react";

interface NotificationPreferences {
  resource_access: boolean;
  feedback_responses: boolean;
  exam_reminders: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
}

export default function NotificationSettings() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    resource_access: true,
    feedback_responses: true,
    exam_reminders: true,
    email_notifications: false,
    push_notifications: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No preferences yet, create default ones
        await createDefaultPreferences();
      } else {
        console.error('Error loading preferences:', error);
      }
    } else if (data) {
      setPreferences({
        resource_access: data.resource_access,
        feedback_responses: data.feedback_responses,
        exam_reminders: data.exam_reminders,
        email_notifications: data.email_notifications,
        push_notifications: data.push_notifications,
      });
    }

    setLoading(false);
  };

  const createDefaultPreferences = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('notification_preferences')
      .insert([{ user_id: user.id }]);

    if (error) {
      console.error('Error creating preferences:', error);
    }
  };

  const updatePreference = async (key: keyof NotificationPreferences, value: boolean) => {
    if (!user) return;

    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);

    const { error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: user.id,
        ...newPreferences,
      });

    if (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: "Error",
        description: "Failed to update notification preferences",
        variant: "destructive",
      });
      // Revert on error
      setPreferences(preferences);
    } else {
      toast({
        title: "Preferences updated",
        description: "Your notification preferences have been saved",
      });
    }
  };

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Notification Settings</h1>
        <p className="text-muted-foreground">
          Manage your notification preferences and how you receive updates
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            App Notifications
          </CardTitle>
          <CardDescription>
            Choose which events trigger notifications in the app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="resource_access" className="text-base">
                Resource Access
              </Label>
              <p className="text-sm text-muted-foreground">
                Get notified when someone views or downloads your shared resources
              </p>
            </div>
            <Switch
              id="resource_access"
              checked={preferences.resource_access}
              onCheckedChange={(checked) => updatePreference('resource_access', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="feedback_responses" className="text-base">
                Feedback Responses
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive updates when your feedback status changes or reaches milestones
              </p>
            </div>
            <Switch
              id="feedback_responses"
              checked={preferences.feedback_responses}
              onCheckedChange={(checked) => updatePreference('feedback_responses', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="exam_reminders" className="text-base">
                Exam Reminders
              </Label>
              <p className="text-sm text-muted-foreground">
                Get reminders about upcoming exams (7, 3, and 1 day before)
              </p>
            </div>
            <Switch
              id="exam_reminders"
              checked={preferences.exam_reminders}
              onCheckedChange={(checked) => updatePreference('exam_reminders', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Receive notifications via email (coming soon)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email_notifications" className="text-base">
                Email Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Get important notifications sent to your email
              </p>
            </div>
            <Switch
              id="email_notifications"
              checked={preferences.email_notifications}
              onCheckedChange={(checked) => updatePreference('email_notifications', checked)}
              disabled
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Receive push notifications on your device (PWA only)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push_notifications" className="text-base">
                Push Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Get instant notifications even when the app is closed
              </p>
            </div>
            <Switch
              id="push_notifications"
              checked={preferences.push_notifications}
              onCheckedChange={(checked) => updatePreference('push_notifications', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
