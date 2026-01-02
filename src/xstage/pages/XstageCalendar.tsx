import { useState, useEffect } from 'react';
import { useXstage } from '../contexts/XstageContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { XstageEvent, XstageEventRSVP, EventType, RSVPStatus, EVENT_TYPE_CONFIG } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Plus, MapPin, Clock, Users, Trash2, Check, HelpCircle, X } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const XstageCalendar = () => {
  const { currentProject } = useXstage();
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<XstageEvent[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<XstageEvent | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState<EventType>('rehearsal');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    if (currentProject) {
      fetchEvents();
    }
  }, [currentProject]);

  const fetchEvents = async () => {
    if (!currentProject) return;
    
    setLoading(true);
    try {
      const { data: eventsData, error } = await supabase
        .from('xstage_events')
        .select('*')
        .eq('project_id', currentProject.id)
        .order('event_date', { ascending: true });

      if (error) throw error;

      // Fetch RSVPs for each event
      const eventsWithRSVPs = await Promise.all(
        (eventsData || []).map(async (event) => {
          const { data: rsvps } = await supabase
            .from('xstage_event_rsvps')
            .select('*')
            .eq('event_id', event.id);
          return { ...event, rsvps: rsvps || [] } as XstageEvent;
        })
      );

      setEvents(eventsWithRSVPs);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });

    // Add padding for start of week
    const startDay = start.getDay();
    const paddingStart = Array(startDay).fill(null);

    return [...paddingStart, ...days];
  };

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => isSameDay(parseISO(event.event_date), date));
  };

  const openNewEvent = (date?: Date) => {
    setEditingEvent(null);
    setTitle('');
    setDescription('');
    setEventType('rehearsal');
    setEventDate(date ? format(date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
    setStartTime('');
    setEndTime('');
    setLocation('');
    setShowEventModal(true);
  };

  const openEditEvent = (event: XstageEvent) => {
    setEditingEvent(event);
    setTitle(event.title);
    setDescription(event.description || '');
    setEventType(event.event_type);
    setEventDate(event.event_date);
    setStartTime(event.start_time?.slice(0, 5) || '');
    setEndTime(event.end_time?.slice(0, 5) || '');
    setLocation(event.location || '');
    setShowEventModal(true);
  };

  const handleSaveEvent = async () => {
    if (!currentProject || !user || !title.trim()) return;

    try {
      const eventData = {
        project_id: currentProject.id,
        title: title.trim(),
        description: description.trim() || null,
        event_type: eventType,
        event_date: eventDate,
        start_time: startTime || null,
        end_time: endTime || null,
        location: location.trim() || null,
        created_by: user.id,
      };

      if (editingEvent) {
        const { error } = await supabase
          .from('xstage_events')
          .update(eventData)
          .eq('id', editingEvent.id);

        if (error) throw error;
        toast.success('Event updated');
      } else {
        const { error } = await supabase
          .from('xstage_events')
          .insert(eventData);

        if (error) throw error;
        toast.success('Event created');
      }

      setShowEventModal(false);
      fetchEvents();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save event');
    }
  };

  const handleDeleteEvent = async () => {
    if (!editingEvent) return;

    try {
      const { error } = await supabase
        .from('xstage_events')
        .delete()
        .eq('id', editingEvent.id);

      if (error) throw error;
      toast.success('Event deleted');
      setShowEventModal(false);
      fetchEvents();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete event');
    }
  };

  const handleRSVP = async (eventId: string, status: RSVPStatus) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('xstage_event_rsvps')
        .upsert({
          event_id: eventId,
          user_id: user.id,
          status,
        }, { onConflict: 'event_id,user_id' });

      if (error) throw error;
      fetchEvents();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update RSVP');
    }
  };

  const getUserRSVP = (event: XstageEvent): RSVPStatus | null => {
    const rsvp = event.rsvps?.find((r) => r.user_id === user?.id);
    return rsvp?.status || null;
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <Button onClick={() => openNewEvent()} className="bg-gradient-to-r from-cyan-500 to-fuchsia-500">
          <Plus className="mr-2 h-4 w-4" />
          New Event
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <CardTitle>{format(currentMonth, 'MMMM yyyy')}</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-2">
              {WEEKDAYS.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth().map((day, i) => {
                if (!day) {
                  return <div key={`empty-${i}`} className="aspect-square" />;
                }

                const dayEvents = getEventsForDate(day);
                const isSelected = selectedDate && isSameDay(day, selectedDate);

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    onDoubleClick={() => openNewEvent(day)}
                    className={cn(
                      'aspect-square p-1 rounded-lg text-sm transition-colors relative',
                      !isSameMonth(day, currentMonth) && 'text-muted-foreground/50',
                      isToday(day) && 'ring-2 ring-cyan-500',
                      isSelected && 'bg-cyan-500/20',
                      'hover:bg-muted'
                    )}
                  >
                    <span className="font-medium">{format(day, 'd')}</span>
                    {dayEvents.length > 0 && (
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                        {dayEvents.slice(0, 3).map((event, idx) => (
                          <div
                            key={idx}
                            className={cn('w-1.5 h-1.5 rounded-full', EVENT_TYPE_CONFIG[event.event_type].bg.replace('/20', ''))}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Events */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedDate ? format(selectedDate, 'EEEE, MMM d') : 'Select a date'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedDate ? (
              <p className="text-sm text-muted-foreground">Click on a date to see events</p>
            ) : selectedDateEvents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-4">No events on this day</p>
                <Button size="sm" variant="outline" onClick={() => openNewEvent(selectedDate)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Event
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateEvents.map((event) => {
                  const config = EVENT_TYPE_CONFIG[event.event_type];
                  const userRSVP = getUserRSVP(event);
                  const attendingCount = event.rsvps?.filter((r) => r.status === 'attending').length || 0;

                  return (
                    <div
                      key={event.id}
                      className="p-3 rounded-lg border border-border hover:border-muted-foreground/50 transition-colors cursor-pointer"
                      onClick={() => openEditEvent(event)}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-medium">{event.title}</h3>
                        <Badge variant="outline" className={`${config.color} border-current/30 shrink-0`}>
                          {config.label}
                        </Badge>
                      </div>
                      
                      {event.start_time && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <Clock className="h-3 w-3" />
                          {event.start_time.slice(0, 5)}
                          {event.end_time && ` - ${event.end_time.slice(0, 5)}`}
                        </div>
                      )}
                      
                      {event.location && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </div>
                      )}

                      {/* RSVP buttons */}
                      <div className="flex items-center gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant={userRSVP === 'attending' ? 'default' : 'outline'}
                          className={cn('h-7 text-xs', userRSVP === 'attending' && 'bg-green-600 hover:bg-green-700')}
                          onClick={() => handleRSVP(event.id, 'attending')}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Going
                        </Button>
                        <Button
                          size="sm"
                          variant={userRSVP === 'maybe' ? 'default' : 'outline'}
                          className={cn('h-7 text-xs', userRSVP === 'maybe' && 'bg-amber-600 hover:bg-amber-700')}
                          onClick={() => handleRSVP(event.id, 'maybe')}
                        >
                          <HelpCircle className="h-3 w-3 mr-1" />
                          Maybe
                        </Button>
                        <Button
                          size="sm"
                          variant={userRSVP === 'declined' ? 'default' : 'outline'}
                          className={cn('h-7 text-xs', userRSVP === 'declined' && 'bg-red-600 hover:bg-red-700')}
                          onClick={() => handleRSVP(event.id, 'declined')}
                        >
                          <X className="h-3 w-3 mr-1" />
                          No
                        </Button>
                        <span className="text-xs text-muted-foreground ml-auto">
                          <Users className="h-3 w-3 inline mr-1" />
                          {attendingCount}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Event Modal */}
      <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Edit Event' : 'New Event'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Event title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Event Type</Label>
              <Select value={eventType} onValueChange={(v) => setEventType(v as EventType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EVENT_TYPE_CONFIG).map(([type, config]) => (
                    <SelectItem key={type} value={type}>
                      <span className={config.color}>{config.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start">Start Time</Label>
                <Input
                  id="start"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end">End Time</Label>
                <Input
                  id="end"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Event location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="desc">Description</Label>
              <Textarea
                id="desc"
                placeholder="Optional details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            {editingEvent && (
              <Button variant="destructive" onClick={handleDeleteEvent}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={() => setShowEventModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEvent} disabled={!title.trim()} className="bg-gradient-to-r from-cyan-500 to-fuchsia-500">
                {editingEvent ? 'Save Changes' : 'Create Event'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
