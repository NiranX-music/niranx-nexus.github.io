import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  AlertTriangle, 
  Trash2,
  Target,
  Users,
  Timer as TimerIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";

// Types
interface Task {
  id: string;
  name: string;
  resource: string;
  startTime: Date;
  endTime: Date;
  color: string;
}

interface Overlap {
  task1: Task;
  task2: Task;
  overlapStart: Date;
  overlapEnd: Date;
  duration: number; // in minutes
}

// Resource colors
const RESOURCE_COLORS = {
  'Resource 1': '#14b8a6', // teal
  'Resource 2': '#f59e0b', // yellow
  'Resource 3': '#ef4444', // red
  'Resource 4': '#8b5cf6', // purple
  'Resource 5': '#06b6d4', // cyan
};

const RESOURCES = Object.keys(RESOURCE_COLORS);

const TaskScheduler = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState({
    name: '',
    resource: '',
    startDate: new Date(),
    startTime: '09:00',
    endDate: new Date(),
    endTime: '10:00'
  });
  const { toast } = useToast();

  // Initialize with sample data
  useEffect(() => {
    const savedTasks = localStorage.getItem('task-scheduler-data');
    if (savedTasks) {
      const parsed = JSON.parse(savedTasks);
      setTasks(parsed.map((task: any) => ({
        ...task,
        startTime: new Date(task.startTime),
        endTime: new Date(task.endTime)
      })));
    } else {
      // Sample data similar to the image provided
      const sampleTasks: Task[] = [
        {
          id: '1',
          name: 'Task 1',
          resource: 'Resource 1',
          startTime: new Date(2024, 0, 15, 9, 0), // 9:00 AM
          endTime: new Date(2024, 0, 15, 14, 0), // 2:00 PM
          color: RESOURCE_COLORS['Resource 1']
        },
        {
          id: '2',
          name: 'Task 2',
          resource: 'Resource 2',
          startTime: new Date(2024, 0, 15, 10, 0), // 10:00 AM
          endTime: new Date(2024, 0, 15, 16, 0), // 4:00 PM
          color: RESOURCE_COLORS['Resource 2']
        },
        {
          id: '3',
          name: 'Task 3',
          resource: 'Resource 1',
          startTime: new Date(2024, 0, 15, 12, 0), // 12:00 PM
          endTime: new Date(2024, 0, 15, 18, 0), // 6:00 PM
          color: RESOURCE_COLORS['Resource 1']
        },
        {
          id: '4',
          name: 'Task 4',
          resource: 'Resource 3',
          startTime: new Date(2024, 0, 15, 13, 0), // 1:00 PM
          endTime: new Date(2024, 0, 15, 19, 0), // 7:00 PM
          color: RESOURCE_COLORS['Resource 3']
        },
        {
          id: '5',
          name: 'Task 5',
          resource: 'Resource 2',
          startTime: new Date(2024, 0, 15, 14, 0), // 2:00 PM
          endTime: new Date(2024, 0, 15, 20, 0), // 8:00 PM
          color: RESOURCE_COLORS['Resource 2']
        }
      ];
      setTasks(sampleTasks);
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('task-scheduler-data', JSON.stringify(tasks));
  }, [tasks]);

  // Calculate overlaps
  const overlaps = useMemo(() => {
    const overlapList: Overlap[] = [];
    
    for (let i = 0; i < tasks.length; i++) {
      for (let j = i + 1; j < tasks.length; j++) {
        const task1 = tasks[i];
        const task2 = tasks[j];
        
        // Check if tasks overlap in time
        const overlapStart = new Date(Math.max(task1.startTime.getTime(), task2.startTime.getTime()));
        const overlapEnd = new Date(Math.min(task1.endTime.getTime(), task2.endTime.getTime()));
        
        if (overlapStart < overlapEnd) {
          const duration = Math.round((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60));
          overlapList.push({
            task1,
            task2,
            overlapStart,
            overlapEnd,
            duration
          });
        }
      }
    }
    
    return overlapList;
  }, [tasks]);

  // Get unique overlapping tasks
  const overlappingTasks = useMemo(() => {
    const taskSet = new Set<string>();
    overlaps.forEach(overlap => {
      taskSet.add(overlap.task1.id);
      taskSet.add(overlap.task2.id);
    });
    return tasks.filter(task => taskSet.has(task.id));
  }, [tasks, overlaps]);

  // Add new task
  const handleAddTask = () => {
    if (!newTask.name.trim() || !newTask.resource) {
      toast({
        title: "Missing Information",
        description: "Please fill in task name and resource",
        variant: "destructive",
      });
      return;
    }

    const [startHours, startMinutes] = newTask.startTime.split(':').map(Number);
    const [endHours, endMinutes] = newTask.endTime.split(':').map(Number);
    
    const startDateTime = new Date(newTask.startDate);
    startDateTime.setHours(startHours, startMinutes, 0, 0);
    
    const endDateTime = new Date(newTask.endDate);
    endDateTime.setHours(endHours, endMinutes, 0, 0);

    if (startDateTime >= endDateTime) {
      toast({
        title: "Invalid Time Range",
        description: "End time must be after start time",
        variant: "destructive",
      });
      return;
    }

    const task: Task = {
      id: Date.now().toString(),
      name: newTask.name,
      resource: newTask.resource,
      startTime: startDateTime,
      endTime: endDateTime,
      color: RESOURCE_COLORS[newTask.resource]
    };

    setTasks(prev => [...prev, task]);
    
    // Reset form
    setNewTask({
      name: '',
      resource: '',
      startDate: new Date(),
      startTime: '09:00',
      endDate: new Date(),
      endTime: '10:00'
    });

    toast({
      title: "Task Added",
      description: `${task.name} has been scheduled successfully`,
    });
  };

  // Remove task
  const handleRemoveTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    toast({
      title: "Task Removed",
      description: "Task has been removed from the schedule",
    });
  };

  // Format duration in hours and minutes
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Task Scheduler & Visualizer</h1>
            <p className="text-muted-foreground">Manage tasks, resources, and detect overlaps</p>
          </div>
          <div className="flex items-center gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <div>
                  <p className="text-sm text-muted-foreground">Overlapping Tasks</p>
                  <p className="text-2xl font-bold text-destructive">{overlappingTasks.length}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Tasks</p>
                  <p className="text-2xl font-bold">{tasks.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Active Resources</p>
                  <p className="text-2xl font-bold">{new Set(tasks.map(t => t.resource)).size}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TimerIcon className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Overlaps</p>
                  <p className="text-2xl font-bold">{overlaps.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Overlap Time</p>
                  <p className="text-2xl font-bold">
                    {formatDuration(overlaps.reduce((sum, overlap) => sum + overlap.duration, 0))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline Visualization */}
        <TimelineVisualization tasks={tasks} />

        {/* Add Task Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Task
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <Label htmlFor="taskName">Task Name</Label>
                <Input
                  id="taskName"
                  value={newTask.name}
                  onChange={(e) => setNewTask(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Task 6"
                />
              </div>

              <div>
                <Label htmlFor="resource">Resource</Label>
                <Select value={newTask.resource} onValueChange={(value) => setNewTask(prev => ({ ...prev, resource: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Resource" />
                  </SelectTrigger>
                  <SelectContent>
                    {RESOURCES.map(resource => (
                      <SelectItem key={resource} value={resource}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: RESOURCE_COLORS[resource] }}
                          />
                          {resource}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(newTask.startDate, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newTask.startDate}
                      onSelect={(date) => date && setNewTask(prev => ({ ...prev, startDate: date }))}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={newTask.startTime}
                  onChange={(e) => setNewTask(prev => ({ ...prev, startTime: e.target.value }))}
                />
              </div>

              <div>
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(newTask.endDate, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newTask.endDate}
                      onSelect={(date) => date && setNewTask(prev => ({ ...prev, endDate: date }))}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={newTask.endTime}
                  onChange={(e) => setNewTask(prev => ({ ...prev, endTime: e.target.value }))}
                />
                <Button onClick={handleAddTask} className="mt-auto">
                  Add Task
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overlapping Tasks Table */}
        {overlappingTasks.length > 0 && (
          <OverlappingTasksTable 
            overlappingTasks={overlappingTasks}
            overlaps={overlaps}
            onRemoveTask={handleRemoveTask}
            formatDuration={formatDuration}
          />
        )}
      </div>
    </div>
  );
};

