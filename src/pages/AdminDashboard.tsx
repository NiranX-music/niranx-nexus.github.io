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
import { Users, FileText, MessageSquare, Activity, TrendingUp, Clock, Award } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleSearchQuery, setRoleSearchQuery] = useState("");

  useEffect(() => {
    loadDashboardData();
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
      supabase.from('admin_user_stats').select('*').single(),
      supabase.from('admin_resource_stats').select('*').single(),
      supabase.from('admin_feedback_stats').select('*').single(),
      supabase.from('admin_study_stats').select('*').single(),
    ]);

    setStats({
      totalUsers: userStats.data?.total_users || 0,
      activeUsersWeek: userStats.data?.active_users_week || 0,
      newUsersMonth: userStats.data?.new_users_month || 0,
      avgXp: Math.round(userStats.data?.avg_xp || 0),
      totalResources: resourceStats.data?.total_resources || 0,
      totalViews: resourceStats.data?.total_views || 0,
      totalDownloads: resourceStats.data?.total_downloads || 0,
      totalFeedback: feedbackStats.data?.total_feedback || 0,
      pendingFeedback: feedbackStats.data?.pending || 0,
      totalSessions: studyStats.data?.total_sessions || 0,
      totalMinutes: studyStats.data?.total_minutes || 0,
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
      .order('created_at', { ascending: false })
      .limit(20);

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

  const updateUserRole = async (userId: string, role: 'admin' | 'moderator' | 'user', action: 'add' | 'remove') => {
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

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor platform activity, manage feedback, and analyze usage statistics
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 lg:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
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
              <CardTitle>User Activity</CardTitle>
              <CardDescription>Recent user registrations and activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Display Name</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>XP</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.username || 'N/A'}</TableCell>
                        <TableCell>{user.display_name || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">Level {user.level || 1}</Badge>
                        </TableCell>
                        <TableCell>{user.xp || 0}</TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Role Management</CardTitle>
              <CardDescription>Assign or revoke admin, moderator, and user roles</CardDescription>
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
                                variant={role === 'admin' ? 'destructive' : role === 'moderator' ? 'default' : 'secondary'}
                              >
                                {role}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
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
      </Tabs>
    </div>
  );
}
