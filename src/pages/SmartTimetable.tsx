import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Brain, 
  Zap, 
  Target,
  BookOpen,
  Coffee,
  Sunrise,
  Sun,
  Moon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SubSlot {
  id: string;
  name: string;
  task: string;
  completed: boolean;
}

interface TimeSlot {
  id: string;
  subject: string;
  startTime: string;
  endTime: string;
  day: string;
  type: 'study' | 'break' | 'exercise' | 'meals';
  priority: 'high' | 'medium' | 'low';
  color: string;
  subSlots: SubSlot[];
}

interface Subject {
  name: string;
  color: string;
  priority: 'high' | 'medium' | 'low';
  weeklyHours: number;
}

const SmartTimetable = () => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([
    { name: 'Mathematics', color: 'bg-blue-500', priority: 'high', weeklyHours: 8 },
    { name: 'Physics', color: 'bg-green-500', priority: 'high', weeklyHours: 6 },
    { name: 'Chemistry', color: 'bg-purple-500', priority: 'medium', weeklyHours: 5 },
    { name: 'English', color: 'bg-yellow-500', priority: 'medium', weeklyHours: 4 },
  ]);
  const [selectedDay, setSelectedDay] = useState('monday');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const timeSlotHours = Array.from({ length: 15 }, (_, i) => {
    const hour = i + 6; // 6 AM to 8 PM
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  useEffect(() => {
    const saved = localStorage.getItem('studyverse-timetable');
    if (saved) {
      setTimeSlots(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('studyverse-timetable', JSON.stringify(timeSlots));
  }, [timeSlots]);

  const generateSmartTimetable = () => {
    setIsGenerating(true);
    
    // AI-like smart generation logic
    setTimeout(() => {
      const newTimeSlots: TimeSlot[] = [];
      
      days.forEach((day, dayIndex) => {
        let currentHour = 6;
        
        // Morning routine
        newTimeSlots.push({
          id: `${day}-morning`,
          subject: 'Morning Routine',
          startTime: '06:00',
          endTime: '07:00',
          day,
          type: 'break',
          priority: 'medium',
          color: 'bg-orange-500',
          subSlots: [
            { id: '1', name: 'Slot 1', task: 'Wake up & freshen up', completed: false },
            { id: '2', name: 'Slot 2', task: 'Exercise/Yoga', completed: false },
            { id: '3', name: 'Slot 3', task: 'Breakfast', completed: false },
            { id: '4', name: 'Slot 4', task: 'Review daily goals', completed: false },
            { id: '5', name: 'Slot 5', task: 'Prepare materials', completed: false }
          ]
        });
        
        currentHour = 7;
        
        // Study sessions based on priority and optimal learning times
        subjects.forEach((subject, index) => {
          if (dayIndex < 6) { // Weekdays
            const startTime = `${(currentHour + index * 2).toString().padStart(2, '0')}:00`;
            const endTime = `${(currentHour + index * 2 + 1).toString().padStart(2, '0')}:30`;
            
            newTimeSlots.push({
              id: `${day}-${subject.name}`,
              subject: subject.name,
              startTime,
              endTime,
              day,
              type: 'study',
              priority: subject.priority,
              color: subject.color,
              subSlots: [
                { id: '1', name: 'Slot 1', task: 'Review previous topics', completed: false },
                { id: '2', name: 'Slot 2', task: 'Learn new concepts', completed: false },
                { id: '3', name: 'Slot 3', task: 'Practice problems', completed: false },
                { id: '4', name: 'Slot 4', task: 'Take notes', completed: false },
                { id: '5', name: 'Slot 5', task: 'Quick revision', completed: false }
              ]
            });
            
            // Add break after each study session
            if (index < subjects.length - 1) {
              newTimeSlots.push({
                id: `${day}-break-${index}`,
                subject: 'Break',
                startTime: endTime,
                endTime: `${(currentHour + index * 2 + 2).toString().padStart(2, '0')}:00`,
                day,
                type: 'break',
                priority: 'low',
                color: 'bg-gray-500',
                subSlots: [
                  { id: '1', name: 'Slot 1', task: 'Stretch & relax', completed: false },
                  { id: '2', name: 'Slot 2', task: 'Hydrate', completed: false },
                  { id: '3', name: 'Slot 3', task: 'Light snack', completed: false },
                  { id: '4', name: 'Slot 4', task: 'Walk around', completed: false },
                  { id: '5', name: 'Slot 5', task: 'Prepare for next session', completed: false }
                ]
              });
            }
          }
        });
        
        // Lunch break
        newTimeSlots.push({
          id: `${day}-lunch`,
          subject: 'Lunch Break',
          startTime: '12:00',
          endTime: '13:00',
          day,
          type: 'meals',
          priority: 'high',
          color: 'bg-green-600',
          subSlots: [
            { id: '1', name: 'Slot 1', task: 'Wash up', completed: false },
            { id: '2', name: 'Slot 2', task: 'Have lunch', completed: false },
            { id: '3', name: 'Slot 3', task: 'Relax', completed: false },
            { id: '4', name: 'Slot 4', task: 'Light walk', completed: false },
            { id: '5', name: 'Slot 5', task: 'Get ready for afternoon', completed: false }
          ]
        });
        
        // Evening study (high priority subjects)
        if (dayIndex < 5) { // Only weekdays
          const highPrioritySubjects = subjects.filter(s => s.priority === 'high');
          highPrioritySubjects.forEach((subject, index) => {
            newTimeSlots.push({
              id: `${day}-evening-${subject.name}`,
              subject: `${subject.name} (Review)`,
              startTime: `${(15 + index * 2).toString().padStart(2, '0')}:00`,
              endTime: `${(16 + index * 2).toString().padStart(2, '0')}:30`,
              day,
              type: 'study',
              priority: 'high',
              color: subject.color,
              subSlots: [
                { id: '1', name: 'Slot 1', task: 'Review notes', completed: false },
                { id: '2', name: 'Slot 2', task: 'Solve practice questions', completed: false },
                { id: '3', name: 'Slot 3', task: 'Clarify doubts', completed: false },
                { id: '4', name: 'Slot 4', task: 'Create flashcards', completed: false },
                { id: '5', name: 'Slot 5', task: 'Summary writing', completed: false }
              ]
            });
          });
        }
      });
      
      setTimeSlots(newTimeSlots);
      setIsGenerating(false);
      toast({
        title: "🧠 Smart Timetable Generated!",
        description: "AI has optimized your schedule based on learning patterns"
      });
    }, 2000);
  };

  const getTodaySlots = () => {
    return timeSlots.filter(slot => slot.day === selectedDay);
  };

  const getTimeIcon = (hour: number) => {
    if (hour >= 6 && hour < 12) return <Sunrise className="w-4 h-4" />;
    if (hour >= 12 && hour < 18) return <Sun className="w-4 h-4" />;
    return <Moon className="w-4 h-4" />;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'study': return <BookOpen className="w-4 h-4" />;
      case 'break': return <Coffee className="w-4 h-4" />;
      case 'exercise': return <Target className="w-4 h-4" />;
      case 'meals': return <Coffee className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Calendar className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Smart Timetable
          </h1>
          <Brain className="w-6 h-6 text-accent animate-pulse" />
        </div>
        <p className="text-muted-foreground">
          AI-powered scheduling for optimal learning
        </p>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Smart Generation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-48">
              <Label>Select Day</Label>
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {days.map(day => (
                    <SelectItem key={day} value={day}>
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={generateSmartTimetable}
                disabled={isGenerating}
                className="flex items-center gap-2"
              >
                <Brain className="w-4 h-4" />
                {isGenerating ? 'Generating...' : 'Generate Smart Schedule'}
              </Button>
            </div>
          </div>

          {/* Subject Overview */}
          <div className="space-y-2">
            <Label>Active Subjects</Label>
            <div className="flex flex-wrap gap-2">
              {subjects.map(subject => (
                <Badge key={subject.name} variant="outline" className="flex items-center gap-1">
                  <div className={`w-3 h-3 rounded-full ${subject.color}`} />
                  {subject.name}
                  <span className="text-xs text-muted-foreground">
                    ({subject.weeklyHours}h/week)
                  </span>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timetable View */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)} Schedule
            </span>
            <Badge variant="secondary">
              {getTodaySlots().length} sessions
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {timeSlotHours.map(hour => {
              const hourNum = parseInt(hour.split(':')[0]);
              const slotsAtThisHour = getTodaySlots().filter(slot => 
                slot.startTime === hour || 
                (hourNum >= parseInt(slot.startTime.split(':')[0]) && 
                 hourNum < parseInt(slot.endTime.split(':')[0]))
              );

              return (
                <div key={hour} className="flex items-center gap-4 py-2 border-b border-border/30">
                  <div className="flex items-center gap-2 w-20 text-sm text-muted-foreground">
                    {getTimeIcon(hourNum)}
                    {hour}
                  </div>
                  
                  <div className="flex-1">
                    {slotsAtThisHour.length > 0 ? (
                      slotsAtThisHour.map(slot => (
                        <div 
                          key={slot.id}
                          className="space-y-2"
                        >
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border/50 hover:border-border transition-colors">
                            <div className={`w-1 h-12 rounded ${slot.color}`} />
                            <div className="flex items-center gap-2">
                              {getTypeIcon(slot.type)}
                              <div>
                                <p className="font-medium">{slot.subject}</p>
                                <p className="text-xs text-muted-foreground">
                                  {slot.startTime} - {slot.endTime}
                                </p>
                              </div>
                            </div>
                            <Badge 
                              variant={slot.priority === 'high' ? 'destructive' : 
                                     slot.priority === 'medium' ? 'default' : 'secondary'}
                              className="ml-auto"
                            >
                              {slot.priority}
                            </Badge>
                          </div>
                          
                          {/* Sub-slots */}
                          <div className="ml-8 space-y-1">
                            {slot.subSlots.map((subSlot) => (
                              <div 
                                key={subSlot.id}
                                className="flex items-center gap-2 p-2 rounded bg-muted/30 text-sm"
                              >
                                <span className="text-xs font-medium text-muted-foreground w-12">
                                  {subSlot.name}
                                </span>
                                <span className="flex-1 text-muted-foreground">
                                  {subSlot.task}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-muted-foreground italic py-2">
                        Free time
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartTimetable;