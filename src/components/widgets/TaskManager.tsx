import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  CheckSquare, 
  Plus, 
  Calendar, 
  Flag, 
  Clock,
  Edit,
  Trash2,
  Filter,
  BookOpen,
  Target
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Task {
  id: string;
  title: string;
  description?: string;
  subject?: string;
  priority: 'high' | 'medium' | 'low';
  deadline?: Date;
  completed: boolean;
  createdAt: Date;
  subtasks?: SubTask[];
}

interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

const TaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [newTask, setNewTask] = useState<{
    title: string;
    description: string;
    subject: string;
    priority: Task['priority'];
    deadline: string;
  }>({
    title: '',
    description: '',
    subject: '',
    priority: 'medium',
    deadline: '',
  });

  // Load tasks from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('studyverse-tasks');
    if (savedTasks) {
      try {
        const parsed = JSON.parse(savedTasks);
        setTasks(parsed.map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          deadline: task.deadline ? new Date(task.deadline) : undefined,
        })));
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    }
  }, []);

  // Save tasks to localStorage
  useEffect(() => {
    localStorage.setItem('studyverse-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addOrUpdateTask = () => {
    if (!newTask.title.trim()) {
      toast({
        title: "Missing Title",
        description: "Please enter a task title",
        variant: "destructive",
      });
      return;
    }

    const taskData: Task = {
      id: editingTask?.id || Math.random().toString(36).substr(2, 9),
      title: newTask.title,
      description: newTask.description,
      subject: newTask.subject,
      priority: newTask.priority,
      deadline: newTask.deadline ? new Date(newTask.deadline) : undefined,
      completed: editingTask?.completed || false,
      createdAt: editingTask?.createdAt || new Date(),
      subtasks: editingTask?.subtasks || [],
    };

    if (editingTask) {
      setTasks(prev => prev.map(task => task.id === editingTask.id ? taskData : task));
      toast({
        title: "Task Updated",
        description: "Your task has been updated successfully",
      });
    } else {
      setTasks(prev => [...prev, taskData]);
      toast({
        title: "Task Added",
        description: "New task added to your list",
      });
    }

    resetForm();
  };

  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, completed: !task.completed }
        : task
    ));
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    toast({
      title: "Task Deleted",
      description: "Task removed from your list",
    });
  };

  const resetForm = () => {
    setNewTask({
      title: '',
      description: '',
      subject: '',
      priority: 'medium',
      deadline: '',
    });
    setShowAddForm(false);
    setEditingTask(null);
  };

  const startEdit = (task: Task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      description: task.description || '',
      subject: task.subject || '',
      priority: task.priority,
      deadline: task.deadline ? task.deadline.toISOString().slice(0, 16) : '',
    });
    setShowAddForm(true);
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 border-red-500/30 bg-red-500/10';
      case 'medium':
        return 'text-yellow-600 border-yellow-500/30 bg-yellow-500/10';
      case 'low':
        return 'text-green-600 border-green-500/30 bg-green-500/10';
      default:
        return '';
    }
  };

  const getDaysUntilDeadline = (deadline: Date) => {
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
    // Sort by completion status, then by priority, then by deadline
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    
    if (a.deadline && b.deadline) {
      return a.deadline.getTime() - b.deadline.getTime();
    }
    
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  const completedCount = tasks.filter(task => task.completed).length;
  const totalCount = tasks.length;

  return (
    <Card className="widget">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
              <CheckSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Task Manager</h3>
              <p className="text-sm text-muted-foreground">
                {completedCount}/{totalCount} completed
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

        {/* Tasks List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => {
              const daysUntil = task.deadline ? getDaysUntilDeadline(task.deadline) : null;
              
              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-lg border transition-all duration-200 ${
                    task.completed 
                      ? 'bg-muted/30 opacity-75' 
                      : `priority-${task.priority} hover:shadow-md`
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
                        {task.subject && (
                          <Badge variant="secondary" className="text-xs">
                            <BookOpen className="w-3 h-3 mr-1" />
                            {task.subject}
                          </Badge>
                        )}
                      </div>
                      
                      {task.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {task.description}
                        </p>
                      )}
                      
                      {task.deadline && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {task.deadline.toLocaleDateString()}
                          {daysUntil !== null && (
                            <span className={`ml-2 ${
                              daysUntil < 0 ? 'text-red-500' : 
                              daysUntil <= 3 ? 'text-yellow-500' : 
                              'text-green-500'
                            }`}>
                              {daysUntil < 0 ? `${Math.abs(daysUntil)} days overdue` :
                               daysUntil === 0 ? 'Due today' :
                               `${daysUntil} days left`}
                            </span>
                          )}
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
              <p className="text-sm">Add your first task to get started!</p>
            </div>
          )}
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-card rounded-lg max-w-md w-full p-6">
              <h4 className="font-semibold mb-4">
                {editingTask ? 'Edit Task' : 'Add New Task'}
              </h4>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter task title..."
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Description (optional)</label>
                  <Textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Add details..."
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Subject (optional)</label>
                  <Input
                    value={newTask.subject}
                    onChange={(e) => setNewTask(prev => ({ ...prev, subject: e.target.value }))}
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
                        className={`${getPriorityColor(priority)} text-xs`}
                      >
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Deadline (optional)</label>
                  <Input
                    type="datetime-local"
                    value={newTask.deadline}
                    onChange={(e) => setNewTask(prev => ({ ...prev, deadline: e.target.value }))}
                  />
                </div>
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
      </div>
    </Card>
  );
};

export default TaskManager;