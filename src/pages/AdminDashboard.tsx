// Admin Dashboard Component
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, FileText, MessageSquare, Activity, TrendingUp, Clock, Award, BarChart3, Sparkles, UserPlus, Music, Pencil, RotateCcw, AlertTriangle, Eye, Mail, Calendar, Globe, Link2, Newspaper, Layers, Quote, LinkIcon, Key, Code, Compass, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { CreateUserForm } from "@/components/admin/CreateUserForm";
import { useAdminEdit } from "@/contexts/AdminEditContext";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NiranXMusicManager } from "@/components/admin/NiranXMusicManager";
import { NiranXProjectsManager } from "@/components/admin/NiranXProjectsManager";
import { NiranXNexusManager } from "@/components/admin/NiranXNexusManager";
import { NiranXSongsManager } from "@/components/admin/NiranXSongsManager";
import { NiranXContactManager } from "@/components/admin/NiranXContactManager";
import { NiranXNewsletterManager } from "@/components/admin/NiranXNewsletterManager";
import { FooterLinksManager } from "@/components/admin/FooterLinksManager";
import { TestimonialsManager } from "@/components/admin/TestimonialsManager";
import { ApiKeysManager } from "@/components/admin/ApiKeysManager";
import { CustomPagesManager } from "@/components/admin/CustomPagesManager";
import { ExploreLinksManager } from "@/components/admin/ExploreLinksManager";
import { AdminUserManager } from "@/components/admin/AdminUserManager";
import { LauncherAppsManager } from "@/components/admin/LauncherAppsManager";
import { DevelopersManager } from "@/components/admin/DevelopersManager";
import { ProductsManager } from "@/components/admin/ProductsManager";

