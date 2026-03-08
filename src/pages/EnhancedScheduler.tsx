import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  ExternalLink, 
  Video, 
  FileText,
  BookOpen,
  Target,
  AlertCircle,
  CheckCircle2,
  PlayCircle,
  Upload,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ScheduleTask {
  id: string;
  taskName: string;
  subject: string;
  topic: string;
  startTime: string;
  endTime: string;
  classDuration: number;
  classLink?: string;
  notes?: string;
  recordingLink?: string;
  taskType: string;
  priority: 'high' | 'medium' | 'low';
  day: string;
  isRecurring: boolean;
  status: 'upcoming' | 'active' | 'completed';
  created_at: string;
}

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Generate 10-minute time slots from 6:00 AM to 11:00 PM
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 6; hour <= 23; hour++) {
    for (let minute = 0; minute < 60; minute += 10) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(timeString);
    }
  }
  return slots;
};

const timeSlots = generateTimeSlots();

// Normalize time strings (e.g., "08:20:00" -> "08:20") for consistent comparisons
const normalizeTime = (time: string) => {
  if (!time) return time;
  return time.length >= 5 ? time.slice(0, 5) : time;
};


const EnhancedScheduler = () => {
  const [tasks, setTasks] = useState<ScheduleTask[]>([]);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ScheduleTask | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [columnSettingsOpen, setColumnSettingsOpen] = useState(false);
  const [taskColumns, setTaskColumns] = useState<string[]>(['main', 'optional', 'subtask', 'revision']);
  const [visibleTaskColumns, setVisibleTaskColumns] = useState<string[]>(['main', 'optional', 'subtask', 'revision']);
  const [newColumnName, setNewColumnName] = useState('');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    taskName: '',
    subject: '',
    topic: '',
    startTime: '',
    endTime: '',
    classDuration: 60,
    classLink: '',
    notes: '',
    recordingLink: '',
    taskType: 'main' as ScheduleTask['taskType'],
    priority: 'medium' as ScheduleTask['priority'],
    isRecurring: false
  });

  // Load tasks from Supabase
  useEffect(() => {
    fetchTasks();
    
    // Load saved column preferences
    const savedTaskColumns = localStorage.getItem('enhancedSchedulerTaskColumns');
    const savedVisibleTaskColumns = localStorage.getItem('enhancedSchedulerVisibleTaskColumns');
    
    if (savedTaskColumns) {
      setTaskColumns(JSON.parse(savedTaskColumns));
    }
    if (savedVisibleTaskColumns) {
      setVisibleTaskColumns(JSON.parse(savedVisibleTaskColumns));
    }
  }, []);

  // Save column preferences
  useEffect(() => {
    localStorage.setItem('enhancedSchedulerTaskColumns', JSON.stringify(taskColumns));
  }, [taskColumns]);

  useEffect(() => {
    localStorage.setItem('enhancedSchedulerVisibleTaskColumns', JSON.stringify(visibleTaskColumns));
  }, [visibleTaskColumns]);

  const fetchTasks = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to view your schedule",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('schedule_tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Convert database data to ScheduleTask format
      const scheduleTasks: ScheduleTask[] = (data || []).map(item => ({
        id: item.id,
        taskName: item.task_name,
        subject: item.subject,
        topic: item.topic || '',
        startTime: normalizeTime(item.start_time),
        endTime: normalizeTime(item.end_time),
        classDuration: item.class_duration,
        classLink: item.class_link,
        notes: item.notes,
        recordingLink: item.recording_link,
        taskType: item.task_type as ScheduleTask['taskType'],
        priority: item.priority as ScheduleTask['priority'],
        day: item.day_of_week,
        isRecurring: item.is_recurring,
        status: item.status as ScheduleTask['status'],
        created_at: item.created_at
      }));

      setTasks(scheduleTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveTaskToSupabase = async (task: ScheduleTask) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Handle recurring tasks by creating multiple entries for different weeks
      if (task.isRecurring) {
        // For recurring tasks, insert with upsert to avoid duplicates
        const { error } = await supabase
          .from('schedule_tasks')
          .upsert({
            id: task.id,
            user_id: user.id,
            task_name: task.taskName,
            subject: task.subject,
            topic: task.topic,
            start_time: task.startTime,
            end_time: task.endTime,
            class_duration: task.classDuration,
            class_link: task.classLink,
            notes: task.notes,
            recording_link: task.recordingLink,
            task_type: task.taskType,
            priority: task.priority,
            day_of_week: task.day,
            is_recurring: task.isRecurring,
            status: task.status
          }, {
            onConflict: 'id'
          });

        if (error) throw error;
      } else {
        // Regular insert for non-recurring tasks
        const { error } = await supabase
          .from('schedule_tasks')
          .insert({
            user_id: user.id,
            task_name: task.taskName,
            subject: task.subject,
            topic: task.topic,
            start_time: task.startTime,
            end_time: task.endTime,
            class_duration: task.classDuration,
            class_link: task.classLink,
            notes: task.notes,
            recording_link: task.recordingLink,
            task_type: task.taskType,
            priority: task.priority,
            day_of_week: task.day,
            is_recurring: task.isRecurring,
            status: task.status
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error saving task:', error);
      throw error;
    }
  };

  const saveRecordingToLibrary = async (task: ScheduleTask) => {
    if (!task.recordingLink) return;

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('study_materials')
        .insert({
          user_id: user.id,
          name: `${task.taskName} - Recording`,
          type: 'video',
          size: 0,
          url: task.recordingLink,
          category: task.subject,
          tags: ['recording', task.topic],
          notes: `Recording from ${task.taskName} class`,
          uploaded_by: 'Auto-saved from Scheduler',
        });

      if (error) throw error;

      toast({
        title: "Recording Saved! 📹",
        description: "Recording has been automatically saved to your library",
      });
    } catch (error) {
      console.error('Error saving recording:', error);
      toast({
        title: "Error",
        description: "Failed to save recording to library",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    if (!formData.taskName || !formData.subject || !formData.startTime || !formData.endTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const taskData: ScheduleTask = {
      id: editingTask?.id || Math.random().toString(36).substr(2, 9),
      taskName: formData.taskName,
      subject: formData.subject,
      topic: formData.topic,
      startTime: formData.startTime,
      endTime: formData.endTime,
      classDuration: formData.classDuration,
      classLink: formData.classLink,
      notes: formData.notes,
      recordingLink: formData.recordingLink,
      taskType: formData.taskType,
      priority: formData.priority,
      day: selectedDay,
      isRecurring: formData.isRecurring,
      status: 'upcoming',
      created_at: editingTask?.created_at || new Date().toISOString()
    };

    try {
      if (editingTask) {
        // Update in database
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('schedule_tasks')
            .update({
              task_name: taskData.taskName,
              subject: taskData.subject,
              topic: taskData.topic,
              start_time: taskData.startTime,
              end_time: taskData.endTime,
              class_duration: taskData.classDuration,
              class_link: taskData.classLink,
              notes: taskData.notes,
              recording_link: taskData.recordingLink,
              task_type: taskData.taskType,
              priority: taskData.priority,
              day_of_week: taskData.day,
              is_recurring: taskData.isRecurring,
              status: taskData.status
            })
            .eq('id', editingTask.id);
        }
        
        setTasks(prev => prev.map(task => task.id === editingTask.id ? taskData : task));
        
        // If recording link was added, save to library
        if (formData.recordingLink && !editingTask.recordingLink) {
          await saveRecordingToLibrary(taskData);
        }
      } else {
        await saveTaskToSupabase(taskData);
        setTasks(prev => [...prev, taskData]);
      }

      toast({
        title: editingTask ? "Task Updated" : "Task Added",
        description: `${taskData.taskName} has been ${editingTask ? 'updated' : 'added to your schedule'}`,
      });

      resetForm();
    } catch (error: any) {
      const errorMessage = error?.message?.includes('duplicate') 
        ? "A task with this schedule already exists. Please choose a different time or day."
        : "Failed to save task";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('schedule_tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setTasks(prev => prev.filter(task => task.id !== taskId));
      toast({
        title: "Task Deleted",
        description: "Task removed from schedule",
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  const editTask = (task: ScheduleTask) => {
    setEditingTask(task);
    setFormData({
      taskName: task.taskName,
      subject: task.subject,
      topic: task.topic,
      startTime: task.startTime,
      endTime: task.endTime,
      classDuration: task.classDuration,
      classLink: task.classLink || '',
      notes: task.notes || '',
      recordingLink: task.recordingLink || '',
      taskType: task.taskType,
      priority: task.priority,
      isRecurring: task.isRecurring
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      taskName: '',
      subject: '',
      topic: '',
      startTime: selectedTimeSlot || '',
      endTime: '',
      classDuration: 60,
      classLink: '',
      notes: '',
      recordingLink: '',
      taskType: 'main',
      priority: 'medium',
      isRecurring: false
    });
    setEditingTask(null);
    setIsDialogOpen(false);
  };

  const openAddDialog = (timeSlot?: string) => {
    setSelectedTimeSlot(timeSlot || '');
    setFormData(prev => ({
      ...prev,
      startTime: timeSlot || prev.startTime,
      endTime: timeSlot ? calculateEndTime(timeSlot, 60) : prev.endTime
    }));
    setIsDialogOpen(true);
  };

  const calculateEndTime = (startTime: string, duration: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMins = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  };

  const getTasksForTimeSlot = (time: string, typeFilter?: string) => {
    return tasks.filter(task => {
      if (task.day !== selectedDay) return false;
      const taskStart = task.startTime;
      const taskEnd = task.endTime;
      const matchesTime = time >= taskStart && time < taskEnd;
      const matchesType = !typeFilter || task.taskType === typeFilter;
      return matchesTime && matchesType;
    });
  };

  const toggleTaskColumn = (column: string) => {
    setVisibleTaskColumns(prev => 
      prev.includes(column) 
        ? prev.filter(col => col !== column)
        : [...prev, column]
    );
  };

  const addNewTaskColumn = () => {
    if (newColumnName.trim() && !taskColumns.includes(newColumnName.trim())) {
      const newColumn = newColumnName.trim();
      setTaskColumns(prev => [...prev, newColumn]);
      setVisibleTaskColumns(prev => [...prev, newColumn]);
      setNewColumnName('');
      toast({
        title: "Column Added",
        description: `Task column "${newColumn}" has been added`,
      });
    }
  };

  const getTaskTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      main: 'bg-primary',
      optional: 'bg-secondary',
      subtask: 'bg-accent',
      revision: 'bg-muted'
    };
    return colors[type] || 'bg-primary';
  };

  const getPriorityBadge = (priority: ScheduleTask['priority']) => {
    switch (priority) {
      case 'high': return <Badge variant="destructive">High</Badge>;
      case 'medium': return <Badge variant="default">Medium</Badge>;
      case 'low': return <Badge variant="secondary">Low</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p>Loading schedule...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Enhanced Scheduler</h1>
            <p className="text-muted-foreground">Manage your schedule with 10-minute precision</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={columnSettingsOpen} onOpenChange={setColumnSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Columns
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Customize Task Columns</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-3">Visible Task Type Columns</h3>
                    <div className="space-y-2">
                      {taskColumns.map(column => (
                        <div key={column} className="flex items-center space-x-2">
                          <Checkbox
                            id={`task-${column}`}
                            checked={visibleTaskColumns.includes(column)}
                            onCheckedChange={() => toggleTaskColumn(column)}
                          />
                          <Label htmlFor={`task-${column}`} className="capitalize">{column}</Label>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 flex gap-2">
                      <Input
                        placeholder="New column name"
                        value={newColumnName}
                        onChange={(e) => setNewColumnName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addNewTaskColumn()}
                      />
                      <Button onClick={addNewTaskColumn}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button onClick={() => openAddDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>

        {/* Day Selector */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-2 overflow-x-auto">
              {days.map(day => (
                <Button
                  key={day}
                  variant={selectedDay === day ? 'default' : 'outline'}
                  onClick={() => setSelectedDay(day)}
                  className="whitespace-nowrap"
                >
                  {day}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Schedule Grid */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {selectedDay} Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Column Headers */}
                <div className="flex border-b-2 border-border">
                  <div className="w-16 text-xs font-semibold text-muted-foreground py-2 px-2">
                    Time
                  </div>
                  {visibleTaskColumns.map(column => (
                    <div key={column} className="flex-1 text-xs font-semibold text-center py-2 px-2 border-l border-border capitalize">
                      {column}
                    </div>
                  ))}
                </div>
                
                {/* Time Slot Rows */}
                <div className="space-y-0 max-h-[600px] overflow-y-auto">
                  {timeSlots.map(time => {
                    return (
                      <div key={time} className="flex items-stretch border-b border-border/30 hover:bg-muted/50 transition-colors">
                        <div className="w-16 text-xs text-muted-foreground py-2 px-2 flex items-center">
                          {time}
                        </div>
                        {visibleTaskColumns.map(taskType => {
                          const tasksInSlot = getTasksForTimeSlot(time, taskType);
                          return (
                            <div
                              key={`${time}-${taskType}`}
                              className="flex-1 py-1 px-2 min-h-[40px] flex items-center cursor-pointer border-l border-border/30"
                              onClick={() => openAddDialog(time)}
                            >
                              {tasksInSlot.length > 0 ? (
                                <div className="w-full space-y-1">
                                  {tasksInSlot.map(task => (
                                    <div
                                      key={task.id}
                                      className={`p-2 rounded text-xs text-white ${getTaskTypeColor(task.taskType)} flex items-center justify-between`}
                                    >
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium truncate">{task.taskName}</div>
                                        <div className="opacity-90 truncate text-[10px]">{task.subject}</div>
                                      </div>
                                      <div className="flex gap-1 ml-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 w-6 p-0 text-white hover:bg-white/20"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            editTask(task);
                                          }}
                                        >
                                          <Edit className="w-3 h-3" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 w-6 p-0 text-white hover:bg-white/20"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            deleteTask(task.id);
                                          }}
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-muted-foreground text-xs opacity-50 text-center w-full">+</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task List */}
        <Card>
          <CardHeader>
            <CardTitle>All Tasks for {selectedDay}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tasks.filter(task => task.day === selectedDay).length > 0 ? (
                tasks
                  .filter(task => task.day === selectedDay)
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map(task => (
                    <div key={task.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{task.taskName}</h4>
                            <Badge variant="outline">{task.taskType}</Badge>
                            {getPriorityBadge(task.priority)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {task.subject} • {task.topic}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {task.startTime} - {task.endTime} ({task.classDuration}min)
                            </span>
                          </div>
                          {task.notes && (
                            <p className="text-sm text-muted-foreground mt-2">{task.notes}</p>
                          )}
                          <div className="flex gap-2 mt-2">
                            {task.classLink && (
                              <Button variant="outline" size="sm" onClick={() => window.open(task.classLink, '_blank')}>
                                <ExternalLink className="w-3 h-3 mr-1" />
                                Class Link
                              </Button>
                            )}
                            {task.recordingLink && (
                              <Button variant="outline" size="sm" onClick={() => window.open(task.recordingLink, '_blank')}>
                                <Video className="w-3 h-3 mr-1" />
                                Recording
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => editTask(task)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteTask(task.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No tasks scheduled for {selectedDay}</p>
                  <p className="text-sm">Click on a time slot to add your first task!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Basic Details</TabsTrigger>
                <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="taskName">Task Name *</Label>
                    <Input
                      id="taskName"
                      value={formData.taskName}
                      onChange={(e) => setFormData(prev => ({ ...prev, taskName: e.target.value }))}
                      placeholder="Enter task name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="e.g., Mathematics"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    value={formData.topic}
                    onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                    placeholder="e.g., Calculus, Derivatives"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="startTime">Start Time *</Label>
                    <Select value={formData.startTime} onValueChange={(value) => setFormData(prev => ({ ...prev, startTime: value, endTime: calculateEndTime(value, prev.classDuration) }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map(time => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="endTime">End Time *</Label>
                    <Select value={formData.endTime} onValueChange={(value) => setFormData(prev => ({ ...prev, endTime: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map(time => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="classDuration">Duration (min)</Label>
                    <Input
                      id="classDuration"
                      type="number"
                      min="10"
                      step="10"
                      value={formData.classDuration}
                      onChange={(e) => setFormData(prev => ({ ...prev, classDuration: parseInt(e.target.value) || 60 }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="classLink">Class Link</Label>
                  <Input
                    id="classLink"
                    value={formData.classLink}
                    onChange={(e) => setFormData(prev => ({ ...prev, classLink: e.target.value }))}
                    placeholder="https://meet.google.com/..."
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any additional notes..."
                    rows={3}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="advanced" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="taskType">Task Type</Label>
                    <Select value={formData.taskType} onValueChange={(value: ScheduleTask['taskType']) => setFormData(prev => ({ ...prev, taskType: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {taskColumns.map(column => (
                          <SelectItem key={column} value={column} className="capitalize">
                            {column}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={formData.priority} onValueChange={(value: ScheduleTask['priority']) => setFormData(prev => ({ ...prev, priority: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="recordingLink">Recording Link (Optional)</Label>
                  <Input
                    id="recordingLink"
                    value={formData.recordingLink}
                    onChange={(e) => setFormData(prev => ({ ...prev, recordingLink: e.target.value }))}
                    placeholder="Recording will be auto-saved to library"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Recording links will be automatically saved to your library for easy access
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isRecurring"
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="isRecurring">Recurring Task</Label>
                </div>
                {formData.isRecurring && (
                  <div className="space-y-2">
                    <Label>Recurrence</Label>
                    <Select value={(formData as any).recurrenceType || 'weekly'} onValueChange={v => setFormData(prev => ({ ...prev, recurrenceType: v } as any))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Bi-Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="flex gap-2 mt-6">
              <Button onClick={handleSubmit} className="flex-1">
                {editingTask ? 'Update Task' : 'Add Task'}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default EnhancedScheduler;