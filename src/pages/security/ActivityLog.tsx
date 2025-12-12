import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { 
  Shield, Monitor, Smartphone, Globe, AlertTriangle,
  Clock, Search, Filter, RefreshCw, MapPin
} from 'lucide-react';

interface ActivityEntry {
  id: string;
  action_type: string;
  device_info: Record<string, any> | null;
  ip_address: string | null;
  location: string | null;
  user_agent: string | null;
  is_suspicious: boolean | null;
  created_at: string;
}

const actionLabels: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  login: { label: 'Sign In', icon: <Shield className="w-4 h-4" />, color: 'text-green-500' },
  logout: { label: 'Sign Out', icon: <Shield className="w-4 h-4" />, color: 'text-blue-500' },
  password_change: { label: 'Password Changed', icon: <Shield className="w-4 h-4" />, color: 'text-yellow-500' },
  profile_update: { label: 'Profile Updated', icon: <Shield className="w-4 h-4" />, color: 'text-purple-500' },
  session_refresh: { label: 'Session Refreshed', icon: <RefreshCw className="w-4 h-4" />, color: 'text-gray-500' },
  failed_login: { label: 'Failed Login Attempt', icon: <AlertTriangle className="w-4 h-4" />, color: 'text-red-500' }
};

export default function ActivityLog() {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchActivities();
      logCurrentSession();
    }
  }, [user]);

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('user_activity_log')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setActivities((data || []).map(a => ({
        ...a,
        device_info: (a.device_info as Record<string, any>) || {}
      })));
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast({
        title: 'Error',
        description: 'Failed to load activity log',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const logCurrentSession = async () => {
    if (!user) return;

    try {
      // Get device info from user agent
      const ua = navigator.userAgent;
      const deviceInfo = {
        browser: getBrowser(ua),
        os: getOS(ua),
        device: getDevice(ua)
      };

      await supabase.from('user_activity_log').insert({
        user_id: user.id,
        action_type: 'session_refresh',
        device_info: deviceInfo,
        ip_address: 'Client-side',
        user_agent: ua,
        is_suspicious: false
      });
    } catch (error) {
      console.error('Error logging session:', error);
    }
  };

  const getBrowser = (ua: string): string => {
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown';
  };

  const getOS = (ua: string): string => {
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS')) return 'iOS';
    return 'Unknown';
  };

  const getDevice = (ua: string): string => {
    if (ua.includes('Mobile')) return 'Mobile';
    if (ua.includes('Tablet')) return 'Tablet';
    return 'Desktop';
  };

  const getDeviceIcon = (deviceInfo: ActivityEntry['device_info']) => {
    if (deviceInfo?.device === 'Mobile') return <Smartphone className="w-4 h-4" />;
    return <Monitor className="w-4 h-4" />;
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.action_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.ip_address?.includes(searchQuery) ||
      activity.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || 
      (filterType === 'suspicious' && activity.is_suspicious) ||
      activity.action_type === filterType;
    return matchesSearch && matchesFilter;
  });

  const suspiciousCount = activities.filter(a => a.is_suspicious).length;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">Account Activity</h1>
          <p className="text-muted-foreground">
            Review your recent account activity and security events
          </p>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Activities</p>
                  <p className="text-2xl font-bold">{activities.length}</p>
                </div>
                <Shield className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Sessions</p>
                  <p className="text-2xl font-bold">1</p>
                </div>
                <Monitor className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card className={suspiciousCount > 0 ? 'border-yellow-500/50' : ''}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Suspicious Activity</p>
                  <p className="text-2xl font-bold">{suspiciousCount}</p>
                </div>
                <AlertTriangle className={`w-8 h-8 ${suspiciousCount > 0 ? 'text-yellow-500' : 'text-muted-foreground'}`} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Activities</SelectItem>
              <SelectItem value="login">Sign In</SelectItem>
              <SelectItem value="logout">Sign Out</SelectItem>
              <SelectItem value="password_change">Password Changes</SelectItem>
              <SelectItem value="suspicious">Suspicious Only</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchActivities}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Activity List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your account activity from the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-center gap-4 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-muted" />
                    <div className="flex-1">
                      <div className="h-4 w-1/3 bg-muted rounded" />
                      <div className="h-3 w-1/2 bg-muted rounded mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredActivities.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Activity Found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? 'Try a different search term' : 'Your activity will appear here'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredActivities.map((activity, index) => {
                  const actionInfo = actionLabels[activity.action_type] || {
                    label: activity.action_type,
                    icon: <Shield className="w-4 h-4" />,
                    color: 'text-gray-500'
                  };

                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={`flex items-start gap-4 p-4 rounded-lg border ${
                        activity.is_suspicious ? 'border-yellow-500/50 bg-yellow-500/5' : 'bg-muted/30'
                      }`}
                    >
                      <div className={`p-2 rounded-full bg-muted ${actionInfo.color}`}>
                        {actionInfo.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{actionInfo.label}</span>
                          {activity.is_suspicious && (
                            <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Suspicious
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            {getDeviceIcon(activity.device_info)}
                            {activity.device_info?.browser} on {activity.device_info?.os}
                          </span>
                          {activity.ip_address && (
                            <span className="flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              {activity.ip_address}
                            </span>
                          )}
                          {activity.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {activity.location}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(activity.created_at)}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Tips */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Security Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Shield className="w-4 h-4 mt-0.5 text-primary" />
                Enable two-factor authentication for extra security
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 text-yellow-500" />
                Report suspicious activity immediately
              </li>
              <li className="flex items-start gap-2">
                <RefreshCw className="w-4 h-4 mt-0.5 text-green-500" />
                Change your password regularly
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
