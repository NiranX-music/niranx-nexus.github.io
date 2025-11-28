import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Calendar, Clock, BookOpen, Target, Settings } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ScheduledClass {
  id: string;
  subject: string;
  time: string;
  duration: number;
  day: string;
  type: 'main' | 'optional';
  color: string;
  professor?: string;
  room?: string;
}

const Scheduler = () => {
  const [classes, setClasses] = useState<ScheduledClass[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{day: string, time: string} | null>(null);
  const [columnSettingsOpen, setColumnSettingsOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(['subject', 'time', 'duration', 'type', 'professor', 'room']);
  const { toast } = useToast();

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = [
    '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00',
    '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'
  ];

  const classColors = {
    main: 'hsl(var(--primary))',
    optional: 'hsl(var(--secondary))'
  };

  useEffect(() => {
    const savedClasses = localStorage.getItem('scheduledClasses');
    const savedColumns = localStorage.getItem('schedulerColumns');
    
    if (savedColumns) {
      setVisibleColumns(JSON.parse(savedColumns));
    }
    
    if (savedClasses) {
      setClasses(JSON.parse(savedClasses));
    } else {
      // Initial sample data
      const sampleClasses: ScheduledClass[] = [
        {
          id: '1',
          subject: 'Mathematics',
          time: '09:00',
          duration: 90,
          day: 'Monday',
          type: 'main',
          color: classColors.main,
          professor: 'Dr. Smith',
          room: 'Room 101'
        },
        {
          id: '2',
          subject: 'Physics',
          time: '11:00',
          duration: 60,
          day: 'Tuesday',
          type: 'main',
          color: classColors.main,
          professor: 'Prof. Johnson',
          room: 'Lab A'
        },
        {
          id: '3',
          subject: 'Art Club',
          time: '15:00',
          duration: 120,
          day: 'Wednesday',
          type: 'optional',
          color: classColors.optional,
          professor: 'Ms. Davis',
          room: 'Art Studio'
        }
      ];
      setClasses(sampleClasses);
      localStorage.setItem('scheduledClasses', JSON.stringify(sampleClasses));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('scheduledClasses', JSON.stringify(classes));
    localStorage.setItem('upcomingClasses', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('schedulerColumns', JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  const toggleColumn = (column: string) => {
    setVisibleColumns(prev => 
      prev.includes(column) 
        ? prev.filter(col => col !== column)
        : [...prev, column]
    );
  };

  const addNewClass = (formData: {
    subject: string;
    time: string;
    duration: number;
    day: string;
    type: 'main' | 'optional';
    professor?: string;
    room?: string;
  }) => {
    const newClass: ScheduledClass = {
      id: Date.now().toString(),
      ...formData,
      color: classColors[formData.type]
    };

    setClasses(prev => [...prev, newClass]);
    setIsDialogOpen(false);
    setSelectedTimeSlot(null);
    
    toast({
      title: "Class Added",
      description: `${newClass.subject} has been scheduled for ${newClass.day} at ${newClass.time}`,
    });
  };

  const getClassesForTimeSlot = (day: string, time: string) => {
    return classes.filter(cls => {
      const classTime = parseInt(cls.time.replace(':', ''));
      const slotTime = parseInt(time.replace(':', ''));
      const classEndTime = classTime + (cls.duration / 60 * 100);
      
      return cls.day === day && slotTime >= classTime && slotTime < classEndTime;
    });
  };

  const handleTimeSlotClick = (day: string, time: string) => {
    setSelectedTimeSlot({ day, time });
    setIsDialogOpen(true);
  };

  const formatTime12Hour = (time24: string) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Class Scheduler</h1>
            <p className="text-muted-foreground">Manage your weekly class schedule</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={columnSettingsOpen} onOpenChange={setColumnSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Columns
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Customize Columns</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {[
                    { id: 'subject', label: 'Subject' },
                    { id: 'time', label: 'Time' },
                    { id: 'duration', label: 'Duration' },
                    { id: 'type', label: 'Type' },
                    { id: 'professor', label: 'Professor' },
                    { id: 'room', label: 'Room' }
                  ].map(column => (
                    <div key={column.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={column.id}
                        checked={visibleColumns.includes(column.id)}
                        onCheckedChange={() => toggleColumn(column.id)}
                      />
                      <Label htmlFor={column.id}>{column.label}</Label>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Class
                </Button>
              </DialogTrigger>
              <AddClassDialog 
                onAddClass={addNewClass} 
                selectedTimeSlot={selectedTimeSlot}
                onClose={() => setIsDialogOpen(false)}
              />
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Classes</p>
                  <p className="text-2xl font-bold">{classes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Main Classes</p>
                  <p className="text-2xl font-bold">{classes.filter(c => c.type === 'main').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-secondary" />
                <div>
                  <p className="text-sm text-muted-foreground">Optional Classes</p>
                  <p className="text-2xl font-bold">{classes.filter(c => c.type === 'optional').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Schedule Grid */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Weekly Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="grid grid-cols-8 gap-1 min-w-[800px]">
                {/* Header row */}
                <div className="p-3 font-semibold text-center border-b">Time</div>
                {days.map(day => (
                  <div key={day} className="p-3 font-semibold text-center border-b">
                    {day}
                  </div>
                ))}

                {/* Time slots */}
                {timeSlots.map(time => (
                  <React.Fragment key={time}>
                    <div className="p-2 text-xs text-muted-foreground text-center border-r">
                      {formatTime12Hour(time)}
                    </div>
                    {days.map(day => {
                      const classesInSlot = getClassesForTimeSlot(day, time);
                      return (
                        <div
                          key={`${day}-${time}`}
                          className="relative min-h-[40px] border border-border/50 cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => handleTimeSlotClick(day, time)}
                        >
                          {classesInSlot.map(cls => (
                            <div
                              key={cls.id}
                              className="absolute inset-1 rounded text-xs p-1 text-white font-medium overflow-hidden"
                              style={{ 
                                backgroundColor: cls.color,
                                height: `${Math.min(cls.duration / 30 * 20, 60)}px`
                              }}
                            >
                              <div className="truncate">{cls.subject}</div>
                              <Badge 
                                variant={cls.type === 'main' ? 'default' : 'secondary'} 
                                className="text-xs mt-1"
                              >
                                {cls.type}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Class List */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>All Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {classes.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No classes scheduled yet.</p>
              ) : (
                classes.map(cls => (
                  <div key={cls.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: cls.color }}
                      />
                      <div className="flex-1">
                        {visibleColumns.includes('subject') && (
                          <h4 className="font-medium">{cls.subject}</h4>
                        )}
                        <div className="text-sm text-muted-foreground space-y-1">
                          {visibleColumns.includes('time') && (
                            <p>{cls.day} at {formatTime12Hour(cls.time)}</p>
                          )}
                          {visibleColumns.includes('duration') && (
                            <p>Duration: {cls.duration} min</p>
                          )}
                          {visibleColumns.includes('professor') && cls.professor && (
                            <p>{cls.professor}</p>
                          )}
                          {visibleColumns.includes('room') && cls.room && (
                            <p>Room: {cls.room}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    {visibleColumns.includes('type') && (
                      <Badge variant={cls.type === 'main' ? 'default' : 'secondary'}>
                        {cls.type}
                      </Badge>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Add Class Dialog Component
const AddClassDialog = ({ 
  onAddClass, 
  selectedTimeSlot, 
  onClose 
}: {
  onAddClass: (data: any) => void;
  selectedTimeSlot: {day: string, time: string} | null;
  onClose: () => void;
}) => {
  const [formData, setFormData] = useState({
    subject: '',
    time: selectedTimeSlot?.time || '09:00',
    duration: 60,
    day: selectedTimeSlot?.day || 'Monday',
    type: 'main' as 'main' | 'optional',
    professor: '',
    room: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.subject.trim()) {
      onAddClass(formData);
      setFormData({
        subject: '',
        time: '09:00',
        duration: 60,
        day: 'Monday',
        type: 'main',
        professor: '',
        room: ''
      });
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Add New Class</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            value={formData.subject}
            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
            placeholder="Enter subject name"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="day">Day</Label>
            <Select 
              value={formData.day} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, day: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                  <SelectItem key={day} value={day}>{day}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              min="30"
              max="180"
              step="30"
              value={formData.duration}
              onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="type">Type</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value: 'main' | 'optional') => setFormData(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="main">Main</SelectItem>
                <SelectItem value="optional">Optional</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="professor">Professor (optional)</Label>
          <Input
            id="professor"
            value={formData.professor}
            onChange={(e) => setFormData(prev => ({ ...prev, professor: e.target.value }))}
            placeholder="Professor name"
          />
        </div>

        <div>
          <Label htmlFor="room">Room (optional)</Label>
          <Input
            id="room"
            value={formData.room}
            onChange={(e) => setFormData(prev => ({ ...prev, room: e.target.value }))}
            placeholder="Room number or location"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Add Class</Button>
        </div>
      </form>
    </DialogContent>
  );
};

export default Scheduler;