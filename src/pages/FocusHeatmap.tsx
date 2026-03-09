import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Calendar, Clock, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format, subDays, startOfWeek, eachDayOfInterval } from 'date-fns';

interface DayData {
  date: string;
  hours: number;
  sessions: number;
}

export default function FocusHeatmap() {
  const { user } = useAuth();
  const [data, setData] = useState<DayData[]>([]);
  const days = 365;

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const { data: snapshots } = await supabase
        .from('analytics_snapshots')
        .select('snapshot_date, total_study_hours, pomodoro_sessions')
        .eq('user_id', user.id)
        .gte('snapshot_date', format(subDays(new Date(), days), 'yyyy-MM-dd'))
        .order('snapshot_date', { ascending: true });

      if (snapshots) {
        setData(snapshots.map(s => ({
          date: s.snapshot_date,
          hours: s.total_study_hours || 0,
          sessions: s.pomodoro_sessions || 0,
        })));
      }
    };
    fetchData();
  }, [user]);

  const allDays = useMemo(() => {
    const end = new Date();
    const start = subDays(end, days - 1);
    return eachDayOfInterval({ start, end });
  }, []);

  const dataMap = useMemo(() => {
    const map = new Map<string, DayData>();
    data.forEach(d => map.set(d.date, d));
    return map;
  }, [data]);

  const getIntensity = (hours: number) => {
    if (hours === 0) return 'bg-muted/30';
    if (hours < 1) return 'bg-primary/20';
    if (hours < 2) return 'bg-primary/40';
    if (hours < 4) return 'bg-primary/60';
    return 'bg-primary/90';
  };

  const totalHours = data.reduce((s, d) => s + d.hours, 0);
  const totalSessions = data.reduce((s, d) => s + d.sessions, 0);
  const activeDays = data.filter(d => d.hours > 0).length;
  const maxHours = Math.max(...data.map(d => d.hours), 0);

  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  allDays.forEach((day, i) => {
    if (i > 0 && day.getDay() === 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);
  });
  if (currentWeek.length) weeks.push(currentWeek);

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-6xl">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <Flame className="w-10 h-10 text-primary" />
          <h1 className="text-3xl font-bold font-[Orbitron]">Focus Heatmap</h1>
        </div>
        <p className="text-muted-foreground">Visualize your study consistency over the past year</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Hours', value: totalHours.toFixed(1), icon: Clock },
          { label: 'Active Days', value: activeDays, icon: Calendar },
          { label: 'Total Sessions', value: totalSessions, icon: TrendingUp },
          { label: 'Best Day', value: `${maxHours.toFixed(1)}h`, icon: Flame },
        ].map((s, i) => (
          <Card key={i} className="border-primary/20 bg-card/60 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <s.icon className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold font-[Orbitron]">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-primary/20 bg-card/60 backdrop-blur-sm overflow-x-auto">
        <CardHeader>
          <CardTitle className="text-lg">Study Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-[3px] min-w-[700px]">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map(day => {
                  const key = format(day, 'yyyy-MM-dd');
                  const d = dataMap.get(key);
                  const hours = d?.hours || 0;
                  return (
                    <div
                      key={key}
                      className={`w-3 h-3 rounded-sm ${getIntensity(hours)} transition-colors hover:ring-1 hover:ring-primary cursor-pointer`}
                      title={`${format(day, 'MMM d, yyyy')}: ${hours.toFixed(1)}h`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
            <span>Less</span>
            {['bg-muted/30', 'bg-primary/20', 'bg-primary/40', 'bg-primary/60', 'bg-primary/90'].map((c, i) => (
              <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
            ))}
            <span>More</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
