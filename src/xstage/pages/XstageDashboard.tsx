import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useXstage } from '../contexts/XstageContext';
import { supabase } from '@/integrations/supabase/client';
import { XstageEvent, XstageFile, EVENT_TYPE_CONFIG } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Calendar,
  MessageSquare,
  FolderOpen,
  Users,
  Plus,
  ArrowRight,
  Clock,
  FileText,
} from 'lucide-react';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { XstageOnboarding } from '../components/onboarding/XstageOnboarding';

export const XstageDashboard = () => {
  const navigate = useNavigate();
  const { currentProject, members, loading: projectLoading } = useXstage();
  const [events, setEvents] = useState<XstageEvent[]>([]);
  const [files, setFiles] = useState<XstageFile[]>([]);
  const [messageCount, setMessageCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentProject) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch upcoming events
        const { data: eventsData } = await supabase
          .from('xstage_events')
          .select('*')
          .eq('project_id', currentProject.id)
          .gte('event_date', new Date().toISOString().split('T')[0])
          .order('event_date', { ascending: true })
          .limit(5);

        setEvents((eventsData || []) as XstageEvent[]);

        // Fetch recent files
        const { data: filesData } = await supabase
          .from('xstage_files')
          .select('*')
          .eq('project_id', currentProject.id)
          .eq('is_folder', false)
          .order('created_at', { ascending: false })
          .limit(5);

        setFiles((filesData || []) as XstageFile[]);

        // Count recent messages (last 24 hours)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        const { count } = await supabase
          .from('xstage_messages')
          .select('*', { count: 'exact', head: true })
          .eq('project_id', currentProject.id)
          .gte('created_at', yesterday.toISOString());

        setMessageCount(count || 0);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentProject]);

  const formatEventDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEE, MMM d');
  };

  // Show onboarding if no project
  if (!projectLoading && !currentProject) {
    return <XstageOnboarding />;
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Welcome Header */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold">
          Welcome back! 👋
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with{' '}
          <span className="text-foreground font-medium">{currentProject?.name}</span>
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border-cyan-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/20">
                <Calendar className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{loading ? '-' : events.length}</p>
                <p className="text-xs text-muted-foreground">Upcoming Events</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-fuchsia-500/10 to-fuchsia-500/5 border-fuchsia-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-fuchsia-500/20">
                <MessageSquare className="h-5 w-5 text-fuchsia-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{loading ? '-' : messageCount}</p>
                <p className="text-xs text-muted-foreground">Recent Messages</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <FolderOpen className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{loading ? '-' : files.length}</p>
                <p className="text-xs text-muted-foreground">Shared Files</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Users className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{members.length}</p>
                <p className="text-xs text-muted-foreground">Team Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Upcoming Events</CardTitle>
              <CardDescription>Your next scheduled activities</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/xstage/app/calendar')}
              className="text-cyan-400 hover:text-cyan-300"
            >
              View all
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-3">No upcoming events</p>
                <Button
                  size="sm"
                  onClick={() => navigate('/xstage/app/calendar')}
                  className="bg-gradient-to-r from-cyan-500 to-fuchsia-500"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Schedule Event
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((event) => {
                  const config = EVENT_TYPE_CONFIG[event.event_type];
                  return (
                    <div
                      key={event.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                      onClick={() => navigate('/xstage/app/calendar')}
                    >
                      <div className={`p-2 rounded-lg ${config.bg}`}>
                        <Clock className={`h-4 w-4 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatEventDate(event.event_date)}
                          {event.start_time && ` at ${event.start_time.slice(0, 5)}`}
                        </p>
                      </div>
                      <Badge variant="outline" className={`${config.color} border-current/30`}>
                        {config.label}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Files */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Recent Files</CardTitle>
              <CardDescription>Latest uploads from your team</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/xstage/app/files')}
              className="text-cyan-400 hover:text-cyan-300"
            >
              View all
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-8">
                <FolderOpen className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-3">No files uploaded yet</p>
                <Button
                  size="sm"
                  onClick={() => navigate('/xstage/app/files')}
                  className="bg-gradient-to-r from-cyan-500 to-fuchsia-500"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Upload Files
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate('/xstage/app/files')}
                  >
                    <div className="p-2 rounded-lg bg-muted">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(file.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => navigate('/xstage/app/calendar')}
            >
              <Calendar className="h-5 w-5 text-cyan-400" />
              <span className="text-xs">Schedule Event</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => navigate('/xstage/app/chat')}
            >
              <MessageSquare className="h-5 w-5 text-fuchsia-400" />
              <span className="text-xs">Start Chat</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => navigate('/xstage/app/files')}
            >
              <FolderOpen className="h-5 w-5 text-purple-400" />
              <span className="text-xs">Upload Files</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => navigate('/xstage/app/team')}
            >
              <Users className="h-5 w-5 text-amber-400" />
              <span className="text-xs">Invite Member</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
