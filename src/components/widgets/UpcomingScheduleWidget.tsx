import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, ExternalLink, ArrowRight, Orbit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UpcomingTask {
  id: string;
  task_name: string;
  subject: string;
  start_time: string;
  end_time: string;
  day_of_week: string;
  class_link?: string | null;
  priority?: string | null;
  task_type?: string | null;
}

function getNextOccurrence(dayName: string, startTime: string): Date {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const now = new Date();
  const targetDay = days.indexOf(dayName);
  if (targetDay === -1) return now;
  
  const currentDay = now.getDay();
  let daysUntil = targetDay - currentDay;
  if (daysUntil < 0) daysUntil += 7;
  
  const [hours, minutes] = startTime.split(':').map(Number);
  const target = new Date(now);
  target.setDate(target.getDate() + daysUntil);
  target.setHours(hours, minutes, 0, 0);
  
  if (target < now) target.setDate(target.getDate() + 7);
  return target;
}

export default function UpcomingScheduleWidget() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<UpcomingTask[]>([]);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('schedule_tasks')
      .select('id, task_name, subject, start_time, end_time, day_of_week, class_link, priority, task_type')
      .eq('user_id', user.id)
      .order('start_time');
    if (data) setTasks(data);
  }, [user]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const upcoming = tasks
    .map(t => ({ ...t, nextTime: getNextOccurrence(t.day_of_week, t.start_time.slice(0, 5)) }))
    .filter(t => t.nextTime > new Date())
    .sort((a, b) => a.nextTime.getTime() - b.nextTime.getTime())
    .slice(0, 5);

  const priorityColor = (p: string | null) => {
    if (p === 'high') return 'destructive';
    if (p === 'medium') return 'default';
    return 'secondary';
  };

  if (!user || upcoming.length === 0) return null;

  return (
    <Card className="holo-card neon-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-mono tracking-wider flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            UPCOMING_SCHEDULE
          </CardTitle>
          <div className="flex gap-1.5">
            <Button size="sm" variant="ghost" className="text-xs font-mono h-7" onClick={() => navigate('/niranx/scheduler')}>
              SCHEDULER <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
            <Button size="sm" variant="ghost" className="text-xs font-mono h-7" onClick={() => navigate('/niranx/xorbit')}>
              <Orbit className="h-3 w-3 mr-1" /> XORBIT
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <AnimatePresence>
          {upcoming.map((task, i) => {
            const diffMs = task.nextTime.getTime() - Date.now();
            const diffMins = Math.floor(diffMs / 60000);
            const diffHrs = Math.floor(diffMins / 60);
            const timeLabel = diffHrs > 24 
              ? `${task.day_of_week} ${task.start_time.slice(0,5)}`
              : diffHrs > 0 
                ? `in ${diffHrs}h ${diffMins % 60}m` 
                : `in ${diffMins}m`;

            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 border border-border/30 group hover:border-primary/30 transition-all"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{task.task_name}</span>
                    <Badge variant={priorityColor(task.priority)} className="text-[9px] shrink-0">
                      {task.priority?.toUpperCase() || 'LOW'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono mt-0.5">
                    <span>{task.subject}</span>
                    <span>•</span>
                    <Clock className="h-3 w-3" />
                    <span>{task.start_time.slice(0,5)} - {task.end_time.slice(0,5)}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-xs font-mono ${diffMins <= 10 ? 'text-destructive animate-pulse' : 'text-muted-foreground'}`}>
                    {timeLabel}
                  </span>
                </div>
                {task.class_link && (
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 shrink-0" asChild>
                    <a href={task.class_link} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
