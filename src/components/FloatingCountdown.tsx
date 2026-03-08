import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, X, ExternalLink } from 'lucide-react';

interface NextTask {
  id: string;
  task_name: string;
  subject: string;
  start_time: string;
  day_of_week: string;
  class_link?: string | null;
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

export function FloatingCountdown() {
  const { user } = useAuth();
  const [nextTask, setNextTask] = useState<(NextTask & { nextTime: Date }) | null>(null);
  const [countdown, setCountdown] = useState('');
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  const fetchNext = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('schedule_tasks')
      .select('id, task_name, subject, start_time, day_of_week, class_link')
      .eq('user_id', user.id);
    if (!data?.length) return;

    const withTimes = data
      .map(t => ({ ...t, nextTime: getNextOccurrence(t.day_of_week, t.start_time.slice(0, 5)) }))
      .filter(t => t.nextTime > new Date())
      .sort((a, b) => a.nextTime.getTime() - b.nextTime.getTime());

    if (withTimes.length > 0) setNextTask(withTimes[0]);
  }, [user]);

  useEffect(() => { fetchNext(); const iv = setInterval(fetchNext, 60000); return () => clearInterval(iv); }, [fetchNext]);

  useEffect(() => {
    if (!nextTask) return;
    const update = () => {
      const diff = nextTask.nextTime.getTime() - Date.now();
      if (diff <= 0) { setVisible(false); return; }
      const mins = Math.floor(diff / 60000);
      setVisible(mins <= 10);
      if (mins <= 10) {
        const secs = Math.floor((diff % 60000) / 1000);
        setCountdown(`${mins}:${secs.toString().padStart(2, '0')}`);
      }
    };
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, [nextTask]);

  if (!visible || dismissed || !nextTask) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.9 }}
        className="fixed top-4 right-4 z-[100] max-w-xs"
      >
        <div className="rounded-xl border border-destructive/50 bg-background/95 backdrop-blur-lg shadow-[0_0_30px_hsl(var(--destructive)/0.2)] p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-destructive/10 animate-pulse">
              <Clock className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono text-destructive tracking-wider">STARTING SOON</span>
                <Button size="sm" variant="ghost" className="h-5 w-5 p-0" onClick={() => setDismissed(true)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-sm font-semibold truncate mt-1">{nextTask.task_name}</p>
              <p className="text-xs text-muted-foreground">{nextTask.subject}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="destructive" className="text-lg font-mono tabular-nums px-3">
                  {countdown}
                </Badge>
                {nextTask.class_link && (
                  <Button size="sm" variant="outline" className="h-7 text-xs" asChild>
                    <a href={nextTask.class_link} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-3 w-3 mr-1" /> Join
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
