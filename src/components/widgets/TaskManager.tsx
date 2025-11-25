import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, Calendar, Flag, Star, Trophy, Zap, Target, CheckCircle2, Clock, Repeat, Edit, Trash2, BookOpen } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useXPReward } from '@/hooks/useXPReward';
import { useXP } from '@/contexts/XPContext';

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  dueDate?: string;
  createdAt: string;
  xpReward: number;
  isRecurring?: boolean;
  recurringType?: 'daily' | 'weekly' | 'monthly';
  subtasks?: Array<{
    id: string;
    title: string;
    completed: boolean;
  }>;
  tags: string[];
}

interface GameStats {
  totalXP: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  tasksCompleted: number;
  lastCompletionDate?: string;
}

const TaskManager = () => {
  const { toast } = useToast();
  const { awardXP } = useXPReward();
  const { xp, level } = useXP();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [gameStats, setGameStats] = useState<GameStats>({
    totalXP: 0,
    level: 1,
    currentStreak: 0,
    longestStreak: 0,
    tasksCompleted: 0
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium' as Task['priority'],
    dueDate: '',
    tags: [] as string[],
    isRecurring: false,
    recurringType: 'daily' as Task['recurringType']
  });

  // Load data from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('studyverse-tasks');
    const savedStats = localStorage.getItem('studyverse-game-stats');
    
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    }
    
    if (savedStats) {
      try {
        setGameStats(JSON.parse(savedStats));
      } catch (error) {
        console.error('Error loading game stats:', error);
      }
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('studyverse-tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('studyverse-game-stats', JSON.stringify(gameStats));
  }, [gameStats]);

  const calculateXPReward = (priority: Task['priority']): number => {
    const baseXP = { low: 10, medium: 20, high: 30 };
    return baseXP[priority];
  };

  const calculateLevel = (xp: number): number => {
    return Math.floor(xp / 100) + 1;
  };

  const addOrUpdateTask = () => {
    if (!newTask.title.trim()) {
      toast({
        title: "Missing Title",
        description: "Please enter a task title",
        variant: "destructive",
      });
      return;
    }

    const xpReward = calculateXPReward(newTask.priority);
    const taskData: Task = {
      id: editingTask?.id || Math.random().toString(36).substr(2, 9),
      title: newTask.title,
      description: newTask.description,
      completed: editingTask?.completed || false,
      priority: newTask.priority,
      category: newTask.category,
      dueDate: newTask.dueDate || undefined,
      createdAt: editingTask?.createdAt || new Date().toISOString(),
      xpReward,
      isRecurring: newTask.isRecurring,
      recurringType: newTask.recurringType,
      tags: newTask.tags,
      subtasks: editingTask?.subtasks || []
    };

    if (editingTask) {
      setTasks(prev => prev.map(task => task.id === editingTask.id ? taskData : task));
      toast({
        title: "Task Updated! 📝",
        description: "Your task has been updated successfully",
      });
    } else {
      setTasks(prev => [...prev, taskData]);
      toast({
        title: "Task Added! ✨",
        description: `New task added with ${xpReward} XP reward`,
      });
    }

    resetForm();
  };

  const toggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const wasCompleted = task.completed;
    
    setTasks(prev => prev.map(t => 
      t.id === taskId 
        ? { ...t, completed: !t.completed }
        : t
    ));

    if (!wasCompleted) {
      // Task completed - award XP using universal system
      await awardXP('COMPLETE_TASK');
      
      const today = new Date().toDateString();
      const lastDate = gameStats.lastCompletionDate;
      const isConsecutiveDay = lastDate === new Date(Date.now() - 86400000).toDateString();
      const newStreak = lastDate === today ? gameStats.currentStreak : 
                       isConsecutiveDay ? gameStats.currentStreak + 1 : 1;

      const newStats = {
        totalXP: gameStats.totalXP + task.xpReward,
        level,
        currentStreak: newStreak,
        longestStreak: Math.max(gameStats.longestStreak, newStreak),
        tasksCompleted: gameStats.tasksCompleted + 1,
        lastCompletionDate: today
      };

      setGameStats(newStats);
      
      toast({
        title: `🎉 Task Completed!`,
        description: `Streak: ${newStreak} days | Level ${level}`,
      });

      // Handle recurring tasks
      if (task.isRecurring) {
        const newRecurringTask = {
          ...task,
          id: Math.random().toString(36).substr(2, 9),
          completed: false,
          createdAt: new Date().toISOString()
        };
        
        setTasks(prev => [...prev, newRecurringTask]);
      }
    } else {
      // Task uncompleted - update stats
      setGameStats(prev => ({
        ...prev,
        tasksCompleted: Math.max(0, prev.tasksCompleted - 1)
      }));
    }
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    toast({
      title: "Task Deleted 🗑️",
      description: "Task removed from your list",
    });
  };

  const resetForm = () => {
    setNewTask({
      title: '',
      description: '',
      category: '',
      priority: 'medium',
      dueDate: '',
      tags: [],
      isRecurring: false,
      recurringType: 'daily'
    });
    setShowAddForm(false);
    setEditingTask(null);
  };

  const startEdit = (task: Task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      description: task.description || '',
      category: task.category,
      priority: task.priority,
      dueDate: task.dueDate || '',
      tags: task.tags,
      isRecurring: task.isRecurring || false,
      recurringType: task.recurringType || 'daily'
    });
    setShowAddForm(true);
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-destructive border-destructive/30 bg-destructive/10';
      case 'medium':
        return 'text-warning border-warning/30 bg-warning/10';
      case 'low':
        return 'text-success border-success/30 bg-success/10';
      default:
        return '';
    }
  };

  const getDaysUntilDeadline = (dueDate: string) => {
    const deadline = new Date(dueDate);
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const filteredTasks = tasks.filter(task => {
    const statusMatch = filter === 'all' || 
      (filter === 'completed' && task.completed) ||
      (filter === 'pending' && !task.completed);
    
    const priorityMatch = priorityFilter === 'all' || task.priority === priorityFilter;
    
    return statusMatch && priorityMatch;
  }).sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const completedCount = tasks.filter(task => task.completed).length;
  const totalCount = tasks.length;
  const xpToNextLevel = ((gameStats.level) * 100) - gameStats.totalXP;

  return (
    <Card className="widget">
      <CardHeader className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Task Manager
                <Badge variant="secondary" className="text-xs">
                  Level {gameStats.level}
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {completedCount}/{totalCount} completed • {gameStats.currentStreak} day streak
              </p>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddForm(true)}
            className="glass-button"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">XP & Level</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>{gameStats.totalXP} XP</span>
                <span>{xpToNextLevel} to next level</span>
              </div>
              <Progress value={(gameStats.totalXP % 100)} className="h-2" />
            </div>
          </div>
          
          <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-warning" />
              <span className="text-sm font-medium">Streak Stats</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-warning font-medium">{gameStats.currentStreak}</div>
                <div className="text-muted-foreground">Current</div>
              </div>
              <div>
                <div className="text-warning font-medium">{gameStats.longestStreak}</div>
                <div className="text-muted-foreground">Best</div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {totalCount > 0 && (
          <div className="space-y-2">
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="progress-glow h-2 rounded-full transition-all duration-500"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {Math.round((completedCount / totalCount) * 100)}% Complete
            </p>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-1">
            {(['all', 'pending', 'completed'] as const).map((filterType) => (
              <Button
                key={filterType}
                variant={filter === filterType ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(filterType)}
                className="text-xs"
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </Button>
            ))}
          </div>
          
          <div className="flex gap-1">
            {(['all', 'high', 'medium', 'low'] as const).map((priority) => (
              <Button
                key={priority}
                variant={priorityFilter === priority ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPriorityFilter(priority)}
                className={`text-xs ${priority !== 'all' ? getPriorityColor(priority) : ''}`}
              >
                <Flag className="w-3 h-3 mr-1" />
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Tasks List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => {
              const daysUntil = task.dueDate ? getDaysUntilDeadline(task.dueDate) : null;
              
              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-lg border transition-all duration-200 ${
                    task.completed 
                      ? 'bg-muted/30 opacity-75' 
                      : 'bg-card hover:shadow-md border-border/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => toggleTask(task.id)}
                      className="mt-1"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className={`font-medium ${task.completed ? 'line-through' : ''}`}>
                          {task.title}
                        </h5>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getPriorityColor(task.priority)}`}
                        >
                          {task.priority}
                        </Badge>
                        {task.category && (
                          <Badge variant="secondary" className="text-xs">
                            <BookOpen className="w-3 h-3 mr-1" />
                            {task.category}
                          </Badge>
                        )}
                        {task.isRecurring && (
                          <Badge variant="outline" className="text-xs">
                            <Repeat className="w-3 h-3 mr-1" />
                            {task.recurringType}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs text-primary">
                          <Star className="w-3 h-3 mr-1" />
                          {task.xpReward} XP
                        </Badge>
                      </div>
                      
                      {task.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {task.description}
                        </p>
                      )}
                      
                      {task.dueDate && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(task.dueDate).toLocaleDateString()}
                          {daysUntil !== null && (
                            <span className={`ml-2 ${
                              daysUntil < 0 ? 'text-destructive' : 
                              daysUntil <= 3 ? 'text-warning' : 
                              'text-success'
                            }`}>
                              {daysUntil < 0 ? `${Math.abs(daysUntil)} days overdue` :
                               daysUntil === 0 ? 'Due today' :
                               `${daysUntil} days left`}
                            </span>
                          )}
                        </div>
                      )}

                      {task.tags.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {task.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(task)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTask(task.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No tasks found</p>
              <p className="text-sm">Add your first task to start earning XP!</p>
            </div>
          )}
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-card rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
              <h4 className="font-semibold mb-4">
                {editingTask ? 'Edit Task' : 'Add New Task'}
              </h4>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title*</label>
                  <Input
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter task title..."
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Add details..."
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Input
                    value={newTask.category}
                    onChange={(e) => setNewTask(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="e.g., Math, Physics, History"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <div className="flex gap-2 mt-1">
                    {(['high', 'medium', 'low'] as const).map((priority) => (
                      <Button
                        key={priority}
                        variant={newTask.priority === priority ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setNewTask(prev => ({ ...prev, priority }))}
                        className={`text-xs ${getPriorityColor(priority)}`}
                      >
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        <span className="ml-1">({calculateXPReward(priority)} XP)</span>
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Due Date</label>
                  <Input
                    type="datetime-local"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={newTask.isRecurring}
                    onCheckedChange={(checked) => setNewTask(prev => ({ ...prev, isRecurring: checked as boolean }))}
                  />
                  <label className="text-sm font-medium">Recurring Task</label>
                </div>

                {newTask.isRecurring && (
                  <div>
                    <label className="text-sm font-medium">Recurrence</label>
                    <Select
                      value={newTask.recurringType}
                      onValueChange={(value) => setNewTask(prev => ({ ...prev, recurringType: value as Task['recurringType'] }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 mt-6">
                <Button onClick={addOrUpdateTask} className="flex-1">
                  {editingTask ? 'Update' : 'Add'} Task
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskManager;