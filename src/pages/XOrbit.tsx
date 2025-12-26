import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Calendar as CalendarIcon,
  Plus,
  RefreshCw,
  Clock,
  MapPin,
  Users,
  ExternalLink,
  MoreVertical,
  Trash2,
  Edit,
  LogOut,
  Loader2,
  Check,
  ChevronLeft,
  ChevronRight,
  Orbit,
  Mail,
  Star,
  Link,
  FileText,
  Video,
} from 'lucide-react';
import { useGoogleCalendar, CalendarEvent, CalendarAccount } from '@/hooks/useGoogleCalendar';
import { useAuth } from '@/contexts/AuthContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths, startOfWeek, endOfWeek, parseISO } from 'date-fns';

export default function XOrbit() {
  const { user } = useAuth();
  const {
    accounts,
    calendars,
    events,
    isLoading,
    isConnected,
    selectedAccountId,
    setSelectedAccountId,
    connect,
    disconnect,
    loadCalendars,
    loadEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  } = useGoogleCalendar();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [viewingEvent, setViewingEvent] = useState<CalendarEvent | null>(null);
  const [eventDetailOpen, setEventDetailOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    summary: '',
    description: '',
    location: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract links from description
  const extractLinks = (text: string | undefined): string[] => {
    if (!text) return [];
    const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`\[\]]+)/g;
    return text.match(urlRegex) || [];
  };

  // Check if it's a meeting link
  const isMeetingLink = (url: string): boolean => {
    const meetingDomains = ['meet.google.com', 'zoom.us', 'zoom.com', 'teams.microsoft.com', 'webex.com'];
    return meetingDomains.some(domain => url.includes(domain));
  };

  const openEventDetail = (event: CalendarEvent) => {
    setViewingEvent(event);
    setEventDetailOpen(true);
  };

  useEffect(() => {
    if (isConnected && selectedAccountId) {
      loadCalendars();
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);
      loadEvents({
        timeMin: start.toISOString(),
        timeMax: end.toISOString(),
      });
    }
  }, [isConnected, selectedAccountId, currentMonth]);

  const monthDays = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth)),
  });

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = event.start.dateTime 
        ? parseISO(event.start.dateTime) 
        : event.start.date 
          ? parseISO(event.start.date) 
          : null;
      return eventDate && isSameDay(eventDate, date);
    });
  };

  const handleCreateEvent = async () => {
    if (!newEvent.summary || !newEvent.startDate || !newEvent.endDate) return;

    setIsSubmitting(true);
    try {
      const startDateTime = newEvent.startTime
        ? `${newEvent.startDate}T${newEvent.startTime}:00`
        : undefined;
      const endDateTime = newEvent.endTime
        ? `${newEvent.endDate}T${newEvent.endTime}:00`
        : undefined;

      const eventData: any = {
        summary: newEvent.summary,
        description: newEvent.description,
        location: newEvent.location,
      };

      if (startDateTime && endDateTime) {
        eventData.start = { dateTime: new Date(startDateTime).toISOString() };
        eventData.end = { dateTime: new Date(endDateTime).toISOString() };
      } else {
        eventData.start = { date: newEvent.startDate };
        eventData.end = { date: newEvent.endDate };
      }

      if (editingEvent) {
        await updateEvent(editingEvent.id, eventData);
      } else {
        await createEvent(eventData);
      }

      setEventDialogOpen(false);
      resetEventForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return;
    await deleteEvent(eventToDelete.id);
    setEventToDelete(null);
    setDeleteDialogOpen(false);
  };

  const resetEventForm = () => {
    setNewEvent({
      summary: '',
      description: '',
      location: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
    });
    setEditingEvent(null);
  };

  const openEditDialog = (event: CalendarEvent) => {
    const startDT = event.start.dateTime ? parseISO(event.start.dateTime) : null;
    const endDT = event.end.dateTime ? parseISO(event.end.dateTime) : null;
    
    setEditingEvent(event);
    setNewEvent({
      summary: event.summary || '',
      description: event.description || '',
      location: event.location || '',
      startDate: startDT ? format(startDT, 'yyyy-MM-dd') : (event.start.date || ''),
      startTime: startDT ? format(startDT, 'HH:mm') : '',
      endDate: endDT ? format(endDT, 'yyyy-MM-dd') : (event.end.date || ''),
      endTime: endDT ? format(endDT, 'HH:mm') : '',
    });
    setEventDialogOpen(true);
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Orbit className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Sign in Required</h2>
            <p className="text-muted-foreground">Please sign in to access XOrbit.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-lg mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4">
              <Orbit className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-2xl">Welcome to XOrbit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              Connect your Google Calendar to manage your schedule, events, and tasks all in one place.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-purple-500" />
                View and manage all your calendars
              </li>
              <li className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-green-500" />
                Create, edit, and delete events
              </li>
              <li className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                Connect multiple Google accounts
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                Sync with your study schedule
              </li>
            </ul>
            <Button
              onClick={connect}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <CalendarIcon className="h-5 w-5 mr-2" />
              )}
              Connect Google Calendar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text flex items-center gap-2">
            <Orbit className="h-8 w-8" />
            XOrbit
          </h1>
          <p className="text-muted-foreground">Your unified calendar & schedule manager</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Account Selector */}
          {accounts.length > 0 && (
            <Select value={selectedAccountId || ''} onValueChange={setSelectedAccountId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map(account => (
                  <SelectItem key={account.id} value={account.id}>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {account.google_email}
                      {account.is_primary && <Star className="h-3 w-3 text-yellow-500" />}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button variant="outline" size="sm" onClick={connect}>
            <Plus className="h-4 w-4 mr-2" />
            Add Account
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => loadEvents()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {accounts.map(account => (
                <DropdownMenuItem
                  key={account.id}
                  onClick={() => disconnect(account.id)}
                  className="text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Disconnect {account.google_email}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg">{format(currentMonth, 'MMMM yyyy')}</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(new Date())}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {monthDays.map((day, idx) => {
                const dayEvents = getEventsForDate(day);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isCurrentMonth = day.getMonth() === currentMonth.getMonth();

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(day)}
                    className={`min-h-[80px] p-1 text-left rounded-lg border transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-transparent hover:border-border'
                    } ${!isCurrentMonth ? 'opacity-40' : ''}`}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      isToday(day) 
                        ? 'bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center' 
                        : ''
                    }`}>
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 2).map(event => (
                        <div
                          key={event.id}
                          className="text-xs truncate px-1 py-0.5 rounded bg-primary/20 text-primary"
                        >
                          {event.summary}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-muted-foreground px-1">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Events Sidebar */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg">
              {selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'Upcoming Events'}
            </CardTitle>
            <Dialog open={eventDialogOpen} onOpenChange={(open) => {
              setEventDialogOpen(open);
              if (!open) resetEventForm();
            }}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingEvent ? 'Edit Event' : 'Create Event'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input
                    placeholder="Event title"
                    value={newEvent.summary}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, summary: e.target.value }))}
                  />
                  <Textarea
                    placeholder="Description (optional)"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  />
                  <Input
                    placeholder="Location (optional)"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Start Date</label>
                      <Input
                        type="date"
                        value={newEvent.startDate}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Start Time</label>
                      <Input
                        type="time"
                        value={newEvent.startTime}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, startTime: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground">End Date</label>
                      <Input
                        type="date"
                        value={newEvent.endDate}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">End Time</label>
                      <Input
                        type="time"
                        value={newEvent.endTime}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, endTime: e.target.value }))}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleCreateEvent}
                    disabled={isSubmitting || !newEvent.summary || !newEvent.startDate || !newEvent.endDate}
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : editingEvent ? (
                      <Check className="h-4 w-4 mr-2" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    {editingEvent ? 'Update Event' : 'Create Event'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <ScrollArea className="h-[500px]">
            <CardContent className="space-y-3">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-lg" />
                ))
              ) : (
                (selectedDate ? getEventsForDate(selectedDate) : events).map(event => {
                  const eventLinks = extractLinks(event.description);
                  const hasMeetingLink = eventLinks.some(isMeetingLink);
                  
                  return (
                    <Card 
                      key={event.id} 
                      className="group cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => openEventDetail(event)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium truncate flex items-center gap-2">
                              {event.summary}
                              {hasMeetingLink && <Video className="h-3 w-3 text-green-500" />}
                              {eventLinks.length > 0 && !hasMeetingLink && <Link className="h-3 w-3 text-blue-500" />}
                            </h4>
                            {event.start.dateTime && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(parseISO(event.start.dateTime), 'h:mm a')} - 
                                {event.end.dateTime && format(parseISO(event.end.dateTime), 'h:mm a')}
                              </p>
                            )}
                            {event.location && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1 truncate">
                                <MapPin className="h-3 w-3" />
                                {event.location}
                              </p>
                            )}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {event.htmlLink && (
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(event.htmlLink, '_blank');
                                }}>
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Open in Google
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                openEditDialog(event);
                              }}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEventToDelete(event);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
              {!isLoading && (selectedDate ? getEventsForDate(selectedDate) : events).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No events</p>
                </div>
              )}
            </CardContent>
          </ScrollArea>
        </Card>
      </div>

      {/* Event Detail Dialog */}
      <Dialog open={eventDetailOpen} onOpenChange={setEventDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <CalendarIcon className="h-5 w-5 text-primary" />
              {viewingEvent?.summary || 'Event Details'}
            </DialogTitle>
          </DialogHeader>
          
          {viewingEvent && (
            <div className="space-y-4 pt-2">
              {/* Date & Time */}
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">
                    {viewingEvent.start.dateTime 
                      ? format(parseISO(viewingEvent.start.dateTime), 'EEEE, MMMM d, yyyy')
                      : viewingEvent.start.date 
                        ? format(parseISO(viewingEvent.start.date), 'EEEE, MMMM d, yyyy')
                        : 'No date'}
                  </p>
                  {viewingEvent.start.dateTime && (
                    <p className="text-sm text-muted-foreground">
                      {format(parseISO(viewingEvent.start.dateTime), 'h:mm a')}
                      {viewingEvent.end.dateTime && ` - ${format(parseISO(viewingEvent.end.dateTime), 'h:mm a')}`}
                    </p>
                  )}
                </div>
              </div>

              {/* Location */}
              {viewingEvent.location && (
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">{viewingEvent.location}</p>
                  </div>
                </div>
              )}

              {/* Description */}
              {viewingEvent.description && (
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium mb-1">Description</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                      {viewingEvent.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Attendees */}
              {viewingEvent.attendees && viewingEvent.attendees.length > 0 && (
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Attendees ({viewingEvent.attendees.length})</p>
                    <div className="space-y-1">
                      {viewingEvent.attendees.slice(0, 5).map((attendee, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{attendee.email}</span>
                          {attendee.responseStatus && (
                            <Badge variant="secondary" className="text-xs">
                              {attendee.responseStatus}
                            </Badge>
                          )}
                        </div>
                      ))}
                      {viewingEvent.attendees.length > 5 && (
                        <p className="text-xs text-muted-foreground">
                          +{viewingEvent.attendees.length - 5} more
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Links from Description */}
              {extractLinks(viewingEvent.description).length > 0 && (
                <div className="space-y-2">
                  <p className="font-medium flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    Links
                  </p>
                  <div className="space-y-2">
                    {extractLinks(viewingEvent.description).map((link, idx) => (
                      <Button
                        key={idx}
                        variant={isMeetingLink(link) ? 'default' : 'outline'}
                        className="w-full justify-start"
                        onClick={() => window.open(link, '_blank')}
                      >
                        {isMeetingLink(link) ? (
                          <Video className="h-4 w-4 mr-2 text-green-400" />
                        ) : (
                          <ExternalLink className="h-4 w-4 mr-2" />
                        )}
                        <span className="truncate">
                          {isMeetingLink(link) ? 'Join Meeting' : link.replace(/^https?:\/\//, '').slice(0, 40)}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                {viewingEvent.htmlLink && (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.open(viewingEvent.htmlLink, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in Google
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    setEventDetailOpen(false);
                    openEditDialog(viewingEvent);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => {
                    setEventDetailOpen(false);
                    setEventToDelete(viewingEvent);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Connected Calendars */}
      {calendars.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Connected Calendars</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {calendars.map(calendar => (
                <Badge
                  key={calendar.id}
                  variant="secondary"
                  className="flex items-center gap-2"
                  style={{ backgroundColor: calendar.backgroundColor }}
                >
                  {calendar.primary && <Star className="h-3 w-3 text-yellow-500" />}
                  {calendar.summary}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{eventToDelete?.summary}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
