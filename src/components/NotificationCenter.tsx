import { useState, useEffect } from "react";
import { Bell, Check, X, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
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

export function NotificationCenter() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    loadNotifications();
    loadAdminNotifications();

    // Subscribe to real-time updates for regular notifications
    const notifChannel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show toast for new notification
          toast({
            title: newNotification.title,
            description: newNotification.message || undefined,
          });
        }
      )
      .subscribe();

    // Subscribe to admin notifications
    const adminChannel = supabase
      .channel('admin_notifications')
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
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error loading notifications:', error);
      return;
    }

    setNotifications(data || []);
    setUnreadCount(data?.filter(n => !n.is_read).length || 0);
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
    let query = supabase
      .from('admin_notifications')
      .select('*')
      .eq('is_active', true)
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .order('created_at', { ascending: false })
      .limit(10);

    // Filter by target_users based on user role
    const { data, error } = await query;

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

    if (error) {
      console.error('Error marking as read:', error);
      return;
    }

    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) {
      console.error('Error marking all as read:', error);
      return;
    }

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
    toast({ title: "All notifications marked as read" });
  };

  const deleteNotification = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting notification:', error);
      return;
    }

    setNotifications(prev => prev.filter(n => n.id !== id));
    toast({ title: "Notification deleted" });
  };

  const getNotificationLink = (notification: Notification) => {
    switch (notification.type) {
      case 'resource_access':
        return `/exams`;
      case 'feedback_response':
        return `/feedback`;
      case 'exam_reminder':
        return `/exams`;
      default:
        return null;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'resource_access':
        return '📁';
      case 'feedback_response':
        return '💬';
      case 'exam_reminder':
        return '📅';
      default:
        return '🔔';
    }
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-accent/20 transition-all"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-96">
          {notifications.length === 0 && adminNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {/* Admin Notifications (shown first) */}
              {adminNotifications.map((notification) => (
                <div
                  key={`admin-${notification.id}`}
                  className="p-4 bg-primary/5 border-l-4 border-primary"
                >
                  <div className="flex items-start gap-3">
                    <Bell className="h-5 w-5 text-primary" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">
                          {notification.title}
                        </p>
                        <Badge variant={
                          notification.priority === 'urgent' ? 'destructive' :
                          notification.priority === 'high' ? 'default' :
                          'secondary'
                        } className="text-xs">
                          {notification.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatTime(notification.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Regular Notifications */}
              {notifications.map((notification) => {
                const link = getNotificationLink(notification);
                const content = (
                  <div
                    className={cn(
                      "p-4 hover:bg-accent/10 transition-colors cursor-pointer relative group",
                      !notification.is_read && "bg-primary/5"
                    )}
                    onClick={() => !notification.is_read && markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate">
                            {notification.title}
                          </p>
                          {!notification.is_read && (
                            <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                          )}
                        </div>
                        {notification.message && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatTime(notification.created_at)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );

                return link ? (
                  <Link key={notification.id} to={link} onClick={() => setOpen(false)}>
                    {content}
                  </Link>
                ) : (
                  <div key={notification.id}>{content}</div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <div className="p-3 border-t">
          <Link to="/notification-settings" onClick={() => setOpen(false)}>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              Notification Settings
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