// Timeline Visualization Component
const TimelineVisualization = ({ tasks }: { tasks: Task[] }) => {
  // Generate hours from 6 AM to 11 PM
  const hours = Array.from({ length: 18 }, (_, i) => i + 6);
  
  // Get the earliest and latest dates from tasks
  const dates = tasks.length > 0 
    ? [...new Set(tasks.map(task => format(task.startTime, 'yyyy-MM-dd')))]
    : [format(new Date(), 'yyyy-MM-dd')];

  const getTaskPosition = (task: Task, date: string) => {
    const taskDate = format(task.startTime, 'yyyy-MM-dd');
    if (taskDate !== date) return null;

    const startHour = task.startTime.getHours() + task.startTime.getMinutes() / 60;
    const endHour = task.endTime.getHours() + task.endTime.getMinutes() / 60;
    
    // Position relative to 6 AM start
    const left = ((startHour - 6) / 18) * 100;
    const width = ((endHour - startHour) / 18) * 100;
    
    return { left: `${Math.max(0, left)}%`, width: `${Math.max(1, width)}%` };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Timeline Visualization
        </CardTitle>
      </CardHeader>
      <CardContent>
        {dates.map(date => (
          <div key={date} className="mb-8">
            <h3 className="text-lg font-semibold mb-4">
              {format(new Date(date), 'EEEE, MMMM d, yyyy')}
            </h3>
            
            <div className="relative">
              {/* Time header */}
              <div className="flex border-b mb-4">
                <div className="w-24 flex-shrink-0"></div>
                <div className="flex-1 flex">
                  {hours.map(hour => (
                    <div key={hour} className="flex-1 text-center text-sm text-muted-foreground py-2 border-l">
                      {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : hour === 0 ? '12 AM' : `${hour} AM`}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tasks */}
              <div className="space-y-2">
                {tasks
                  .filter(task => format(task.startTime, 'yyyy-MM-dd') === date)
                  .map((task, index) => {
                    const position = getTaskPosition(task, date);
                    if (!position) return null;

                    return (
                      <div key={task.id} className="flex items-center">
                        <div className="w-24 flex-shrink-0 text-sm font-medium pr-4">
                          {task.name}
                        </div>
                        <div className="flex-1 relative h-8 bg-muted/30 rounded">
                          <div
                            className="absolute h-full rounded flex items-center justify-between px-2 text-white text-xs font-medium"
                            style={{
                              backgroundColor: task.color,
                              left: position.left,
                              width: position.width,
                              minWidth: '60px'
                            }}
                          >
                            <span>{task.resource}</span>
                            <span>
                              {format(task.startTime, 'HH:mm')} - {format(task.endTime, 'HH:mm')}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

// Overlapping Tasks Table Component
const OverlappingTasksTable = ({ 
  overlappingTasks, 
  overlaps, 
  onRemoveTask, 
  formatDuration 
}: {
  overlappingTasks: Task[];
  overlaps: Overlap[];
  onRemoveTask: (taskId: string) => void;
  formatDuration: (minutes: number) => string;
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Overlapping Tasks ({overlappingTasks.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Overlapping Task</th>
                <th className="text-left p-2">Overlap Duration</th>
                <th className="text-left p-2">Overlap Start</th>
                <th className="text-left p-2">Overlap End</th>
                <th className="text-left p-2">Resource</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {overlappingTasks.map(task => {
                const taskOverlaps = overlaps.filter(o => o.task1.id === task.id || o.task2.id === task.id);
                const totalOverlapDuration = taskOverlaps.reduce((sum, overlap) => sum + overlap.duration, 0);
                
                return (
                  <tr key={task.id} className="border-b hover:bg-muted/50">
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: task.color }}
                        />
                        {task.name}
                      </div>
                    </td>
                    <td className="p-2">{formatDuration(totalOverlapDuration)}</td>
                    <td className="p-2">{format(task.startTime, 'MMM d, HH:mm')}</td>
                    <td className="p-2">{format(task.endTime, 'MMM d, HH:mm')}</td>
                    <td className="p-2">
                      <Badge variant="outline">{task.resource}</Badge>
                    </td>
                    <td className="p-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onRemoveTask(task.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskScheduler;