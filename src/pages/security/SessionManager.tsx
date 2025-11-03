import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Monitor, Smartphone, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Session {
  id: string;
  device_info: string;
  ip_address: string;
  last_activity: string;
  created_at: string;
}

export default function SessionManager() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  const fetchSessions = async () => {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', user?.id)
      .order('last_activity', { ascending: false });

    if (data) {
      setSessions(data);
    }
  };

  const revokeSession = async (sessionId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      setSessions(sessions.filter(s => s.id !== sessionId));
      toast.success('Session revoked successfully');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const revokeAllSessions = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_sessions')
        .delete()
        .eq('user_id', user?.id);

      if (error) throw error;

      setSessions([]);
      toast.success('All sessions revoked successfully');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (deviceInfo: string) => {
    if (deviceInfo?.toLowerCase().includes('mobile')) {
      return <Smartphone className="w-5 h-5" />;
    }
    return <Monitor className="w-5 h-5" />;
  };

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Active Sessions</h1>
          <p className="text-muted-foreground">Manage your active sessions across all devices</p>
        </div>
        {sessions.length > 0 && (
          <Button variant="destructive" onClick={revokeAllSessions} disabled={loading}>
            Revoke All Sessions
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {sessions.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No active sessions found
            </CardContent>
          </Card>
        ) : (
          sessions.map((session) => (
            <Card key={session.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getDeviceIcon(session.device_info)}
                    <div>
                      <CardTitle className="text-base">{session.device_info || 'Unknown Device'}</CardTitle>
                      <CardDescription>
                        IP: {session.ip_address || 'Unknown'} • Last active: {format(new Date(session.last_activity), 'PPpp')}
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => revokeSession(session.id)}
                    disabled={loading}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}