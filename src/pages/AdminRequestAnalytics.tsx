import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, Clock, CheckCircle, XCircle, AlertCircle, ArrowLeft, Users, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

interface AdminRequest {
  id: string;
  full_name: string;
  email: string;
  reason: string;
  status: string;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

interface TrendData {
  date: string;
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

interface ProcessingTimeData {
  range: string;
  count: number;
}

export default function AdminRequestAnalytics() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [processingTimeData, setProcessingTimeData] = useState<ProcessingTimeData[]>([]);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    approvalRate: 0,
    avgProcessingTime: 0,
    fastestProcessing: 0,
    slowestProcessing: 0,
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setRequests(data);
        calculateStats(data);
        generateTrendData(data);
        generateProcessingTimeData(data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: AdminRequest[]) => {
    const total = data.length;
    const pending = data.filter(r => r.status === 'pending').length;
    const approved = data.filter(r => r.status === 'approved').length;
    const rejected = data.filter(r => r.status === 'rejected').length;
    
    const approvalRate = total > 0 ? ((approved / (approved + rejected)) * 100) : 0;

    // Calculate processing times for reviewed requests
    const processingTimes = data
      .filter(r => r.reviewed_at && r.status !== 'pending')
      .map(r => {
        const created = new Date(r.created_at).getTime();
        const reviewed = new Date(r.reviewed_at!).getTime();
        return (reviewed - created) / (1000 * 60 * 60); // Convert to hours
      });

    const avgProcessingTime = processingTimes.length > 0
      ? processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length
      : 0;

    const fastestProcessing = processingTimes.length > 0
      ? Math.min(...processingTimes)
      : 0;

    const slowestProcessing = processingTimes.length > 0
      ? Math.max(...processingTimes)
      : 0;

    setStats({
      totalRequests: total,
      pendingRequests: pending,
      approvedRequests: approved,
      rejectedRequests: rejected,
      approvalRate: Math.round(approvalRate),
      avgProcessingTime: Math.round(avgProcessingTime * 10) / 10,
      fastestProcessing: Math.round(fastestProcessing * 10) / 10,
      slowestProcessing: Math.round(slowestProcessing * 10) / 10,
    });
  };

  const generateTrendData = (data: AdminRequest[]) => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i);
      return format(date, 'MMM dd');
    });

    const trendMap = last30Days.map(dateStr => {
      const dateObj = new Date(dateStr);
      const dayStart = startOfDay(dateObj).getTime();
      const dayEnd = endOfDay(dateObj).getTime();

      const dayRequests = data.filter(r => {
        const requestTime = new Date(r.created_at).getTime();
        return requestTime >= dayStart && requestTime <= dayEnd;
      });

      return {
        date: dateStr,
        pending: dayRequests.filter(r => r.status === 'pending').length,
        approved: dayRequests.filter(r => r.status === 'approved').length,
        rejected: dayRequests.filter(r => r.status === 'rejected').length,
        total: dayRequests.length,
      };
    });

    setTrendData(trendMap);
  };

  const generateProcessingTimeData = (data: AdminRequest[]) => {
    const reviewedRequests = data.filter(r => r.reviewed_at && r.status !== 'pending');
    
    const timeRanges = [
      { label: '< 1 hour', min: 0, max: 1 },
      { label: '1-6 hours', min: 1, max: 6 },
      { label: '6-24 hours', min: 6, max: 24 },
      { label: '1-3 days', min: 24, max: 72 },
      { label: '> 3 days', min: 72, max: Infinity },
    ];

    const rangeData = timeRanges.map(range => {
      const count = reviewedRequests.filter(r => {
        const created = new Date(r.created_at).getTime();
        const reviewed = new Date(r.reviewed_at!).getTime();
        const hours = (reviewed - created) / (1000 * 60 * 60);
        return hours >= range.min && hours < range.max;
      }).length;

      return {
        range: range.label,
        count,
      };
    });

    setProcessingTimeData(rangeData);
  };

  const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  const statusData = [
    { name: 'Pending', value: stats.pendingRequests, color: '#f59e0b' },
    { name: 'Approved', value: stats.approvedRequests, color: '#10b981' },
    { name: 'Rejected', value: stats.rejectedRequests, color: '#ef4444' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/niranx/admin-dashboard')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </div>
          <h1 className="text-3xl font-bold">Admin Request Analytics</h1>
          <p className="text-muted-foreground">Comprehensive insights into admin access requests</p>
        </div>
        <Button onClick={loadAnalytics} variant="outline">
          Refresh Data
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRequests}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingRequests} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approvalRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.approvedRequests} approved, {stats.rejectedRequests} rejected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgProcessingTime}h</div>
            <p className="text-xs text-muted-foreground">
              Average time to review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing Range</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.fastestProcessing}h - {stats.slowestProcessing}h</div>
            <p className="text-xs text-muted-foreground">
              Fastest to slowest
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Request Trends */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Request Trends (Last 30 Days)</CardTitle>
            <CardDescription>Daily admin request submissions by status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="total" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" name="Total" />
                <Area type="monotone" dataKey="approved" stackId="2" stroke="#10b981" fill="#10b981" name="Approved" />
                <Area type="monotone" dataKey="rejected" stackId="2" stroke="#ef4444" fill="#ef4444" name="Rejected" />
                <Area type="monotone" dataKey="pending" stackId="2" stroke="#f59e0b" fill="#f59e0b" name="Pending" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>Breakdown of request statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-4 md:grid-cols-1">
        {/* Processing Time Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Processing Time Distribution</CardTitle>
            <CardDescription>How long requests take to be reviewed</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={processingTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8b5cf6" name="Number of Requests">
                  {processingTimeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
          <CardDescription>Automated analysis of admin request patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.approvalRate >= 70 && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-700 dark:text-green-400">High Approval Rate</p>
                  <p className="text-sm text-muted-foreground">
                    Your approval rate of {stats.approvalRate}% indicates good quality requests.
                  </p>
                </div>
              </div>
            )}

            {stats.avgProcessingTime < 24 && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-700 dark:text-blue-400">Fast Processing</p>
                  <p className="text-sm text-muted-foreground">
                    Average processing time of {stats.avgProcessingTime} hours shows efficient review process.
                  </p>
                </div>
              </div>
            )}

            {stats.pendingRequests > 5 && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="font-semibold text-yellow-700 dark:text-yellow-400">Pending Requests Backlog</p>
                  <p className="text-sm text-muted-foreground">
                    You have {stats.pendingRequests} pending requests awaiting review.
                  </p>
                </div>
              </div>
            )}

            {stats.totalRequests === 0 && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-500/10 border border-gray-500/20">
                <AlertCircle className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-400">No Data Available</p>
                  <p className="text-sm text-muted-foreground">
                    No admin requests have been submitted yet. Analytics will appear once requests are made.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
