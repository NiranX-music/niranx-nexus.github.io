import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Calendar, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface WeeklySummaryProps {
  studentId: string;
}

export function WeeklySummary({ studentId }: WeeklySummaryProps) {
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeeklyData();
  }, [studentId]);

  const fetchWeeklyData = async () => {
    setLoading(true);
    try {
      // Get last 7 days of focus sessions
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from('focus_sessions')
        .select('completed_at, duration_minutes')
        .eq('user_id', studentId)
        .eq('completed', true)
        .gte('completed_at', sevenDaysAgo.toISOString())
        .order('completed_at', { ascending: true });

      if (error) throw error;

      // Group by day
      const dayMap = new Map<string, number>();
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      // Initialize all days with 0
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dayName = days[date.getDay()];
        dayMap.set(dayName, 0);
      }

      // Populate with actual data
      data?.forEach(session => {
        const date = new Date(session.completed_at);
        const dayName = days[date.getDay()];
        dayMap.set(dayName, (dayMap.get(dayName) || 0) + session.duration_minutes);
      });

      const chartData = Array.from(dayMap.entries()).map(([day, minutes]) => ({
        day,
        minutes: Math.round(minutes)
      }));

      setWeeklyData(chartData);
    } catch (error) {
      console.error('Error fetching weekly data:', error);
      toast({
        title: "Error",
        description: "Failed to load weekly summary",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    // Simple CSV export
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Day,Study Time (minutes)\n"
      + weeklyData.map(d => `${d.day},${d.minutes}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `weekly_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Report Exported",
      description: "Weekly summary has been downloaded",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalMinutes = weeklyData.reduce((sum, day) => sum + day.minutes, 0);
  const avgMinutes = Math.round(totalMinutes / 7);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Weekly Summary
            </CardTitle>
            <CardDescription>Last 7 days study pattern</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Study Time</p>
            <p className="text-2xl font-bold">{totalMinutes} min</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Daily Average</p>
            <p className="text-2xl font-bold">{avgMinutes} min</p>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="day" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
              />
              <Bar dataKey="minutes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
