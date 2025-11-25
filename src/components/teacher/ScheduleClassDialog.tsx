import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface ScheduleClassDialogProps {
  classroomId: string;
  onClassScheduled?: () => void;
}

export const ScheduleClassDialog = ({ classroomId, onClassScheduled }: ScheduleClassDialogProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledDate: '',
    startTime: '',
    endTime: '',
  });

  const handleSchedule = async () => {
    if (!user) return;

    if (!formData.title || !formData.scheduledDate || !formData.startTime || !formData.endTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const scheduledStart = new Date(`${formData.scheduledDate}T${formData.startTime}`);
      const scheduledEnd = new Date(`${formData.scheduledDate}T${formData.endTime}`);

      if (scheduledEnd <= scheduledStart) {
        toast.error('End time must be after start time');
        return;
      }

      // Generate unique channel name
      const channelName = `class_${classroomId}_${Date.now()}`;

      const { error } = await supabase.from('live_classes').insert({
        user_id: user.id,
        title: formData.title,
        subject: formData.title,
        start_time: scheduledStart.toISOString(),
        end_time: scheduledEnd.toISOString(),
        status: 'scheduled',
        agora_channel_name: channelName,
      } as any);

      if (error) throw error;

      toast.success('Class scheduled successfully!');
      setOpen(false);
      setFormData({
        title: '',
        description: '',
        scheduledDate: '',
        startTime: '',
        endTime: '',
      });
      onClassScheduled?.();
    } catch (error) {
      console.error('Error scheduling class:', error);
      toast.error('Failed to schedule class');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Schedule Class
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Schedule New Live Class</DialogTitle>
          <DialogDescription>
            Create a scheduled class session for your students
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Class Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Algebra - Chapter 5"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Topics to be covered..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="date">Date *</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="date"
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Start Time *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="endTime">End Time *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSchedule} disabled={loading}>
              {loading ? 'Scheduling...' : 'Schedule Class'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