interface Stats {
  totalUsers: number;
  activeUsersWeek: number;
  newUsersMonth: number;
  avgXp: number;
  totalResources: number;
  totalViews: number;
  totalDownloads: number;
  totalFeedback: number;
  pendingFeedback: number;
  totalSessions: number;
  totalMinutes: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isEditMode, toggleEditMode, isAdmin } = useAdminEdit();
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeUsersWeek: 0,
    newUsersMonth: 0,
    avgXp: 0,
    totalResources: 0,
    totalViews: 0,
    totalDownloads: 0,
    totalFeedback: 0,
    pendingFeedback: 0,
    totalSessions: 0,
    totalMinutes: 0,
  });
  const [feedback, setFeedback] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [userRoles, setUserRoles] = useState<any[]>([]);
  const [adminRequests, setAdminRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [roleSearchQuery, setRoleSearchQuery] = useState("");
  const [requestStatusFilter, setRequestStatusFilter] = useState<string>("all");
  const [isResetting, setIsResetting] = useState(false);

  const resetAllEditedContent = async () => {
    setIsResetting(true);
    try {
      const { error } = await supabase
        .from('admin_editable_content')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "All edited content has been reset to defaults",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reset content",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    // Set up realtime subscriptions
    const feedbackChannel = supabase
      .channel('admin-feedback-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'feedback_suggestions' }, () => {
        loadFeedback();
        loadStats();
      })
      .subscribe();

    const requestsChannel = supabase
      .channel('admin-requests-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_requests' }, () => {
        loadAdminRequests();
      })
      .subscribe();

    const rolesChannel = supabase
      .channel('user-roles-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_roles' }, () => {
        loadUserRoles();
      })
      .subscribe();

    const resourcesChannel = supabase
      .channel('resources-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'exam_resources' }, () => {
        loadResources();
        loadStats();
      })
      .subscribe();

    const profilesChannel = supabase
      .channel('profiles-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        loadUsers();
        loadUserRoles();
        loadStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(feedbackChannel);
      supabase.removeChannel(requestsChannel);
      supabase.removeChannel(rolesChannel);
      supabase.removeChannel(resourcesChannel);
      supabase.removeChannel(profilesChannel);
    };
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadStats(),
        loadFeedback(),
        loadUsers(),
        loadResources(),
        loadUserRoles(),
        loadAdminRequests(),
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  const loadStats = async () => {
    const [userStats, resourceStats, feedbackStats, studyStats] = await Promise.all([
      supabase.rpc('get_admin_user_stats'),
      supabase.rpc('get_admin_resource_stats'),
      supabase.rpc('get_admin_feedback_stats'),
      supabase.rpc('get_admin_study_stats'),
    ]);

    // Functions return arrays, so we take the first element
    const userStatsData = userStats.data?.[0];
    const resourceStatsData = resourceStats.data?.[0];
    const feedbackStatsData = feedbackStats.data?.[0];
    const studyStatsData = studyStats.data?.[0];

    setStats({
      totalUsers: Number(userStatsData?.total_users || 0),
      activeUsersWeek: Number(userStatsData?.active_users_week || 0),
      newUsersMonth: Number(userStatsData?.new_users_month || 0),
      avgXp: Math.round(Number(userStatsData?.avg_xp || 0)),
      totalResources: Number(resourceStatsData?.total_resources || 0),
      totalViews: Number(resourceStatsData?.total_views || 0),
      totalDownloads: Number(resourceStatsData?.total_downloads || 0),
      totalFeedback: Number(feedbackStatsData?.total_feedback || 0),
      pendingFeedback: Number(feedbackStatsData?.pending || 0),
      totalSessions: Number(studyStatsData?.total_sessions || 0),
      totalMinutes: Number(studyStatsData?.total_minutes || 0),
    });
  };

  const loadFeedback = async () => {
    const { data, error } = await supabase
      .from('feedback_suggestions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      setFeedback(data);
    }
  };

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setUsers(data);
    }
  };

  const loadResources = async () => {
    const { data, error } = await supabase
      .from('exam_resources')
      .select('*')
      .order('view_count', { ascending: false })
      .limit(20);

    if (!error && data) {
      setResources(data);
    }
  };

  const loadUserRoles = async () => {
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, username, display_name')
      .order('created_at', { ascending: false });

    if (profilesError || !profilesData) return;

    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select('*');

    if (rolesError) return;

    const usersWithRoles = profilesData.map(profile => {
      const roles = rolesData?.filter(r => r.user_id === profile.user_id).map(r => r.role) || [];
      return {
        ...profile,
        roles: roles.length > 0 ? roles : ['user']
      };
    });

    setUserRoles(usersWithRoles);
  };

  const updateUserRole = async (userId: string, role: 'admin' | 'moderator' | 'teacher' | 'parent' | 'user', action: 'add' | 'remove') => {
    try {
      if (action === 'add') {
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role });
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', role);
        
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Role ${action === 'add' ? 'added' : 'removed'} successfully. User has been notified.`,
      });

      loadUserRoles();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update role",
        variant: "destructive",
      });
    }
  };

  const loadAdminRequests = async () => {
    const { data, error } = await supabase
      .from('admin_requests')
      .select(`
        *,
        profiles:user_id (username, display_name, avatar_url)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading admin requests:', error);
    } else {
      setAdminRequests(data || []);
    }
  };

  const updateRequestStatus = async (requestId: string, status: 'approved' | 'rejected', userId: string) => {
    const currentUser = await supabase.auth.getUser();
    
    // Get the request details for email notification
    const { data: requestData } = await supabase
      .from('admin_requests')
      .select('email, full_name')
      .eq('id', requestId)
      .single();
    
    // Update the request status
    const { error: updateError } = await supabase
      .from('admin_requests')
      .update({
        status,
        reviewed_by: currentUser.data.user?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (updateError) {
      toast({
        title: "Error",
        description: "Failed to update request status",
        variant: "destructive",
      });
      return;
    }

    // If approved, add admin role
    if (status === 'approved') {
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert([{ user_id: userId, role: 'admin' }]);

      if (roleError) {
        toast({
          title: "Error",
          description: "Failed to assign admin role",
          variant: "destructive",
        });
        return;
      }
    }

    // Send email notification
    if (requestData) {
      try {
        await supabase.functions.invoke('send-admin-decision-email', {
          body: {
            email: requestData.email,
            fullName: requestData.full_name,
            status,
          },
        });
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
        // Don't fail the whole operation if email fails
      }
    }

    toast({
      title: "Success",
      description: `Request ${status} successfully. User will be notified via email.`,
    });

    loadAdminRequests();
    loadUserRoles();
  };

  const updateFeedbackStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('feedback_suggestions')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update feedback status",
        variant: "destructive",
      });
    } else {
      toast({ title: "Feedback status updated" });
      loadFeedback();
      loadStats();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success';
      case 'in_progress': return 'bg-warning';
      case 'pending': return 'bg-muted';
      default: return 'bg-secondary';
    }
  };

  const filteredFeedback = feedback.filter(item => {
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesSearch = searchQuery === "" || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filteredAdminRequests = adminRequests.filter(request => {
    return requestStatusFilter === "all" || request.status === requestStatusFilter;
  });

  if (loading) {
    return (
      <div className="container max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const chartData = [
    { name: 'Pending', value: stats.pendingFeedback },
    { name: 'In Progress', value: feedback.filter(f => f.status === 'in_progress').length },
    { name: 'Completed', value: feedback.filter(f => f.status === 'completed').length },
  ];

  const COLORS = ['hsl(var(--muted))', 'hsl(var(--warning))', 'hsl(var(--success))'];

  const filteredUsers = users.filter(user => {
    const matchesSearch = userSearchQuery === "" || 
      (user.username?.toLowerCase().includes(userSearchQuery.toLowerCase())) ||
      (user.display_name?.toLowerCase().includes(userSearchQuery.toLowerCase())) ||
      (user.email?.toLowerCase().includes(userSearchQuery.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor platform activity, manage feedback, and analyze usage statistics
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={toggleEditMode} 
            variant={isEditMode ? "default" : "outline"}
            className="gap-2"
          >
            <Pencil className="h-4 w-4" />
            {isEditMode ? "Exit Edit Mode" : "Edit Mode"}
          </Button>
          <Button onClick={() => navigate('/niranx/admin/user-controls')} variant="outline" className="gap-2">
            <Activity className="h-4 w-4" />
            User Controls
          </Button>
        </div>
      </div>

      {isEditMode && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="py-3 flex items-center gap-3">
            <Pencil className="h-5 w-5 text-primary" />
            <p className="text-sm">
              <strong>Edit Mode Active:</strong> Click on any editable text across the platform to modify it. Changes are saved automatically and visible to all users.
            </p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="flex flex-wrap gap-1 h-auto p-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="create-user">Create User</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="requests">
            Requests
            {adminRequests.filter(r => r.status === 'pending').length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {adminRequests.filter(r => r.status === 'pending').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="niranx-music" className="gap-1">
            <Music className="h-3 w-3" /> Music
          </TabsTrigger>
          <TabsTrigger value="niranx-projects" className="gap-1">
            <Layers className="h-3 w-3" /> Projects
          </TabsTrigger>
          <TabsTrigger value="niranx-nexus" className="gap-1">
            <Link2 className="h-3 w-3" /> Nexus
          </TabsTrigger>
          <TabsTrigger value="niranx-songs" className="gap-1">
            <Globe className="h-3 w-3" /> Songs
          </TabsTrigger>
          <TabsTrigger value="niranx-contact" className="gap-1">
            <Mail className="h-3 w-3" /> Contact
          </TabsTrigger>
          <TabsTrigger value="niranx-newsletter" className="gap-1">
            <Newspaper className="h-3 w-3" /> Newsletter
          </TabsTrigger>
          <TabsTrigger value="footer-links" className="gap-1">
            <LinkIcon className="h-3 w-3" /> Footer
          </TabsTrigger>
          <TabsTrigger value="testimonials" className="gap-1">
            <Quote className="h-3 w-3" /> Testimonials
          </TabsTrigger>
          <TabsTrigger value="api-keys" className="gap-1">
            <Key className="h-3 w-3" /> API Keys
          </TabsTrigger>
          <TabsTrigger value="custom-pages" className="gap-1">
            <Code className="h-3 w-3" /> Pages
          </TabsTrigger>
          <TabsTrigger value="danger" className="text-destructive">Danger Zone</TabsTrigger>
          <TabsTrigger value="explore-links" className="gap-1">
            <Compass className="h-3 w-3" /> Explore
          </TabsTrigger>
          <TabsTrigger value="user-management" className="gap-1">
            <Users className="h-3 w-3" /> User Mgmt
          </TabsTrigger>
          <TabsTrigger value="launcher-apps" className="gap-1">
            <Globe className="h-3 w-3" /> App Launcher
          </TabsTrigger>
          <TabsTrigger value="developers" className="gap-1">
            <Code className="h-3 w-3" /> Developers
          </TabsTrigger>
          <TabsTrigger value="products" className="gap-1">
            <ExternalLink className="h-3 w-3" /> Products
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeUsersWeek} active this week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resources</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalResources}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalViews} total views
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Feedback</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalFeedback}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.pendingFeedback} pending review
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Study Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(stats.totalMinutes / 60)}h</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalSessions} sessions
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage platform features and communications</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={() => navigate('/niranx/admin/whats-new')}
                className="h-auto py-4 flex flex-col items-start gap-2"
                variant="outline"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  <span className="font-semibold">What's New Manager</span>
                </div>
                <span className="text-xs text-muted-foreground text-left">
                  Update and manage What's New items for users
                </span>
              </Button>

              <Button 
                onClick={() => navigate('/niranx/admin/custom-notifications')}
                className="h-auto py-4 flex flex-col items-start gap-2"
                variant="outline"
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  <span className="font-semibold">Custom Notifications</span>
                </div>
                <span className="text-xs text-muted-foreground text-left">
                  Send targeted notifications to users
                </span>
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Feedback Status Distribution</CardTitle>
                <CardDescription>Current feedback by status</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>Platform usage highlights</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg XP per user</span>
                  <span className="font-bold">{stats.avgXp}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">New users this month</span>
                  <Badge variant="secondary">{stats.newUsersMonth}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total downloads</span>
                  <span className="font-bold">{stats.totalDownloads}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg session time</span>
                  <span className="font-bold">
                    {stats.totalSessions > 0 
                      ? Math.round(stats.totalMinutes / stats.totalSessions) 
                      : 0}m
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feedback Management</CardTitle>
              <CardDescription>Review and manage user feedback submissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  placeholder="Search feedback..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="sm:max-w-xs"
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="sm:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Upvotes</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFeedback.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No feedback found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredFeedback.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.type}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(item.status)}>
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.upvotes || 0}</TableCell>
                          <TableCell>
                            {new Date(item.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={item.status}
                              onValueChange={(value) => updateFeedbackStatus(item.id, value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>View and manage all registered users ({users.length} total)</CardDescription>
                </div>
                <Input
                  placeholder="Search users by name, username or email..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="md:max-w-xs"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>XP</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.avatar_url} />
                                <AvatarFallback>
                                  {(user.display_name || user.username || 'U')[0].toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{user.display_name || 'No name'}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">@{user.username || 'N/A'}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              <span className="text-sm truncate max-w-[150px]">{user.email || 'N/A'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">Level {user.level || 1}</Badge>
                          </TableCell>
                          <TableCell className="font-mono">{user.xp || 0}</TableCell>
                          <TableCell>
                            <Badge variant={user.is_active !== false ? "default" : "secondary"}>
                              {user.is_active !== false ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-muted-foreground text-sm">
                              <Calendar className="h-3 w-3" />
                              {new Date(user.created_at).toLocaleDateString()}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create-user" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CreateUserForm />
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Additional user management options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => navigate('/niranx/admin/music-moderation')}
                  className="w-full h-auto py-4 flex flex-col items-start gap-2"
                  variant="outline"
                >
                  <div className="flex items-center gap-2">
                    <Music className="h-5 w-5" />
                    <span className="font-semibold">Music Moderation</span>
                  </div>
                  <span className="text-xs text-muted-foreground text-left">
                    Review and approve uploaded tracks and artists
                  </span>
                </Button>
                <Button 
                  onClick={() => navigate('/niranx/admin/roles')}
                  className="w-full h-auto py-4 flex flex-col items-start gap-2"
                  variant="outline"
                >
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    <span className="font-semibold">Role Management</span>
                  </div>
                  <span className="text-xs text-muted-foreground text-left">
                    Manage user roles and permissions
                  </span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Role Management</CardTitle>
              <CardDescription>Assign or revoke admin, moderator, teacher, and parent/guardian roles</CardDescription>
              <div className="mt-4">
                <Input
                  placeholder="Search by username, display name, or email..."
                  value={roleSearchQuery}
                  onChange={(e) => setRoleSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Display Name</TableHead>
                      <TableHead>Current Roles</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userRoles
                      .filter(user => 
                        roleSearchQuery === '' || 
                        user.username?.toLowerCase().includes(roleSearchQuery.toLowerCase()) ||
                        user.display_name?.toLowerCase().includes(roleSearchQuery.toLowerCase()) ||
                        user.user_id?.toLowerCase().includes(roleSearchQuery.toLowerCase())
                      )
                      .map((user) => (
                      <TableRow key={user.user_id}>
                        <TableCell className="font-medium">{user.username || 'N/A'}</TableCell>
                        <TableCell>{user.display_name || 'N/A'}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {user.roles.map((role: string) => (
                              <Badge 
                                key={role} 
                                variant={
                                  role === 'admin' ? 'destructive' : 
                                  role === 'moderator' ? 'default' : 
                                  role === 'teacher' ? 'outline' :
                                  role === 'parent' ? 'secondary' :
                                  'secondary'
                                }
                                className={
                                  role === 'teacher' ? 'border-blue-500 text-blue-700' :
                                  role === 'parent' ? 'border-green-500 text-green-700' :
                                  ''
                                }
                              >
                                {role === 'parent' ? 'guardian' : role}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2 flex-wrap">
                            {!user.roles.includes('admin') && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateUserRole(user.user_id, 'admin', 'add')}
                              >
                                Make Admin
                              </Button>
                            )}
                            {user.roles.includes('admin') && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updateUserRole(user.user_id, 'admin', 'remove')}
                              >
                                Remove Admin
                              </Button>
                            )}
                            {!user.roles.includes('moderator') && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateUserRole(user.user_id, 'moderator', 'add')}
                              >
                                Make Moderator
                              </Button>
                            )}
                            {user.roles.includes('moderator') && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateUserRole(user.user_id, 'moderator', 'remove')}
                              >
                                Remove Moderator
                              </Button>
                            )}
                            {!user.roles.includes('teacher') && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateUserRole(user.user_id, 'teacher', 'add')}
                                className="border-blue-500 hover:bg-blue-50"
                              >
                                Make Teacher
                              </Button>
                            )}
                            {user.roles.includes('teacher') && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateUserRole(user.user_id, 'teacher', 'remove')}
                                className="border-blue-500"
                              >
                                Remove Teacher
                              </Button>
                            )}
                            {!user.roles.includes('parent') && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateUserRole(user.user_id, 'parent', 'add')}
                                className="border-green-500 hover:bg-green-50"
                              >
                                Make Guardian
                              </Button>
                            )}
                            {user.roles.includes('parent') && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateUserRole(user.user_id, 'parent', 'remove')}
                                className="border-green-500"
                              >
                                Remove Guardian
                              </Button>
                            )}
                            {!user.roles.includes('music_moderator') && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateUserRole(user.user_id, 'music_moderator' as any, 'add')}
                                className="border-purple-500 hover:bg-purple-50"
                              >
                                Make Music Mod
                              </Button>
                            )}
                            {user.roles.includes('music_moderator') && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateUserRole(user.user_id, 'music_moderator' as any, 'remove')}
                                className="border-purple-500"
                              >
                                Remove Music Mod
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Admin Access Requests - History & Audit Log</CardTitle>
                  <CardDescription>Review and manage user requests for admin access</CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => navigate('/niranx/admin-request-analytics')}
                  className="gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  View Analytics
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Select value={requestStatusFilter} onValueChange={setRequestStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Requests</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Badge variant="outline" className="ml-auto">
                  Total: {filteredAdminRequests.length}
                </Badge>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Reviewed</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAdminRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          No admin requests found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAdminRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">
                            {request.profiles?.display_name || request.full_name}
                          </TableCell>
                          <TableCell>{request.email}</TableCell>
                          <TableCell className="max-w-md">
                            <p className="line-clamp-2 text-sm">{request.reason}</p>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                request.status === 'approved'
                                  ? 'default'
                                  : request.status === 'rejected'
                                  ? 'destructive'
                                  : 'secondary'
                              }
                            >
                              {request.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(request.created_at).toLocaleDateString()}
                              <div className="text-xs text-muted-foreground">
                                {new Date(request.created_at).toLocaleTimeString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {request.reviewed_at ? (
                              <div className="text-sm">
                                {new Date(request.reviewed_at).toLocaleDateString()}
                                <div className="text-xs text-muted-foreground">
                                  {new Date(request.reviewed_at).toLocaleTimeString()}
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">Pending</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {request.status === 'pending' ? (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => updateRequestStatus(request.id, 'approved', request.user_id)}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => updateRequestStatus(request.id, 'rejected', request.user_id)}
                                >
                                  Reject
                                </Button>
                              </div>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                {request.status === 'approved' ? 'Role Granted' : 'Request Declined'}
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Popular Resources</CardTitle>
              <CardDescription>Most viewed and downloaded study resources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Downloads</TableHead>
                      <TableHead>Uploaded</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resources.map((resource) => (
                      <TableRow key={resource.id}>
                        <TableCell className="font-medium">{resource.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{resource.type}</Badge>
                        </TableCell>
                        <TableCell>{resource.view_count || 0}</TableCell>
                        <TableCell>{resource.download_count || 0}</TableCell>
                        <TableCell>
                          {new Date(resource.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Analytics</CardTitle>
              <CardDescription>Detailed usage statistics and trends</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Engagement Rate</p>
                  <p className="text-2xl font-bold">
                    {stats.totalUsers > 0 
                      ? Math.round((stats.activeUsersWeek / stats.totalUsers) * 100) 
                      : 0}%
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Avg Resources per User</p>
                  <p className="text-2xl font-bold">
                    {stats.totalUsers > 0 
                      ? (stats.totalResources / stats.totalUsers).toFixed(1) 
                      : 0}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Feedback Response Rate</p>
                  <p className="text-2xl font-bold">
                    {stats.totalFeedback > 0 
                      ? Math.round(((stats.totalFeedback - stats.pendingFeedback) / stats.totalFeedback) * 100) 
                      : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="danger" className="space-y-4">
          <Card className="border-destructive/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
              </div>
              <CardDescription>
                These actions are irreversible. Please proceed with caution.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Reset Edited Content */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg border border-destructive/30 bg-destructive/5">
                <div>
                  <h3 className="font-semibold">Reset All Edited Content</h3>
                  <p className="text-sm text-muted-foreground">
                    This will reset all admin-edited text across the platform to their default values. 
                    All customizations made via Edit Mode will be permanently deleted.
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="gap-2 shrink-0" disabled={isResetting}>
                      <RotateCcw className="h-4 w-4" />
                      {isResetting ? "Resetting..." : "Reset Content"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. All edited content across the platform will be 
                        permanently reset to their original default values. This affects all pages 
                        and all users will see the default content.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={resetAllEditedContent}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Yes, Reset Everything
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {/* View Edited Content Stats */}
              <div className="p-4 rounded-lg border">
                <h3 className="font-semibold mb-2">Content Statistics</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor how much content has been customized via Edit Mode.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-3 gap-2"
                  onClick={async () => {
                    const { count } = await supabase
                      .from('admin_editable_content')
                      .select('*', { count: 'exact', head: true });
                    toast({
                      title: "Content Statistics",
                      description: `${count || 0} text entries have been customized via Edit Mode.`,
                    });
                  }}
                >
                  <Eye className="h-4 w-4" />
                  Check Edited Content Count
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NiranX Universe Management Tabs */}
        <TabsContent value="niranx-music">
          <Card>
            <CardHeader>
              <CardTitle>NiranX Music Releases</CardTitle>
              <CardDescription>Manage music releases displayed on the landing page</CardDescription>
            </CardHeader>
            <CardContent>
              <NiranXMusicManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="niranx-projects">
          <Card>
            <CardHeader>
              <CardTitle>NiranX Projects</CardTitle>
              <CardDescription>Manage projects displayed on the landing page</CardDescription>
            </CardHeader>
            <CardContent>
              <NiranXProjectsManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="niranx-nexus">
          <Card>
            <CardHeader>
              <CardTitle>Nexus Portal</CardTitle>
              <CardDescription>Manage Nexus categories and links</CardDescription>
            </CardHeader>
            <CardContent>
              <NiranXNexusManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="niranx-songs">
          <Card>
            <CardHeader>
              <CardTitle>Artists & Songs</CardTitle>
              <CardDescription>Manage artists and songs for the Songs page</CardDescription>
            </CardHeader>
            <CardContent>
              <NiranXSongsManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="niranx-contact">
          <Card>
            <CardHeader>
              <CardTitle>Contact Submissions</CardTitle>
              <CardDescription>View messages from the contact form</CardDescription>
            </CardHeader>
            <CardContent>
              <NiranXContactManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="niranx-newsletter">
          <Card>
            <CardHeader>
              <CardTitle>Newsletter Subscribers</CardTitle>
              <CardDescription>Manage newsletter subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <NiranXNewsletterManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="footer-links">
          <FooterLinksManager />
        </TabsContent>

        <TabsContent value="testimonials">
          <TestimonialsManager />
        </TabsContent>

        <TabsContent value="api-keys">
          <ApiKeysManager />
        </TabsContent>

        <TabsContent value="custom-pages">
          <CustomPagesManager />
        </TabsContent>

        <TabsContent value="explore-links">
          <ExploreLinksManager />
        </TabsContent>

        <TabsContent value="user-management">
          <AdminUserManager />
        </TabsContent>

        <TabsContent value="launcher-apps">
          <LauncherAppsManager />
        </TabsContent>

        <TabsContent value="developers">
          <DevelopersManager />
        </TabsContent>

        <TabsContent value="products">
          <ProductsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
