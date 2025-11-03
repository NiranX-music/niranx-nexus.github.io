import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface AuditEntry {
  id: string;
  action: string;
  details: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export default function AuditLog() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditEntry[]>([]);

  useEffect(() => {
    if (user) {
      fetchAuditLogs();
    }
  }, [user]);

  const fetchAuditLogs = async () => {
    const { data, error } = await supabase
      .from('audit_log')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (data) {
      setLogs(data);
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes('login')) return 'text-green-500';
    if (action.includes('delete')) return 'text-red-500';
    if (action.includes('update')) return 'text-blue-500';
    return 'text-muted-foreground';
  };

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Audit Log</h1>
          <p className="text-muted-foreground">View your recent account activities</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>
            Last 100 activities on your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            {logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No activities recorded yet
              </div>
            ) : (
              <div className="space-y-4">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className={`font-medium ${getActionColor(log.action)}`}>
                          {log.action}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(log.created_at), 'PPpp')}
                        </span>
                      </div>
                      {log.details && (
                        <p className="text-sm text-muted-foreground">
                          {JSON.stringify(log.details)}
                        </p>
                      )}
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        {log.ip_address && <span>IP: {log.ip_address}</span>}
                        {log.user_agent && (
                          <span className="truncate max-w-xs">{log.user_agent}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}