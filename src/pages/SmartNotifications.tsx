import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bell, Clock, Filter, Moon, Zap } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface NotificationPreferences {
  smart_timing_enabled: boolean;
  digest_mode: boolean;
  digest_time: string;
  priority_filter: string;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  push_notifications: boolean;
  email_notifications: boolean;
}

export default function SmartNotifications() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    smart_timing_enabled: true,
    digest_mode: false,
    digest_time: "18:00:00",
    priority_filter: "all",
    quiet_hours_start: null,
    quiet_hours_end: null,
    push_notifications: true,
    email_notifications: false,
  });
  const [queuedCount, setQueuedCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPreferences();
      fetchQueuedNotifications();
    }
  }, [user]);

  const fetchPreferences = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!error && data) {
      setPreferences({
        smart_timing_enabled: data.smart_timing_enabled ?? true,
        digest_mode: data.digest_mode ?? false,
        digest_time: data.digest_time || "18:00:00",
        priority_filter: data.priority_filter || "all",
        quiet_hours_start: data.quiet_hours_start,
        quiet_hours_end: data.quiet_hours_end,
        push_notifications: data.push_notifications ?? true,
        email_notifications: data.email_notifications ?? false,
      });
    }
  };

  const fetchQueuedNotifications = async () => {
    if (!user) return;

    const { count } = await supabase
      .from("notification_queue")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "pending");

    setQueuedCount(count || 0);
  };

  const updatePreferences = async (updates: Partial<NotificationPreferences>) => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("notification_preferences")
        .upsert({
          user_id: user.id,
          ...preferences,
          ...updates,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      setPreferences((prev) => ({ ...prev, ...updates }));
      toast({
        title: "Settings Updated ✓",
        description: "Your notification preferences have been saved",
      });
    } catch (error) {
      console.error("Error updating preferences:", error);
      toast({
        title: "Error",
        description: "Failed to update preferences",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold gradient-text mb-2 animate-fade-in">
          Smart Notifications
        </h1>
        <p className="text-muted-foreground animate-fade-in">
          AI-powered notification timing that respects your focus time
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="animate-scale-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Smart Timing
            </CardTitle>
            <CardDescription>
              AI determines the best time to notify you based on your activity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Smart Timing</Label>
                <p className="text-sm text-muted-foreground">
                  Avoid notifications during focus sessions
                </p>
              </div>
              <Switch
                checked={preferences.smart_timing_enabled}
                onCheckedChange={(checked) =>
                  updatePreferences({ smart_timing_enabled: checked })
                }
              />
            </div>

            {queuedCount > 0 && (
              <div className="p-3 rounded-lg bg-muted/50 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Queued notifications</span>
                  <Badge variant="secondary">{queuedCount}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Will be delivered at optimal times
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="animate-scale-in" style={{ animationDelay: "0.1s" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-500" />
              Digest Mode
            </CardTitle>
            <CardDescription>
              Batch non-urgent notifications into a daily summary
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Digest Mode</Label>
                <p className="text-sm text-muted-foreground">Receive notifications once daily</p>
              </div>
              <Switch
                checked={preferences.digest_mode}
                onCheckedChange={(checked) => updatePreferences({ digest_mode: checked })}
              />
            </div>

            {preferences.digest_mode && (
              <div className="space-y-2 animate-fade-in">
                <Label>Digest Time</Label>
                <Input
                  type="time"
                  value={preferences.digest_time.slice(0, 5)}
                  onChange={(e) =>
                    updatePreferences({ digest_time: e.target.value + ":00" })
                  }
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="animate-scale-in" style={{ animationDelay: "0.2s" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-purple-500" />
              Priority Filter
            </CardTitle>
            <CardDescription>Choose which priority levels to receive</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Notification Priority</Label>
              <Select
                value={preferences.priority_filter}
                onValueChange={(value) => updatePreferences({ priority_filter: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Notifications</SelectItem>
                  <SelectItem value="high">High Priority Only</SelectItem>
                  <SelectItem value="urgent">Urgent Only</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                {preferences.priority_filter === "all" && "Receive all notifications"}
                {preferences.priority_filter === "high" &&
                  "Only high and urgent notifications"}
                {preferences.priority_filter === "urgent" && "Only urgent notifications"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-scale-in" style={{ animationDelay: "0.3s" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="h-5 w-5 text-indigo-500" />
              Quiet Hours
            </CardTitle>
            <CardDescription>Set times when you don't want to be disturbed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={preferences.quiet_hours_start?.slice(0, 5) || ""}
                  onChange={(e) =>
                    updatePreferences({
                      quiet_hours_start: e.target.value ? e.target.value + ":00" : null,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={preferences.quiet_hours_end?.slice(0, 5) || ""}
                  onChange={(e) =>
                    updatePreferences({
                      quiet_hours_end: e.target.value ? e.target.value + ":00" : null,
                    })
                  }
                />
              </div>
            </div>
            {preferences.quiet_hours_start && preferences.quiet_hours_end && (
              <div className="p-3 rounded-lg bg-muted/50 animate-fade-in">
                <p className="text-sm">
                  No notifications between {preferences.quiet_hours_start.slice(0, 5)} and{" "}
                  {preferences.quiet_hours_end.slice(0, 5)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2 animate-scale-in" style={{ animationDelay: "0.4s" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-500" />
              Delivery Channels
            </CardTitle>
            <CardDescription>Choose how you want to receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  In-app notifications while using the platform
                </p>
              </div>
              <Switch
                checked={preferences.push_notifications}
                onCheckedChange={(checked) =>
                  updatePreferences({ push_notifications: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive important updates via email
                </p>
              </div>
              <Switch
                checked={preferences.email_notifications}
                onCheckedChange={(checked) =>
                  updatePreferences({ email_notifications: checked })
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 animate-fade-in" style={{ animationDelay: "0.5s" }}>
        <CardHeader>
          <CardTitle>How Smart Notifications Work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <Badge variant="outline" className="mt-0.5">1</Badge>
            <p>
              <strong>Focus Detection:</strong> AI learns your study patterns and avoids
              interrupting during focus sessions
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Badge variant="outline" className="mt-0.5">2</Badge>
            <p>
              <strong>Priority Routing:</strong> Urgent notifications are delivered immediately,
              others wait for breaks
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Badge variant="outline" className="mt-0.5">3</Badge>
            <p>
              <strong>Digest Batching:</strong> Non-urgent notifications are grouped into a single
              daily summary
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Badge variant="outline" className="mt-0.5">4</Badge>
            <p>
              <strong>Quiet Hours:</strong> No notifications during your specified rest periods
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
