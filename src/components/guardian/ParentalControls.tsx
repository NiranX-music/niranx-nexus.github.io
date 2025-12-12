import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Clock, Shield, Save, AlertTriangle } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

interface ParentalControlsProps {
  studentId: string;
  guardianId: string;
}

export function ParentalControls({ studentId, guardianId }: ParentalControlsProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [restrictTime, setRestrictTime] = useState(false);
  const [controls, setControls] = useState({
    daily_study_limit_minutes: 480, // 8 hours in minutes
    daily_break_reminder_minutes: 45,
    enforce_focus_sessions: false,
    allowed_start_time: "06:00",
    allowed_end_time: "22:00",
    blocked_features: [] as string[],
    is_active: true,
  });

  useEffect(() => {
    fetchControls();
  }, [studentId, guardianId]);

  const fetchControls = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('parental_controls')
        .select('*')
        .eq('student_id', studentId)
        .eq('guardian_id', guardianId)
        .single();

      if (data) {
        setControls({
          daily_study_limit_minutes: data.daily_study_limit_minutes || 480,
          daily_break_reminder_minutes: data.daily_break_reminder_minutes || 45,
          enforce_focus_sessions: data.enforce_focus_sessions || false,
          allowed_start_time: data.allowed_start_time || "06:00",
          allowed_end_time: data.allowed_end_time || "22:00",
          blocked_features: data.blocked_features || [],
          is_active: data.is_active !== false,
        });
        // Check if time restriction is enabled
        setRestrictTime(data.allowed_start_time !== "00:00" || data.allowed_end_time !== "23:59");
      }
    } catch (error) {
      // No existing controls, use defaults
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const saveData = {
        student_id: studentId,
        guardian_id: guardianId,
        daily_study_limit_minutes: controls.daily_study_limit_minutes,
        daily_break_reminder_minutes: controls.daily_break_reminder_minutes,
        enforce_focus_sessions: controls.enforce_focus_sessions,
        allowed_start_time: restrictTime ? controls.allowed_start_time : "00:00",
        allowed_end_time: restrictTime ? controls.allowed_end_time : "23:59",
        blocked_features: controls.blocked_features,
        is_active: controls.is_active,
        updated_at: new Date().toISOString(),
      };

      // Check if record exists
      const { data: existing } = await supabase
        .from('parental_controls')
        .select('id')
        .eq('student_id', studentId)
        .eq('guardian_id', guardianId)
        .single();

      let error;
      if (existing) {
        const result = await supabase
          .from('parental_controls')
          .update(saveData)
          .eq('id', existing.id);
        error = result.error;
      } else {
        const result = await supabase
          .from('parental_controls')
          .insert(saveData);
        error = result.error;
      }

      if (error) throw error;

      toast({
        title: "Controls Saved",
        description: "Parental controls have been updated",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save controls",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const studyLimitHours = controls.daily_study_limit_minutes / 60;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Parental Controls
        </CardTitle>
        <CardDescription>
          Set study limits and break reminders for this student
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Active Toggle */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div>
            <Label className="font-medium">Controls Active</Label>
            <p className="text-sm text-muted-foreground">Enable or disable all parental controls</p>
          </div>
          <Switch
            checked={controls.is_active}
            onCheckedChange={(checked) => setControls(prev => ({ ...prev, is_active: checked }))}
          />
        </div>

        {/* Daily Study Limit */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Daily Study Limit
          </Label>
          <div className="flex items-center gap-4">
            <Slider
              value={[studyLimitHours]}
              onValueChange={([value]) => setControls(prev => ({ 
                ...prev, 
                daily_study_limit_minutes: Math.round(value * 60) 
              }))}
              min={1}
              max={12}
              step={0.5}
              className="flex-1"
            />
            <span className="w-20 text-right font-medium">
              {studyLimitHours.toFixed(1)} hours
            </span>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="enforce-focus" className="text-sm text-muted-foreground">
              Enforce focus session limits
            </Label>
            <Switch
              id="enforce-focus"
              checked={controls.enforce_focus_sessions}
              onCheckedChange={(checked) => setControls(prev => ({ ...prev, enforce_focus_sessions: checked }))}
            />
          </div>
        </div>

        {/* Break Reminders */}
        <div className="space-y-3">
          <Label>Break Reminder Interval</Label>
          <div className="flex items-center gap-4">
            <Slider
              value={[controls.daily_break_reminder_minutes]}
              onValueChange={([value]) => setControls(prev => ({ ...prev, daily_break_reminder_minutes: value }))}
              min={15}
              max={90}
              step={5}
              className="flex-1"
            />
            <span className="w-24 text-right font-medium">
              {controls.daily_break_reminder_minutes} mins
            </span>
          </div>
        </div>

        {/* Time Restrictions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Restrict Study Hours</Label>
            <Switch
              checked={restrictTime}
              onCheckedChange={setRestrictTime}
            />
          </div>
          
          {restrictTime && (
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <Label htmlFor="start-time" className="text-sm">Start Time</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={controls.allowed_start_time}
                  onChange={(e) => setControls(prev => ({ ...prev, allowed_start_time: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="end-time" className="text-sm">End Time</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={controls.allowed_end_time}
                  onChange={(e) => setControls(prev => ({ ...prev, allowed_end_time: e.target.value }))}
                />
              </div>
            </div>
          )}
        </div>

        {controls.enforce_focus_sessions && (
          <div className="flex items-start gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
            <p className="text-xs text-muted-foreground">
              When enabled, the student's focus sessions will be limited based on your settings.
            </p>
          </div>
        )}

        <Button onClick={handleSave} disabled={saving} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Controls"}
        </Button>
      </CardContent>
    </Card>
  );
}
