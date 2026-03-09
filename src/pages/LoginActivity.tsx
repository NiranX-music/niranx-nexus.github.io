import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, MapPin, Monitor, Smartphone, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

interface LoginEntry {
  id: string;
  action: string;
  created_at: string;
  ip_address: string | null;
  user_agent: string | null;
  details: any;
}

export default function LoginActivity() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<LoginEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from('audit_log')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      setLogs((data || []) as LoginEntry[]);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const getDeviceIcon = (ua: string | null) => {
    if (!ua) return Monitor;
    if (/mobile|android|iphone/i.test(ua)) return Smartphone;
    return Monitor;
  };

  const getBrowser = (ua: string | null) => {
    if (!ua) return 'Unknown';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Other';
  };

  const getActionColor = (action: string) => {
    if (action.includes('login') || action.includes('sign_in')) return 'text-green-500';
    if (action.includes('logout') || action.includes('sign_out')) return 'text-muted-foreground';
    if (action.includes('fail') || action.includes('error')) return 'text-destructive';
    return 'text-primary';
  };

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-4xl">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <Shield className="w-10 h-10 text-primary" />
          <h1 className="text-3xl font-bold font-[Orbitron]">Login Activity</h1>
        </div>
        <p className="text-muted-foreground">Monitor your account access and security events</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="border-primary/20 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-1" />
            <p className="text-2xl font-bold font-[Orbitron]">{logs.filter(l => l.action.includes('login')).length}</p>
            <p className="text-xs text-muted-foreground">Logins</p>
          </CardContent>
        </Card>
        <Card className="border-primary/20 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <Monitor className="w-6 h-6 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold font-[Orbitron]">{new Set(logs.map(l => getBrowser(l.user_agent))).size}</p>
            <p className="text-xs text-muted-foreground">Devices</p>
          </CardContent>
        </Card>
        <Card className="border-primary/20 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-6 h-6 text-destructive mx-auto mb-1" />
            <p className="text-2xl font-bold font-[Orbitron]">{logs.filter(l => l.action.includes('fail')).length}</p>
            <p className="text-xs text-muted-foreground">Failed Attempts</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/20 bg-card/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <p className="text-muted-foreground text-center py-8">Loading activity...</p>
          ) : logs.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No activity recorded yet</p>
          ) : (
            logs.map(log => {
              const DeviceIcon = getDeviceIcon(log.user_agent);
              return (
                <div key={log.id} className="flex items-center gap-4 p-3 rounded-lg border border-border/30 hover:bg-muted/10 transition-colors">
                  <DeviceIcon className={`w-5 h-5 shrink-0 ${getActionColor(log.action)}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{log.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{format(new Date(log.created_at!), 'MMM d, h:mm a')}</span>
                      {log.ip_address && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{log.ip_address}</span>}
                      <Badge variant="outline" className="text-xs">{getBrowser(log.user_agent)}</Badge>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
