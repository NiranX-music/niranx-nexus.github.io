import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Clock, Calendar, BarChart3, Flame, CheckSquare, Brain, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

interface ReportPreferences {
  enabled: boolean;
  frequency: string;
  day_of_week: number;
  time_of_day: string;
  metrics_to_include: string[];
  include_ai_insights: boolean;
}

const METRICS = [
  { id: 'study_time', label: 'Study Time', icon: Clock },
  { id: 'streaks', label: 'Streaks', icon: Flame },
  { id: 'tasks', label: 'Tasks Completed', icon: CheckSquare },
  { id: 'focus_sessions', label: 'Focus Sessions', icon: Brain },
  { id: 'flashcards', label: 'Flashcard Progress', icon: BarChart3 },
  { id: 'courses', label: 'Course Progress', icon: Calendar },
];

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const EmailReports = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<ReportPreferences>({
    enabled: false,
    frequency: 'weekly',
    day_of_week: 1,
    time_of_day: '09:00',
    metrics_to_include: ['study_time', 'streaks', 'tasks', 'focus_sessions'],
    include_ai_insights: true,
  });

  useEffect(() => {
    fetchPreferences();
  }, [user]);

  const fetchPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('email_report_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setPreferences({
          enabled: data.enabled,
          frequency: data.frequency,
          day_of_week: data.day_of_week,
          time_of_day: data.time_of_day,
          metrics_to_include: data.metrics_to_include || [],
          include_ai_insights: data.include_ai_insights,
        });
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('email_report_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      toast.success('Preferences saved!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const toggleMetric = (metricId: string) => {
    setPreferences(prev => ({
      ...prev,
      metrics_to_include: prev.metrics_to_include.includes(metricId)
        ? prev.metrics_to_include.filter(m => m !== metricId)
        : [...prev.metrics_to_include, metricId],
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Email Reports</h1>
        <p className="text-muted-foreground">Configure weekly study progress reports</p>
      </div>

      {/* Main Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Report Settings
          </CardTitle>
          <CardDescription>
            Receive personalized study progress reports in your inbox
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Enable Email Reports</Label>
              <p className="text-sm text-muted-foreground">
                Receive regular progress summaries via email
              </p>
            </div>
            <Switch
              checked={preferences.enabled}
              onCheckedChange={(checked) => setPreferences({ ...preferences, enabled: checked })}
            />
          </div>

          {preferences.enabled && (
            <>
              {/* Frequency */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Frequency</Label>
                  <Select
                    value={preferences.frequency}
                    onValueChange={(v) => setPreferences({ ...preferences, frequency: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Day of Week</Label>
                  <Select
                    value={preferences.day_of_week.toString()}
                    onValueChange={(v) => setPreferences({ ...preferences, day_of_week: parseInt(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS.map((day, index) => (
                        <SelectItem key={day} value={index.toString()}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Time of Day</Label>
                <Select
                  value={preferences.time_of_day}
                  onValueChange={(v) => setPreferences({ ...preferences, time_of_day: v })}
                >
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="06:00">6:00 AM</SelectItem>
                    <SelectItem value="08:00">8:00 AM</SelectItem>
                    <SelectItem value="09:00">9:00 AM</SelectItem>
                    <SelectItem value="12:00">12:00 PM</SelectItem>
                    <SelectItem value="18:00">6:00 PM</SelectItem>
                    <SelectItem value="20:00">8:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Metrics Selection */}
      {preferences.enabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Report Content
            </CardTitle>
            <CardDescription>
              Choose what metrics to include in your reports
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {METRICS.map((metric) => {
                const Icon = metric.icon;
                const isSelected = preferences.metrics_to_include.includes(metric.id);
                
                return (
                  <div
                    key={metric.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected ? 'border-primary bg-primary/5' : 'hover:border-muted-foreground/50'
                    }`}
                    onClick={() => toggleMetric(metric.id)}
                  >
                    <Checkbox checked={isSelected} />
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{metric.label}</span>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">AI-Powered Insights</Label>
                  <p className="text-sm text-muted-foreground">
                    Include personalized recommendations based on your progress
                  </p>
                </div>
                <Switch
                  checked={preferences.include_ai_insights}
                  onCheckedChange={(checked) => 
                    setPreferences({ ...preferences, include_ai_insights: checked })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview */}
      {preferences.enabled && (
        <Card>
          <CardHeader>
            <CardTitle>Report Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                <span className="font-medium">Weekly Study Report</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your {preferences.frequency} report will be sent on {DAYS[preferences.day_of_week]}s 
                at {preferences.time_of_day.replace(':00', '')} and will include:
              </p>
              <div className="flex flex-wrap gap-2">
                {preferences.metrics_to_include.map(metricId => {
                  const metric = METRICS.find(m => m.id === metricId);
                  return metric ? (
                    <Badge key={metricId} variant="secondary">
                      {metric.label}
                    </Badge>
                  ) : null;
                })}
                {preferences.include_ai_insights && (
                  <Badge variant="default" className="gap-1">
                    <Brain className="h-3 w-3" />
                    AI Insights
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={savePreferences} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Preferences
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default EmailReports;
