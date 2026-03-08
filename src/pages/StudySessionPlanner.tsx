import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { CalendarClock, Plus, Trash2, Clock, BookOpen, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface TimeBlock {
  id: string;
  subject: string;
  startTime: string;
  endTime: string;
  color: string;
  notes: string;
}

interface DayPlan {
  date: string;
  blocks: TimeBlock[];
}

const subjectColors: Record<string, string> = {
  Mathematics: 'bg-primary/20 border-primary/40 text-primary',
  Physics: 'bg-accent/20 border-accent/40 text-accent',
  Chemistry: 'bg-success/20 border-success/40 text-success',
  Biology: 'bg-warning/20 border-warning/40 text-warning',
  Literature: 'bg-destructive/20 border-destructive/40 text-destructive',
  Programming: 'bg-primary/30 border-primary/50 text-primary',
  History: 'bg-accent/30 border-accent/50 text-accent',
  General: 'bg-muted border-border text-foreground',
};

const hours = Array.from({ length: 16 }, (_, i) => {
  const h = i + 6;
  return `${h.toString().padStart(2, '0')}:00`;
});

const subjects = Object.keys(subjectColors);

const StudySessionPlanner = () => {
  const [plans, setPlans] = useState<DayPlan[]>(() => {
    const saved = localStorage.getItem('study-session-plans');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [newSubject, setNewSubject] = useState('Mathematics');
  const [newStart, setNewStart] = useState('09:00');
  const [newEnd, setNewEnd] = useState('10:00');
  const [newNotes, setNewNotes] = useState('');

  const currentPlan = useMemo(() => {
    return plans.find(p => p.date === selectedDate) || { date: selectedDate, blocks: [] };
  }, [plans, selectedDate]);

  const savePlans = (updated: DayPlan[]) => {
    setPlans(updated);
    localStorage.setItem('study-session-plans', JSON.stringify(updated));
  };

  const addBlock = () => {
    if (newStart >= newEnd) {
      toast.error('End time must be after start time');
      return;
    }
    const block: TimeBlock = {
      id: Date.now().toString(),
      subject: newSubject,
      startTime: newStart,
      endTime: newEnd,
      color: subjectColors[newSubject] || subjectColors.General,
      notes: newNotes,
    };
    const existing = plans.find(p => p.date === selectedDate);
    let updated: DayPlan[];
    if (existing) {
      updated = plans.map(p => p.date === selectedDate
        ? { ...p, blocks: [...p.blocks, block].sort((a, b) => a.startTime.localeCompare(b.startTime)) }
        : p
      );
    } else {
      updated = [...plans, { date: selectedDate, blocks: [block] }];
    }
    savePlans(updated);
    setNewNotes('');
    toast.success('Block added');
  };

  const removeBlock = (blockId: string) => {
    const updated = plans.map(p => p.date === selectedDate
      ? { ...p, blocks: p.blocks.filter(b => b.id !== blockId) }
      : p
    ).filter(p => p.blocks.length > 0);
    savePlans(updated);
    toast.success('Removed');
  };

  const totalMinutes = currentPlan.blocks.reduce((acc, b) => {
    const [sh, sm] = b.startTime.split(':').map(Number);
    const [eh, em] = b.endTime.split(':').map(Number);
    return acc + (eh * 60 + em) - (sh * 60 + sm);
  }, 0);

  const weekDates = useMemo(() => {
    const d = new Date(selectedDate);
    const day = d.getDay();
    const start = new Date(d);
    start.setDate(d.getDate() - day + 1);
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return date.toISOString().split('T')[0];
    });
  }, [selectedDate]);

  return (
    <div className="min-h-full p-4 md:p-6 space-y-6 cyber-grid">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <CalendarClock className="w-8 h-8 text-primary" />
            <h1 className="text-2xl md:text-3xl font-display font-bold gradient-text tracking-wider">
              SESSION_PLANNER
            </h1>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="font-mono text-xs gap-2">
                <Plus className="w-4 h-4" /> ADD_BLOCK
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-mono tracking-wider">ADD_TIME_BLOCK</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Select value={newSubject} onValueChange={setNewSubject}>
                  <SelectTrigger className="font-mono text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {subjects.map(s => <SelectItem key={s} value={s} className="font-mono text-sm">{s}</SelectItem>)}
                  </SelectContent>
                </Select>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-mono text-[10px] text-muted-foreground">START</label>
                    <Input type="time" value={newStart} onChange={e => setNewStart(e.target.value)} className="font-mono" />
                  </div>
                  <div>
                    <label className="font-mono text-[10px] text-muted-foreground">END</label>
                    <Input type="time" value={newEnd} onChange={e => setNewEnd(e.target.value)} className="font-mono" />
                  </div>
                </div>
                <Input placeholder="Notes (optional)" value={newNotes} onChange={e => setNewNotes(e.target.value)} className="font-mono text-sm" />
                <Button onClick={addBlock} className="w-full font-mono text-xs">ADD_BLOCK</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <p className="font-mono text-xs text-muted-foreground tracking-widest">
          {">"} TIME_ALLOCATION // DAILY_BLOCKS
        </p>
      </motion.div>

      {/* Week Selector */}
      <div className="flex gap-1.5 overflow-x-auto pb-2">
        {weekDates.map(date => {
          const d = new Date(date);
          const hasPlan = plans.some(p => p.date === date && p.blocks.length > 0);
          return (
            <Button key={date} size="sm"
              variant={selectedDate === date ? 'default' : 'outline'}
              onClick={() => setSelectedDate(date)}
              className={cn("font-mono text-xs min-w-[70px] flex-col h-auto py-2 gap-0.5", selectedDate !== date && "glass-button")}
            >
              <span className="text-[9px]">{d.toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase()}</span>
              <span className="text-sm font-bold">{d.getDate()}</span>
              {hasPlan && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
            </Button>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'BLOCKS', value: currentPlan.blocks.length, color: 'text-primary' },
          { label: 'TOTAL_MIN', value: totalMinutes, color: 'text-accent' },
          { label: 'HOURS', value: (totalMinutes / 60).toFixed(1), color: 'text-success' },
        ].map(s => (
          <Card key={s.label} className="tech-card">
            <CardContent className="p-3 text-center">
              <p className={cn("text-xl font-display font-bold tabular-nums", s.color)}>{s.value}</p>
              <p className="text-[9px] font-mono text-muted-foreground tracking-widest">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Timeline */}
      <Card className="tech-card">
        <CardHeader className="pb-2">
          <CardTitle className="font-mono text-xs tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" /> TIMELINE — {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {currentPlan.blocks.length === 0 ? (
            <div className="text-center py-12">
              <CalendarClock className="w-12 h-12 mx-auto text-muted-foreground/20 mb-3" />
              <p className="font-mono text-sm text-muted-foreground">NO_BLOCKS_SCHEDULED</p>
              <p className="font-mono text-[10px] text-muted-foreground/60 mt-1">Add time blocks to plan your day</p>
            </div>
          ) : (
            <div className="space-y-2">
              {currentPlan.blocks.map((block, i) => (
                <motion.div key={block.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn("flex items-center gap-3 p-3 rounded-lg border", block.color)}
                >
                  <GripVertical className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono text-xs font-semibold">{block.subject}</span>
                      <Badge variant="outline" className="text-[9px] font-mono">
                        {block.startTime} — {block.endTime}
                      </Badge>
                    </div>
                    {block.notes && (
                      <p className="font-mono text-[10px] text-muted-foreground truncate">{block.notes}</p>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removeBlock(block.id)}>
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudySessionPlanner;
