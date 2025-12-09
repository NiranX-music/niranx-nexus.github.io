import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Flame, Calendar, TrendingUp } from 'lucide-react';

interface HeatmapDay {
  date: string;
  totalMinutes: number;
  sessionsCount: number;
  focusScore: number;
  level: 0 | 1 | 2 | 3 | 4;
}

interface StudyHeatmapProps {
  userId?: string;
  showStats?: boolean;
  compact?: boolean;
}

export function StudyHeatmap({ userId, showStats = true, compact = false }: StudyHeatmapProps) {
  const [heatmapData, setHeatmapData] = useState<Map<string, HeatmapDay>>(new Map());
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const targetUserId = userId || user?.id;

  useEffect(() => {
    if (targetUserId) {
      fetchHeatmapData();
    }
  }, [targetUserId]);

  const fetchHeatmapData = async () => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 365);

      const { data, error } = await supabase
        .from('study_heatmap_data')
        .select('*')
        .eq('user_id', targetUserId)
        .gte('study_date', startDate.toISOString().split('T')[0])
        .order('study_date', { ascending: true });

      if (error) throw error;

      const dataMap = new Map<string, HeatmapDay>();
      data?.forEach(entry => {
        const level = getIntensityLevel(entry.total_minutes);
        dataMap.set(entry.study_date, {
          date: entry.study_date,
          totalMinutes: entry.total_minutes,
          sessionsCount: entry.sessions_count,
          focusScore: entry.focus_score,
          level
        });
      });

      setHeatmapData(dataMap);
    } catch (error) {
      console.error('Error fetching heatmap data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIntensityLevel = (minutes: number): 0 | 1 | 2 | 3 | 4 => {
    if (minutes === 0) return 0;
    if (minutes < 30) return 1;
    if (minutes < 60) return 2;
    if (minutes < 120) return 3;
    return 4;
  };

  const getLevelColor = (level: number): string => {
    const colors = [
      'bg-muted hover:bg-muted/80',
      'bg-green-200 dark:bg-green-900/50 hover:bg-green-300 dark:hover:bg-green-800/60',
      'bg-green-400 dark:bg-green-700/70 hover:bg-green-500 dark:hover:bg-green-600/80',
      'bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-500',
      'bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-400'
    ];
    return colors[level];
  };

  // Generate calendar grid
  const calendarData = useMemo(() => {
    const weeks: (HeatmapDay | null)[][] = [];
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 364);
    
    // Adjust to start from Sunday
    const startDay = startDate.getDay();
    startDate.setDate(startDate.getDate() - startDay);

    let currentWeek: (HeatmapDay | null)[] = [];
    const current = new Date(startDate);

    while (current <= today) {
      const dateStr = current.toISOString().split('T')[0];
      const dayData = heatmapData.get(dateStr) || {
        date: dateStr,
        totalMinutes: 0,
        sessionsCount: 0,
        focusScore: 0,
        level: 0 as const
      };

      currentWeek.push(dayData);

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }

      current.setDate(current.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }

    return weeks;
  }, [heatmapData]);

  // Calculate stats
  const stats = useMemo(() => {
    let totalMinutes = 0;
    let totalSessions = 0;
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = new Date();
    const sortedDates = Array.from(heatmapData.keys()).sort();

    sortedDates.forEach((dateStr, index) => {
      const day = heatmapData.get(dateStr)!;
      totalMinutes += day.totalMinutes;
      totalSessions += day.sessionsCount;

      if (day.totalMinutes > 0) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    });

    // Calculate current streak
    const current = new Date(today);
    while (true) {
      const dateStr = current.toISOString().split('T')[0];
      const day = heatmapData.get(dateStr);
      if (day && day.totalMinutes > 0) {
        currentStreak++;
        current.setDate(current.getDate() - 1);
      } else {
        break;
      }
    }

    return {
      totalMinutes,
      totalSessions,
      currentStreak,
      longestStreak,
      totalDays: heatmapData.size
    };
  }, [heatmapData]);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse">
            <div className="h-24 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className={compact ? 'pb-2' : ''}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className={compact ? 'text-lg' : ''}>Study Activity</CardTitle>
            {!compact && (
              <CardDescription>Your learning journey over the past year</CardDescription>
            )}
          </div>
          {showStats && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-500" />
                {stats.currentStreak} day streak
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats Row */}
        {showStats && !compact && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold text-foreground">
                {Math.round(stats.totalMinutes / 60)}h
              </p>
              <p className="text-xs text-muted-foreground">Total Study Time</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold text-foreground">{stats.totalSessions}</p>
              <p className="text-xs text-muted-foreground">Sessions</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold text-foreground">{stats.currentStreak}</p>
              <p className="text-xs text-muted-foreground">Current Streak</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold text-foreground">{stats.longestStreak}</p>
              <p className="text-xs text-muted-foreground">Longest Streak</p>
            </div>
          </div>
        )}

        {/* Heatmap Grid */}
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Month labels */}
            <div className="flex mb-1 pl-8">
              {calendarData.map((week, weekIndex) => {
                const firstDay = week.find(d => d !== null);
                if (!firstDay) return null;
                const date = new Date(firstDay.date);
                const showMonth = weekIndex === 0 || date.getDate() <= 7;
                
                return (
                  <div key={weekIndex} className="w-3 mx-[1px]">
                    {showMonth && (
                      <span className="text-[10px] text-muted-foreground">
                        {months[date.getMonth()]}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Day rows */}
            <div className="flex">
              {/* Day labels */}
              <div className="flex flex-col mr-2">
                {days.map((day, i) => (
                  <div key={day} className="h-3 my-[1px] flex items-center">
                    {i % 2 === 1 && (
                      <span className="text-[10px] text-muted-foreground w-6">
                        {day.slice(0, 3)}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Grid */}
              <div className="flex">
                {calendarData.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col">
                    {week.map((day, dayIndex) => (
                      <TooltipProvider key={dayIndex}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: weekIndex * 0.002 }}
                              className={`w-3 h-3 m-[1px] rounded-sm cursor-pointer transition-colors ${
                                day ? getLevelColor(day.level) : 'bg-transparent'
                              }`}
                            />
                          </TooltipTrigger>
                          {day && (
                            <TooltipContent side="top" className="text-xs">
                              <p className="font-medium">
                                {new Date(day.date).toLocaleDateString('en-US', { 
                                  weekday: 'short',
                                  month: 'short', 
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </p>
                              <p className="text-muted-foreground">
                                {day.totalMinutes > 0 
                                  ? `${Math.round(day.totalMinutes)} minutes • ${day.sessionsCount} session${day.sessionsCount !== 1 ? 's' : ''}`
                                  : 'No activity'}
                              </p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-2 mt-4">
              <span className="text-xs text-muted-foreground">Less</span>
              {[0, 1, 2, 3, 4].map(level => (
                <div
                  key={level}
                  className={`w-3 h-3 rounded-sm ${getLevelColor(level)}`}
                />
              ))}
              <span className="text-xs text-muted-foreground">More</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
