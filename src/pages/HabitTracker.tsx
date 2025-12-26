import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useHabits, StudyHabit } from '@/hooks/useHabits';
import { Plus, Check, Flame, Target, Calendar, Trash2, Edit, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format, startOfWeek, addDays } from 'date-fns';

const HABIT_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e'
];

const HABIT_ICONS = ['check', 'book', 'brain', 'clock', 'star', 'target', 'trophy', 'zap'];

const HabitTracker = () => {
  const { habits, completions, loading, createHabit, updateHabit, deleteHabit, completeHabit, getTodayCompletions, getStreak } = useHabits();
  const [isCreating, setIsCreating] = useState(false);
  const [editingHabit, setEditingHabit] = useState<StudyHabit | null>(null);
  const [newHabit, setNewHabit] = useState({
    name: '',
    description: '',
    frequency: 'daily',
    target_per_day: 1,
    color: '#6366f1',
    icon: 'check',
  });

  const handleCreate = async () => {
    if (!newHabit.name.trim()) return;
    await createHabit(newHabit);
    setNewHabit({
      name: '',
      description: '',
      frequency: 'daily',
      target_per_day: 1,
      color: '#6366f1',
      icon: 'check',
    });
    setIsCreating(false);
  };

  const handleComplete = async (habitId: string) => {
    await completeHabit(habitId);
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    return addDays(start, i);
  });

  const getCompletionsForDay = (habitId: string, date: Date) => {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    
    return completions.filter(c => 
      c.habit_id === habitId &&
      new Date(c.completed_at) >= dayStart &&
      new Date(c.completed_at) <= dayEnd
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Habit Tracker</h1>
          <p className="text-muted-foreground">Build consistent study routines</p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Habit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Habit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Habit Name</Label>
                <Input
                  value={newHabit.name}
                  onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                  placeholder="e.g., Read for 30 minutes"
                />
              </div>
              <div>
                <Label>Description (optional)</Label>
                <Textarea
                  value={newHabit.description}
                  onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
                  placeholder="Why is this habit important to you?"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Frequency</Label>
                  <Select value={newHabit.frequency} onValueChange={(v) => setNewHabit({ ...newHabit, frequency: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Target per day</Label>
                  <Input
                    type="number"
                    min={1}
                    value={newHabit.target_per_day}
                    onChange={(e) => setNewHabit({ ...newHabit, target_per_day: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>
              <div>
                <Label>Color</Label>
                <div className="flex gap-2 mt-2">
                  {HABIT_COLORS.map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full transition-transform ${newHabit.color === color ? 'scale-110 ring-2 ring-offset-2 ring-primary' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewHabit({ ...newHabit, color })}
                    />
                  ))}
                </div>
              </div>
              <Button onClick={handleCreate} className="w-full">
                Create Habit
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{habits.length}</p>
                <p className="text-sm text-muted-foreground">Active Habits</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <Check className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {habits.reduce((acc, h) => acc + getTodayCompletions(h.id).length, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Completed Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-500/10 rounded-lg">
                <Flame className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {Math.max(...habits.map(h => getStreak(h.id)), 0)}
                </p>
                <p className="text-sm text-muted-foreground">Best Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completions.length}</p>
                <p className="text-sm text-muted-foreground">This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            This Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          {habits.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No habits yet. Create your first habit to start tracking!
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-2 w-48">Habit</th>
                    {weekDays.map((day) => (
                      <th key={day.toISOString()} className="text-center p-2 w-20">
                        <div className="text-xs text-muted-foreground">{format(day, 'EEE')}</div>
                        <div className="text-sm">{format(day, 'd')}</div>
                      </th>
                    ))}
                    <th className="text-center p-2">Streak</th>
                  </tr>
                </thead>
                <tbody>
                  {habits.map((habit) => (
                    <tr key={habit.id} className="border-t">
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: habit.color }}
                          />
                          <span className="font-medium">{habit.name}</span>
                        </div>
                      </td>
                      {weekDays.map((day) => {
                        const dayCompletions = getCompletionsForDay(habit.id, day);
                        const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                        const isCompleted = dayCompletions.length >= habit.target_per_day;
                        const isFuture = day > new Date();
                        
                        return (
                          <td key={day.toISOString()} className="text-center p-2">
                            {isFuture ? (
                              <div className="w-8 h-8 mx-auto rounded-lg bg-muted/30" />
                            ) : isToday ? (
                              <button
                                onClick={() => handleComplete(habit.id)}
                                className={`w-8 h-8 mx-auto rounded-lg flex items-center justify-center transition-colors ${
                                  isCompleted 
                                    ? 'text-white' 
                                    : 'bg-muted hover:bg-muted/80'
                                }`}
                                style={{ backgroundColor: isCompleted ? habit.color : undefined }}
                              >
                                {isCompleted ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <span className="text-xs">{dayCompletions.length}/{habit.target_per_day}</span>
                                )}
                              </button>
                            ) : (
                              <div
                                className={`w-8 h-8 mx-auto rounded-lg flex items-center justify-center ${
                                  isCompleted ? 'text-white' : 'bg-muted/50'
                                }`}
                                style={{ backgroundColor: isCompleted ? habit.color : undefined }}
                              >
                                {isCompleted && <Check className="h-4 w-4" />}
                              </div>
                            )}
                          </td>
                        );
                      })}
                      <td className="text-center p-2">
                        <Badge variant="secondary" className="gap-1">
                          <Flame className="h-3 w-3 text-orange-500" />
                          {getStreak(habit.id)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Habits List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {habits.map((habit) => {
          const todayCount = getTodayCompletions(habit.id).length;
          const progress = Math.min((todayCount / habit.target_per_day) * 100, 100);
          const streak = getStreak(habit.id);
          
          return (
            <Card key={habit.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: habit.color }}
                    >
                      <Check className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{habit.name}</h3>
                      <p className="text-xs text-muted-foreground capitalize">{habit.frequency}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => deleteHabit(habit.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                {habit.description && (
                  <p className="text-sm text-muted-foreground mb-4">{habit.description}</p>
                )}
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Today's Progress</span>
                    <span>{todayCount}/{habit.target_per_day}</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
                
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="gap-1">
                    <Flame className="h-3 w-3 text-orange-500" />
                    {streak} day streak
                  </Badge>
                  <Button
                    size="sm"
                    onClick={() => handleComplete(habit.id)}
                    disabled={todayCount >= habit.target_per_day}
                    style={{ backgroundColor: todayCount >= habit.target_per_day ? undefined : habit.color }}
                    className={todayCount >= habit.target_per_day ? '' : 'text-white hover:opacity-90'}
                  >
                    {todayCount >= habit.target_per_day ? 'Done!' : 'Complete'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default HabitTracker;
