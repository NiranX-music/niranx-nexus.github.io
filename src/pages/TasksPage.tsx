import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, 
  Trash2, 
  Check, 
  Star, 
  Calendar,
  Target,
  Trophy,
  Flame,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  dueDate?: string;
  xp: number;
  createdAt: string;
}

interface UserStats {
  totalXP: number;
  level: number;
  streak: number;
  tasksCompleted: number;
  badges: string[];
}

const TasksPage = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState('');
  const [userStats, setUserStats] = useState<UserStats>({
    totalXP: 0,
    level: 1,
    streak: 0,
    tasksCompleted: 0,
    badges: []
  });

  useEffect(() => {
    const savedTasks = localStorage.getItem('studyverse-tasks');
    const savedStats = localStorage.getItem('studyverse-user-stats');
    
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
    if (savedStats) {
      setUserStats(JSON.parse(savedStats));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('studyverse-tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('studyverse-user-stats', JSON.stringify(userStats));
  }, [userStats]);

  const addTask = () => {
    if (!newTask.trim()) return;

    const xpValue = priority === 'high' ? 30 : priority === 'medium' ? 20 : 10;
    
    const task: Task = {
      id: Date.now().toString(),
      title: newTask,
      completed: false,
      priority,
      category: category || 'General',
      xp: xpValue,
      createdAt: new Date().toISOString()
    };

    setTasks(prev => [...prev, task]);
    setNewTask('');
    setCategory('');

    toast({
      title: "Task Added! 🎯",
      description: `+${xpValue} XP when completed`
    });
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        const newCompleted = !task.completed;
        
        if (newCompleted) {
          // Award XP and update stats
          setUserStats(prevStats => {
            const newXP = prevStats.totalXP + task.xp;
            const newLevel = Math.floor(newXP / 100) + 1;
            const newTasksCompleted = prevStats.tasksCompleted + 1;
            
            return {
              ...prevStats,
              totalXP: newXP,
              level: newLevel,
              tasksCompleted: newTasksCompleted,
              streak: prevStats.streak + 1
            };
          });

          toast({
            title: "Task Complete! 🎉",
            description: `+${task.xp} XP earned!`
          });
        }
        
        return { ...task, completed: newCompleted };
      }
      return task;
    }));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const completedTasks = tasks.filter(task => task.completed).length;
  const progressPercentage = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  return (
    <div className="min-h-screen p-6 pb-20">
      {/* Header Stats */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Task Manager
          </h1>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <Trophy className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{userStats.level}</div>
              <div className="text-sm text-muted-foreground">Level</div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <Zap className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{userStats.totalXP}</div>
              <div className="text-sm text-muted-foreground">Total XP</div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <Flame className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{userStats.streak}</div>
              <div className="text-sm text-muted-foreground">Streak</div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <Check className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{userStats.tasksCompleted}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-card mb-6">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Daily Progress</span>
              <span className="text-sm text-muted-foreground">
                {completedTasks}/{tasks.length} tasks
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Add Task Form */}
      <Card className="glass-card mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Task
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <Input
                placeholder="What needs to be done?"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTask()}
                className="flex-1"
              />
              <Button onClick={addTask} className="glass-button">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Input
                placeholder="Category (optional)"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex-1 min-w-32"
              />
              
              <div className="flex gap-1">
                {(['low', 'medium', 'high'] as const).map((p) => (
                  <Button
                    key={p}
                    variant={priority === p ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPriority(p)}
                    className="capitalize"
                  >
                    {p}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="p-8 text-center">
              <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tasks yet</h3>
              <p className="text-muted-foreground">Add your first task to get started!</p>
            </CardContent>
          </Card>
        ) : (
          tasks.map((task) => (
            <Card 
              key={task.id} 
              className={`glass-card transition-all duration-200 ${
                task.completed ? 'opacity-75 bg-green-500/10' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleTask(task.id)}
                    className={`rounded-full w-8 h-8 p-0 ${
                      task.completed ? 'bg-green-500 text-white' : ''
                    }`}
                  >
                    {task.completed && <Check className="w-4 h-4" />}
                  </Button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-medium ${
                        task.completed ? 'line-through text-muted-foreground' : ''
                      }`}>
                        {task.title}
                      </h3>
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {task.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {task.xp} XP
                      </Badge>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTask(task.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default TasksPage;