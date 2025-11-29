import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Trash2, Edit, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  icon?: string;
  priority: string;
  target_users: string;
  target_user_ids?: string[];
  expires_at?: string;
  is_active: boolean;
  created_at: string;
}

export default function CustomNotificationsManager() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingNotification, setEditingNotification] = useState<AdminNotification | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info",
    icon: "",
    priority: "normal",
    target_users: "all",
    expires_at: "",
    is_active: true,
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from("admin_notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    try {
      const payload = {
        ...formData,
        expires_at: formData.expires_at || null,
        created_by: user.id,
      };

      if (editingNotification) {
        const { error } = await supabase
          .from("admin_notifications")
          .update(payload)
          .eq("id", editingNotification.id);

        if (error) throw error;
        toast.success("Notification updated successfully!");
      } else {
        const { error } = await supabase
          .from("admin_notifications")
          .insert([payload]);

        if (error) throw error;
        toast.success("Notification created successfully!");
      }

      resetForm();
      fetchNotifications();
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error("Error saving notification:", error);
      toast.error("Failed to save notification");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this notification?")) return;

    try {
      const { error } = await supabase
        .from("admin_notifications")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Notification deleted successfully!");
      fetchNotifications();
    } catch (error: any) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  const handleEdit = (notification: AdminNotification) => {
    setEditingNotification(notification);
    setFormData({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      icon: notification.icon || "",
      priority: notification.priority,
      target_users: notification.target_users,
      expires_at: notification.expires_at ? notification.expires_at.split('T')[0] : "",
      is_active: notification.is_active,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingNotification(null);
    setFormData({
      title: "",
      message: "",
      type: "info",
      icon: "",
      priority: "normal",
      target_users: "all",
      expires_at: "",
      is_active: true,
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Custom Notifications Manager</h1>
          <p className="text-muted-foreground">Send custom notifications to users</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Notification
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingNotification ? "Edit" : "Create"} Notification</DialogTitle>
              <DialogDescription>
                {editingNotification ? "Update" : "Send"} a custom notification to users
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target_users">Target Users</Label>
                  <Select value={formData.target_users} onValueChange={(value) => setFormData({ ...formData, target_users: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="students">Students Only</SelectItem>
                      <SelectItem value="teachers">Teachers Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icon">Icon (Lucide icon name)</Label>
                  <Input
                    id="icon"
                    placeholder="e.g., Bell"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expires_at">Expires At (optional)</Label>
                <Input
                  id="expires_at"
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingNotification ? "Update" : "Create"} Notification
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">No custom notifications yet</p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card key={notification.id} className={!notification.is_active ? "opacity-50" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Bell className="h-5 w-5 mt-1 text-primary" />
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {notification.title}
                        <span className={`text-xs px-2 py-1 rounded ${
                          notification.type === 'success' ? 'bg-green-500/10 text-green-500' :
                          notification.type === 'warning' ? 'bg-yellow-500/10 text-yellow-500' :
                          notification.type === 'error' ? 'bg-red-500/10 text-red-500' :
                          'bg-blue-500/10 text-blue-500'
                        }`}>
                          {notification.type}
                        </span>
                        {!notification.is_active && (
                          <span className="text-xs bg-muted px-2 py-1 rounded">Inactive</span>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-2">{notification.message}</CardDescription>
                      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Target: {notification.target_users}</span>
                        <span>Priority: {notification.priority}</span>
                        {notification.expires_at && (
                          <span>Expires: {new Date(notification.expires_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="outline" onClick={() => handleEdit(notification)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="destructive" onClick={() => handleDelete(notification.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
