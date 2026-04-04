import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Monitor, Smartphone, Tablet, Trash2, LogOut, Globe, Clock, Shield, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';

interface Session {
  id: string;
  device_info: string;
  ip_address: string;
  last_activity: string;
  created_at: string;
  session_token: string;
}

function parseUserAgent(ua: string) {
  let browser = 'Unknown Browser';
  let os = 'Unknown OS';
  let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';

  if (/iPad|Android.*Tablet/i.test(ua)) deviceType = 'tablet';
  else if (/Mobile|iPhone|Android/i.test(ua)) deviceType = 'mobile';

  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edg/')) browser = 'Microsoft Edge';
  else if (ua.includes('OPR') || ua.includes('Opera')) browser = 'Opera';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';

  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  else if (ua.includes('CrOS')) os = 'Chrome OS';

  return { browser, os, deviceType };
}

export default function SessionManager() {
  const { user, signOut } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentSessionToken, setCurrentSessionToken] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchSessions();
      recordCurrentSession();
    }
  }, [user]);

  const recordCurrentSession = async () => {
    if (!user) return;
    const token = `session_${user.id}_${navigator.userAgent.slice(0, 50)}`;
    setCurrentSessionToken(token);

    const { data: existing } = await supabase
      .from('user_sessions')
      .select('id')
      .eq('user_id', user.id)
      .eq('session_token', token)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('user_sessions')
        .update({ last_activity: new Date().toISOString(), device_info: navigator.userAgent })
        .eq('id', existing.id);
    } else {
      await supabase.from('user_sessions').insert({
        user_id: user.id,
        session_token: token,
        device_info: navigator.userAgent,
        ip_address: 'Client',
        last_activity: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
    fetchSessions();
  };

  const fetchSessions = async () => {
    const { data } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', user?.id)
      .order('last_activity', { ascending: false });
    if (data) setSessions(data);
  };

  const revokeSession = async (sessionId: string) => {
    setLoading(true);
    try {
      await supabase.from('user_sessions').delete().eq('id', sessionId);
      setSessions(s => s.filter(x => x.id !== sessionId));
      toast.success('Session revoked');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const logoutEverywhere = async () => {
    setLoading(true);
    try {
      await supabase.from('user_sessions').delete().eq('user_id', user?.id);
      setSessions([]);
      toast.success('All sessions revoked. Signing out...');
      setTimeout(() => signOut(), 1500);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    if (deviceType === 'tablet') return <Tablet className="w-6 h-6 text-primary" />;
    if (deviceType === 'mobile') return <Smartphone className="w-6 h-6 text-primary" />;
    return <Monitor className="w-6 h-6 text-primary" />;
  };

  const isCurrentSession = (session: Session) => {
    const token = `session_${user?.id}_${navigator.userAgent.slice(0, 50)}`;
    return session.session_token === token;
  };

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" /> Login Activity
          </h1>
          <p className="text-muted-foreground">
            {sessions.length} active session{sessions.length !== 1 ? 's' : ''} across your devices
          </p>
        </div>
        <Button variant="destructive" onClick={logoutEverywhere} disabled={loading} className="gap-2">
          <LogOut className="w-4 h-4" /> Logout Everywhere
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Globe className="w-8 h-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{sessions.length}</p>
              <p className="text-xs text-muted-foreground">Total Logins</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Monitor className="w-8 h-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">
                {new Set(sessions.map(s => parseUserAgent(s.device_info).os)).size}
              </p>
              <p className="text-xs text-muted-foreground">Platforms</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="w-8 h-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">
                {sessions[0] ? formatDistanceToNow(new Date(sessions[0].last_activity), { addSuffix: true }) : '—'}
              </p>
              <p className="text-xs text-muted-foreground">Last Activity</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {sessions.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No active sessions found
            </CardContent>
          </Card>
        ) : (
          sessions.map((session) => {
            const { browser, os, deviceType } = parseUserAgent(session.device_info);
            const isCurrent = isCurrentSession(session);
            return (
              <Card key={session.id} className={isCurrent ? 'border-primary/50 bg-primary/5' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      {getDeviceIcon(deviceType)}
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {browser} on {os}
                          {isCurrent && (
                            <Badge variant="default" className="text-[10px] px-1.5 py-0">
                              This device
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {session.ip_address || 'Unknown'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(session.last_activity), { addSuffix: true })}
                          </span>
                          <span>
                            Signed in {format(new Date(session.created_at), 'MMM d, yyyy')}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                    {!isCurrent && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => revokeSession(session.id)}
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
