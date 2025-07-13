import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Calendar, 
  Clock, 
  Plus, 
  ExternalLink, 
  BookOpen, 
  Edit, 
  Trash2,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ClassSession {
  id: string;
  subject: string;
  time: Date;
  duration: number; // in minutes
  link?: string;
  notes?: string;
  resources?: string[];
  isRecurring?: boolean;
  status: 'upcoming' | 'active' | 'completed';
}

const ClassScheduler = () => {
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassSession | null>(null);
  const [newClass, setNewClass] = useState({
    subject: '',
    time: '',
    duration: 60,
    link: '',
    notes: '',
  });

  // Load classes from localStorage
  useEffect(() => {
    const savedClasses = localStorage.getItem('studyverse-classes');
    if (savedClasses) {
      try {
        const parsed = JSON.parse(savedClasses);
        setClasses(parsed.map((cls: any) => ({
          ...cls,
          time: new Date(cls.time)
        })));
      } catch (error) {
        console.error('Error loading classes:', error);
      }
    }
  }, []);

  // Save classes to localStorage
  useEffect(() => {
    localStorage.setItem('studyverse-classes', JSON.stringify(classes));
  }, [classes]);

  // Update class status based on current time
  useEffect(() => {
    const updateClassStatus = () => {
      const now = new Date();
      setClasses(prev => prev.map(cls => {
        const classStart = new Date(cls.time);
        const classEnd = new Date(classStart.getTime() + cls.duration * 60000);
        
        if (now >= classStart && now <= classEnd) {
          return { ...cls, status: 'active' as const };
        } else if (now > classEnd) {
          return { ...cls, status: 'completed' as const };
        } else {
          return { ...cls, status: 'upcoming' as const };
        }
      }));
    };

    updateClassStatus();
    const interval = setInterval(updateClassStatus, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const addOrUpdateClass = () => {
    if (!newClass.subject || !newClass.time) {
      toast({
        title: "Missing Information",
        description: "Please fill in subject and time",
        variant: "destructive",
      });
      return;
    }

    const classData: ClassSession = {
      id: editingClass?.id || Math.random().toString(36).substr(2, 9),
      subject: newClass.subject,
      time: new Date(newClass.time),
      duration: newClass.duration,
      link: newClass.link,
      notes: newClass.notes,
      status: 'upcoming'
    };

    if (editingClass) {
      setClasses(prev => prev.map(cls => cls.id === editingClass.id ? classData : cls));
      toast({
        title: "Class Updated",
        description: "Your class has been updated successfully",
      });
    } else {
      setClasses(prev => [...prev, classData]);
      toast({
        title: "Class Added",
        description: "New class added to your schedule",
      });
    }

    resetForm();
  };

  const deleteClass = (classId: string) => {
    setClasses(prev => prev.filter(cls => cls.id !== classId));
    toast({
      title: "Class Deleted",
      description: "Class removed from your schedule",
    });
  };

  const resetForm = () => {
    setNewClass({
      subject: '',
      time: '',
      duration: 60,
      link: '',
      notes: '',
    });
    setShowAddForm(false);
    setEditingClass(null);
  };

  const startEdit = (cls: ClassSession) => {
    setEditingClass(cls);
    setNewClass({
      subject: cls.subject,
      time: cls.time.toISOString().slice(0, 16),
      duration: cls.duration,
      link: cls.link || '',
      notes: cls.notes || '',
    });
    setShowAddForm(true);
  };

  const getTimeUntilClass = (classTime: Date) => {
    const now = new Date();
    const diff = classTime.getTime() - now.getTime();
    
    if (diff <= 0) return null;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getStatusBadge = (status: ClassSession['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Live</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      default:
        return <Badge variant="outline">Upcoming</Badge>;
    }
  };

  const upcomingClasses = classes
    .filter(cls => cls.status === 'upcoming')
    .sort((a, b) => a.time.getTime() - b.time.getTime());

  const activeClasses = classes.filter(cls => cls.status === 'active');

  return (
    <Card className="widget">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Class Schedule</h3>
              <p className="text-sm text-muted-foreground">
                {classes.length} class{classes.length !== 1 ? 'es' : ''} scheduled
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
            Add Class
          </Button>
        </div>

        {/* Active Classes */}
        {activeClasses.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-green-600 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Live Now
            </h4>
            {activeClasses.map((cls) => (
              <div key={cls.id} className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-semibold text-green-700">{cls.subject}</h5>
                  {cls.link && (
                    <Button
                      size="sm"
                      onClick={() => window.open(cls.link, '_blank')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Join Now
                    </Button>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Started at {cls.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Upcoming Classes */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground">Upcoming Classes</h4>
          {upcomingClasses.length > 0 ? (
            upcomingClasses.slice(0, 5).map((cls) => {
              const timeUntil = getTimeUntilClass(cls.time);
              return (
                <div key={cls.id} className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h5 className="font-semibold">{cls.subject}</h5>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {cls.time.toLocaleDateString()} at {cls.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      {timeUntil && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          in {timeUntil}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(cls)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteClass(cls.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {cls.notes && (
                    <p className="text-sm text-muted-foreground mt-2">{cls.notes}</p>
                  )}
                  
                  {cls.link && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => window.open(cls.link, '_blank')}
                    >
                      <ExternalLink className="w-3 h-3 mr-2" />
                      Class Link
                    </Button>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No upcoming classes</p>
              <p className="text-sm">Add your first class to get started!</p>
            </div>
          )}
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-card rounded-lg max-w-md w-full p-6">
              <h4 className="font-semibold mb-4">
                {editingClass ? 'Edit Class' : 'Add New Class'}
              </h4>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Subject</label>
                  <Input
                    value={newClass.subject}
                    onChange={(e) => setNewClass(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="e.g., Mathematics, Physics"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Date & Time</label>
                  <Input
                    type="datetime-local"
                    value={newClass.time}
                    onChange={(e) => setNewClass(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Duration (minutes)</label>
                  <Input
                    type="number"
                    value={newClass.duration}
                    onChange={(e) => setNewClass(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                    min="15"
                    max="300"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Class Link (optional)</label>
                  <Input
                    value={newClass.link}
                    onChange={(e) => setNewClass(prev => ({ ...prev, link: e.target.value }))}
                    placeholder="https://zoom.us/..."
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Notes (optional)</label>
                  <Textarea
                    value={newClass.notes}
                    onChange={(e) => setNewClass(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any additional notes..."
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex gap-2 mt-6">
                <Button onClick={addOrUpdateClass} className="flex-1">
                  {editingClass ? 'Update' : 'Add'} Class
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

export default ClassScheduler;