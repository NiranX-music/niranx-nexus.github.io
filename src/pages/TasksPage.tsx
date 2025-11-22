import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AIContextualSuggestions } from "@/components/AIContextualSuggestions";
import { 
  Plus, 
  Trash2, 
  Check, 
  Star, 
  Target,
  Trophy,
  Flame,
  Zap,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useXP } from '@/contexts/XPContext';

interface Task {
  id: string;
  user_id: string;
  title: string;
  completed: boolean;
  priority: string;
  category: string;
  due_date: string | null;
  xp_reward: number;
  created_at: string;
  description: string | null;
  completed_at: string | null;
  updated_at: string;
  recurring_type: string | null;
  subtasks: any;
  tags: string[] | null;
}

const TasksPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { addXP, xp, level } = useXP();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [tasksCompleted, setTasksCompleted] = useState(0);

  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  const loadTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
      setTasksCompleted((data || []).filter(t => t.completed).length);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addTask = async () => {
    if (!newTask.trim() || !user) return;

    const xpValue = priority === 'high' ? 30 : priority === 'medium' ? 20 : 10;
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          title: newTask,
          priority,
          category: category || 'General',
          xp_reward: xpValue,
          completed: false
        })
        .select()
        .single();

      if (error) throw error;

      setTasks(prev => [data, ...prev]);
      setNewTask('');
      setCategory('');

      toast({
        title: "Task Added! 🎯",
        description: `+${xpValue} XP when completed`
      });
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: "Error",
        description: "Failed to add task",
        variant: "destructive"
      });
    }
  };

  const toggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !user) return;

    const newCompleted = !task.completed;
    
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          completed: newCompleted,
          completed_at: newCompleted ? new Date().toISOString() : null
        })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, completed: newCompleted } : t
      ));

      if (newCompleted) {
        addXP(task.xp_reward);
        setTasksCompleted(prev => prev + 1);
        toast({
          title: "Task Complete! 🎉",
          description: `+${task.xp_reward} XP earned!`
        });
      } else {
        setTasksCompleted(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error toggling task:', error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive"
      });
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.filter(t => t.id !== taskId));
      toast({
        title: "Task Deleted",
        description: "Task removed successfully"
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive"
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const completedTasksCount = tasks.filter(t => t.completed).length;
  const progressPercentage = tasks.length > 0 ? (completedTasksCount / tasks.length) * 100 : 0;

  if (loading) {
    return (
      <div className="mobile-container mobile-padding flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mobile-container mobile-padding space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm opacity-90">Level</p>
                <p className="text-2xl md:text-3xl font-bold">{level}</p>
              </div>
              <Star className="w-8 h-8 md:w-12 md:h-12 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm opacity-90">Total XP</p>
                <p className="text-2xl md:text-3xl font-bold">{xp}</p>
              </div>
              <Zap className="w-8 h-8 md:w-12 md:h-12 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm opacity-90">Streak</p>
                <p className="text-2xl md:text-3xl font-bold">0</p>
              </div>
              <Flame className="w-8 h-8 md:w-12 md:h-12 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm opacity-90">Completed</p>
                <p className="text-2xl md:text-3xl font-bold">{tasksCompleted}</p>
              </div>
              <Trophy className="w-8 h-8 md:w-12 md:h-12 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs md:text-sm font-medium">Today's Progress</span>
              <span className="text-xs md:text-sm text-muted-foreground">
                {completedTasksCount} / {tasks.length} tasks
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2 md:h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Add Task Form */}
      <Card>
        <CardHeader className="mobile-padding">
          <CardTitle className="text-lg md:text-xl">Add New Task</CardTitle>
        </CardHeader>
        <CardContent className="mobile-padding">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            <Input
              placeholder="Task title..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
              className="flex-1 min-h-[44px] text-base"
            />
            <Input
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full md:w-32 min-h-[44px] text-base"
            />
            <div className="flex gap-2">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                className="flex-1 md:flex-none px-3 py-2 border border-input rounded-md bg-background min-h-[44px] text-base"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <Button onClick={addTask} className="min-h-[44px]">
                <Plus className="w-4 h-4 mr-0 md:mr-2" />
                <span className="hidden sm:inline">Add</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <Card>
        <CardHeader className="mobile-padding">
          <CardTitle className="text-lg md:text-xl">Tasks</CardTitle>
        </CardHeader>
        <CardContent className="mobile-padding space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Target className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 opacity-50" />
              <p className="text-sm md:text-base">No tasks yet. Add your first task to get started!</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 border rounded-lg transition-all gap-3 ${
                  task.completed ? 'opacity-50 bg-muted' : 'hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-3 md:gap-4 flex-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleTask(task.id)}
                    className={`min-w-[44px] min-h-[44px] ${task.completed ? 'text-green-500' : ''}`}
                  >
                    <Check className="w-4 h-4 md:w-5 md:h-5" />
                  </Button>
                  <div className="flex-1">
                    <p className={`text-sm md:text-base font-medium ${task.completed ? 'line-through' : ''}`}>
                      {task.title}
                    </p>
                    <div className="flex gap-1 md:gap-2 mt-1 flex-wrap">
                      <Badge variant="secondary" className="text-xs">{task.category}</Badge>
                      <Badge className={`${getPriorityColor(task.priority)} text-xs`}>
                        {task.priority}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Zap className="w-3 h-3 mr-1" />
                        {task.xp_reward} XP
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteTask(task.id)}
                  className="text-destructive hover:text-destructive min-w-[44px] min-h-[44px]"
                >
                  <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TasksPage;
