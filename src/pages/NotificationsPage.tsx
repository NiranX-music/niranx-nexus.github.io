import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Check, Trash2, AlertCircle, Info, CheckCircle, XCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

interface Notification {
  id: string;
  title: string;
  message: string | null;
  type: string;
  data: any;
  is_read: boolean;
  created_at: string;
}

interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  icon?: string;
  priority: string;
  target_users: string;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (!user) return;

    loadNotifications();
    loadAdminNotifications();

    // Subscribe to regular notifications
    const notifChannel = supabase
      .channel('notifications_page')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          loadNotifications();
        }
      )
      .subscribe();

    // Subscribe to admin notifications
    const adminChannel = supabase
      .channel('admin_notifications_page')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_notifications'
        },
        () => {
          loadAdminNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notifChannel);
      supabase.removeChannel(adminChannel);
    };
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setNotifications(data);
    }
    setLoading(false);
  };

  const loadAdminNotifications = async () => {
    if (!user) return;

    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isAdmin = userRoles?.some(r => r.role === 'admin');
    const isTeacher = userRoles?.some(r => r.role === 'teacher');

    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('admin_notifications')
      .select('*')
      .eq('is_active', true)
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading admin notifications:', error);
      return;
    }

    // Client-side filtering based on target_users
    const filtered = data?.filter(notif => {
      if (notif.target_users === 'all') return true;
      if (notif.target_users === 'teachers' && isTeacher) return true;
      if (notif.target_users === 'students' && !isAdmin && !isTeacher) return true;
      if (notif.target_users === 'specific' && notif.target_user_ids?.includes(user.id)) return true;
      return false;
    });

    setAdminNotifications(filtered || []);
  };

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (!error) {
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (!error) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      toast({ title: "All notifications marked as read" });
    }
  };

  const deleteNotification = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (!error) {
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast({ title: "Notification deleted" });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, any> = {
      urgent: 'destructive',
      high: 'default',
      normal: 'secondary',
      low: 'outline'
    };
    return variants[priority] || 'secondary';
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Notifications</h1>
              <p className="text-muted-foreground">Stay updated with all your notifications</p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Bell className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">Stay updated with all your notifications</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline" size="sm">
              <Check className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
          <Link to="/niranx/notification-settings">
            <Button variant="outline" size="sm">
              Settings
            </Button>
          </Link>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="all">
            All
            {(unreadCount + adminNotifications.length > 0) && (
              <Badge variant="secondary" className="ml-2">
                {unreadCount + adminNotifications.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="circulars">
            Circulars
            {adminNotifications.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {adminNotifications.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="personal">
            Personal
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          {adminNotifications.length === 0 && notifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <Bell className="h-16 w-16 mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground text-lg">No notifications yet</p>
                <p className="text-sm text-muted-foreground mt-2">You'll see updates here</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Admin Circulars */}
              {adminNotifications.map((notif) => (
                <Card key={`admin-${notif.id}`} className="border-l-4 border-primary">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        {getNotificationIcon(notif.type)}
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <CardTitle className="text-lg">{notif.title}</CardTitle>
                            <Badge variant={getPriorityBadge(notif.priority)}>
                              {notif.priority}
                            </Badge>
                            <Badge variant="outline">Circular</Badge>
                          </div>
                          <CardDescription className="text-base">
                            {notif.message}
                          </CardDescription>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatTime(notif.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}

              {/* Personal Notifications */}
              {notifications.map((notif) => (
                <Card key={notif.id} className={!notif.is_read ? 'bg-primary/5' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <Bell className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">{notif.title}</CardTitle>
                            {!notif.is_read && (
                              <span className="w-2 h-2 rounded-full bg-primary" />
                            )}
                          </div>
                          {notif.message && (
                            <CardDescription className="text-base">
                              {notif.message}
                            </CardDescription>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatTime(notif.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!notif.is_read && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => markAsRead(notif.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteNotification(notif.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </>
          )}
        </TabsContent>

        <TabsContent value="circulars" className="space-y-4 mt-6">
          {adminNotifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <Bell className="h-16 w-16 mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground text-lg">No circulars yet</p>
              </CardContent>
            </Card>
          ) : (
            adminNotifications.map((notif) => (
              <Card key={notif.id} className="border-l-4 border-primary">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    {getNotificationIcon(notif.type)}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-lg">{notif.title}</CardTitle>
                        <Badge variant={getPriorityBadge(notif.priority)}>
                          {notif.priority}
                        </Badge>
                      </div>
                      <CardDescription className="text-base">
                        {notif.message}
                      </CardDescription>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                        <span>{formatTime(notif.created_at)}</span>
                        {notif.expires_at && (
                          <span>Expires: {new Date(notif.expires_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="personal" className="space-y-4 mt-6">
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <Bell className="h-16 w-16 mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground text-lg">No personal notifications</p>
              </CardContent>
            </Card>
          ) : (
            notifications.map((notif) => (
              <Card key={notif.id} className={!notif.is_read ? 'bg-primary/5' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <Bell className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{notif.title}</CardTitle>
                          {!notif.is_read && (
                            <span className="w-2 h-2 rounded-full bg-primary" />
                          )}
                        </div>
                        {notif.message && (
                          <CardDescription className="text-base">
                            {notif.message}
                          </CardDescription>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatTime(notif.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!notif.is_read && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => markAsRead(notif.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteNotification(notif.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
